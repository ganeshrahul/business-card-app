const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

const getUserByCredentials = (username, password, callback) => {
    const query = 'SELECT * FROM nithrausers WHERE username = ? AND password = ?';
    console.log('Executing query:', query, [username, password]); // Debugging

    pool.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err); // Debugging
            return callback(err, null);
        }
        console.log('Query results:', results); // Debugging
        callback(null, results);
    });
};

module.exports = { getUserByCredentials };
