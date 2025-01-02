require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
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
const globalUpload = multer({ storage: multer.memoryStorage() });

app.use((req, res, next) => {
    if (req.path === '/cards/upload') {
        next(); // Skip global Multer middleware for /cards/upload
    } else {
        globalUpload.any()(req, res, next);
    }
});

// Security Headers
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; font-src 'self' data:; script-src 'self';"
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
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

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error details:', err.stack);
    console.error('Request Path:', req.path);
    console.error('Request Headers:', req.headers);
    res.status(500).json({ error: 'Something broke!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
