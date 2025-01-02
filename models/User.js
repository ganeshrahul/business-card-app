const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const getUserByCredentials = (username, password, callback) => {
    const query = 'SELECT * FROM nithrausers WHERE username = ? AND password = ?';

    pool.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return callback(err, null);
        }

        callback(null, results);
    });
};

module.exports = { getUserByCredentials };
