import axios from 'axios';
import { connectToDatabase } from '../../../lib/mongodb';

const config = {
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '657991800734493',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'your-whatsapp-access-token'
  }
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { phoneNumber, message, userId } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'Phone number and message are required' });
      }

      // Format phone number (remove + and add country code if needed)
      const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
      
      console.log(`📱 Sending WhatsApp message to ${formattedPhone}`);

      // Send message using WhatsApp Cloud API
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

      console.log(`✅ WhatsApp message sent to ${formattedPhone}`);
      
      // Store message in database for tracking
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
      console.error('🔥 WhatsApp message error:', err);
      
      let errorMessage = 'Failed to send WhatsApp message';
      let errorCode = 'UNKNOWN_ERROR';
      
      if (err.response && err.response.data) {
        if (err.response.data.error && err.response.data.error.message) {
          errorMessage = err.response.data.error.message;
          errorCode = err.response.data.error.code || errorCode;
          
          // Handle specific WhatsApp API errors
          if (err.response.data.error.code === 100) {
            errorMessage = "Invalid phone number format";
          } else if (err.response.data.error.code === 131) {
            errorMessage = "Message template required for this recipient";
          } else if (err.response.data.error.code === 132) {
            errorMessage = "Message too long";
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