const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (userId, username) => {
    try {
        return jwt.sign(
            { id: userId, username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Token generation failed');
    }
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Error verifying token:', error);
        throw new Error('Invalid or expired token');
    }
};

module.exports = { generateToken, verifyToken };
