const { DEFAULTS } = require('../constants/constants');

/**
 * Parse pagination parameters from query
 * @param {Object} query - Request query parameters
 * @returns {Object} Pagination object
 */
const parsePagination = (query = {}) => {
    const page = Math.max(1, parseInt(query.page) || DEFAULTS.PAGINATION.PAGE);
    const limit = Math.min(
        DEFAULTS.PAGINATION.MAX_LIMIT,
        Math.max(1, parseInt(query.limit) || DEFAULTS.PAGINATION.LIMIT)
    );
    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

/**
 * Parse range parameter from query
 * @param {Object} query - Request query parameters
 * @returns {string} Range string
 */
const parseRange = (query = {}) => {
    return query.range || DEFAULTS.RANGES.DEFAULT;
};

/**
 * Filter object by removing null/undefined values
 * @param {Object} obj - Object to filter
 * @returns {Object} Filtered object
 */
const filterObject = (obj) => {
    const filtered = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined && value !== '') {
            filtered[key] = value;
        }
    }
    return filtered;
};

/**
 * Convert string to number safely
 * @param {*} value - Value to convert
 * @param {number} defaultValue - Default value if conversion fails
 * @returns {number} Converted number or default
 */
const toNumber = (value, defaultValue = 0) => {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
};

/**
 * Convert string to boolean safely
 * @param {*} value - Value to convert
 * @param {boolean} defaultValue - Default value if conversion fails
 * @returns {boolean} Converted boolean or default
 */
const toBoolean = (value, defaultValue = false) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1' || lower === 'yes') return true;
        if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }
    return defaultValue;
};

/**
 * Generate unique ID with prefix
 * @param {string} prefix - ID prefix
 * @param {number} length - Number length (default: 3)
 * @returns {string} Generated ID
 */
const generateId = (prefix, length = 3) => {
    const number = Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
    return `${prefix}${number}`;
};

/**
 * Validate required fields in object
 * @param {Object} obj - Object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Array} Array of missing fields
 */
const validateRequiredFields = (obj, requiredFields) => {
    return requiredFields.filter(field => !obj[field] || obj[field] === '');
};

/**
 * Sanitize string for Google Sheets
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/['"]/g, '').replace(/\n/g, ' ').replace(/\r/g, '');
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
const getCurrentTimestamp = () => {
    return new Date().toISOString();
};

/**
 * Calculate percentage change
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
const calculatePercentageChange = (oldValue, newValue) => {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Round number to specified decimal places
 * @param {number} num - Number to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded number
 */
const roundNumber = (num, decimals = 2) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

module.exports = {
    parsePagination,
    parseRange,
    filterObject,
    toNumber,
    toBoolean,
    generateId,
    validateRequiredFields,
    sanitizeString,
    formatDate,
    deepClone,
    getCurrentTimestamp,
    calculatePercentageChange,
    roundNumber
};
