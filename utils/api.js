const axios = require('axios');

const callChatCompletionAPI = async (text) => {
    try {
        // console.log('Sending request to OpenAI API with text:', text); // Log the request
        const response = await axios.post(process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user', content: `
You will receive text from a business card surrounded by triple quotes. Your task is to extract the metadata and categorize it into the given JSON format:
[ { “name”: “”, “email”: “”, “phone”: “”, “company”: “”, “address”: “”, “title”: “” }]

Please follow these instructions:

Extract the name of the individual or company.
Extract the email address.
Extract the phone number and remove any country code or spaces, keeping only the first 10-digit mobile number.
Extract the company name.
Extract the address.
Extract the title (if available).
The business card text is provided below:
“”“${text}”“”`
            }],
        }, {
            headers: {Authorization: `Bearer ${process.env.OPENAI_API_KEY}`},
        });
        // console.log('OpenAI API response:', response.data); // Log the response
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling chat completion API:', error); // Log the error
        throw error;
    }
};

const whatsappAPI = async (recipient, templateName, accessToken) => {
    try {
        const postData = [
            {
                messaging_product: "whatsapp",
                to: recipient,
                type: "template",
                template: {
                    name: templateName,
                    "language": {
                        "code": "en"
                    },
                    components: []
                }
            }
        ];
        console.log(postData)
        // Send WhatsApp message
        return axios.post('https://nithraapps.in:3011/api/common', postData, {
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': accessToken
            },
            timeout: 10000, // 10 second timeout
            maxRedirects: 10
        }).then(response => {
            console.log(`Message sent for service: ${templateName}`);
        }).catch(error => {
            console.error(`Error sending message for service: ${templateName}`, error.message);
        });
    } catch (error) {
        console.error('Error calling chat completion API:', error); // Log the error
        throw error;
    }
};

module.exports = {callChatCompletionAPI, whatsappAPI};
