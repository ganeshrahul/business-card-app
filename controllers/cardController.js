const BusinessCard = require('../models/BusinessCard');
const axios = require('axios');

const listCards = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const cards = await BusinessCard.find().skip(skip).limit(limit);
    res.render('cards', { cards, page });
};

const extractMetadata = async (text) => {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Extract metadata from: ${text}` }],
    }, {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    });
    return response.data.choices[0].message.content;
};

const saveCard = async (req, res) => {
    const { name, email, phone, company, title } = req.body;
    const newCard = new BusinessCard({ name, email, phone, company, title });
    await newCard.save();
    res.redirect('/cards');
};

module.exports = { listCards, extractMetadata, saveCard };
