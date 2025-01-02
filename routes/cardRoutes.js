const express = require('express');
const multer = require('multer');
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Multer for route-specific usage
const upload = multer({ storage: multer.memoryStorage() }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'text', maxCount: 1 },
    { name: 'selectedServices', maxCount: 1 },
]);

/**
 * @route GET /cards
 * @desc List all business cards with pagination
 * @access Private
 */
router.get('/', authMiddleware, cardController.listCards);

/**
 * @route POST /cards/upload
 * @desc Extract metadata from uploaded business card
 * @access Private
 */
router.post('/upload', authMiddleware, (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, cardController.extractMetadata);

/**
 * @route POST /cards/save
 * @desc Save a new business card
 * @access Private
 */
router.post('/save', authMiddleware, cardController.saveCard);

module.exports = router;
