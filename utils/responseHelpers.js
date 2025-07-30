const { STATUS_CODES, MESSAGES } = require('../constants/constants');

/**
 * Standard API response formatter
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success flag
 * @param {*} data - Response data
 * @param {string} message - Response message
 * @param {number} count - Item count (for collections)
 * @param {Object} meta - Additional metadata
 */
const sendResponse = (res, statusCode, success, data = null, message = null, count = null, meta = {}) => {
    const response = {
        success,
        ...(data !== null && { data }),
        ...(count !== null && { count }),
        ...(message && { message }),
        ...meta
    };

    return res.status(statusCode).json(response);
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} count - Item count
 * @param {Object} meta - Additional metadata
 */
const sendSuccess = (res, data = null, message = MESSAGES.SUCCESS.OPERATION_COMPLETED, count = null, meta = {}) => {
    return sendResponse(res, STATUS_CODES.OK, true, data, message, count, meta);
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
const sendCreated = (res, data, message = MESSAGES.SUCCESS.CREATED) => {
    return sendResponse(res, STATUS_CODES.CREATED, true, data, message);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error message
 * @param {Object} details - Error details
 */
const sendError = (res, statusCode, error, details = null) => {
    const response = {
        success: false,
        error,
        ...(details && { details })
    };

    return res.status(statusCode).json(response);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
const sendNotFound = (res, message = MESSAGES.ERROR.NOT_FOUND) => {
    return sendError(res, STATUS_CODES.NOT_FOUND, message);
};

/**
 * Send bad request response
 * @param {Object} res - Express response object
 * @param {string} message - Bad request message
 * @param {Object} details - Validation details
 */
const sendBadRequest = (res, message = MESSAGES.ERROR.INVALID_DATA, details = null) => {
    return sendError(res, STATUS_CODES.BAD_REQUEST, message, details);
};

/**
 * Send conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Conflict message
 */
const sendConflict = (res, message = MESSAGES.ERROR.ALREADY_EXISTS) => {
    return sendError(res, STATUS_CODES.CONFLICT, message);
};

/**
 * Send internal server error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Object} details - Error details (only in development)
 */
const sendInternalError = (res, message = MESSAGES.ERROR.INTERNAL_ERROR, details = null) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, message, isDevelopment ? details : null);
};

module.exports = {
    sendResponse,
    sendSuccess,
    sendCreated,
    sendError,
    sendNotFound,
    sendBadRequest,
    sendConflict,
    sendInternalError
};
