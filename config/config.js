const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development',
        host: process.env.HOST || '0.0.0.0'
    },

    // Google Sheets Configuration
    googleSheets: {
        privateKey: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
        clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_ID,
        sheetNames: {
            orders: process.env.ORDERS_SHEET_NAME || 'Orders',
            orderDetails: process.env.ORDER_DETAILS_SHEET_NAME || 'Order Details',
            products: process.env.PRODUCTS_SHEET_NAME || 'Products',
            transactions: process.env.TRANSACTIONS_SHEET_NAME || 'Transactions',
            batches: process.env.BATCHES_SHEET_NAME || 'Batches'
        }
    },

    // API Configuration
    api: {
        rateLimit: parseInt(process.env.API_RATE_LIMIT) || 1000,
        timeout: parseInt(process.env.API_TIMEOUT) || 30000,
        maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
        version: '1.0.0'
    },

    // CORS Configuration
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/application.log'
    },

    // Validation
    validate() {
        const required = [
            'GOOGLE_SHEETS_PRIVATE_KEY', 'GOOGLE_PRIVATE_KEY',
            'GOOGLE_SHEETS_CLIENT_EMAIL', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 
            'GOOGLE_SHEETS_SPREADSHEET_ID', 'GOOGLE_SHEETS_ID'
        ];

        // Check if at least one of each pair exists
        const hasPrivateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
        const hasClientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const hasSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_ID;

        const missing = [];
        if (!hasPrivateKey) missing.push('GOOGLE_SHEETS_PRIVATE_KEY or GOOGLE_PRIVATE_KEY');
        if (!hasClientEmail) missing.push('GOOGLE_SHEETS_CLIENT_EMAIL or GOOGLE_SERVICE_ACCOUNT_EMAIL');
        if (!hasSpreadsheetId) missing.push('GOOGLE_SHEETS_SPREADSHEET_ID or GOOGLE_SHEETS_ID');
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        return true;
    }
};

module.exports = config;
