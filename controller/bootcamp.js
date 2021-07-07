const Bootcamp = require('../models/Bootcamp')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({ success: true, msg: 'Showing all bootcamps data' });
}

// @desc    Get bootcamp by id
// @route   GET /api/v1/bootcamps/id
// @access  Public
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Showing bootcamp data with id ${req.params.id}` });
}

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {
    // console.log(req.body)
    // res.status(201).json({ success: true, msg: 'Create new bootcamp' });
    try {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success: true,
            data: bootcamp
        })
    } catch (err) {
        res.status(400).json({ success: false })
    }
}

// @desc    Update single bootcamp
// @route   PUT /api/v1/bootcamps/id
// @access  Public
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Update bootcamp data with id ${req.params.id}` });
}

// @desc    Delete single bootcamp
// @route   DELETE /api/v1/bootcamps/id
// @access  Public
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Delete data bootcamp with id ${req.params.id}` });
}