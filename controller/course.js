const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')

// @desc    Get all bootcamps
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query
    // Check param (bootcamp id)
    if(req.params.bootcampId){
        query = Course.find({ bootcamp: req.params.bootcampId })
    }else{
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        })
    }
    // Exec query
    const courses = await query
    
    res.status(200).json({ success: true, counts: courses.length, data: courses })
})