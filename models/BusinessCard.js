const mongoose = require('mongoose');

const BusinessCardSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    address: { type: String, trim: true },
    title: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    metadata: { type: String, trim: true },
    scannedText: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
    user: { type: String, trim: true },
    username: { type: String, trim: true },
    selectedServices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    }],
});

// Adding indexes
BusinessCardSchema.index({ name: 1 }); // Optimizing queries by name
BusinessCardSchema.index({ createdAt: -1 }); // Optimizing recent data queries

module.exports = mongoose.model('BusinessCard', BusinessCardSchema);
