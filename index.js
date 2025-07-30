const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config/config');

// Import middleware
const requestLogger = require('./middlewares/requestLogger');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Import routes
const apiRoutes = require('./routes/apiRoutes');

// Validate configuration
try {
    config.validate();
} catch (error) {
    console.error('❌ Configuration Error:', error.message);
    console.error('📝 Please check your .env file and ensure all required variables are set.');
    process.exit(1);
}

// Create Express application
const app = express();

// Configure CORS
const corsOptions = {
    origin: config.cors.allowedOrigins,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    credentials: true
};

// Apply middleware
app.use(bodyParser.json({ limit: config.api.maxRequestSize }));
app.use(bodyParser.urlencoded({ extended: true, limit: config.api.maxRequestSize }));
app.use(cors(corsOptions));
app.use(requestLogger);

// Welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Retail Management API',
        version: config.api.version,
        environment: config.server.environment,
        endpoints: {
            api_info: '/api/info',
            health_check: '/api/health',
            documentation: {
                products: '/api/products',
                orders: '/api/orders',
                order_details: '/api/order-details',
                transactions: '/api/transactions',
                batches: '/api/batches'
            }
        },
        documentation: 'Check /api/info for detailed API information'
    });
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start the server
const startServer = () => {
    const server = app.listen(config.server.port, config.server.host, () => {
        console.log('🚀 Retail Management API Server Started');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📡 Server running on: http://${config.server.host}:${config.server.port}`);
        console.log(`📊 API Documentation: http://localhost:${config.server.port}/api/info`);
        console.log(`🏥 Health Check: http://localhost:${config.server.port}/api/health`);
        console.log(`📝 Environment: ${config.server.environment}`);
        console.log(`🌐 CORS Origin: ${config.cors.origin}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Ready to accept requests!');
    });

    // Handle server errors
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`❌ Port ${config.server.port} is already in use`);
            console.error('💡 Try using a different port or stop the process using that port');
        } else {
            console.error('❌ Server error:', error.message);
        }
        process.exit(1);
    });

    return server;
};

// Start the server
startServer();