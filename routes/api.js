const express = require('express');
const router = express.Router();

// const userController = require('../app/controllers/UserController');
const OrderController = require('../app/controllers/OrderController');
const PendingController = require('../app/controllers/PendingController');
const ProductController = require('../app/controllers/ProductController');
const WarehouseController = require('../app/controllers/WarehouseController');

// User routes
// router.get('/users', userController.index);
// router.post('/users', userController.store);

// Order routes
router.get('/orders', OrderController.getAllOrders);
router.get('/orders/:orderId', OrderController.getOrderByOrderId);

// Pending routes
router.get('/pendings', PendingController.getAllPendings);
router.get('/pendings/:bookingId', PendingController.getPendingByBookingId);

// Product routes
router.get('/products', ProductController.getAllProducts);
router.get('/products/:id', ProductController.getProductById);

// Warehouse routes
router.get('/warehouses', WarehouseController.getAllWarehouses);
router.get('/warehouses/:id', WarehouseController.getWarehouseById);

module.exports = router;
// This file defines the API routes for the application. It uses Express Router to handle requests to the /api/users endpoint.