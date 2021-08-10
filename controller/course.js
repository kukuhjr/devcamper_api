const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')

// @desc    Get all bootcamps
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    // Check param (bootcamp id)
    if(req.params.bootcampId){
        const courses = await Course.find({ bootcamp: req.params.bootcampId })
        return res.status(200).json({ success: true, counts: courses.length, data: courses })
    }else{
        res.status(200).json(res.advanceResults)
    }
})

// @desc    Get all bootcamps
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }
    
    res.status(200).json({ success: true, data: course })
})

// @desc    Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id
    
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`), 404)
    }

    // Check bootcamp owner
    if (req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorized to this action`, 401))
    }

    const course = await Course.create(req.body)
    
    res.status(200).json({ success: true, data: course })
})

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id)
    // If Course not found
    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }
    // Check bootcamp owner
    if (req.user.id !== course.user.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorized to this action`, 401))
    }
    // update
    course = await Course.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    
    res.status(200).json({ success: true, data: course })
})

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Public
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id)
    // If Course not found
    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }
    // Check bootcamp owner
    if (req.user.id !== course.user.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorized to this action`, 401))
    }
    // update
    await course.remove();
    
    res.status(200).json({ success: true, data: {} })
})