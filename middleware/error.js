const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
    let error = { ...err }

    // Message Default
    error.message = err.message

    // Log console for dev
    // console.log(err);

    // Error Detect (Not Found)
    if (err.name == 'CastError') {
        const message = `Resource with id ${err.value} is not found`
        error = new ErrorResponse(message, 404)
    }

    // Duplicate key
    if (err.code == '11000') {
        const message = `Duplicate field value entered`
        error = new ErrorResponse(message, 400)
    }

    // Mongoose Validation Error
    if (err.name == 'ValidationError') {
        const message = Object.values(err.errors).map(el => el.message)
        error = new ErrorResponse(message, 400)
    }

    res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Server Error' })
}

module.exports = errorHandler