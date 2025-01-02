const { getUserByCredentials } = require('../models/User');
const { generateToken } = require('../config/auth');

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await new Promise((resolve, reject) => {
            getUserByCredentials(username, password, (err, results) => {
                if (err) {
                    reject(new Error('Database error'));
                } else if (!results || results.length === 0) {
                    reject(new Error('Invalid credentials'));
                } else {
                    resolve(results[0]);
                }
            });
        });

        const token = generateToken(user.id, username);
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(200).json({ token });
    } catch (error) {
        const statusCode = error.message === 'Invalid credentials' ? 401 : 500;
        res.status(statusCode).json({ error: error.message });
    }
};

module.exports = { login };
