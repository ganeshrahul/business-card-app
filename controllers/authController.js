const { getUserByCredentials } = require('../models/User');
const { generateToken } = require('../config/auth');

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const results = await new Promise((resolve, reject) => {
            getUserByCredentials(username, password, (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(results[0].id);
        res.cookie('token', token, { httpOnly: true });
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { login };
