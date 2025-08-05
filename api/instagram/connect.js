import axios from 'axios';

const config = {
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID || '1477959410285896',
    appSecret: process.env.INSTAGRAM_APP_SECRET || 'fc7fbca3fbecd5bc6b06331bc4da17c9',
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || 'https://work-flow-backend-final.onrender.com/auth/instagram/callback'
  }
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${config.instagram.appId}&redirect_uri=${encodeURIComponent(config.instagram.redirectUri)}&response_type=code&scope=instagram_basic%2Cinstagram_manage_messages%2Cinstagram_manage_comments%2Cinstagram_content_publish%2Cinstagram_manage_insights`;
      
      console.log('🔗 Redirecting to Instagram Auth URL:', authUrl);
      res.redirect(authUrl);
    } catch (err) {
      console.error('🔥 Instagram login redirect error:', err);
      res.status(500).json({ error: 'Server error during Instagram login' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 