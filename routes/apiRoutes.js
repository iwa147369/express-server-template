const express = require('express');
const router = express.Router();
const googleSheetsService = require('../services/googleSheetsService');
const { asyncHandler } = require('../middlewares/errorHandler');

// Import all route modules
const ordersRoutes = require('./ordersRoutes');
const orderDetailsRoutes = require('./orderDetailsRoutes');
const productsRoutes = require('./productsRoutes');
const transactionsRoutes = require('./transactionsRoutes');
const batchesRoutes = require('./batchesRoutes');

// Health check endpoint
router.get('/health', asyncHandler(async (req, res) => {
    let googleSheetsStatus = {
        connected: false,
        error: null,
        solution: null
    };
    
    try {
        // Test Google Sheets connection
        const sheetsInfo = await googleSheetsService.getSheetInfo();
        googleSheetsStatus = {
            connected: true,
            spreadsheet_title: sheetsInfo.title,
            available_sheets: sheetsInfo.sheets.map(sheet => sheet.title)
        };
        
        res.status(200).json({
            success: true,
            message: 'API is healthy',
            timestamp: new Date().toISOString(),
            google_sheets: googleSheetsStatus
        });
    } catch (error) {
        // Provide specific solutions for common errors
        let solution = 'Check your Google Sheets configuration and service account permissions.';
        
        if (error.message.includes('API has not been used') || error.message.includes('is disabled')) {
            solution = 'Enable the Google Sheets API in your Google Cloud Console: https://console.developers.google.com/apis/api/sheets.googleapis.com/overview';
        } else if (error.message.includes('does not have permission')) {
            solution = 'Share your Google Sheets document with your service account email and grant Editor permissions.';
        } else if (error.message.includes('Unable to parse range')) {
            solution = 'Check that your sheet names match the configuration and headers are in row 1.';
        } else if (error.message.includes('not found')) {
            solution = 'Verify your GOOGLE_SHEETS_ID is correct and the spreadsheet exists.';
        }
        
        googleSheetsStatus = {
            connected: false,
            error: error.message,
            solution: solution
        };
        
        res.status(503).json({
            success: false,
            message: 'Google Sheets service unavailable - API endpoints will not work until this is resolved',
            timestamp: new Date().toISOString(),
            google_sheets: googleSheetsStatus
        });
    }
}));

// API info endpoint
router.get('/info', (req, res) => {
    res.status(200).json({
        success: true,
        api: {
            name: 'Google Sheets Retail Management API',
            version: '1.0.0',
            description: 'REST API for managing retail data through Google Sheets',
            endpoints: {
                orders: '/api/orders',
                order_details: '/api/order-details',
                products: '/api/products',
                transactions: '/api/transactions',
                batches: '/api/batches'
            },
            features: [
                'CRUD operations for all sheets',
                'Data validation',
                'Error handling',
                'Filtering and pagination',
                'Stock management',
                'Transaction confirmation',
                'Inventory summaries'
            ]
        },
        sheets: {
            orders: 'Orders management with customer and delivery info',
            order_details: 'Order line items with product details',
            products: 'Product catalog with stock tracking',
            transactions: 'Financial transactions with confirmation',
            batches: 'Inventory batches with cost tracking'
        }
    });
});

// Mount all route modules
router.use('/orders', ordersRoutes);
router.use('/order-details', orderDetailsRoutes);
router.use('/products', productsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/batches', batchesRoutes);

// Catch-all for API routes
router.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `API route ${req.originalUrl} not found`,
        available_endpoints: [
            'GET /api/health',
            'GET /api/info',
            'GET /api/orders',
            'GET /api/order-details',
            'GET /api/products',
            'GET /api/transactions',
            'GET /api/batches'
        ]
    });
});

module.exports = router;
