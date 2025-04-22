const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/UserController');
const orderController = require('../app/controllers/OrderController');
const PendingController = require('../app/controllers/PendingController');

// User routes
router.get('/users', userController.index);
router.post('/users', userController.store);

// Order routes
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:orderId', orderController.getOrderByOrderId);

// Pending routes
router.get('/pendings', PendingController.getAllPendings);

module.exports = router;
// This file defines the API routes for the application. It uses Express Router to handle requests to the /api/users endpoint.