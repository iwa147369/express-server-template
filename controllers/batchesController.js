const googleSheetsService = require('../services/googleSheetsService');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

const SHEET_NAME = process.env.BATCHES_SHEET_NAME || 'Batches';

// Get all batches
const getAllBatches = asyncHandler(async (req, res) => {
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

// Get batch by ID
const getBatchById = asyncHandler(async (req, res) => {
    const { batchId } = req.params;
    
    if (!batchId) {
        throw new AppError('Batch ID is required', 400);
    }

    const result = await googleSheetsService.findRowByValue(SHEET_NAME, 'Batch ID', batchId);
    
    if (!result) {
        throw new AppError(`Batch with ID ${batchId} not found`, 404);
    }

    res.status(200).json({
        success: true,
        data: result.data,
        rowIndex: result.rowIndex
    });
});

// Get batches by Product ID
const getBatchesByProductId = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    
    if (!productId) {
        throw new AppError('Product ID is required', 400);
    }

    const { data } = await googleSheetsService.readSheet(SHEET_NAME);
    const batches = data.filter(batch => batch['Product ID'] === productId);
    
    if (batches.length === 0) {
        throw new AppError(`No batches found for Product ID: ${productId}`, 404);
    }

    // Calculate total quantity for the product
    const totalQuantity = batches.reduce((sum, batch) => sum + (parseInt(batch['Quantity']) || 0), 0);
    const averageCost = batches.length > 0 ? 
        batches.reduce((sum, batch) => sum + (parseFloat(batch['Unit Cost Price']) || 0), 0) / batches.length : 0;

    res.status(200).json({
        success: true,
        data: batches,
        count: batches.length,
        summary: {
            product_id: productId,
            total_quantity: totalQuantity,
            average_unit_cost: averageCost,
            total_batches: batches.length
        }
    });
});

// Get batch by field
const getBatchByField = asyncHandler(async (req, res) => {
    const { field, value } = req.params;
    
    if (!field || !value) {
        throw new AppError('Field and value parameters are required', 400);
    }

    const result = await googleSheetsService.findRowByValue(SHEET_NAME, field, value);
    
    if (!result) {
        throw new AppError(`Batch with ${field}=${value} not found`, 404);
    }

    res.status(200).json({
        success: true,
        data: result.data,
        rowIndex: result.rowIndex
    });
});

// Create new batch
const createBatch = asyncHandler(async (req, res) => {
    const batchData = req.body;
    
    // Check if batch ID already exists
    const existingBatch = await googleSheetsService.findRowByValue(SHEET_NAME, 'Batch ID', batchData['Batch ID']);
    if (existingBatch) {
        throw new AppError(`Batch with ID ${batchData['Batch ID']} already exists`, 409);
    }
    
    const values = [
        batchData['Batch ID'],
        batchData['Product ID'],
        batchData['Unit Cost Price'],
        batchData['Quantity'],
        batchData['Import Date']
    ];

    const result = await googleSheetsService.appendToSheet(SHEET_NAME, values);
    
    res.status(201).json({
        success: true,
        message: 'Batch created successfully',
        data: batchData,
        sheets_response: result
    });
});

// Update batch
const updateBatch = asyncHandler(async (req, res) => {
    const { batchId } = req.params;
    const updateData = req.body;
    
    if (!batchId) {
        throw new AppError('Batch ID is required', 400);
    }

    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, 'Batch ID', batchId);
    
    if (!existingRow) {
        throw new AppError(`Batch with ID ${batchId} not found`, 404);
    }

    const updatedData = { ...existingRow.data, ...updateData };
    
    const values = [
        updatedData['Batch ID'],
        updatedData['Product ID'],
        updatedData['Unit Cost Price'],
        updatedData['Quantity'],
        updatedData['Import Date']
    ];

    const range = `A${existingRow.rowIndex + 1}:E${existingRow.rowIndex + 1}`;
    const result = await googleSheetsService.updateSheet(SHEET_NAME, range, values);
    
    res.status(200).json({
        success: true,
        message: 'Batch updated successfully',
        data: updatedData,
        sheets_response: result
    });
});

// Update batch quantity
const updateBatchQuantity = asyncHandler(async (req, res) => {
    const { batchId } = req.params;
    const { quantity, adjustment } = req.body;
    
    if (!batchId) {
        throw new AppError('Batch ID is required', 400);
    }

    if (quantity === undefined && adjustment === undefined) {
        throw new AppError('Either quantity or adjustment is required', 400);
    }

    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, 'Batch ID', batchId);
    
    if (!existingRow) {
        throw new AppError(`Batch with ID ${batchId} not found`, 404);
    }

    let newQuantity;
    if (quantity !== undefined) {
        newQuantity = parseInt(quantity);
    } else {
        const currentQuantity = parseInt(existingRow.data['Quantity']) || 0;
        newQuantity = currentQuantity + parseInt(adjustment);
    }

    if (newQuantity < 0) {
        throw new AppError('Batch quantity cannot be negative', 400);
    }

    const updatedData = { ...existingRow.data, 'Quantity': newQuantity };
    
    const values = [
        updatedData['Batch ID'],
        updatedData['Product ID'],
        updatedData['Unit Cost Price'],
        updatedData['Quantity'],
        updatedData['Import Date']
    ];

    const range = `A${existingRow.rowIndex + 1}:E${existingRow.rowIndex + 1}`;
    const result = await googleSheetsService.updateSheet(SHEET_NAME, range, values);
    
    res.status(200).json({
        success: true,
        message: 'Batch quantity updated successfully',
        data: updatedData,
        previous_quantity: existingRow.data['Quantity'],
        new_quantity: newQuantity,
        sheets_response: result
    });
});

