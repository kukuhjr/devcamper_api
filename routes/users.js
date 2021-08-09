const express = require('express')
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controller/users')

const router = express.Router()

// Protect route
const { protect, authorize } = require('../middleware/auth')

// Advance Results
const User = require('../models/User')
const advanceResults = require('../middleware/advancedResults')

// Set auth to all routes
router.use(protect)
router.use(authorize('admin'))

router.route('/')
    .get(advanceResults(User, 'courses'), getUsers)
    .post(createUser)

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = router