const googleSheetsService = require('../services/googleSheetsService');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

const SHEET_NAME = process.env.PRODUCTS_SHEET_NAME || 'Products';

// Get all products
const getAllProducts = asyncHandler(async (req, res) => {
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

// Get product by ID
const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    
    if (!productId) {
        throw new AppError('Product ID is required', 400);
    }

    const result = await googleSheetsService.findRowByValue(SHEET_NAME, 'Product ID', productId);
    
    if (!result) {
        throw new AppError(`Product with ID ${productId} not found`, 404);
    }

    res.status(200).json({
        success: true,
        data: result.data,
        rowIndex: result.rowIndex
    });
});

// Get product by field
const getProductByField = asyncHandler(async (req, res) => {
    const { field, value } = req.params;
    
    if (!field || !value) {
        throw new AppError('Field and value parameters are required', 400);
    }

    const result = await googleSheetsService.findRowByValue(SHEET_NAME, field, value);
    
    if (!result) {
        throw new AppError(`Product with ${field}=${value} not found`, 404);
    }

    res.status(200).json({
        success: true,
        data: result.data,
        rowIndex: result.rowIndex
    });
});

// Create new product
const createProduct = asyncHandler(async (req, res) => {
    const productData = req.body;
    
    // Check if product ID already exists
    const existingProduct = await googleSheetsService.findRowByValue(SHEET_NAME, 'Product ID', productData['Product ID']);
    if (existingProduct) {
        throw new AppError(`Product with ID ${productData['Product ID']} already exists`, 409);
    }
    
    const values = [
        productData['Product ID'],
        productData['Product Name'],
        productData['Selling Price'],
        productData['Current Stock'],
        productData['Min Stock']
    ];

    const result = await googleSheetsService.appendToSheet(SHEET_NAME, values);
    
    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: productData,
        sheets_response: result
    });
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const updateData = req.body;
    
    if (!productId) {
        throw new AppError('Product ID is required', 400);
    }

    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, 'Product ID', productId);
    
    if (!existingRow) {
        throw new AppError(`Product with ID ${productId} not found`, 404);
    }

    const updatedData = { ...existingRow.data, ...updateData };
    
    const values = [
        updatedData['Product ID'],
        updatedData['Product Name'],
        updatedData['Selling Price'],
        updatedData['Current Stock'],
        updatedData['Min Stock']
    ];

    const range = `A${existingRow.rowIndex + 1}:E${existingRow.rowIndex + 1}`;
    const result = await googleSheetsService.updateSheet(SHEET_NAME, range, values);
    
    res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedData,
        sheets_response: result
    });
});

// Update product stock
const updateProductStock = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { current_stock, adjustment } = req.body;
    
    if (!productId) {
        throw new AppError('Product ID is required', 400);
    }

    if (current_stock === undefined && adjustment === undefined) {
        throw new AppError('Either current_stock or adjustment is required', 400);
    }

    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, 'Product ID', productId);
    
    if (!existingRow) {
        throw new AppError(`Product with ID ${productId} not found`, 404);
    }

    let newStock;
    if (current_stock !== undefined) {
        newStock = parseInt(current_stock);
    } else {
        const currentStock = parseInt(existingRow.data['Current Stock']) || 0;
        newStock = currentStock + parseInt(adjustment);
    }

    if (newStock < 0) {
        throw new AppError('Stock cannot be negative', 400);
    }

    const updatedData = { ...existingRow.data, 'Current Stock': newStock };
    
    const values = [
        updatedData['Product ID'],
        updatedData['Product Name'],
        updatedData['Selling Price'],
        updatedData['Current Stock'],
        updatedData['Min Stock']
    ];

    const range = `A${existingRow.rowIndex + 1}:E${existingRow.rowIndex + 1}`;
    const result = await googleSheetsService.updateSheet(SHEET_NAME, range, values);
    
    res.status(200).json({
        success: true,
        message: 'Product stock updated successfully',
        data: updatedData,
        previous_stock: existingRow.data['Current Stock'],
        new_stock: newStock,
        sheets_response: result
    });
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    
    if (!productId) {
        throw new AppError('Product ID is required', 400);
    }

    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, 'Product ID', productId);
    
    if (!existingRow) {
        throw new AppError(`Product with ID ${productId} not found`, 404);
    }

    const result = await googleSheetsService.deleteRow(SHEET_NAME, existingRow.rowIndex + 1);
    
    res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        deleted_product: existingRow.data,
        sheets_response: result
    });
});

// Get products with low stock
const getLowStockProducts = asyncHandler(async (req, res) => {
    const { data } = await googleSheetsService.readSheet(SHEET_NAME);
    
    const lowStockProducts = data.filter(product => {
        const currentStock = parseInt(product['Current Stock']) || 0;
        const minStock = parseInt(product['Min Stock']) || 0;
        return currentStock <= minStock;
    });
    
    res.status(200).json({
        success: true,
        data: lowStockProducts,
        count: lowStockProducts.length,
        message: lowStockProducts.length > 0 ? 'Products with low stock found' : 'No products with low stock'
    });
});

// Get products with filtering
const getProductsWithFilter = asyncHandler(async (req, res) => {
    const { name, min_price, max_price, min_stock, max_stock, low_stock_only } = req.query;
    
    const { data } = await googleSheetsService.readSheet(SHEET_NAME);
    
    let filteredData = data;
    
    if (name) {
        filteredData = filteredData.filter(product => 
            product['Product Name']?.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    if (min_price) {
        filteredData = filteredData.filter(product => 
            parseFloat(product['Selling Price']) >= parseFloat(min_price)
        );
    }
    
    if (max_price) {
        filteredData = filteredData.filter(product => 
            parseFloat(product['Selling Price']) <= parseFloat(max_price)
        );
    }
    
    if (min_stock) {
        filteredData = filteredData.filter(product => 
            parseInt(product['Current Stock']) >= parseInt(min_stock)
        );
    }
    
    if (max_stock) {
        filteredData = filteredData.filter(product => 
            parseInt(product['Current Stock']) <= parseInt(max_stock)
        );
    }
    
    if (low_stock_only === 'true') {
        filteredData = filteredData.filter(product => {
            const currentStock = parseInt(product['Current Stock']) || 0;
            const minStock = parseInt(product['Min Stock']) || 0;
            return currentStock <= minStock;
        });
    }
    
    res.status(200).json({
        success: true,
        data: filteredData,
        count: filteredData.length,
        filters_applied: { name, min_price, max_price, min_stock, max_stock, low_stock_only }
    });
});

module.exports = {
    getAllProducts,
    getProductById,
    getProductByField,
    createProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    getLowStockProducts,
    getProductsWithFilter
};
