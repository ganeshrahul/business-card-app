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

// Function to generate the custom URL
function generateCustomS3Url(bucketName, key) {
    const customDomain = process.env.AWS_domain; // Your custom domain
    return `${customDomain}/${bucketName}/${key}`;
}

const extractMetadata = async (req, res) => {
    try {
        console.log('Request body:', req.body); // Log the request body
        console.log('Request files:', req.files); // Log the uploaded files

        const text = req.body.text;
        const selectedServices = req.body.selectedServices || [];

        // Parse selectedServices if it's a string
        let parsedServices;
        if (typeof selectedServices === "string") {
            try {
                parsedServices = JSON.parse(selectedServices);
            } catch (error) {
                console.error("Error parsing selectedServices:", error);
                return res.status(400).json({error: "Invalid selectedServices format"});
            }
        } else {
            parsedServices = selectedServices;
        }

        let imageUrl = null;
        if (req.files && req.files['image']) {
            console.log('Image file received:', req.files['image'][0]); // Log the image file
            const fileBuffer = req.files['image'][0].buffer;
            const s3Params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `business-cards/${Date.now()}_${req.files['image'][0].originalname}`,
                Body: fileBuffer,
                ContentType: req.files['image'][0].mimetype,
            };
            // console.log('Uploading image to S3 with params:', s3Params); // Log S3 params
            const s3UploadResponse = await s3.upload(s3Params).promise();
            console.log(s3UploadResponse)
            imageUrl = generateCustomS3Url(s3Params.Bucket, s3Params.Key);

            console.log('Image uploaded to S3. URL:', imageUrl); // Log the S3 URL
        } else {
            console.log('Image file Not received'); // Log the image file
        }

        // Call the Chat Completion API
        const metadataObject = await callChatCompletionAPI(text);

        // Extract the first item from metadataObject
        // (assuming metadataObject is an array with at least one item)
        const metadata = metadataObject?.[0] ?? {};

        // Convert metadata to a string if you intend to store it as JSON
        const metadataString = JSON.stringify(metadata);
        console.log(metadata)
        // Create the new business card
        const newBusinessCard = new BusinessCard({
            name: metadata.name ?? "",
            email: metadata.email ?? "",
            phone: metadata.phone ?? "",
            company: metadata.company ?? "",
            address: metadata.address ?? "",
            title: metadata.title ?? "",
            imageUrl, // shorthand for imageUrl: imageUrl
            metadata: metadataString,
            scannedText: text,
            selectedServices: parsedServices ?? [],
        });

        const savedCard = await newBusinessCard.save();

        res.json({
            message: 'Business card saved successfully',
            card: savedCard,
        });
    } catch (error) {
        console.error('Error extracting metadata:', error); // Log the full error
        res.status(500).json({error: 'Error extracting metadata'});
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
