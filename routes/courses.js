const express = require('express');
const { 
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controller/course')

// Advance Results
const Courses = require('../models/Course')
const advanceResults = require('../middleware/advancedResults')

const router = express.Router({ mergeParams: true });

// Protect Route, Authorize Role
const { protect, authorize } = require('../middleware/auth')

router.route('/')
    .get(advanceResults(Courses, { path: 'bootcamp', select: 'name description' }), getCourses)
    .post(protect, authorize('publisher', 'admin'), addCourse)

router.route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse)

module.exports = router;