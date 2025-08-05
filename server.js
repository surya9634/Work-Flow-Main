const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Serve React build

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workflow-auth';
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  const client = await MongoClient.connect(MONGODB_URI);
  cachedDb = client.db();
  return cachedDb;
}

// Configuration
const config = {
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID || '1477959410285896',
    appSecret: process.env.INSTAGRAM_APP_SECRET || '8ccbc2e1a98cecf839bffa956928ba73',
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || 'https://work-flow-backend.onrender.com/api/instagram/callback'
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '1256408305896903',
    appSecret: process.env.FACEBOOK_APP_SECRET || 'fc7fbca3fbecd5bc6b06331bc4da17c9',
    callbackUrl: process.env.FACEBOOK_CALLBACK_URL || 'https://work-flow-backend.onrender.com/api/facebook/callback'
  },
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '657991800734493',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'your-whatsapp-access-token'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyBYanNh-KVJObP1eqQ7fF5JVukV2DULtcw'
  }
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'WorkFlow Automation API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Instagram Routes
app.get('/api/instagram/connect', (req, res) => {
  const authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${config.instagram.appId}&redirect_uri=${encodeURIComponent(config.instagram.redirectUri)}&response_type=code&scope=instagram_basic%2Cinstagram_manage_messages%2Cinstagram_manage_comments%2Cinstagram_content_publish%2Cinstagram_manage_insights`;
  res.redirect(authUrl);
});

app.get('/api/instagram/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code) {
      throw new Error('Authorization code is missing');
    }

    // Exchange code for token
    const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
      client_id: config.instagram.appId,
      client_secret: config.instagram.appSecret,
      grant_type: 'authorization_code',
      redirect_uri: config.instagram.redirectUri,
      code: code
    }, {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-IG-App-ID': config.instagram.appId
      }
    });

    const access_token = tokenResponse.data.access_token;
    const user_id = String(tokenResponse.data.user_id);
    const expirationTime = Date.now() + 60 * 24 * 60 * 60 * 1000; // 60 days

    // Get user profile
    const profileResponse = await axios.get(`https://graph.instagram.com/me`, {
      params: { 
        fields: 'id,username,profile_picture_url',
        access_token: access_token
      },
      headers: { 'X-IG-App-ID': config.instagram.appId }
    });

    // Store user data
    const { db } = await connectToDatabase();
    const userData = {
      instagram_id: user_id,
      username: profileResponse.data.username,
      profile_pic: profileResponse.data.profile_picture_url,
      access_token: access_token,
      token_expiration: expirationTime,
      last_login: new Date(),
      platform: 'instagram',
      connected: true
    };

    await db.collection('instagram_users').updateOne(
      { instagram_id: user_id },
      { $set: userData },
      { upsert: true }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'https://work-flow-frontend.onrender.com';
    res.redirect(`${frontendUrl}?instagram_connected=true&user_id=${user_id}`);
    
  } catch (err) {
    console.error('Instagram authentication error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'https://work-flow-frontend.onrender.com';
    res.redirect(`${frontendUrl}?error=instagram_auth_failed&message=${encodeURIComponent('Instagram login failed. Please try again.')}`);
  }
});

