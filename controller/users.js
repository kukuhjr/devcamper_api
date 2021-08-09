const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')
const asyncHandler = require('../middleware/async')

// @desc    Create User
// @route   POST /api/v1/auth/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    
    res.status(201).json({
        success: true,
        data: user
    })
})

// @desc    Get data all user
// @route   GET /api/v1/auth/users
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advanceResults)
})

// @desc    Get data user by id
// @route   GET /api/v1/auth/user/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) {
        return next(new ErrorResponse(`User with id ${req.params.id} is not found`, 404))
    }
    res.status(200).json({ success: true, data: user })
})

// @desc    Update data user
// @route   PUT /api/v1/auth/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({ success: true, data: user })
})

// @desc    Delete user data
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    // Not found in db
    if (!user) {
        return next(new ErrorResponse(`User with id ${req.params.id} is not found`, 404))
    }
    user.remove()
    res.status(200).json({ success: true, data: {  } })
})