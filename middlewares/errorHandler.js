// Custom error class for application-specific errors
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handling middleware
const errorHandler = (err, req, res, _next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString()
    });

    // Google Sheets API specific errors
    if (err.message && err.message.includes('The caller does not have permission')) {
        error = new AppError('Google Sheets access denied. Please check service account permissions.', 403);
    }

    if (err.message && err.message.includes('Unable to parse range')) {
        error = new AppError('Invalid sheet range specified.', 400);
    }

    if (err.message && err.message.includes('Requested entity was not found')) {
        error = new AppError('Sheet or range not found.', 404);
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(`Validation Error: ${message}`, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        error = new AppError('Token expired', 401);
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.isOperational ? error.message : 'Something went wrong!';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// 404 handler for undefined routes
const notFound = (req, _res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

// Async error wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};

module.exports = {
    AppError,
    errorHandler,
    notFound,
    asyncHandler
};
