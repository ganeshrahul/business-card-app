const { getUserByCredentials } = require('../models/User');

const login = (req, res) => {
    const { username, password } = req.body;
    getUserByCredentials(username, password, (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send('Invalid credentials');
        }
        res.redirect('/cards');
    });
};

module.exports = { login };
