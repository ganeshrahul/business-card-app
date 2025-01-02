const express = require('express');
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure all routes have valid callback functions
router.get('/', authMiddleware, cardController.listCards); // Check if listCards is defined
router.post('/upload', authMiddleware, (req, res, next) => {
    console.log('Request received at /cards/upload'); // Log the request
    console.log('Multer processed fields:', req.body); // Log the processed fields
    console.log('Multer processed files:', req.files); // Log the processed files
    next();
}, cardController.extractMetadata);

router.post('/save', authMiddleware, cardController.saveCard); // Check if saveCard is defined

module.exports = router;
