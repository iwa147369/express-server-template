const googleSheetsService = require('../services/googleSheetsService');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

const SHEET_NAME = process.env.TRANSACTIONS_SHEET_NAME || 'Transactions';

// Get all transactions
const getAllTransactions = asyncHandler(async (req, res) => {
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

// Get transaction by ID
const getTransactionById = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    
    if (!transactionId) {
        throw new AppError('Transaction ID is required', 400);
    }

    const result = await googleSheetsService.findRowByValue(SHEET_NAME, 'Transaction ID', transactionId);
    
    if (!result) {
        throw new AppError(`Transaction with ID ${transactionId} not found`, 404);
    }

    res.status(200).json({
        success: true,
        data: result.data,
        rowIndex: result.rowIndex
    });
});

// Get transaction by field
const getTransactionByField = asyncHandler(async (req, res) => {
    const { field, value } = req.params;
    
    if (!field || !value) {
        throw new AppError('Field and value parameters are required', 400);
    }

    const result = await googleSheetsService.findRowByValue(SHEET_NAME, field, value);
    
    if (!result) {
        throw new AppError(`Transaction with ${field}=${value} not found`, 404);
    }

    res.status(200).json({
        success: true,
        data: result.data,
        rowIndex: result.rowIndex
    });
});

// Create new transaction
const createTransaction = asyncHandler(async (req, res) => {
    const transactionData = req.body;
    
    // Check if transaction ID already exists
    const existingTransaction = await googleSheetsService.findRowByValue(SHEET_NAME, 'Transaction ID', transactionData['Transaction ID']);
    if (existingTransaction) {
        throw new AppError(`Transaction with ID ${transactionData['Transaction ID']} already exists`, 409);
    }
    
    const values = [
        transactionData['Transaction ID'],
        transactionData['Date'],
        transactionData['Category'],
        transactionData['Amount'],
        transactionData['From'],
        transactionData['To'],
        transactionData['Confirmed'] || false,
        transactionData['Note']
    ];

    const result = await googleSheetsService.appendToSheet(SHEET_NAME, values);
    
    res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transactionData,
        sheets_response: result
    });
});

// Update transaction
const updateTransaction = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const updateData = req.body;
    
    if (!transactionId) {
        throw new AppError('Transaction ID is required', 400);
    }

    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, 'Transaction ID', transactionId);
    
    if (!existingRow) {
        throw new AppError(`Transaction with ID ${transactionId} not found`, 404);
    }

    const updatedData = { ...existingRow.data, ...updateData };
    
    const values = [
        updatedData['Transaction ID'],
        updatedData['Date'],
        updatedData['Category'],
        updatedData['Amount'],
        updatedData['From'],
        updatedData['To'],
        updatedData['Confirmed'],
        updatedData['Note']
    ];

    const range = `A${existingRow.rowIndex + 1}:H${existingRow.rowIndex + 1}`;
    const result = await googleSheetsService.updateSheet(SHEET_NAME, range, values);
    
    res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        data: updatedData,
        sheets_response: result
    });
});

// Confirm transaction
const confirmTransaction = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const { confirmed = true } = req.body;
    
    if (!transactionId) {
        throw new AppError('Transaction ID is required', 400);
    }

    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, 'Transaction ID', transactionId);
    
    if (!existingRow) {
        throw new AppError(`Transaction with ID ${transactionId} not found`, 404);
    }

    const updatedData = { ...existingRow.data, 'Confirmed': confirmed };
    
    const values = [
        updatedData['Transaction ID'],
        updatedData['Date'],
        updatedData['Category'],
        updatedData['Amount'],
        updatedData['From'],
        updatedData['To'],
        updatedData['Confirmed'],
        updatedData['Note']
    ];

    const range = `A${existingRow.rowIndex + 1}:H${existingRow.rowIndex + 1}`;
    const result = await googleSheetsService.updateSheet(SHEET_NAME, range, values);
    
    res.status(200).json({
        success: true,
        message: `Transaction ${confirmed ? 'confirmed' : 'unconfirmed'} successfully`,
        data: updatedData,
        sheets_response: result
    });
});

