const BusinessCard = require('../models/BusinessCard');
const { callChatCompletionAPI } = require('../utils/api');
const Service = require('../models/Service'); // Import the Service model
const {getUserById} = require('../models/User');

const listCards = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const cards = await BusinessCard.find()
            .sort({_id: -1}) // Sort by `createdAt` in descending order
            .skip(skip)
            .limit(limit)
            .exec();
        const totalCards = await BusinessCard.countDocuments();
        const totalPages = Math.ceil(totalCards / limit);
        res.render('cards', {cards, page, totalPages});
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).send('Error fetching cards');
    }

};
const addCardForm = async (req, res) => {
    try {
        const services = await Service.find();
        res.render('addCard', {services}); // Pass services to view
    } catch (error) {
        console.error('Error fetching services for card form', error)
        res.status(500).send('Error fetching services for card form');
    }

};

const extractMetadata = async (req, res) => {
    try {
        console.log(req.files)
        console.log(req.body)
        if (!req.files || !req.files['image'] || req.files['image'].length === 0) {
            return res.status(400).send('No file uploaded.');
        }
        const text = req.body.text;
        const fileBuffer = req.files['image'][0].buffer;
        const metadata = await callChatCompletionAPI(text + fileBuffer.toString('utf-8'));
        res.send(metadata)

    } catch (error) {
        console.error('Error extracting metadata:', error);
        res.status(500).send('Error extracting metadata');
    }

};

const saveCard = async (req, res) => {
    try {
        const {name, email, phone, company, title, selectedServices } = req.body;
        const user = await new Promise((resolve, reject) => {
            getUserById(req.userId, (err, results) => {
                if(err){
                    reject(err);
                }
                resolve(results[0]);
            });
        })
        const newCard = new BusinessCard({name, email, phone, company, title, createdAt: new Date(), user: user.username, selectedServices});
        await newCard.save();
        res.redirect('/cards');
    } catch (error) {
        console.error('Error saving card:', error);
        res.status(500).send('Error saving card');
    }

};

module.exports = {listCards, extractMetadata, saveCard, addCardForm};
