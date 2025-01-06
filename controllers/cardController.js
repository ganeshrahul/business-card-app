const BusinessCard = require('../models/BusinessCard');
const {callChatCompletionAPI, whatsappAPI, addToLeadManagement} = require('../utils/api');
const AWS = require('aws-sdk');
const Service = require('../models/Service');

// Configure AWS S3 with custom endpoint
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_endpoint,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
});
const serviceMappings = {
    'Jobs': {
        templateName: 'yes_con_jobs',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtb2RlIjoiYXBpIiwicHJvamVjdCI6ImpvYnMiLCJmcm9tIjoiOTE5MTUwMDUxNTc4IiwiaW50ZWdyYXRlZF9udW1iZXIiOiIyNTU4NTMzNDA5MzQ3MDciLCJ0ZW1wbGF0ZSI6Inllc19jb25fam9icyIsImlhdCI6MTczNTg5NzM4N30.2T2Lm5QYtofLlFu7cFzBic53eUTjZCaXjRTblVIbQgQ'
    },
    'Jobs Pro': {
        templateName: 'yes_con_jobs',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtb2RlIjoiYXBpIiwicHJvamVjdCI6ImpvYnMiLCJmcm9tIjoiOTE5MTUwMDUxNTc4IiwiaW50ZWdyYXRlZF9udW1iZXIiOiIyNTU4NTMzNDA5MzQ3MDciLCJ0ZW1wbGF0ZSI6Inllc19jb25fam9icyIsImlhdCI6MTczNTg5NzM4N30.2T2Lm5QYtofLlFu7cFzBic53eUTjZCaXjRTblVIbQgQ'
    },
    'Ads': {
        templateName: 'yes_con_ads',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtb2RlIjoiYXBpIiwicHJvamVjdCI6ImpvYnMiLCJmcm9tIjoiOTE5MTUwMDUxNTc4IiwiaW50ZWdyYXRlZF9udW1iZXIiOiIyNTU4NTMzNDA5MzQ3MDciLCJ0ZW1wbGF0ZSI6Inllc19jb25fYWRzIiwiaWF0IjoxNzM1ODk3NDMyfQ.UMQcm3aZdwrl0FjKrUioNkk9qvCpO4CIOWeDeeBuIy0'
    },
    'People': {
        templateName: 'yes_con_people',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtb2RlIjoiYXBpIiwicHJvamVjdCI6ImpvYnMiLCJmcm9tIjoiOTE5MTUwMDUxNTc4IiwiaW50ZWdyYXRlZF9udW1iZXIiOiIyNTU4NTMzNDA5MzQ3MDciLCJ0ZW1wbGF0ZSI6Inllc19jb25fcGVvcGxlIiwiaWF0IjoxNzM1ODk3NDA0fQ.VJb0JMwY3Lf4OMYnbR-FswrfyRlDC0GU81-SSdtNHX8'
    },
};


const listCards = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const [cards, totalCards] = await Promise.all(
            [
                BusinessCard.find()
                    .sort({_id: -1})
                    .skip(skip)
                    .limit(limit)
                    .populate({
                        path: 'selectedServices',
                        select: 'name', // Fetch name and description instead of just IDs
                    })
                    .exec(),
                BusinessCard.countDocuments(),
            ]
        );

        // Format createdAt to IST with AM/PM
        const formattedCards = cards.map(card => {
            const options = {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            };
            const createdAtIST = new Intl.DateTimeFormat('en-IN', options).format(card.createdAt);
            return {...card._doc, createdAt: createdAtIST};
        });

        res.status(200).json({
            cards: formattedCards,
            page,
            totalPages: Math.ceil(totalCards / limit),
        });

    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({error: 'Error fetching cards'});
    }
};

const generateCustomS3Url = (bucketName, key) => {
    const customDomain = process.env.AWS_domain;
    return `${customDomain}/${bucketName}/${key}`;
};

