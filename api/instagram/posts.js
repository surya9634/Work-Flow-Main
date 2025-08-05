import axios from 'axios';
import { connectToDatabase } from '../../../lib/mongodb';

const config = {
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID || '1477959410285896'
  }
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Get user from database
      const { db } = await connectToDatabase();
      const user = await db.collection('instagram_users').findOne({ instagram_id: userId });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if token is expired
      if (Date.now() > user.token_expiration) {
        return res.status(401).json({ error: 'Token expired. Please reconnect your Instagram account.' });
      }

      // Fetch posts using Instagram Graph API
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
      console.error('🔥 Instagram posts error:', err);
      res.status(500).json({ error: 'Error fetching posts' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 