const express = require('express');
const router = express.Router();
const orderDetailsController = require('../controllers/orderDetailsController');
const { validateOrderDetails, validateOrderDetailsUpdate } = require('../middlewares/validation');

// GET /api/order-details - Get all order details with pagination
router.get('/', orderDetailsController.getAllOrderDetails);

// GET /api/order-details/filter - Get order details with filtering
router.get('/filter', orderDetailsController.getOrderDetailsWithFilter);

// GET /api/order-details/order/:orderId - Get order details by Order ID
router.get('/order/:orderId', orderDetailsController.getOrderDetailsByOrderId);

// GET /api/order-details/:field/:value - Get order detail by field value
router.get('/:field/:value', orderDetailsController.getOrderDetailByField);

// POST /api/order-details - Create new order detail
router.post('/', validateOrderDetails, orderDetailsController.createOrderDetail);

// PUT /api/order-details/:field/:value - Update order detail by field value
router.put('/:field/:value', validateOrderDetailsUpdate, orderDetailsController.updateOrderDetail);

// DELETE /api/order-details/:field/:value - Delete order detail by field value
router.delete('/:field/:value', orderDetailsController.deleteOrderDetail);

module.exports = router;
