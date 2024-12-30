require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
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
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Content Security Policy
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; font-src 'self' data:;"
    );
    next();
});

// Database Connections
try{
    connectMySQL();
    connectMongoDB();
}
catch(error){
    console.error("Failed to connect to database", error)
    process.exit(1)
}


// Routes
app.use('/auth', authRoutes);
app.use('/cards', cardRoutes);
app.use('/services', serviceRoutes);

app.get('/', (req, res) => {
    res.render('login');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
