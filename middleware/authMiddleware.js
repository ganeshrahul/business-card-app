const { verifyToken } = require('../config/auth');

const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token || req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = verifyToken(token.replace('Bearer ', ''));
        req.userId = decoded.id;
        req.username = decoded.username;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};

module.exports = authMiddleware;
