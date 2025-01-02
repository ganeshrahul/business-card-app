const express = require('express');
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route GET /services
 * @desc List all services
 * @access Private
 */
router.get('/', authMiddleware, serviceController.listServices);

module.exports = router;
