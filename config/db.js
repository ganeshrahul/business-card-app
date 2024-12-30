const mysql = require('mysql2');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false); // Add this line

// MySQL Connection
const connectMySQL = () => {
    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });
    connection.connect((err) => {
        if (err) throw err;
        console.log('MySQL Connected');
    });
};

// MongoDB Connection
const connectMongoDB = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    mongoose.connection.on('connected', () => {
        console.log('MongoDB Connected');
    });
};

module.exports = { connectMySQL, connectMongoDB };
