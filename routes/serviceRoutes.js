const express = require('express');
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, serviceController.listServices);
router.post('/save', authMiddleware, serviceController.saveSelectedServices);

module.exports = router;
