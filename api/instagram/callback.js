import axios from 'axios';
import { connectToDatabase } from '../../../lib/mongodb';

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
      console.log('📬 Received Instagram callback:', req.query);
      const { code, error, error_reason, state } = req.query;
      
      if (error) {
        throw new Error(`OAuth error: ${error_reason || 'unknown'} - ${error}`);
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

      if (!tokenResponse.data || !tokenResponse.data.access_token) {
        throw new Error('Invalid token response: ' + JSON.stringify(tokenResponse.data));
      }

      console.log('✅ Token exchange successful');
      const access_token = tokenResponse.data.access_token;
      const user_id = String(tokenResponse.data.user_id);
      
      // Calculate token expiration (60 days from now)
      const expirationTime = Date.now() + 60 * 24 * 60 * 60 * 1000; // 60 days

      // Get user profile
      const profileResponse = await axios.get(`https://graph.instagram.com/me`, {
        params: { 
          fields: 'id,username,profile_picture_url',
          access_token: access_token
        },
        headers: { 'X-IG-App-ID': config.instagram.appId }
      });

      console.log(`👋 User authenticated: ${profileResponse.data.username} (ID: ${user_id})`);
      
      // Store user data in database
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

      // Update or create user record
      await db.collection('instagram_users').updateOne(
        { instagram_id: user_id },
        { $set: userData },
        { upsert: true }
      );

      // Redirect back to frontend with success
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard?instagram_connected=true&user_id=${user_id}`);
      
    } catch (err) {
      console.error('🔥 Instagram authentication error:', err);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard?error=instagram_auth_failed&message=${encodeURIComponent('Instagram login failed. Please try again.')}`);
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 