# WorkFlow - Social Media Automation Platform

A comprehensive social media automation platform with Instagram, Facebook Messenger, and WhatsApp integration, powered by AI.

## 🚀 Features

- **Instagram Automation**: Post management, DM automation, comment responses
- **Facebook Messenger**: Conversation management, automated responses
- **WhatsApp Business**: AI-powered customer support
- **AI Integration**: Gemini AI for intelligent chat responses
- **Analytics Dashboard**: Real-time insights and performance metrics
- **Multi-platform Support**: Unified interface for all social platforms

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB Atlas
- **AI**: Google Gemini API
- **Authentication**: JWT + Session Management
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
2. **MongoDB Atlas** account
3. **Vercel** account
4. **Social Media API Access**:
   - Instagram Business Account
   - Facebook Developer Account
   - WhatsApp Business API

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd work-flow
npm install
```

### 2. Environment Configuration

Copy the environment example file:

```bash
cp env.example .env.local
```

Update `.env.local` with your credentials:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/workflow-auth?retryWrites=true&w=majority

# Instagram Configuration
INSTAGRAM_APP_ID=1477959410285896
INSTAGRAM_APP_SECRET=your-instagram-app-secret
INSTAGRAM_REDIRECT_URI=https://your-domain.vercel.app/api/instagram/callback

# Facebook Configuration
FACEBOOK_APP_ID=1256408305896903
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=https://your-domain.vercel.app/api/facebook/callback

# WhatsApp Configuration
WHATSAPP_PHONE_NUMBER_ID=657991800734493
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_VERIFY_TOKEN=verify-me

# AI Configuration
GEMINI_API_KEY=AIzaSyBYanNh-KVJObP1eqQ7fF5JVukV2DULtcw

# Frontend Configuration
FRONTEND_URL=https://your-domain.vercel.app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Configuration
SESSION_SECRET=work_automation_secret_key_change_this
```

### 3. Social Media API Setup

#### Instagram Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing app
3. Add Instagram Basic Display product
4. Configure OAuth redirect URIs:
   - `https://your-domain.vercel.app/api/instagram/callback`
5. Get your App ID and App Secret
6. Ensure your Instagram account is a Business/Creator account

#### Facebook Messenger Setup

1. In your Facebook app, add Messenger product
2. Configure webhook URL: `https://your-domain.vercel.app/api/facebook/webhook`
3. Set verify token: `verify-me`
4. Subscribe to messaging events
5. Get your Page Access Token

#### WhatsApp Business Setup

1. In your Facebook app, add WhatsApp product
2. Configure your phone number
3. Get your Phone Number ID and Access Token
4. Set up webhook for message events

### 4. MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Add your IP to whitelist (or use 0.0.0.0/0 for all IPs)

### 5. Local Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables in Vercel dashboard
4. Deploy

### 3. Configure Environment Variables in Vercel

Add all environment variables from your `.env.local` file to Vercel:

1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable from your `.env.local` file

### 4. Update Redirect URIs

After deployment, update your social media app redirect URIs:

- **Instagram**: `https://your-domain.vercel.app/api/instagram/callback`
- **Facebook**: `https://your-domain.vercel.app/api/facebook/callback`
- **WhatsApp**: `https://your-domain.vercel.app/api/whatsapp/webhook`

## 📱 Usage

### Instagram Automation

1. Connect your Instagram account
2. View your posts
3. Set up automated responses
4. Send manual DMs

### Facebook Messenger

1. Connect your Facebook page
2. View conversations
3. Send automated responses
4. Manage customer inquiries

### WhatsApp Business

1. Configure WhatsApp Business API
2. Send automated messages
3. Handle customer support
4. AI-powered responses

### AI Assignment

1. Click "Assign AI" on any chat
2. AI will analyze conversation context
3. Generate intelligent responses
4. Automatically reply to customers

## 🔧 API Endpoints

### Instagram
- `GET /api/instagram/connect` - Connect Instagram account
- `GET /api/instagram/callback` - OAuth callback
- `GET /api/instagram/posts` - Get user posts
- `POST /api/instagram/send-dm` - Send direct message

### Facebook
- `GET /api/facebook/connect` - Connect Facebook account
- `GET /api/facebook/conversations` - Get conversations
- `POST /api/facebook/send-message` - Send message

### WhatsApp
- `POST /api/whatsapp/send-message` - Send WhatsApp message

### AI
- `POST /api/ai/assign-chat` - Assign AI to chat

## 🐛 Troubleshooting

### Instagram DM Issues

1. **Business Account Required**: Ensure your Instagram account is a Business/Creator account
2. **User Must Message First**: Instagram only allows DMs to users who have messaged you first
3. **24-Hour Window**: You can only send DMs within 24 hours of their last message
4. **Token Expiration**: Reconnect your account if tokens expire

### Facebook Messenger Issues

1. **Page Access**: Ensure your app has access to the Facebook page
2. **Webhook Configuration**: Verify webhook URL and verify token
3. **Permissions**: Check that you have the required permissions

### WhatsApp Issues

1. **Phone Number Verification**: Ensure your WhatsApp Business phone number is verified
2. **Message Templates**: First messages must use approved templates
3. **API Limits**: Check your WhatsApp Business API limits

### General Issues

1. **Environment Variables**: Ensure all environment variables are set correctly
2. **Database Connection**: Check MongoDB connection string
3. **CORS Issues**: Verify API endpoints are accessible
4. **Token Expiration**: Reconnect social media accounts if needed

## 📊 Analytics

The platform includes comprehensive analytics:

- Message sent/received counts
- Response times
- AI usage statistics
- Platform performance metrics
- Customer engagement data

## 🔒 Security

- JWT authentication for API access
- Secure token storage
- Environment variable protection
- HTTPS enforcement in production
- Rate limiting on API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the troubleshooting section
2. Review API documentation
3. Check social media platform requirements
4. Contact support team

## 🔄 Updates

Keep your deployment updated:

```bash
git pull origin main
npm install
npm run build
```

Deploy changes to Vercel automatically or manually trigger deployment.

---

**Note**: This platform requires proper social media API access and compliance with platform policies. Ensure you follow all terms of service and API usage guidelines.
