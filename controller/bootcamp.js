const path = require('path');
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geoCoder')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advanceResults)
})

// @desc    Get bootcamp by id
// @route   GET /api/v1/bootcamps/id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    console.log(req.params)
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
// @route   PUT /api/v1/bootcamps/:id
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
// @route   DELETE /api/v1/bootcamps/:id
// @access  Public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with id ${req.params.id} is not found`, 404))
    }
    bootcamp.remove()
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

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Public
exports.bootcampUploadPhoto = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with id ${req.params.id} is not found`, 404))
    }
    // if file not uploaded before
    if(!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400))
    }
    // req.files.(form name)
    const file = req.files.file
    // file must be image
    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload a photo file`, 400))
    }
    // check file size
    if(file.size >= process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`File must be not more than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }
    // Create custom file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            console.log(err);
            return next(new ErrorResponse(`Problem with file upload`, 500))
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

        res.status(200).json({
            success: true,
            data: file.name
        })
    })
})