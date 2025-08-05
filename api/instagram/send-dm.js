import axios from 'axios';
import { connectToDatabase } from '../../../lib/mongodb';

const config = {
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID || '1477959410285896'
  }
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, recipientUsername, message } = req.body;
      
      if (!userId || !recipientUsername || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get user from database
      const { db } = await connectToDatabase();
      const user = await db.collection('instagram_users').findOne({ instagram_id: userId });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if token is expired
      if (Date.now() > user.token_expiration) {
        return res.status(401).json({ 
          error: 'Token expired. Please reconnect your Instagram account.',
          code: 'TOKEN_EXPIRED'
        });
      }

      console.log(`✉️ Attempting to send Instagram DM to ${recipientUsername}`);

      // First, get the recipient's Instagram user ID
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
        console.error('User lookup failed:', lookupError);
        return res.status(400).json({ 
          error: 'Could not find Instagram user. Please check the username.',
          code: 'USER_NOT_FOUND'
        });
      }

      // Send DM using Instagram Graph API
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

      console.log(`✅ Instagram DM sent to ${recipientUsername}`);
      
      // Store message in database for tracking
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
      console.error('🔥 Instagram DM error:', err);
      
      let errorMessage = 'Failed to send DM';
      let errorCode = 'UNKNOWN_ERROR';
      
      if (err.response && err.response.data) {
        if (err.response.data.error && err.response.data.error.message) {
          errorMessage = err.response.data.error.message;
          errorCode = err.response.data.error.code || errorCode;
          
          // Handle specific Instagram API errors
          if (err.response.data.error.error_subcode === 2108006) {
            errorMessage = "User doesn't allow message requests from businesses";
          } else if (err.response.data.error.code === 10) {
            errorMessage = "Message blocked by Instagram's content policies";
          } else if (err.response.data.error.code === 190) {
            errorMessage = "Invalid access token - Please reconnect your Instagram account";
            errorCode = 'INVALID_TOKEN';
          } else if (err.response.data.error.code === 100) {
            errorMessage = "Instagram Business account required for sending DMs";
            errorCode = 'BUSINESS_ACCOUNT_REQUIRED';
          }
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please try again.";
        errorCode = 'TIMEOUT';
      }
      
      res.status(500).json({ error: errorMessage, code: errorCode });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 