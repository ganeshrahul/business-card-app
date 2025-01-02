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
router.post('/upload', authMiddleware, (req, res, next) => {
    console.log('Request received at /cards/upload'); // Log the request
    upload(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: err.message });
        }
        console.log('Multer processed fields:', req.body); // Log the processed fields
        console.log('Multer processed files:', req.files); // Log the processed files
        next();
    });
}, cardController.extractMetadata);

router.post('/save', authMiddleware, cardController.saveCard); // Check if saveCard is defined

module.exports = router;
