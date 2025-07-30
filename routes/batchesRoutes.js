const express = require('express');
const router = express.Router();
const batchesController = require('../controllers/batchesController');
const { validateBatches, validateBatchesUpdate } = require('../middlewares/validation');

// GET /api/batches - Get all batches with pagination
router.get('/', batchesController.getAllBatches);

// GET /api/batches/filter - Get batches with filtering
router.get('/filter', batchesController.getBatchesWithFilter);

// GET /api/batches/inventory-summary - Get batch inventory summary
router.get('/inventory-summary', batchesController.getBatchInventorySummary);

// GET /api/batches/product/:productId - Get batches by Product ID
router.get('/product/:productId', batchesController.getBatchesByProductId);

// GET /api/batches/id/:batchId - Get batch by ID
router.get('/id/:batchId', batchesController.getBatchById);

// GET /api/batches/:field/:value - Get batch by field value
router.get('/:field/:value', batchesController.getBatchByField);

// POST /api/batches - Create new batch
router.post('/', validateBatches, batchesController.createBatch);

// PUT /api/batches/:batchId - Update batch by ID
router.put('/:batchId', validateBatchesUpdate, batchesController.updateBatch);

// PATCH /api/batches/:batchId/quantity - Update batch quantity
router.patch('/:batchId/quantity', batchesController.updateBatchQuantity);

// DELETE /api/batches/:batchId - Delete batch by ID
router.delete('/:batchId', batchesController.deleteBatch);

module.exports = router;
