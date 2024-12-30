const axios = require('axios');

const callChatCompletionAPI = async (text) => {
    try{
        const response = await axios.post(process.env.OPENAI_API_URL ||'https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: `Extract metadata from: ${text}` }],
        }, {
            headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        });
        return response.data.choices[0].message.content;
    }
    catch (error) {
        console.error('Error calling chat completion API:', error);
        throw error;
    }

};

module.exports = { callChatCompletionAPI };
