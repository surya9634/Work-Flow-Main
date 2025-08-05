import axios from 'axios';
import { connectToDatabase } from '../../../lib/mongodb';

const config = {
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '1256408305896903',
    appSecret: process.env.FACEBOOK_APP_SECRET || 'fc7fbca3fbecd5bc6b06331bc4da17c9',
    callbackUrl: process.env.FACEBOOK_CALLBACK_URL || 'https://your-domain.vercel.app/api/facebook/callback'
  }
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const authUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${config.facebook.appId}&redirect_uri=${encodeURIComponent(config.facebook.callbackUrl)}&response_type=code&scope=pages_show_list,pages_manage_metadata,pages_read_engagement,pages_manage_posts,pages_manage_messaging,pages_messaging`;
      
      console.log('🔗 Redirecting to Facebook Auth URL:', authUrl);
      res.redirect(authUrl);
    } catch (err) {
      console.error('🔥 Facebook login redirect error:', err);
      res.status(500).json({ error: 'Server error during Facebook login' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 