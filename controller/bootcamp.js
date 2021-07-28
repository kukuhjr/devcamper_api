const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geoCoder')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;
    // Copy req query
    const reqQuery = { ...req.query }
    // Fields to exclude
    const removeFields = ['select', 'sort']
    // console.log(`Remove fields = ${removeFields}`);
    // loop over removeFields and delete them from reqQuery
    removeFields.forEach(el => delete reqQuery[el]);
    // Create query String
    let queryStr = JSON.stringify(reqQuery)
    // Create Operators ($gt, $lt, $in)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    console.log(`Query String= ${queryStr}`);
    
    // Fetch Bootcamp data with query
    query = Bootcamp.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query.select(fields);
        console.log(fields);
    }
    // Sort Fields
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query.sort(sortBy);
        console.log(sortBy);
    }else{
        query.sort('-createdAt');
    }
    const bootcamps = await query;
    
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