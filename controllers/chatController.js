const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');

exports.askAI = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user._id; // جاي من التوكن (middleware)

    // Send to AI model (FastAPI)
    const aiResponse = await axios.post('http://127.0.0.1:8000/find_jobs', {
      query: question,
      top_k: 3
    });

    const answer = aiResponse.data.llm_response;
    
    // Save to DB
    const chat = new ChatHistory({ 
      user: userId, 
      question: question, 
      answer: answer 
    });
    
    await chat.save();
    console.log('Chat saved successfully:', chat);

    res.json({ 
      question: question, 
      answer: answer,
      timestamp: chat.timestamp 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Failed to connect with AI model', 
      error: error.message 
    });
  }
};
