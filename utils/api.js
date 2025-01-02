const axios = require('axios');

const callChatCompletionAPI = async (text) => {
    try {
        console.log('Sending request to OpenAI API with text:', text); // Log the request
        const response = await axios.post(process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: `Extract metadata from the provided business card text and categorize it in the specified format [name:<name>, email:<email>, phone:<phone>(remove country code and space and get first 10 digit mobile number), company:<company>, address:<address>, and title:<title>] : ${text}` }],
        }, {
            headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        });
        console.log('OpenAI API response:', response.data); // Log the response
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling chat completion API:', error); // Log the error
        throw error;
    }
};

module.exports = { callChatCompletionAPI };