// Delete transaction
const deleteTransaction = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    
    if (!transactionId) {
        throw new AppError('Transaction ID is required', 400);
    }

    const existingRow = await googleSheetsService.findRowByValue(SHEET_NAME, 'Transaction ID', transactionId);
    
    if (!existingRow) {
        throw new AppError(`Transaction with ID ${transactionId} not found`, 404);
    }

    const result = await googleSheetsService.deleteRow(SHEET_NAME, existingRow.rowIndex + 1);
    
    res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully',
        deleted_transaction: existingRow.data,
        sheets_response: result
    });
});

// Get transaction summary
const getTransactionSummary = asyncHandler(async (req, res) => {
    const { category, date_from, date_to } = req.query;
    
    const { data } = await googleSheetsService.readSheet(SHEET_NAME);
    
    let filteredData = data;
    
    // Apply filters
    if (category) {
        filteredData = filteredData.filter(transaction => 
            transaction['Category']?.toLowerCase().includes(category.toLowerCase())
        );
    }
    
    if (date_from) {
        filteredData = filteredData.filter(transaction => transaction['Date'] >= date_from);
    }
    
    if (date_to) {
        filteredData = filteredData.filter(transaction => transaction['Date'] <= date_to);
    }
    
    // Calculate summary
    const summary = {
        total_transactions: filteredData.length,
        confirmed_transactions: filteredData.filter(t => t['Confirmed'] === true || t['Confirmed'] === 'TRUE').length,
        unconfirmed_transactions: filteredData.filter(t => t['Confirmed'] === false || t['Confirmed'] === 'FALSE' || !t['Confirmed']).length,
        total_amount: filteredData.reduce((sum, t) => sum + (parseFloat(t['Amount']) || 0), 0),
        average_amount: filteredData.length > 0 ? filteredData.reduce((sum, t) => sum + (parseFloat(t['Amount']) || 0), 0) / filteredData.length : 0,
        categories: [...new Set(filteredData.map(t => t['Category']).filter(Boolean))],
        date_range: {
            from: date_from || 'N/A',
            to: date_to || 'N/A'
        }
    };
    
    res.status(200).json({
        success: true,
        summary,
        data: filteredData,
        filters_applied: { category, date_from, date_to }
    });
});

// Get transactions with filtering
const getTransactionsWithFilter = asyncHandler(async (req, res) => {
    const { category, confirmed, date_from, date_to, min_amount, max_amount, from, to } = req.query;
    
    const { data } = await googleSheetsService.readSheet(SHEET_NAME);
    
    let filteredData = data;
    
    if (category) {
        filteredData = filteredData.filter(transaction => 
            transaction['Category']?.toLowerCase().includes(category.toLowerCase())
        );
    }
    
    if (confirmed !== undefined) {
        const isConfirmed = confirmed === 'true';
        filteredData = filteredData.filter(transaction => {
            const transactionConfirmed = transaction['Confirmed'] === true || transaction['Confirmed'] === 'TRUE';
            return transactionConfirmed === isConfirmed;
        });
    }
    
    if (date_from) {
        filteredData = filteredData.filter(transaction => transaction['Date'] >= date_from);
    }
    
    if (date_to) {
        filteredData = filteredData.filter(transaction => transaction['Date'] <= date_to);
    }
    
    if (min_amount) {
        filteredData = filteredData.filter(transaction => 
            parseFloat(transaction['Amount']) >= parseFloat(min_amount)
        );
    }
    
    if (max_amount) {
        filteredData = filteredData.filter(transaction => 
            parseFloat(transaction['Amount']) <= parseFloat(max_amount)
        );
    }
    
    if (from) {
        filteredData = filteredData.filter(transaction => 
            transaction['From']?.toLowerCase().includes(from.toLowerCase())
        );
    }
    
    if (to) {
        filteredData = filteredData.filter(transaction => 
            transaction['To']?.toLowerCase().includes(to.toLowerCase())
        );
    }
    
    res.status(200).json({
        success: true,
        data: filteredData,
        count: filteredData.length,
        filters_applied: { category, confirmed, date_from, date_to, min_amount, max_amount, from, to }
    });
});

module.exports = {
    getAllTransactions,
    getTransactionById,
    getTransactionByField,
    createTransaction,
    updateTransaction,
    confirmTransaction,
    deleteTransaction,
    getTransactionSummary,
    getTransactionsWithFilter
};
