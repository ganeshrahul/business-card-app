const Service = require('../models/Service');

const listServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.render('services', { services });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).send('Error fetching services');
    }
};

const saveSelectedServices = async (req, res) => {
    try{
        const { selectedServices } = req.body;
        // Save selected services logic (e.g., to a user profile)
        // here, we should be using a middleware that extracts the user_id from the token
        // and saving the selected services into the users document
        res.send('Services saved successfully');
    }
    catch (error) {
        console.error('Error saving services:', error);
        res.status(500).send('Error saving services');
    }
};

module.exports = { listServices, saveSelectedServices };
