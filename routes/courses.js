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

router.route('/')
    .get(advanceResults(Courses, { path: 'bootcamp', select: 'name description' }), getCourses)
    .post(addCourse)

router.route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse)

module.exports = router;