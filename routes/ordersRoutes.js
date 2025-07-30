const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { validateOrders, validateOrdersUpdate } = require('../middlewares/validation');

// GET /api/orders - Get all orders with pagination
router.get('/', ordersController.getAllOrders);

// GET /api/orders/filter - Get orders with filtering
router.get('/filter', ordersController.getOrdersWithFilter);

// GET /api/orders/id/:orderId - Get order by OrderID
router.get('/id/:orderId', ordersController.getOrderById);

// GET /api/orders/:field/:value - Get order by field value
router.get('/:field/:value', ordersController.getOrderByField);

// POST /api/orders - Create new order
router.post('/', validateOrders, ordersController.createOrder);

// PUT /api/orders/:field/:value - Update order by field value
router.put('/:field/:value', validateOrdersUpdate, ordersController.updateOrder);

// DELETE /api/orders/:field/:value - Delete order by field value
router.delete('/:field/:value', ordersController.deleteOrder);

module.exports = router;
