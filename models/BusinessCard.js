const mongoose = require('mongoose');

const BusinessCardSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    company: String,
    address: String,
    title: String,
    imageUrl: String,
    metadata: String,
    scannedText: String,
    createdAt: { type: Date, default: Date.now },
    user: {
        type: String, // Changed to String
    },
    selectedServices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    }],
});

module.exports = mongoose.model('BusinessCard', BusinessCardSchema);
