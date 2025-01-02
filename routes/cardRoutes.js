const multer = require('multer');
const express = require('express');
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Multer for route-specific usage
const upload = multer({ storage: multer.memoryStorage() }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'text', maxCount: 1 },
    { name: 'selectedServices', maxCount: 1 },
]);

// Ensure all routes have valid callback functions
router.get('/', authMiddleware, cardController.listCards); // Check if listCards is defined
router.post('/upload', authMiddleware, (req, res, next) => {
    console.log('Request received at /cards/upload');

    upload(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: err.message });
        }

        // console.log('Multer processed fields:', req.body);
        // console.log('Multer processed files:', req.files);

        // Ensure the image file exists
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'Image file not received' });
        }

        next();
    });
}, cardController.extractMetadata);
router.post('/save', authMiddleware, cardController.saveCard); // Check if saveCard is defined

module.exports = router;
