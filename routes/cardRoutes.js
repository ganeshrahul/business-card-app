const express = require('express');
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/', authMiddleware, cardController.listCards);
router.get('/add', authMiddleware, cardController.addCardForm);  // New route
router.post('/upload', authMiddleware, upload.single('image'), cardController.extractMetadata);
router.post('/save', authMiddleware, cardController.saveCard);

module.exports = router;
