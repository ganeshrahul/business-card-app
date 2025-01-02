const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @route POST /auth/login
 * @desc Login a user and return a JWT token
 * @access Public
 */
router.post('/login', authController.login);

module.exports = router;
