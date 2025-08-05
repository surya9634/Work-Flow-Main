import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '../../../lib/mongodb';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBYanNh-KVJObP1eqQ7fF5JVukV2DULtcw');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { chatId, platform, userId, context } = req.body;
      
      if (!chatId || !platform) {
        return res.status(400).json({ error: 'Chat ID and platform are required' });
      }

      console.log(`🤖 Assigning AI to chat ${chatId} on ${platform}`);

      // Get chat history and context
      const { db } = await connectToDatabase();
      
      let chatHistory = [];
      let customerInfo = {};

      // Fetch chat history based on platform
      if (platform === 'instagram') {
        const messages = await db.collection('instagram_messages')
          .find({ chat_id: chatId })
          .sort({ sent_at: 1 })
          .toArray();
        
        chatHistory = messages.map(msg => ({
          role: msg.sender_id === userId ? 'assistant' : 'user',
          content: msg.message
        }));
      } else if (platform === 'facebook') {
        const messages = await db.collection('facebook_messages')
          .find({ conversation_id: chatId })
          .sort({ timestamp: 1 })
          .toArray();
        
        chatHistory = messages.map(msg => ({
          role: msg.sender_id === userId ? 'assistant' : 'user',
          content: msg.message
        }));
      } else if (platform === 'whatsapp') {
        const messages = await db.collection('whatsapp_messages')
          .find({ chat_id: chatId })
          .sort({ sent_at: 1 })
          .toArray();
        
        chatHistory = messages.map(msg => ({
          role: msg.sender_id === userId ? 'assistant' : 'user',
          content: msg.message
        }));
      }

      // Create AI system prompt
      const systemPrompt = `You are a helpful customer service AI assistant for a business. Your role is to:

1. Respond to customer inquiries professionally and helpfully
2. Provide accurate information about products/services
3. Handle common customer service scenarios
4. Escalate complex issues when necessary
5. Maintain a friendly and professional tone

Business Context: ${context || 'General customer service'}

Guidelines:
- Be concise but thorough
- Ask clarifying questions when needed
- Offer solutions proactively
- Maintain conversation flow naturally
- If you can't help, politely suggest contacting human support

Current conversation context: ${JSON.stringify(chatHistory.slice(-5))}`;

      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Create chat session
      const chat = model.startChat({
        history: chatHistory.slice(0, -1).map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      // Generate AI response
      const lastMessage = chatHistory[chatHistory.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const aiResponse = result.response.text();

      console.log(`✅ AI response generated for ${platform} chat ${chatId}`);

      // Store AI assignment in database
      await db.collection('ai_assignments').insertOne({
        chat_id: chatId,
        platform: platform,
        user_id: userId,
        assigned_at: new Date(),
        status: 'active',
        context: context,
        last_response: aiResponse
      });

      // Send AI response based on platform
      let responseResult;
      if (platform === 'instagram') {
        // Send Instagram DM
        responseResult = await sendInstagramResponse(chatId, aiResponse, userId);
      } else if (platform === 'facebook') {
        // Send Facebook message
        responseResult = await sendFacebookResponse(chatId, aiResponse, userId);
      } else if (platform === 'whatsapp') {
        // Send WhatsApp message
        responseResult = await sendWhatsAppResponse(chatId, aiResponse, userId);
      }

      res.json({ 
        success: true, 
        ai_response: aiResponse,
        chat_id: chatId,
        platform: platform,
        response_sent: responseResult?.success || false
      });

    } catch (err) {
      console.error('🔥 AI assignment error:', err);
      res.status(500).json({ error: 'Failed to assign AI to chat' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Helper functions for sending responses
async function sendInstagramResponse(chatId, message, userId) {
  // Implementation for Instagram response
  return { success: true };
}

async function sendFacebookResponse(chatId, message, userId) {
  // Implementation for Facebook response
  return { success: true };
}

async function sendWhatsAppResponse(chatId, message, userId) {
  // Implementation for WhatsApp response
  return { success: true };
} 