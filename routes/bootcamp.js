const express = require('express');
const { 
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius,
    bootcampUploadPhoto
} = require('../controller/bootcamp')

// Advance Results
const Bootcamp = require('../models/Bootcamp')
const advanceResults = require('../middleware/advancedResults')

// Include other resource router
const courseRouter = require('./courses')

const router = express.Router();

// Protect Route, Authorize role
const { protect, authorize } = require('../middleware/auth')

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)

router.route('/radius/:zipcode/:distance')
    .get(getBootcampInRadius)

router.route('/')
    .get(advanceResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), bootcampUploadPhoto);

module.exports = router;