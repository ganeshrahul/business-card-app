const Service = require('../models/Service');

const listServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.render('services', { services });
    } catch (error) {
        res.status(500).send('Error fetching services');
    }
};

const saveSelectedServices = async (req, res) => {
    const { selectedServices } = req.body;
    // Save selected services logic (e.g., to a user profile)
    res.send('Services saved successfully');
};

module.exports = { listServices, saveSelectedServices };
