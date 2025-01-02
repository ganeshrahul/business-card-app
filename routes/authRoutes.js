const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.get('/login', (req, res) => {
    res.json({ message: 'Login page' });
});

module.exports = router;
