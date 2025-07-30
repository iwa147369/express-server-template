const googleSheetsService = require('../services/googleSheetsService');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

const SHEET_NAME = process.env.ORDER_DETAILS_SHEET_NAME || 'Order Details';

// Get all order details
const getAllOrderDetails = asyncHandler(async (req, res) => {
    const { page = 1, limit = 100, range } = req.query;
    
    let sheetRange = range;
    if (!range && page && limit) {
        const startRow = (page - 1) * limit + 2;
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

// Get order details by Order ID
const getOrderDetailsByOrderId = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    
    if (!orderId) {
        throw new AppError('Order ID is required', 400);
    }

    const { data } = await googleSheetsService.readSheet(SHEET_NAME);
    const orderDetails = data.filter(detail => detail['Order ID'] === orderId);
    
    if (orderDetails.length === 0) {
        throw new AppError(`No order details found for Order ID: ${orderId}`, 404);
    }

    res.status(200).json({
        success: true,
        data: orderDetails,
        count: orderDetails.length
    });
});

// Get order detail by field
const getOrderDetailByField = asyncHandler(async (req, res) => {
    const { field, value } = req.params;
    
    if (!field || !value) {
        throw new AppError('Field and value parameters are required', 400);
    }

    const result = await googleSheetsService.findRowByValue(SHEET_NAME, field, value);
    
    if (!result) {
        throw new AppError(`Order detail with ${field}=${value} not found`, 404);
    }

    res.status(200).json({
        success: true,
        data: result.data,
        rowIndex: result.rowIndex
    });
});

// Create new order detail
const createOrderDetail = asyncHandler(async (req, res) => {
    const orderDetailData = req.body;
    
    const values = [
        orderDetailData['Order ID'],
        orderDetailData['Product ID'],
        orderDetailData['Selling Price'],
        orderDetailData['Total Selling Price'],
        orderDetailData['Size'],
        orderDetailData['Color'],
        orderDetailData['Batch ID']
    ];

    const result = await googleSheetsService.appendToSheet(SHEET_NAME, values);
    
    res.status(201).json({
        success: true,
        message: 'Order detail created successfully',
        data: orderDetailData,
        sheets_response: result
    });
});

// Update order detail
const updateOrderDetail = asyncHandler(async (req, res) => {
    const { field, value } = req.params;
    const updateData = req.body;
    
    if (!field || !value) {
        throw new AppError('Field and value parameters are required', 400);
    }

    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, field, value);
    
    if (!existingRow) {
        throw new AppError(`Order detail with ${field}=${value} not found`, 404);
    }

    const updatedData = { ...existingRow.data, ...updateData };
    
    const values = [
        updatedData['Order ID'],
        updatedData['Product ID'],
        updatedData['Selling Price'],
        updatedData['Total Selling Price'],
        updatedData['Size'],
        updatedData['Color'],
        updatedData['Batch ID']
    ];

    const range = `A${existingRow.rowIndex + 1}:G${existingRow.rowIndex + 1}`;
    const result = await googleSheetsService.updateSheet(SHEET_NAME, range, values);
    
    res.status(200).json({
        success: true,
        message: 'Order detail updated successfully',
        data: updatedData,
        sheets_response: result
    });
});

// Delete order detail
const deleteOrderDetail = asyncHandler(async (req, res) => {
    const { field, value } = req.params;
    
    if (!field || !value) {
        throw new AppError('Field and value parameters are required', 400);
    }

    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, field, value);
    
    if (!existingRow) {
        throw new AppError(`Order detail with ${field}=${value} not found`, 404);
    }

    const result = await googleSheetsService.deleteRow(SHEET_NAME, existingRow.rowIndex + 1);
    
    res.status(200).json({
        success: true,
        message: 'Order detail deleted successfully',
        sheets_response: result
    });
});

// Get order details with filtering
const getOrderDetailsWithFilter = asyncHandler(async (req, res) => {
    const { product_id, batch_id, size, color, min_price, max_price } = req.query;
    
    const { data } = await googleSheetsService.readSheet(SHEET_NAME);
    
    let filteredData = data;
    
    if (product_id) {
        filteredData = filteredData.filter(detail => 
            detail['Product ID']?.toLowerCase().includes(product_id.toLowerCase())
        );
    }
    
    if (batch_id) {
        filteredData = filteredData.filter(detail => 
            detail['Batch ID']?.toLowerCase().includes(batch_id.toLowerCase())
        );
    }
    
    if (size) {
        filteredData = filteredData.filter(detail => 
            detail['Size']?.toLowerCase().includes(size.toLowerCase())
        );
    }
    
    if (color) {
        filteredData = filteredData.filter(detail => 
            detail['Color']?.toLowerCase().includes(color.toLowerCase())
        );
    }
    
    if (min_price) {
        filteredData = filteredData.filter(detail => 
            parseFloat(detail['Selling Price']) >= parseFloat(min_price)
        );
    }
    
    if (max_price) {
        filteredData = filteredData.filter(detail => 
            parseFloat(detail['Selling Price']) <= parseFloat(max_price)
        );
    }
    
    res.status(200).json({
        success: true,
        data: filteredData,
        count: filteredData.length,
        filters_applied: { product_id, batch_id, size, color, min_price, max_price }
    });
});

module.exports = {
    getAllOrderDetails,
    getOrderDetailsByOrderId,
    getOrderDetailByField,
    createOrderDetail,
    updateOrderDetail,
    deleteOrderDetail,
    getOrderDetailsWithFilter
};
