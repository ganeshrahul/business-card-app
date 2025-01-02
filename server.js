require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer'); // Add multer for form data parsing
const authRoutes = require('./routes/authRoutes');
const cardRoutes = require('./routes/cardRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const { connectMySQL, connectMongoDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Multer middleware for parsing multipart/form-data
const upload = multer(); // No need for storage since we're not saving files
app.use(upload.none()); // Parse form data (not files)

// Content Security Policy
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; font-src 'self' data:; script-src 'self';"
    );
    next();
});

// Database Connections
try {
    connectMySQL();
    connectMongoDB();
} catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(1);
}

// Routes
app.use('/auth', authRoutes);
app.use('/cards', cardRoutes);
app.use('/services', serviceRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Business Card API' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