const extractMetadata = async (req, res) => {
    try {
        const {text, selectedServices = []} = req.body;
        const username = req.username;

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
        if (req.files?.image?.[0]) {
            const {buffer, mimetype, originalname} = req.files.image[0];
            const s3Params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `business-cards/${Date.now()}_${originalname}`,
                Body: buffer,
                ContentType: mimetype,
            };
            const s3UploadResponse = await s3.upload(s3Params).promise();
            imageUrl = generateCustomS3Url(s3Params.Bucket, s3Params.Key);
            // console.log('Image uploaded to S3:', s3UploadResponse);
        }

        const metadataString = await callChatCompletionAPI(text);

        let metadata;
        try {
            metadata = JSON.parse(metadataString)[0];
        } catch (error) {
            throw new Error('Error parsing metadata' + metadataString);
        }

        const newBusinessCard = new BusinessCard({
            name: metadata.name ?? '',
            email: metadata.email ?? '',
            phone: metadata.phone ?? '',
            company: metadata.company ?? '',
            address: metadata.address ?? '',
            title: metadata.title ?? '',
            imageUrl,
            username,
            metadata: metadataString,
            scannedText: text,
            selectedServices: parsedServices,
        });

        const savedCard = await newBusinessCard.save();
// WhatsApp messaging logic
        const services = await Service.find({_id: {$in: parsedServices}});
        // console.log(services)
        const recipient = metadata.phone; // Replace with actual recipient

        console.log(services);
        const uniqueServices = new Map();
        // Filter out duplicate service calls based on templateName and accessToken
        services.forEach(service => {
            const {templateName, accessToken} = serviceMappings[service.name] || {};
            if (templateName && accessToken) {
                const key = `${templateName}_${accessToken}`;
                if (!uniqueServices.has(key)) {
                    uniqueServices.set(key, {templateName, accessToken});
                }
            }
        });

// Call whatsappAPI for unique services only
//         uniqueServices.forEach(async ({templateName, accessToken}) => {
//             if (recipient && templateName && accessToken) {
//                 await whatsappAPI(recipient, templateName, accessToken);
//             } else {
//                 console.log("Cannot send message", text, recipient, templateName);
//             }
//         });

        console.log('All WhatsApp messages sent.');

        res.status(200).json({
            message: 'Business card saved successfully',
            card: savedCard,
        });
    } catch (error) {
        console.error('Error extracting metadata:', error);
        res.status(500).json({error: 'Error extracting metadata'});
    }
};

const phoneLeads = async (req, res) => {
    try {
        // console.log(req.body)
        const {text, from} = req.body;
        const token = req.query.token; // Extract token from request parameters
        // const regex = /\b\d{10}\b/;
        const regex = /\b\d{5}\s?\d{5}\b/;
        const match = text.match(regex);
        let recipient = '';
        if (match) {
            recipient = match[0].replace(/\s/g, ""); // Remove spaces before returning the number
        }
        const services = [];
        if (token == '220bf3cc-9ac4-4e59-9204-a3833664593b') {
            services.push('Jobs', 'Jobs Pro')
        } else if (token == '7de80cf7-1a4e-4f73-a5f4-b28db2b5594a') {
            services.push('Ads')
        } else if (token == 'ff5fa181-fcd6-4f33-a611-7eddb3cab2c4') {
            services.push('People')
        } else {
            res.status(500).json({error: 'Token Mismatch'});
        }
        const uniqueServices = new Map();

        // Filter out duplicate service calls based on templateName and accessToken
        services.forEach(service => {
            const {templateName, accessToken} = serviceMappings[service] || {};
            if (templateName && accessToken) {
                const key = `${templateName}_${accessToken}`;
                if (!uniqueServices.has(key)) {
                    uniqueServices.set(key, {templateName, accessToken});
                }
            }
        });

// Call whatsappAPI for unique services only
        uniqueServices.forEach(async ({templateName, accessToken}) => {
            if (recipient && templateName && accessToken) {
                await whatsappAPI(recipient, templateName, accessToken);
                // if (templateName=='yes_con_jobs'){
                //     await addToLeadManagement(recipient, templateName);
                // }
            } else {
                console.log("Cannot send message", text, recipient, templateName);
            }
        });

        const newBusinessCard = new BusinessCard({
            name: '',
            email: '',
            phone: recipient ?? '',
            company: '',
            address: '',
            title: '',
            imageUrl: '',
            username: 'Flock : ' + from,
            metadata: '',
            scannedText: text,
            selectedServices: [
                "6772390a082ad6f446a8158a",
                "6772393f082ad6f446a8158b"
            ],
        });
        const savedCard = await newBusinessCard.save();

        res.status(200).json({
            message: 'Card saved successfully',
        });
    } catch (error) {
        console.error('Error saving card:', error);
        res.status(500).json({error: 'Error saving card'});
    }
};
const saveCard = async (req, res) => {
    try {
        const {name, email, phone, company, title, selectedServices} = req.body;

        const newCard = new BusinessCard({
            name,
            email,
            phone,
            company,
            title,
            createdAt: new Date(),
            user: req.username,
            selectedServices,
        });

        await newCard.save();
        res.status(200).json({
            message: 'Card saved successfully',
            card: newCard,
        });
    } catch (error) {
        console.error('Error saving card:', error);
        res.status(500).json({error: 'Error saving card'});
    }
};

module.exports = {listCards, extractMetadata, saveCard, phoneLeads};
