const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const { validateTransactions, validateTransactionsUpdate } = require('../middlewares/validation');

// GET /api/transactions - Get all transactions with pagination
router.get('/', transactionsController.getAllTransactions);

// GET /api/transactions/filter - Get transactions with filtering
router.get('/filter', transactionsController.getTransactionsWithFilter);

// GET /api/transactions/summary - Get transaction summary with analytics
router.get('/summary', transactionsController.getTransactionSummary);

// GET /api/transactions/id/:transactionId - Get transaction by ID
router.get('/id/:transactionId', transactionsController.getTransactionById);

// GET /api/transactions/:field/:value - Get transaction by field value
router.get('/:field/:value', transactionsController.getTransactionByField);

// POST /api/transactions - Create new transaction
router.post('/', validateTransactions, transactionsController.createTransaction);

// PUT /api/transactions/:transactionId - Update transaction by ID
router.put('/:transactionId', validateTransactionsUpdate, transactionsController.updateTransaction);

// PATCH /api/transactions/:transactionId/confirm - Confirm/unconfirm transaction
router.patch('/:transactionId/confirm', transactionsController.confirmTransaction);

// DELETE /api/transactions/:transactionId - Delete transaction by ID
router.delete('/:transactionId', transactionsController.deleteTransaction);

module.exports = router;
