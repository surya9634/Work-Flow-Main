import axios from 'axios';
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Get user from database
      const { db } = await connectToDatabase();
      const user = await db.collection('facebook_users').findOne({ facebook_id: userId });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if token is expired
      if (Date.now() > user.token_expiration) {
        return res.status(401).json({ error: 'Token expired. Please reconnect your Facebook account.' });
      }

      // Get user's pages
      const pagesResponse = await axios.get(`https://graph.facebook.com/v23.0/me/accounts`, {
        params: {
          access_token: user.access_token
        }
      });

      if (!pagesResponse.data.data || pagesResponse.data.data.length === 0) {
        return res.json([]);
      }

      // Get conversations for the first page (you can modify this to handle multiple pages)
      const page = pagesResponse.data.data[0];
      const conversationsResponse = await axios.get(`https://graph.facebook.com/v23.0/${page.id}/conversations`, {
        params: {
          fields: 'id,participants,updated_time,message_count',
          access_token: page.access_token
        }
      });

      const conversations = conversationsResponse.data.data.map(conv => ({
        id: conv.id,
        participants: conv.participants.data,
        updated_time: conv.updated_time,
        message_count: conv.message_count
      }));

      res.json(conversations);
    } catch (err) {
      console.error('🔥 Facebook conversations error:', err);
      res.status(500).json({ error: 'Error fetching conversations' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 