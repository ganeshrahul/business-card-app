const BusinessCard = require('../models/BusinessCard');
const {callChatCompletionAPI} = require('../utils/api');
const Service = require('../models/Service');
const {getUserById} = require('../models/User');
const AWS = require('aws-sdk');

// Configure AWS S3 with custom endpoint
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_endpoint,
    s3ForcePathStyle: true, // Required for custom endpoints
    signatureVersion: 'v4', // Use v4 signature
});


const listCards = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const cards = await BusinessCard.find()
            .sort({_id: -1})
            .skip(skip)
            .limit(limit)
            .exec();
        const totalCards = await BusinessCard.countDocuments();
        const totalPages = Math.ceil(totalCards / limit);
        res.json({cards, page, totalPages});
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({error: 'Error fetching cards'});
    }
};

const extractMetadata = async (req, res) => {
    try {
        // Check if the image file is uploaded
        if (!req.files || !req.files['image'] || req.files['image'].length === 0) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const text = req.body.text;
        const fileBuffer = req.files['image'][0].buffer;
        const selectedServices = req.body.selectedServices || []; // Array of selected service IDs

        // Step 1: Save the uploaded image to S3
        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `business-cards/${Date.now()}_${req.files['image'][0].originalname}`, // Unique file name
            Body: fileBuffer,
            ContentType: req.files['image'][0].mimetype,
        };

        const s3UploadResponse = await s3.upload(s3Params).promise();
        const imageUrl = s3UploadResponse.Location; // URL of the uploaded image

        // Step 2: Extract metadata using the OpenAI API
        const metadata = await callChatCompletionAPI(text + fileBuffer.toString('utf-8'));

        // Step 3: Save all details into MongoDB
        const newBusinessCard = new BusinessCard({
            name: metadata.name,
            email: metadata.email,
            phone: metadata.phone,
            company: metadata.company,
            title: metadata.title,
            imageUrl: imageUrl,
            metadata: metadata,
            selectedServices: selectedServices,
        });

        const savedCard = await newBusinessCard.save();

        // Step 4: Update the selected services (if needed)
        if (selectedServices.length > 0) {
            await Service.updateMany(
                { _id: { $in: selectedServices } }, // Find services with IDs in the selectedServices array
                { $push: { businessCards: savedCard._id } } // Add the business card ID to the service's businessCards array
            );
        }

        // Return success response
        res.json({
            message: 'Business card saved successfully',
            card: savedCard,
            imageUrl: imageUrl,
            metadata: metadata,
        });
    } catch (error) {
        console.error('Error extracting metadata:', error);
        res.status(500).json({ error: 'Error extracting metadata' });
    }
};

const saveCard = async (req, res) => {
    try {
        const {name, email, phone, company, title, selectedServices} = req.body;
        const user = await new Promise((resolve, reject) => {
            getUserById(req.userId, (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results[0]);
            });
        });
        const newCard = new BusinessCard({
            name,
            email,
            phone,
            company,
            title,
            createdAt: new Date(),
            user: user.username,
            selectedServices
        });
        await newCard.save();
        res.json({message: 'Card saved successfully', card: newCard});
    } catch (error) {
        console.error('Error saving card:', error);
        res.status(500).json({error: 'Error saving card'});
    }
};

module.exports = {listCards, extractMetadata, saveCard};
