const { verifyToken } = require('../config/auth');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization'];
    if (!token) {
        return res.status(401).redirect('/');
    }
    try {
        const decoded = verifyToken(token);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).redirect('/');
    }
};

module.exports = authMiddleware;
