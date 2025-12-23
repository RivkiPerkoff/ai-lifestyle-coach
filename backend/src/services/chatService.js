const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async handleUserMessage(message, userProfile, currentPlan, chatState) {
    console.log('Chat service - handling message:', message);
    console.log('Chat state:', chatState);
    
    const prompt = this.buildChatPrompt(message, userProfile, currentPlan);
    
    try {
      console.log('Sending to Gemini API...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Check if Gemini indicates a plan update is needed via the tag
      const updateMatch = text.match(/\[UPDATE_PLAN: (.*?)\]/);
      const needsPlanUpdate = !!updateMatch;
      
      if (needsPlanUpdate) {
        // Extract the modification instructions and attach to profile for the plan generator
        userProfile.planModifications = updateMatch[1];
        text = text.replace(updateMatch[0], '').trim();
      }
      
      console.log('Gemini response received:', text.substring(0, 100));
      
      return {
        message: text,
        timestamp: new Date().toISOString(),
        needsPlanUpdate
      };
    } catch (error) {
      console.error('Chat API error details:', error);
      
      // Enhanced fallback based on message content
      const fallbackResponse = this.getFallbackResponse(message, userProfile, error);
      
      return fallbackResponse;
    }
  }

  buildChatPrompt(userMessage, profile, currentPlan) {
    return `
You are a personal lifestyle coach and health expert. The user is asking you a question or reporting a change.

User Profile:
- Age: ${profile.age}, BMI: ${profile.bmi}, Weight: ${profile.weight || 'Not specified'}
- Activity Level: ${profile.activityLevel}
- Work Hours: ${profile.workSchedule.startTime}-${profile.workSchedule.endTime}
- Sleep Schedule: ${profile.sleepSchedule.bedtime}-${profile.sleepSchedule.wakeTime}
- Goals: ${profile.goals.join(', ')}

Current Plan:
${JSON.stringify(currentPlan, null, 2)}

User Message: "${userMessage}"

Instructions:
- Answer in Hebrew in a warm and personal manner.
- Provide practical and specific advice.
- If the user reports a change in schedule/habits, suggest adjustments.
- Maintain an encouraging and supportive tone.
- Keep answers short (up to 150 words).
- Do not suggest drastic changes.
- IMPORTANT: If the user asks to change the plan (e.g., "more sport", "change time", "new plan"), you MUST append "[UPDATE_PLAN: <specific instructions>]" at the end. Example: "[UPDATE_PLAN: Increase exercise duration to 45 mins in afternoon]"
- When triggering a plan update (using the tag), phrase your response as a confirmation that you have made the change (e.g., "Great, I've updated your plan with more sport! Are you happy with the change?").

Answer only with the response (and the tag if needed), without additional explanations.
`;
  }

  getFallbackResponse(message, userProfile, error = null) {
    const msg = message.toLowerCase();
    
    // Check for NetFree block or specific network errors
    if (error && (error.message.includes('418') || error.message.includes('NetFree'))) {
      return {
        message: 'נתקלתי בבעיית תקשורת (חסימת NetFree). נראה שספק האינטרנט חוסם את הגישה למודל. נסה לבדוק את החיבור או את הגדרות הסינון.',
        timestamp: new Date().toISOString(),
        needsPlanUpdate: false
      };
    }

    // General encouraging responses
    if (msg.includes('תודה') || msg.includes('תודה רבה')) {
      return {
        message: 'בשמחה! אני כאן כדי לעזור לך להשיג את המטרות שלך! 😊',
        timestamp: new Date().toISOString(),
        needsPlanUpdate: false
      };
    }
    
    if (msg.includes('עזרה') || msg.includes('?')) {
      return {
        message: 'אני כאן לעזור! תוכלי לשאול אותי על:\n• כמות מים מומלצת\n• שעות שינה\n• פעילות גופנית\n• BMI ובריאות\n• התוכנית היומית שלך 💪',
        timestamp: new Date().toISOString(),
        needsPlanUpdate: false
      };
    }
    
    return {
      message: 'אני זמינה לעזור לך! נסי לשאול שאלות ספציפיות על בריאות, תזונה, שינה או פעילות גופנית. המכסה של ה-API התמלאה היום, אבל אני עדיין יכולה לעזור בשאלות בסיסיות! 🌟',
      timestamp: new Date().toISOString(),
      needsPlanUpdate: false
    };
  }
}

module.exports = new ChatService();