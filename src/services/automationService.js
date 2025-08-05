const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://work-flow-backend.onrender.com/api' 
  : 'http://localhost:10000/api';

class AutomationService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Authentication methods
  async signUp(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async submitOnboarding(onboardingData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/onboarding`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(onboardingData)
      });
      return await response.json();
    } catch (error) {
      console.error('Onboarding error:', error);
      throw error;
    }
  }

  async getOnboardingData(userId) {
    try {
      const response = await fetch(`${this.baseURL}/auth/onboarding/${userId}`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get onboarding error:', error);
      throw error;
    }
  }

  // Instagram automation methods
  async connectInstagram() {
    try {
      window.location.href = `${this.baseURL}/instagram/connect`;
    } catch (error) {
      console.error('Instagram connection error:', error);
      throw error;
    }
  }

  async getInstagramPosts(userId) {
    try {
      const response = await fetch(`${this.baseURL}/instagram/posts?userId=${userId}`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get Instagram posts error:', error);
      throw error;
    }
  }

  async getInstagramComments(userId, postId) {
    try {
      const response = await fetch(`${this.baseURL}/instagram/comments?userId=${userId}&postId=${postId}`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get Instagram comments error:', error);
      throw error;
    }
  }

  async configureInstagramAutomation(config) {
    try {
      const response = await fetch(`${this.baseURL}/instagram/configure`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(config)
      });
      return await response.json();
    } catch (error) {
      console.error('Configure Instagram automation error:', error);
      throw error;
    }
  }

  async sendInstagramDM(userId, recipientUsername, message) {
    try {
      const response = await fetch(`${this.baseURL}/instagram/send-dm`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId, recipientUsername, message })
      });
      return await response.json();
    } catch (error) {
      console.error('Send Instagram DM error:', error);
      throw error;
    }
  }

  async getUserInfo(userId) {
    try {
      const response = await fetch(`${this.baseURL}/user-info?userId=${userId}`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  // Messenger automation methods
  async getMessengerConversations(userId) {
    try {
      const response = await fetch(`${this.baseURL}/messenger/conversations?userId=${userId}`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get Messenger conversations error:', error);
      throw error;
    }
  }

  async getMessengerMessages(userId, conversationId) {
    try {
      const response = await fetch(`${this.baseURL}/messenger/messages?userId=${userId}&conversationId=${conversationId}`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get Messenger messages error:', error);
      throw error;
    }
  }

  async sendMessengerMessage(userId, conversationId, message) {
    try {
      const response = await fetch(`${this.baseURL}/messenger/send-message`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId, conversationId, message })
      });
      return await response.json();
    } catch (error) {
      console.error('Send Messenger message error:', error);
      throw error;
    }
  }

  // WhatsApp automation methods
  async sendWhatsAppMessage(userId, phoneNumber, message) {
    try {
      const response = await fetch(`${this.baseURL}/whatsapp/send-message`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId, phoneNumber, message })
      });
      return await response.json();
    } catch (error) {
      console.error('Send WhatsApp message error:', error);
      throw error;
    }
  }

  // AI automation methods
  async assignAIToChat(chatId, platform, userId, context) {
    try {
      const response = await fetch(`${this.baseURL}/ai/assign-chat`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ chatId, platform, userId, context })
      });
      return await response.json();
    } catch (error) {
      console.error('AI assignment error:', error);
      throw error;
    }
  }

  // Stats and analytics
  async getStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Get stored user data
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

// Create and export a singleton instance
const automationService = new AutomationService();
export default automationService; 
