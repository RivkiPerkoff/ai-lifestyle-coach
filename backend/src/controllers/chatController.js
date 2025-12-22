const chatService = require('../services/chatService');
const User = require('../models/User');

class ChatController {
  async sendMessage(req, res) {
    try {
      console.log('Chat controller - received message request');
      const { message } = req.body;
      const userId = req.user.id;
      console.log('Message:', message, 'User ID:', userId);

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get user profile and current plan
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('User found, profile exists:', !!user.profile);
      console.log('Current plan exists:', !!user.currentPlan);
      console.log('Chat state:', user.chatState);

      const response = await chatService.handleUserMessage(
        message,
        user.profile,
        user.currentPlan,
        user.chatState || { isWaitingForResponse: false }
      );
      
      console.log('Chat service response:', response);

      // Handle plan updates
      if (response.planUpdate) {
        await this.updateUserPlan(user, response.planUpdate);
      }

      // Update chat state
      if (response.chatState) {
        user.chatState = response.chatState;
      } else if (response.clearChatState) {
        user.chatState = { isWaitingForResponse: false, context: null, data: null };
      }

      // Save chat message to user's chat history
      if (!user.chatHistory) {
        user.chatHistory = [];
      }

      user.chatHistory.push({
        userMessage: message,
        aiResponse: response.message,
        timestamp: response.timestamp,
        needsPlanUpdate: response.needsPlanUpdate || false
      });

      // Keep only last 50 messages
      if (user.chatHistory.length > 50) {
        user.chatHistory = user.chatHistory.slice(-50);
      }

      await user.save();
      console.log('Chat history saved successfully');

      res.json({
        response: response.message,
        needsPlanUpdate: response.needsPlanUpdate || false,
        timestamp: response.timestamp
      });

    } catch (error) {
      console.error('Chat controller error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  }

  async updateUserPlan(user, planUpdate) {
    if (planUpdate.type === 'meal_time_change') {
      // Update meal time in current plan
      if (user.currentPlan && user.currentPlan.dailyEvents) {
        user.currentPlan.dailyEvents.forEach(event => {
          if (event.category === 'nutrition' || 
              event.title.includes('אוכל') || 
              event.title.includes('ארוחה') ||
              event.title.includes('Lunch')) {
            event.time = planUpdate.newTime;
            event.title = event.title.includes('Lunch') ? 'Mindful Lunch' : 'ארוחת צהריים מודעת';
          }
        });
        
        // Sort events by time
        user.currentPlan.dailyEvents.sort((a, b) => a.time.localeCompare(b.time));
      }
    }
  }

  async getChatHistory(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        chatHistory: user.chatHistory || []
      });

    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ChatController();