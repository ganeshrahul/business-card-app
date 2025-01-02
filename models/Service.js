const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    // createdAt: { type: Date, default: Date.now },
});

// Adding indexes
ServiceSchema.index({ name: 1 }); // Optimizing name-based sorting and lookups

module.exports = mongoose.model('Service', ServiceSchema);
