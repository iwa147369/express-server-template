// API Response Messages
const MESSAGES = {
    // Success Messages
    SUCCESS: {
        OPERATION_COMPLETED: 'Operation completed successfully',
        CREATED: 'Resource created successfully',
        UPDATED: 'Resource updated successfully',
        DELETED: 'Resource deleted successfully',
        FOUND: 'Resource found successfully'
    },

    // Error Messages
    ERROR: {
        NOT_FOUND: 'Resource not found',
        ALREADY_EXISTS: 'Resource already exists',
        INVALID_DATA: 'Invalid data provided',
        VALIDATION_FAILED: 'Validation failed',
        UNAUTHORIZED: 'Unauthorized access',
        FORBIDDEN: 'Access forbidden',
        INTERNAL_ERROR: 'Internal server error',
        GOOGLE_SHEETS_ERROR: 'Google Sheets operation failed',
        MISSING_REQUIRED_FIELDS: 'Missing required fields'
    },

    // Specific Messages
    HEALTH: {
        API_HEALTHY: 'API is healthy',
        GOOGLE_SHEETS_CONNECTED: 'Google Sheets connected successfully',
        GOOGLE_SHEETS_DISCONNECTED: 'Google Sheets connection failed'
    },

    PRODUCTS: {
        LOW_STOCK: 'Products with low stock',
        STOCK_UPDATED: 'Product stock updated successfully',
        OUT_OF_STOCK: 'Product is out of stock'
    },

    ORDERS: {
        ORDER_CREATED: 'Order created successfully',
        ORDER_UPDATED: 'Order updated successfully',
        ORDER_NOT_FOUND: 'Order not found'
    },

    TRANSACTIONS: {
        CONFIRMED: 'Transaction confirmed successfully',
        UNCONFIRMED: 'Transaction marked as unconfirmed',
        SUMMARY_GENERATED: 'Transaction summary generated'
    },

    BATCHES: {
        QUANTITY_UPDATED: 'Batch quantity updated successfully',
        INVENTORY_SUMMARY: 'Inventory summary generated'
    }
};

// HTTP Status Codes
const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// Default Values
const DEFAULTS = {
    PAGINATION: {
        PAGE: 1,
        LIMIT: 100,
        MAX_LIMIT: 1000
    },
    
    RANGES: {
        DEFAULT: 'A1:Z1000'
    },

    STOCK: {
        MIN_STOCK_THRESHOLD: 10
    }
};

// Field Names for Google Sheets
const SHEET_FIELDS = {
    PRODUCTS: {
        ID: 'Product ID',
        NAME: 'Product Name',
        SELLING_PRICE: 'Selling Price',
        CURRENT_STOCK: 'Current Stock',
        MIN_STOCK: 'Min Stock'
    },

    ORDERS: {
        ORDER_ID: 'OrderID',
        ORDER_DATE: 'Order Date',
        CHANNEL: 'Channel',
        REMARK: 'Remark',
        PLATFORM: 'Platform',
        USERNAME: 'Username',
        RECIPIENT: 'Recipient',
        PHONE_NUMBER: 'Phone Number',
        ADDRESS: 'Address',
        PROCESS: 'Process'
    },

    ORDER_DETAILS: {
        ORDER_ID: 'Order ID',
        PRODUCT_ID: 'Product ID',
        SELLING_PRICE: 'Selling Price',
        TOTAL_SELLING_PRICE: 'Total Selling Price',
        SIZE: 'Size',
        COLOR: 'Color',
        BATCH_ID: 'Batch ID'
    },

    TRANSACTIONS: {
        ID: 'Transaction ID',
        DATE: 'Date',
        CATEGORY: 'Category',
        AMOUNT: 'Amount',
        FROM: 'From',
        TO: 'To',
        CONFIRMED: 'Confirmed',
        NOTE: 'Note'
    },

    BATCHES: {
        ID: 'Batch ID',
        PRODUCT_ID: 'Product ID',
        UNIT_COST_PRICE: 'Unit Cost Price',
        QUANTITY: 'Quantity',
        IMPORT_DATE: 'Import Date'
    }
};

// Validation Patterns
const VALIDATION = {
    PATTERNS: {
        PRODUCT_ID: /^PROD\d{3,}$/,
        ORDER_ID: /^ORD\d{3,}$/,
        TRANSACTION_ID: /^TXN\d{3,}$/,
        BATCH_ID: /^BATCH\d{3,}$/,
        PHONE: /^\d{3}-\d{3}-\d{4}$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        DATE: /^\d{4}-\d{2}-\d{2}$/
    },

    LIMITS: {
        MAX_STRING_LENGTH: 255,
        MAX_DESCRIPTION_LENGTH: 1000,
        MIN_PRICE: 0.01,
        MAX_PRICE: 999999.99,
        MIN_QUANTITY: 1,
        MAX_QUANTITY: 999999
    }
};

module.exports = {
    MESSAGES,
    STATUS_CODES,
    DEFAULTS,
    SHEET_FIELDS,
    VALIDATION
};
