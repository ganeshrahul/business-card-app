const { getUserByCredentials } = require('../models/User');
const { generateToken } = require('../config/auth');

const login = async (req, res) => {
    const { username, password } = req.body;
    console.log('Received login request:', { username, password }); // Debugging

    try {
        const results = await new Promise((resolve, reject) => {
            getUserByCredentials(username, password, (err, results) => {
                if (err) {
                    console.error('Database error:', err); // Debugging
                    reject(err);
                }
                console.log('Database results:', results); // Debugging
                resolve(results);
            });
        });

        if (results.length === 0) {
            console.log('No user found with the provided credentials'); // Debugging
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(results[0].id);
        res.cookie('token', token, { httpOnly: true });
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error); // Debugging
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { login };
