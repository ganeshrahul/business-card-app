const { verifyToken } = require('../config/auth');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization'];
    console.log('Received token:', token); // Debugging
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = verifyToken(token);
        console.log('Decoded token:', decoded); // Debugging
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error('Token verification error:', error); // Debugging
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = authMiddleware;
