const googleSheetsService = require('../services/googleSheetsService');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

const SHEET_NAME = process.env.ORDERS_SHEET_NAME || 'Orders';

// Get all orders
const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 100, range } = req.query;
    
    let sheetRange = range;
    if (!range && page && limit) {
        const startRow = (page - 1) * limit + 2; // +2 to account for header row and 1-based indexing
        const endRow = startRow + parseInt(limit) - 1;
        sheetRange = `A${startRow}:Z${endRow}`;
    }

    const result = await googleSheetsService.readSheet(SHEET_NAME, sheetRange);
    
    res.status(200).json({
        success: true,
        data: result.data,
        headers: result.headers,
        count: result.data.length
    });
});

// Get order by ID (assuming Order ID is not in Orders sheet, but we can search by other fields)
const getOrderByField = asyncHandler(async (req, res) => {
    const { field, value } = req.params;
    
    if (!field || !value) {
        throw new AppError('Field and value parameters are required', 400);
    }

    const result = await googleSheetsService.findRowByValue(SHEET_NAME, field, value);
    
    if (!result) {
        throw new AppError(`Order with ${field}=${value} not found`, 404);
    }

    res.status(200).json({
        success: true,
        data: result.data,
        rowIndex: result.rowIndex
    });
});

// Get order by OrderID specifically
const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    
    if (!orderId) {
        throw new AppError('OrderID is required', 400);
    }

    const result = await googleSheetsService.findRowByValue(SHEET_NAME, 'OrderID', orderId);
    
    if (!result) {
        throw new AppError(`Order with ID ${orderId} not found`, 404);
    }

    res.status(200).json({
        success: true,
        data: result.data,
        rowIndex: result.rowIndex
    });
});

// Create new order
const createOrder = asyncHandler(async (req, res) => {
    const orderData = req.body;
    
    // Check if OrderID already exists
    const existingOrder = await googleSheetsService.findRowByValue(SHEET_NAME, 'OrderID', orderData['OrderID']);
    if (existingOrder) {
        throw new AppError(`Order with ID ${orderData['OrderID']} already exists`, 409);
    }
    
    // Convert object to array based on expected column order (OrderID first)
    const values = [
        orderData['OrderID'],
        orderData['Order Date'],
        orderData['Channel'],
        orderData['Remark'],
        orderData['Platform'],
        orderData['Username'],
        orderData['Recipient'],
        orderData['Phone Number'],
        orderData['Address'],
        orderData['Process']
    ];

    const result = await googleSheetsService.appendToSheet(SHEET_NAME, values);
    
    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: orderData,
        sheets_response: result
    });
});

// Update order
const updateOrder = asyncHandler(async (req, res) => {
    const { field, value } = req.params;
    const updateData = req.body;
    
    if (!field || !value) {
        throw new AppError('Field and value parameters are required', 400);
    }

    // First, find the row
    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, field, value);
    
    if (!existingRow) {
        throw new AppError(`Order with ${field}=${value} not found`, 404);
    }

    // Merge existing data with update data
    const updatedData = { ...existingRow.data, ...updateData };
    
    // Convert to array format (OrderID first)
    const values = [
        updatedData['OrderID'],
        updatedData['Order Date'],
        updatedData['Channel'],
        updatedData['Remark'],
        updatedData['Platform'],
        updatedData['Username'],
        updatedData['Recipient'],
        updatedData['Phone Number'],
        updatedData['Address'],
        updatedData['Process']
    ];

    const range = `A${existingRow.rowIndex + 1}:J${existingRow.rowIndex + 1}`; // Updated to J for 10 columns
    const result = await googleSheetsService.updateSheet(SHEET_NAME, range, values);
    
    res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: updatedData,
        sheets_response: result
    });
});

// Delete order
const deleteOrder = asyncHandler(async (req, res) => {
    const { field, value } = req.params;
    
    if (!field || !value) {
        throw new AppError('Field and value parameters are required', 400);
    }

    // First, find the row
    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, field, value);
    
    if (!existingRow) {
        throw new AppError(`Order with ${field}=${value} not found`, 404);
    }

    const result = await googleSheetsService.deleteRow(SHEET_NAME, existingRow.rowIndex + 1); // +1 for 1-based indexing
    
    res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
        sheets_response: result
    });
});

// Get orders with filtering
const getOrdersWithFilter = asyncHandler(async (req, res) => {
    const { channel, platform, process, date_from, date_to } = req.query;
    
    const { data } = await googleSheetsService.readSheet(SHEET_NAME);
    
    let filteredData = data;
    
    // Apply filters
    if (channel) {
        filteredData = filteredData.filter(order => 
            order['Channel']?.toLowerCase().includes(channel.toLowerCase())
        );
    }
    
    if (platform) {
        filteredData = filteredData.filter(order => 
            order['Platform']?.toLowerCase().includes(platform.toLowerCase())
        );
    }
    
    if (process) {
        filteredData = filteredData.filter(order => 
            order['Process']?.toLowerCase().includes(process.toLowerCase())
        );
    }
    
    // Date filtering (basic string comparison - could be enhanced with proper date parsing)
    if (date_from) {
        filteredData = filteredData.filter(order => order['Order Date'] >= date_from);
    }
    
    if (date_to) {
        filteredData = filteredData.filter(order => order['Order Date'] <= date_to);
    }
    
    res.status(200).json({
        success: true,
        data: filteredData,
        count: filteredData.length,
        filters_applied: { channel, platform, process, date_from, date_to }
    });
});

module.exports = {
    getAllOrders,
    getOrderByField,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrdersWithFilter
};
