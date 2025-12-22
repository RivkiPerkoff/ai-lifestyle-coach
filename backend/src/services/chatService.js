const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
  }

  async handleUserMessage(message, userProfile, currentPlan, chatState) {
    console.log('Chat service - handling message:', message);
    console.log('Chat state:', chatState);
    
    const prompt = this.buildChatPrompt(message, userProfile, currentPlan);
    
    try {
      console.log('Sending to Gemini API...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response received:', text.substring(0, 100));
      
      return {
        message: text,
        timestamp: new Date().toISOString(),
        needsPlanUpdate: this.checkIfPlanUpdateNeeded(message)
      };
    } catch (error) {
      console.error('Chat API error details:', error);
      
      // Enhanced fallback based on message content
      const fallbackResponse = this.getFallbackResponse(message, userProfile);
      
      return fallbackResponse;
    }
  }

  buildChatPrompt(userMessage, profile, currentPlan) {
    return `
אתה מאמן אורח חיים אישי ומומחה לבריאות. המשתמש שואל אותך שאלה או מספר על שינוי.

פרופיל המשתמש:
 גיל: ${profile.age}, BMI: ${profile.bmi}, משקל: ${profile.weight || 'לא צוין'}
- רמת פעילות: ${profile.activityLevel}
- שעות עבודה: ${profile.workSchedule.startTime}-${profile.workSchedule.endTime}
- שעות שינה: ${profile.sleepSchedule.bedtime}-${profile.sleepSchedule.wakeTime}
- מטרות: ${profile.goals.join(', ')}

התוכנית הנוכחית שלו:
${JSON.stringify(currentPlan, null, 2)}

הודעת המשתמש: "${userMessage}"

הנחיות:
- ענה בעברית בצורה חמה ואישית
- תן עצות מעשיות וספציפיות
- אם המשתמש מספר על שינוי בסדר יום/הרגלים, הצע התאמות
- שמור על טון מעודד ותומך
- תשובות קצרות (עד 150 מילים)
- אל תציע שינויים דרסטיים

ענה רק עם התשובה, ללא הסברים נוספים.
`;
  }

  checkIfPlanUpdateNeeded(message) {
    const updateKeywords = [
      'שינוי', 'שינה', 'עבודה', 'לוח זמנים', 'שעות', 'התחלתי', 'הפסקתי',
      'לא יכול', 'בעיה', 'קשה', 'עדכון', 'שנה', 'התאם'
    ];
    
    return updateKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  getFallbackResponse(message, userProfile) {
    const msg = message.toLowerCase();
    
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