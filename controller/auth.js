const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
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