app.get('/api/instagram/posts', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('instagram_users').findOne({ instagram_id: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (Date.now() > user.token_expiration) {
      return res.status(401).json({ error: 'Token expired. Please reconnect your Instagram account.' });
    }

    const response = await axios.get(`https://graph.instagram.com/v23.0/me/media`, {
      params: {
        fields: 'id,caption,media_url,media_type,thumbnail_url,permalink,timestamp',
        access_token: user.access_token
      },
      headers: { 'X-IG-App-ID': config.instagram.appId }
    });

    const processedPosts = response.data.data.map(post => ({
      id: post.id,
      caption: post.caption || '',
      media_url: post.media_type === 'VIDEO' ? (post.thumbnail_url || '') : post.media_url,
      media_type: post.media_type,
      permalink: post.permalink,
      timestamp: post.timestamp
    }));

    res.json(processedPosts);
  } catch (err) {
    console.error('Instagram posts error:', err);
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

app.post('/api/instagram/send-dm', async (req, res) => {
  try {
    const { userId, recipientUsername, message } = req.body;
    
    if (!userId || !recipientUsername || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('instagram_users').findOne({ instagram_id: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (Date.now() > user.token_expiration) {
      return res.status(401).json({ 
        error: 'Token expired. Please reconnect your Instagram account.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Get recipient user ID
    let recipientUserId;
    try {
      const userLookupResponse = await axios.get(`https://graph.instagram.com/v23.0/${recipientUsername}`, {
        params: {
          fields: 'id,username',
          access_token: user.access_token
        },
        headers: { 'X-IG-App-ID': config.instagram.appId }
      });
      
      recipientUserId = userLookupResponse.data.id;
    } catch (lookupError) {
      return res.status(400).json({ 
        error: 'Could not find Instagram user. Please check the username.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Send DM
    const dmResponse = await axios.post(`https://graph.instagram.com/v23.0/me/messages`, {
      recipient_id: recipientUserId,
      message: message
    }, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json',
        'X-IG-App-ID': config.instagram.appId
      },
      timeout: 15000
    });

    // Store message
    await db.collection('instagram_messages').insertOne({
      sender_id: userId,
      recipient_username: recipientUsername,
      recipient_id: recipientUserId,
      message: message,
      sent_at: new Date(),
      status: 'sent'
    });

    res.json({ 
      success: true, 
      message_id: dmResponse.data.message_id,
      recipient: recipientUsername
    });

  } catch (err) {
    console.error('Instagram DM error:', err);
    let errorMessage = 'Failed to send DM';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (err.response && err.response.data) {
      if (err.response.data.error && err.response.data.error.message) {
        errorMessage = err.response.data.error.message;
        errorCode = err.response.data.error.code || errorCode;
      }
    }
    
    res.status(500).json({ error: errorMessage, code: errorCode });
  }
});

// WhatsApp Routes
app.post('/api/whatsapp/send-message', async (req, res) => {
  try {
    const { phoneNumber, message, userId } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    const response = await axios.post(`https://graph.facebook.com/v23.0/${config.whatsapp.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: {
        body: message
      }
    }, {
      headers: {
        'Authorization': `Bearer ${config.whatsapp.accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    // Store message
    const { db } = await connectToDatabase();
    await db.collection('whatsapp_messages').insertOne({
      sender_id: userId || 'system',
      recipient_phone: formattedPhone,
      message: message,
      sent_at: new Date(),
      status: 'sent',
      message_id: response.data.messages?.[0]?.id
    });

    res.json({ 
      success: true, 
      message_id: response.data.messages?.[0]?.id,
      recipient: formattedPhone
    });

  } catch (err) {
    console.error('WhatsApp message error:', err);
    res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
});

// AI Routes
app.post('/api/ai/assign-chat', async (req, res) => {
  try {
    const { chatId, platform, userId, context } = req.body;
    
    if (!chatId || !platform) {
      return res.status(400).json({ error: 'Chat ID and platform are required' });
    }

    const { db } = await connectToDatabase();
    
    // Get chat history
    let chatHistory = [];
    if (platform === 'instagram') {
      const messages = await db.collection('instagram_messages')
        .find({ chat_id: chatId })
        .sort({ sent_at: 1 })
        .toArray();
      
      chatHistory = messages.map(msg => ({
        role: msg.sender_id === userId ? 'assistant' : 'user',
        content: msg.message
      }));
    }

    // Generate AI response
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
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

    const lastMessage = chatHistory[chatHistory.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const aiResponse = result.response.text();

    // Store AI assignment
    await db.collection('ai_assignments').insertOne({
      chat_id: chatId,
      platform: platform,
      user_id: userId,
      assigned_at: new Date(),
      status: 'active',
      context: context,
      last_response: aiResponse
    });

    res.json({ 
      success: true, 
      ai_response: aiResponse,
      chat_id: chatId,
      platform: platform
    });

  } catch (err) {
    console.error('AI assignment error:', err);
    res.status(500).json({ error: 'Failed to assign AI to chat' });
  }
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    const stats = {
      instagram_users: await db.collection('instagram_users').countDocuments(),
      instagram_messages: await db.collection('instagram_messages').countDocuments(),
      whatsapp_messages: await db.collection('whatsapp_messages').countDocuments(),
      ai_assignments: await db.collection('ai_assignments').countDocuments(),
      timestamp: new Date().toISOString()
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Catch-all route for React Router
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: __dirname });
});

app.listen(PORT, () => {
  console.log(`🚀 WorkFlow server running on port ${PORT}`);
  console.log(`📱 Instagram App ID: ${config.instagram.appId}`);
  console.log(`🤖 Gemini AI: ${config.gemini.apiKey ? 'Configured' : 'Not configured'}`);
}); 
