const BusinessCard = require('../models/BusinessCard');
const {callChatCompletionAPI} = require('../utils/api');

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

const addCardForm = (req, res) => {
    res.render('addCard');
};

const extractMetadata = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const text = req.file.buffer.toString('utf-8'); // if you are uploading text as file
        const metadata = await callChatCompletionAPI(text);
        res.send(metadata)

    } catch (error) {
        console.error('Error extracting metadata:', error);
        res.status(500).send('Error extracting metadata');
    }

};

const saveCard = async (req, res) => {
    try {
        const {name, email, phone, company, title} = req.body;
        const newCard = new BusinessCard({name, email, phone, company, title});
        await newCard.save();
        res.redirect('/cards');
    } catch (error) {
        console.error('Error saving card:', error);
        res.status(500).send('Error saving card');
    }

};

module.exports = {listCards, extractMetadata, saveCard, addCardForm};
