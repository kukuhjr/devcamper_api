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

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)

router.route('/radius/:zipcode/:distance')
    .get(getBootcampInRadius)

router.route('/')
    .get(advanceResults(Bootcamp, 'courses'), getBootcamps)
    .post(createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

router.route('/:id/photo')
    .put(bootcampUploadPhoto);

module.exports = router;