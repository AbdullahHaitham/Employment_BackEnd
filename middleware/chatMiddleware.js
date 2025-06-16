const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');

// Middleware to handle chatbot interaction
exports.handleChatbot = async (req, res, next) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        // Check if Ollama service is running
        try {
            const response = await axios.get('http://localhost:11434/api/tags');
            if (!response.data.tags.includes('llama3')) {
                return res.status(500).json({ 
                    message: 'llama3 model is not available. Please pull the model first.' 
                });
            }
        } catch (error) {
            return res.status(500).json({ 
                message: 'Ollama service is not running. Please start it first.' 
            });
        }

        // Send request to Ollama
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'llama3',
            prompt: query,
            stream: false
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });

        // Check if we got a valid response
        if (!response.data || !response.data.response) {
            return res.status(500).json({
                message: 'Failed to get response from Ollama'
            });
        }

        const answer = response.data.response;

        // Save chat to MongoDB
        const chatEntry = await ChatHistory.create({
            user: req.user._id,
            query,
            answer
        });

        // Add chat entry to request for use in route handlers
        req.chatEntry = chatEntry;
        
        next();

    } catch (error) {
        console.error('Chatbot error:', error);
        return res.status(500).json({ 
            message: 'Failed to connect with AI model', 
            error: error.message 
        });
    }
};
