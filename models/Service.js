const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: String,
    description: String,
});

module.exports = mongoose.model('Service', ServiceSchema);
