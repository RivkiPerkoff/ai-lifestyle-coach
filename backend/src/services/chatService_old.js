const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
  }

  async handleUserMessage(message, userProfile, currentPlan, chatState) {
    console.log('Chat service - handling message:', message);
    console.log('Chat state:', chatState);
    
    // Handle ongoing conversation
    if (chatState?.isWaitingForResponse) {
      return this.handleFollowUpResponse(message, userProfile, currentPlan, chatState);
    }
    
    // Try to answer common questions without API FIRST
    const localResponse = this.tryLocalResponse(message, userProfile, currentPlan);
    if (localResponse) {
      console.log('Using local response:', localResponse.message.substring(0, 50));
      return localResponse;
    }
    
    // Only try API if no local response found
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
- גיל: ${profile.age}, BMI: ${profile.bmi}
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

  tryLocalResponse(message, userProfile, currentPlan) {
    const msg = message.toLowerCase();
    
    // Plan-related questions with interactive follow-up
    if ((msg.includes('מעדיף') && msg.includes('לא')) || 
        (msg.includes('אוכל') && (msg.includes('שתים') || msg.includes('14:00') || msg.includes('צהריים'))) ||
        (msg.includes('ארוחה') && msg.includes('זמן'))) {
      
      if (currentPlan && currentPlan.dailyEvents) {
        const nutritionEvents = currentPlan.dailyEvents.filter(event => 
          event.category === 'nutrition' || event.title.includes('ארוחה') || event.title.includes('אוכל')
        );
        
        return {
          message: 'אני מבינה שאת רוצה לשנות את זמני האוכל. כרגע יש לך:\n' + nutritionEvents.map(e => '• ' + e.time + ' - ' + e.title).join('\n') + '\n\nבאיזה שעה את מעדיפה לאכול? (למשל: "12:30" או "13:00")',
          timestamp: new Date().toISOString(),
          needsPlanUpdate: false,
          chatState: {
            isWaitingForResponse: true,
            context: 'meal_time_change',
            data: { originalEvents: nutritionEvents }
          }
        };
      }
    }
    
    // Other existing responses...
    if (msg.includes('תוכנית') || msg.includes('לוח זמנים')) {
      if (currentPlan && currentPlan.dailyEvents) {
        return {
          message: 'התוכנית הנוכחית שלך כוללת:\n' + currentPlan.dailyEvents.map(e => '• ' + e.time + ' - ' + e.title + ' (' + e.duration + ' דקות)').join('\n') + '\n\nאם את רוצה לשנות משהו, ספרי לי מה ואני אעזור לך! 📋',
          timestamp: new Date().toISOString(),
          needsPlanUpdate: false
        };
      }
    }
    
    // Water questions
    if (msg.includes('מים') || msg.includes('כוס') || msg.includes('שתיה')) {
      const weight = userProfile?.weight || 70;
      const glasses = Math.round(weight * 0.035);
      return {
        message: 'בהתבסס על המשקל שלך (' + weight + ' ק"ג), מומלץ לשתות כ-' + glasses + ' כוסות מים ביום (כ-2.5 ליטר). זכרי לשתות במרווחים קבועים לאורך היום! 💧',
        timestamp: new Date().toISOString(),
        needsPlanUpdate: false
      };
    }
    
    // Sleep questions
    if (msg.includes('שינה') || msg.includes('ישן') || msg.includes('לישון')) {
      return {
        message: 'לפי הפרופיל שלך, מומלץ לישון 7-8 שעות בלילה. נסי ללכת לישון ב-' + (userProfile?.sleepSchedule?.bedtime || '23:00') + ' ולהתעורר ב-' + (userProfile?.sleepSchedule?.wakeTime || '07:00') + '. 😴',
        timestamp: new Date().toISOString(),
        needsPlanUpdate: false
      };
    }
    
    // Exercise questions
    if (msg.includes('ספורט') || msg.includes('פעילות') || msg.includes('תרגיל')) {
      return {
        message: 'בהתאם לרמת הפעילות שלך (' + (userProfile?.activityLevel || 'בינונית') + '), מומלץ על 150 דקות פעילות בינונית בשבוע. תוכלי לחלק את זה ל-30 דקות, 5 פעמים בשבוע! 🏃‍♀️',
        timestamp: new Date().toISOString(),
        needsPlanUpdate: false
      };
    }
    
    return null;
  }

  handleFollowUpResponse(message, userProfile, currentPlan, chatState) {
    const msg = message.toLowerCase().trim();
    
    if (chatState.context === 'meal_time_change') {
      // Check if user provided a time
      const timeMatch = message.match(/(\d{1,2})[:\.](\d{2})|(\d{1,2})/);
      
      if (timeMatch) {
        let newTime;
        if (timeMatch[1] && timeMatch[2]) {
          // Format: HH:MM or HH.MM
          newTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
        } else if (timeMatch[3]) {
          // Format: HH (assume :00)
          newTime = `${timeMatch[3].padStart(2, '0')}:00`;
        }
        
        if (newTime) {
          return {
            message: 'מעולה! אעדכן את התוכנית שלך לארוחת צהריים ב-' + newTime + '. התוכנית החדשה תיצור עכשיו! 🍽️',
            timestamp: new Date().toISOString(),
            needsPlanUpdate: true,
            planUpdate: {
              type: 'meal_time_change',
              newTime: newTime,
              originalEvents: chatState.data.originalEvents
            },
            clearChatState: true
          };
        }
      }
      
      return {
        message: `לא הצלחתי להבין את השעה. אנא כתבי שעה בפורמט כמו "12:30" או "13:00". באיזה שעה את מעדיפה לאכול?`,
        timestamp: new Date().toISOString(),
        needsPlanUpdate: false
      };
    }
    
    // Default fallback
    return {
      message: 'מצטערת, לא הבנתי. בואי נתחיל מחדש.',
      timestamp: new Date().toISOString(),
      needsPlanUpdate: false,
      clearChatState: true
    };
  }

  getFallbackResponse(message, userProfile) {
    const msg = message.toLowerCase();
    
    // Try local response first
    const localResponse = this.tryLocalResponse(message, userProfile);
    if (localResponse) return localResponse;
    
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