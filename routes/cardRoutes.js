const express = require('express');
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/', authMiddleware, cardController.listCards);
router.post('/upload', authMiddleware, upload.single('image'), cardController.extractMetadata);
router.post('/save', authMiddleware, cardController.saveCard);

module.exports = router;
