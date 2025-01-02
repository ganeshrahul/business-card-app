const mysql = require('mysql2');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// MySQL Connection with better error handling
const connectMySQL = () => {
    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    connection.connect((err) => {
        if (err) {
            console.error('MySQL connection error:', err);
            process.exit(1);
        }
        console.log('MySQL Connected');
    });

    // Handle connection loss
    connection.on('error', (err) => {
        console.error('MySQL error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('MySQL connection lost. Reconnecting...');
            connectMySQL();
        } else {
            throw err;
        }
    });

    return connection;
};

// MongoDB Connection with better error handling
const connectMongoDB = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('MongoDB Connected');
    }).catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });
};

module.exports = { connectMySQL, connectMongoDB };
