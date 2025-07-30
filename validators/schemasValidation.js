const Joi = require('joi');

// Orders validation schema
const ordersSchema = Joi.object({
    'OrderID': Joi.string().required(),
    'Order Date': Joi.string().required(),
    'Channel': Joi.string().required(),
    'Remark': Joi.string().allow(''),
    'Platform': Joi.string().required(),
    'Username': Joi.string().required(),
    'Recipient': Joi.string().required(),
    'Phone Number': Joi.string().required(),
    'Address': Joi.string().required(),
    'Process': Joi.string().allow('')
});

// Order Details validation schema
const orderDetailsSchema = Joi.object({
    'Order ID': Joi.string().required(),
    'Product ID': Joi.string().required(),
    'Selling Price': Joi.number().positive().required(),
    'Total Selling Price': Joi.number().positive().required(),
    'Size': Joi.string().allow(''),
    'Color': Joi.string().allow(''),
    'Batch ID': Joi.string().required()
});

// Products validation schema
const productsSchema = Joi.object({
    'Product ID': Joi.string().required(),
    'Product Name': Joi.string().required(),
    'Selling Price': Joi.number().positive().required(),
    'Current Stock': Joi.number().integer().min(0).required(),
    'Min Stock': Joi.number().integer().min(0).required()
});

// Transactions validation schema
const transactionsSchema = Joi.object({
    'Transaction ID': Joi.string().required(),
    'Date': Joi.string().required(),
    'Category': Joi.string().required(),
    'Amount': Joi.number().required(),
    'From': Joi.string().allow(''),
    'To': Joi.string().allow(''),
    'Confirmed': Joi.boolean().default(false),
    'Note': Joi.string().allow('')
});

// Batches validation schema
const batchesSchema = Joi.object({
    'Batch ID': Joi.string().required(),
    'Product ID': Joi.string().required(),
    'Unit Cost Price': Joi.number().positive().required(),
    'Quantity': Joi.number().integer().positive().required(),
    'Import Date': Joi.string().required()
});

// Update schemas (for partial updates)
const ordersUpdateSchema = ordersSchema.fork(Object.keys(ordersSchema.describe().keys), (schema) => schema.optional());
const orderDetailsUpdateSchema = orderDetailsSchema.fork(Object.keys(orderDetailsSchema.describe().keys), (schema) => schema.optional());
const productsUpdateSchema = productsSchema.fork(Object.keys(productsSchema.describe().keys), (schema) => schema.optional());
const transactionsUpdateSchema = transactionsSchema.fork(Object.keys(transactionsSchema.describe().keys), (schema) => schema.optional());
const batchesUpdateSchema = batchesSchema.fork(Object.keys(batchesSchema.describe().keys), (schema) => schema.optional());

module.exports = {
    // Create schemas
    orders: ordersSchema,
    orderDetails: orderDetailsSchema,
    products: productsSchema,
    transactions: transactionsSchema,
    batches: batchesSchema,
    
    // Update schemas
    ordersUpdate: ordersUpdateSchema,
    orderDetailsUpdate: orderDetailsUpdateSchema,
    productsUpdate: productsUpdateSchema,
    transactionsUpdate: transactionsUpdateSchema,
    batchesUpdate: batchesUpdateSchema
};
