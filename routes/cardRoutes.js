const express = require('express');
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure Multer to handle the 'image' and 'text' fields
const upload = multer({ storage: multer.memoryStorage() }).fields([
    { name: 'image', maxCount: 1 }, // Handle the 'image' field
    { name: 'text', maxCount: 1 },  // Handle the 'text' field
]);

const router = express.Router();

// Ensure all routes have valid callback functions
router.get('/', authMiddleware, cardController.listCards); // Check if listCards is defined
router.post('/upload', authMiddleware, upload, cardController.extractMetadata); // Check if extractMetadata is defined
router.post('/save', authMiddleware, cardController.saveCard); // Check if saveCard is defined

module.exports = router;
