const BusinessCard = require('../models/BusinessCard');
const { callChatCompletionAPI } = require('../utils/api');
const Service = require('../models/Service');
const { getUserById } = require('../models/User');

const listCards = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const cards = await BusinessCard.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalCards = await BusinessCard.countDocuments();
        const totalPages = Math.ceil(totalCards / limit);
        res.json({ cards, page, totalPages });
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({ error: 'Error fetching cards' });
    }
};

const addCardForm = async (req, res) => {
    try {
        const services = await Service.find();
        res.json({ services });
    } catch (error) {
        console.error('Error fetching services for card form', error);
        res.status(500).json({ error: 'Error fetching services for card form' });
    }
};

const extractMetadata = async (req, res) => {
    try {
        if (!req.files || !req.files['image'] || req.files['image'].length === 0) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }
        const text = req.body.text;
        const fileBuffer = req.files['image'][0].buffer;
        const metadata = await callChatCompletionAPI(text + fileBuffer.toString('utf-8'));
        res.json({ metadata });
    } catch (error) {
        console.error('Error extracting metadata:', error);
        res.status(500).json({ error: 'Error extracting metadata' });
    }
};

const saveCard = async (req, res) => {
    try {
        const { name, email, phone, company, title, selectedServices } = req.body;
        const user = await new Promise((resolve, reject) => {
            getUserById(req.userId, (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results[0]);
            });
        });
        const newCard = new BusinessCard({ name, email, phone, company, title, createdAt: new Date(), user: user.username, selectedServices });
        await newCard.save();
        res.json({ message: 'Card saved successfully', card: newCard });
    } catch (error) {
        console.error('Error saving card:', error);
        res.status(500).json({ error: 'Error saving card' });
    }
};

module.exports = { listCards, extractMetadata, saveCard, addCardForm };
