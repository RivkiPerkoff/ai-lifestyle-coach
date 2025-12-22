const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateDailyPlan(userProfile) {
    const prompt = this.buildPrompt(userProfile);
    
    try {
      console.log('Generating plan for user profile:', userProfile);
      console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
      console.log('API Key first 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10));
      
      // Test with a simple prompt first
      const testResult = await this.model.generateContent('Hello, respond with just "OK"');
      console.log('Simple test successful');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response received:', text.substring(0, 100));
      
      return this.parseResponse(text);
    } catch (error) {
      console.error('Gemini API error details:', {
        message: error.message,
        cause: error.cause,
        stack: error.stack?.substring(0, 200)
      });
      
      // Fallback to demo plan if API fails
      console.log('Using fallback plan due to API error');
      return {
        dailyEvents: [
          {
            time: "08:00",
            title: "Morning Hydration",
            description: "Start your day with a glass of water",
            category: "hydration",
            duration: 2
          },
          {
            time: "10:30",
            title: "Movement Break",
            description: "5-minute stretch or walk",
            category: "movement",
            duration: 5
          },
          {
            time: "14:00",
            title: "Mindful Lunch",
            description: "Eat slowly and mindfully",
            category: "nutrition",
            duration: 10
          },
          {
            time: "16:00",
            title: "Afternoon Hydration",
            description: "Drink water and take deep breaths",
            category: "hydration",
            duration: 3
          },
          {
            time: "22:00",
            title: "Wind Down",
            description: "Prepare for sleep - no screens",
            category: "sleep",
            duration: 15
          }
        ],
        recommendations: {
          nutrition: "Focus on whole foods and regular meal times",
          sleep: "Maintain consistent sleep schedule (23:00-07:00)",
          movement: "Take short breaks every 2 hours during work"
        }
      };
    }
  }

  buildPrompt(profile) {
    const { age, bmi, activityLevel, workSchedule, sleepSchedule, goals, preferences } = profile;
    
    return `
Create a personalized daily wellness plan in JSON format for:
- Age: ${age}, BMI: ${bmi}, Activity: ${activityLevel}
- Work: ${workSchedule.startTime}-${workSchedule.endTime}
- Sleep: ${sleepSchedule.bedtime}-${sleepSchedule.wakeTime}
- Goals: ${goals.join(', ')}
- Enabled features: ${Object.entries(preferences).filter(([k,v]) => v).map(([k]) => k).join(', ')}

Return ONLY valid JSON with this structure:
{
  "dailyEvents": [
    {
      "time": "HH:MM",
      "title": "Brief title",
      "description": "Short description",
      "category": "hydration|movement|nutrition|relaxation|sleep|digital",
      "duration": 5
    }
  ],
  "recommendations": {
    "nutrition": "Brief general advice",
    "sleep": "Sleep optimization tip",
    "movement": "Activity suggestion"
  }
}

Guidelines:
- Events should be 5-15 minutes max
- Avoid work hours (${workSchedule.startTime}-${workSchedule.endTime})
- Include only enabled categories
- Times in 24-hour format
- Keep descriptions under 50 characters
`;
  }

  parseResponse(text) {
    try {
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      throw new Error('Invalid AI response format');
    }
  }
}

module.exports = new GeminiService();