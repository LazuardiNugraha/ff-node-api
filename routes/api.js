const express = require('express');
const router = express.Router();
const userController = require('../app/controllers/UserController');

router.get('/users', userController.index);
router.post('/users', userController.store);

module.exports = router;
// This file defines the API routes for the application. It uses Express Router to handle requests to the /api/users endpoint.