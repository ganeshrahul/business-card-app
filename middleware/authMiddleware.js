const {verifyToken} = require('../config/auth');

const authMiddleware = (req, res, next) => {
    console.log('authMiddleware invoked');
    const token = req.cookies.token || req.headers['authorization'];
    console.log('Received token:', token); // Add this log
    if (!token) {
        return res.status(401).json({error: 'Unauthorized: No token provided'});
    }
    try {
        const decoded = verifyToken(token);
        console.log('Decoded token:', decoded);
        req.userId = decoded.id;
        req.username = decoded.username;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({error: 'Unauthorized: Invalid token'});
    }
};


module.exports = authMiddleware;
