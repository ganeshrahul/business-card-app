const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (userId, username) => {
    return jwt.sign({id: userId, username: username}, process.env.JWT_SECRET, {expiresIn: '1h'});
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {generateToken, verifyToken};
