const schemas = require('../validators/schemasValidation');

// Generic validation middleware factory
const validateSchema = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        
        if (!schema) {
            return res.status(500).json({
                success: false,
                error: `Validation schema '${schemaName}' not found`
            });
        }

        const { error, value } = schema.validate(req.body, { 
            abortEarly: false,
            stripUnknown: true 
        });

        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationErrors
            });
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};

// Specific validation middlewares for each sheet
const validateOrders = validateSchema('orders');
const validateOrdersUpdate = validateSchema('ordersUpdate');
const validateOrderDetails = validateSchema('orderDetails');
const validateOrderDetailsUpdate = validateSchema('orderDetailsUpdate');
const validateProducts = validateSchema('products');
const validateProductsUpdate = validateSchema('productsUpdate');
const validateTransactions = validateSchema('transactions');
const validateTransactionsUpdate = validateSchema('transactionsUpdate');
const validateBatches = validateSchema('batches');
const validateBatchesUpdate = validateSchema('batchesUpdate');

module.exports = {
    validateOrders,
    validateOrdersUpdate,
    validateOrderDetails,
    validateOrderDetailsUpdate,
    validateProducts,
    validateProductsUpdate,
    validateTransactions,
    validateTransactionsUpdate,
    validateBatches,
    validateBatchesUpdate
};
