const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geoCoder')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamps = await Bootcamp.find()
    res.status(200).json({ success: true, counts: bootcamps.length ,data: bootcamps })
})

// @desc    Get bootcamp by id
// @route   GET /api/v1/bootcamps/id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    // Wrong id, right format
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with id ${req.params.id} is not found`, 404))
    }
    res.status(200).json({ success: true, data: bootcamp })
})

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp
    })
})

// @desc    Update single bootcamp
// @route   PUT /api/v1/bootcamps/id
// @access  Public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with id ${req.params.id} is not found`, 404))
    }
    res.status(200).json({ success: true, data: bootcamp })
})

// @desc    Delete single bootcamp
// @route   DELETE /api/v1/bootcamps/id
// @access  Public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with id ${req.params.id} is not found`, 404))
    }
    res.status(200).json({ success: true, data: {} })
})

// @desc    Get bootcamp within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    // Hitung radius pake radians
    // Divide distance by radius earth
    // Earth radius = 3,963 mi / 6,378 km (google)
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: {$centerSphere: [ [ lng, lat ], radius ]} }
    })
    
    // const bootcamps = await Bootcamp.find()
    res.status(200).json({ 
        success: true,
        count: bootcamps.length,
        data: bootcamps 
    })
})