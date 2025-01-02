const Service = require('../models/Service');

const listServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ name: 1 }).exec();
        res.status(200).json({ services });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Error fetching services' });
    }
};

module.exports = { listServices };
