const mongoose = require('mongoose');

const BusinessCardSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    company: String,
    title: String,
    imageUrl: String,
});

module.exports = mongoose.model('BusinessCard', BusinessCardSchema);
