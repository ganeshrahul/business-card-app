const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

const getUserByCredentials = (username, password, callback) => {
    pool.query(
        'SELECT * FROM nithrausers WHERE username = ? AND password = ?',
        [username, password],
        callback
    );
};
module.exports = { getUserByCredentials };