// Delete batch
const deleteBatch = asyncHandler(async (req, res) => {
    const { batchId } = req.params;
    
    if (!batchId) {
        throw new AppError('Batch ID is required', 400);
    }

    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, 'Batch ID', batchId);
    
    if (!existingRow) {
        throw new AppError(`Batch with ID ${batchId} not found`, 404);
    }

    const result = await googleSheetsService.deleteRow(SHEET_NAME, existingRow.rowIndex + 1);
    
    res.status(200).json({
        success: true,
        message: 'Batch deleted successfully',
        deleted_batch: existingRow.data,
        sheets_response: result
    });
});

// Get batch inventory summary
const getBatchInventorySummary = asyncHandler(async (req, res) => {
    const { product_id } = req.query;
    
    const { data } = await googleSheetsService.readSheet(SHEET_NAME);
    
    let filteredData = data;
    if (product_id) {
        filteredData = data.filter(batch => batch['Product ID'] === product_id);
    }
    
    // Group by product ID
    const productSummary = {};
    
    filteredData.forEach(batch => {
        const productId = batch['Product ID'];
        if (!productSummary[productId]) {
            productSummary[productId] = {
                product_id: productId,
                total_quantity: 0,
                total_batches: 0,
                average_cost: 0,
                total_cost_value: 0,
                batches: []
            };
        }
        
        const quantity = parseInt(batch['Quantity']) || 0;
        const unitCost = parseFloat(batch['Unit Cost Price']) || 0;
        
        productSummary[productId].total_quantity += quantity;
        productSummary[productId].total_batches += 1;
        productSummary[productId].total_cost_value += (quantity * unitCost);
        productSummary[productId].batches.push(batch);
    });
    
    // Calculate average costs
    Object.values(productSummary).forEach(summary => {
        if (summary.total_quantity > 0) {
            summary.average_cost = summary.total_cost_value / summary.total_quantity;
        }
    });
    
    const summaryArray = Object.values(productSummary);
    
    res.status(200).json({
        success: true,
        data: summaryArray,
        total_products: summaryArray.length,
        overall_summary: {
            total_batches: filteredData.length,
            total_quantity: summaryArray.reduce((sum, p) => sum + p.total_quantity, 0),
            total_value: summaryArray.reduce((sum, p) => sum + p.total_cost_value, 0)
        }
    });
});

// Get batches with filtering
const getBatchesWithFilter = asyncHandler(async (req, res) => {
    const { product_id, min_cost, max_cost, min_quantity, max_quantity, import_date_from, import_date_to } = req.query;
    
    const { data } = await googleSheetsService.readSheet(SHEET_NAME);
    
    let filteredData = data;
    
    if (product_id) {
        filteredData = filteredData.filter(batch => 
            batch['Product ID']?.toLowerCase().includes(product_id.toLowerCase())
        );
    }
    
    if (min_cost) {
        filteredData = filteredData.filter(batch => 
            parseFloat(batch['Unit Cost Price']) >= parseFloat(min_cost)
        );
    }
    
    if (max_cost) {
        filteredData = filteredData.filter(batch => 
            parseFloat(batch['Unit Cost Price']) <= parseFloat(max_cost)
        );
    }
    
    if (min_quantity) {
        filteredData = filteredData.filter(batch => 
            parseInt(batch['Quantity']) >= parseInt(min_quantity)
        );
    }
    
    if (max_quantity) {
        filteredData = filteredData.filter(batch => 
            parseInt(batch['Quantity']) <= parseInt(max_quantity)
        );
    }
    
    if (import_date_from) {
        filteredData = filteredData.filter(batch => batch['Import Date'] >= import_date_from);
    }
    
    if (import_date_to) {
        filteredData = filteredData.filter(batch => batch['Import Date'] <= import_date_to);
    }
    
    res.status(200).json({
        success: true,
        data: filteredData,
        count: filteredData.length,
        filters_applied: { product_id, min_cost, max_cost, min_quantity, max_quantity, import_date_from, import_date_to }
    });
});

module.exports = {
    getAllBatches,
    getBatchById,
    getBatchesByProductId,
    getBatchByField,
    createBatch,
    updateBatch,
    updateBatchQuantity,
    deleteBatch,
    getBatchInventorySummary,
    getBatchesWithFilter
};
