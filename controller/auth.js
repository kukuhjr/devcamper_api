const crypto = require('crypto')
const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')
const asyncHandler = require('../middleware/async')

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    // Create token 
    // const token = user.getSignedJwtToken()
    // res.status(200).json({ success: true, token })

    sendTokenResponse(user, 200, res) // alternate version to create token
})

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body

    // Validate email & pass
    if (!email || !password) return next(new ErrorResponse(`Please enter an email and password`, 400))

    // Check for User
    const user = await User.findOne({ email }).select('+password')
    // User not found in db
    if (!user) return next(new ErrorResponse(`Invalid credentials`, 401))

    // matching password
    const match = await user.matchPassword(password)
    // if not match
    if (!match) return next(new ErrorResponse(`Invalid credentials`, 401))
    
    // Create token
    // const token = user.getSignedJwtToken()
    // res.status(200).json({ success: true, token })

    sendTokenResponse(user, 200, res) // alternate version to create token
})

// @desc    Get Me
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        data: user
    })
})

// @desc    Update User
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const form = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findOneAndUpdate(req.user.id, form, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: user
    })
})

// @desc    Update Password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    if(!(await user.matchPassword(req.body.currentPassword))) { 
        return next(new ErrorResponse(`Password is incorrect`, 400))
    }

    user.password = req.body.newPassword
    await user.save()

    sendTokenResponse(user, 200, res)
})

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if(!user) return next(new ErrorResponse(`User not found with that email`, 404))

    // Get reset token
    const resetToken = user.getResetPasswordToken()
    // Execute query
    await user.save({ validateBeforeSave: false })

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`
    // Create message body
    const message = `This is where you can reset your password if you have forgotten it. Please make a PUT request to: \n\n ${resetUrl}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })

        res.status(200).json({ success: true, data: 'Email sent' }) 
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(new ErrorResponse(`Email could not be sent`, 500))
    }

    res.status(200).json({
        success: true,
        data: user
    })
})

// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex')
    
    const user = await User.findOne({ 
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorResponse(`Invalid Token`, 400))
    }

    // Set new Password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    sendTokenResponse(user, 200, res)
})


// Helper function
// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken()

    const options = {
        expires: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 ),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }

    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
          success: true,
          token
      })
}