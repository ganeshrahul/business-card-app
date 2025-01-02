const Service = require('../models/Service');

const listServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.json({ services });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Error fetching services' });
    }
};

const saveSelectedServices = async (req, res) => {
    try {
        const { selectedServices } = req.body;
        // Save selected services logic here
        res.json({ message: 'Services saved successfully' });
    } catch (error) {
        console.error('Error saving services:', error);
        res.status(500).json({ error: 'Error saving services' });
    }
};

module.exports = { listServices, saveSelectedServices };
