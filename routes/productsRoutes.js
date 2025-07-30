const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { validateProducts, validateProductsUpdate } = require('../middlewares/validation');

// GET /api/products - Get all products with pagination
router.get('/', productsController.getAllProducts);

// GET /api/products/filter - Get products with filtering
router.get('/filter', productsController.getProductsWithFilter);

// GET /api/products/low-stock - Get products with low stock
router.get('/low-stock', productsController.getLowStockProducts);

// GET /api/products/id/:productId - Get product by ID
router.get('/id/:productId', productsController.getProductById);

// GET /api/products/:field/:value - Get product by field value
router.get('/:field/:value', productsController.getProductByField);

// POST /api/products - Create new product
router.post('/', validateProducts, productsController.createProduct);

// PUT /api/products/:productId - Update product by ID
router.put('/:productId', validateProductsUpdate, productsController.updateProduct);

// PATCH /api/products/:productId/stock - Update product stock
router.patch('/:productId/stock', productsController.updateProductStock);

// DELETE /api/products/:productId - Delete product by ID
router.delete('/:productId', productsController.deleteProduct);

module.exports = router;
