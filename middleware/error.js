const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
    let error = { ...err }

    // Message Default
    // error.message = err.message

    // Log console for dev
    console.log(err.stack.red);

    // Error Detect
    if (err.name == 'CastError') {
        const message = `Resource with id ${err.value} is not found`
        error = new ErrorResponse(message, 404)
    }

    // console.log(`Error Gan: ${error.message}`)
    res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Server Error' })
}

module.exports = errorHandler