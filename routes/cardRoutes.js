const express = require('express');
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/', authMiddleware, cardController.listCards);
router.post('/upload', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'text', maxCount: 1 }]), cardController.extractMetadata);
router.post('/save', authMiddleware, cardController.saveCard);

module.exports = router;
