const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
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
      return this.generateFallbackPlan(userProfile);
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

  generateFallbackPlan(profile) {
    const { workSchedule, sleepSchedule, preferences, activityLevel } = profile;
    const events = [];
    const timeVariations = [0, 15, 30]; // Add time variations
    const randomVariation = timeVariations[Math.floor(Math.random() * timeVariations.length)];
    
    // Morning routine with variation
    if (preferences.hydration) {
      const baseHour = 8;
      const time = `${String(baseHour).padStart(2, '0')}:${String(randomVariation).padStart(2, '0')}`;
      events.push({
        time,
        title: "Morning Hydration",
        description: "Start with a glass of water",
        category: "hydration",
        duration: 2
      });
    }
    
    // Work break based on activity level with variation
    if (preferences.movement) {
      const baseHour = activityLevel === 'low' ? 10 : 11;
      const time = `${String(baseHour).padStart(2, '0')}:${String(randomVariation).padStart(2, '0')}`;
      const activities = [
        { desc: "Quick stretch", dur: 5 },
        { desc: "Walk around", dur: 7 },
        { desc: "Desk exercises", dur: 6 }
      ];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      
      events.push({
        time,
        title: "Movement Break",
        description: activityLevel === 'high' ? "Quick workout" : activity.desc,
        category: "movement",
        duration: activityLevel === 'high' ? 10 : activity.dur
      });
    }
    
    // Lunch mindfulness with variation
    if (preferences.nutrition) {
      const baseHour = 13;
      const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      const time = `${String(baseHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const activities = [
        "Eat slowly and focus on your meal",
        "Practice mindful eating",
        "Enjoy your lunch without distractions"
      ];
      
      events.push({
        time,
        title: "Mindful Eating",
        description: activities[Math.floor(Math.random() * activities.length)],
        category: "nutrition",
        duration: 10
      });
    }
    
    // Afternoon hydration with variation
    if (preferences.hydration) {
      const baseHour = 15;
      const minutes = [0, 15, 30][Math.floor(Math.random() * 3)];
      const time = `${String(baseHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      events.push({
        time,
        title: "Hydration Check",
        description: "Drink water and breathe deeply",
        category: "hydration",
        duration: 3
      });
    }
    
    // Evening routine based on sleep schedule with variation
    if (preferences.relaxation) {
      const windDownHour = sleepSchedule.bedtime ? 
        parseInt(sleepSchedule.bedtime.split(':')[0]) - 1 : 21;
      const minutes = [0, 15, 30][Math.floor(Math.random() * 3)];
      const time = `${String(windDownHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      const activities = [
        "Wind down for better sleep",
        "Prepare for restful night",
        "Relax and unwind"
      ];
      
      events.push({
        time,
        title: "Evening Relaxation",
        description: activities[Math.floor(Math.random() * activities.length)],
        category: "relaxation",
        duration: 15
      });
    }
    
    // Add random wellness tip
    if (preferences.digitalWellness && Math.random() > 0.5) {
      events.push({
        time: "16:00",
        title: "Digital Break",
        description: "Take a break from screens",
        category: "digitalWellness",
        duration: 5
      });
    }
    
    const nutritionTips = [
      `Focus on ${activityLevel === 'high' ? 'protein-rich' : 'balanced'} meals`,
      "Stay hydrated throughout the day",
      "Include more vegetables in your meals"
    ];
    
    const sleepTips = [
      `Maintain ${sleepSchedule.bedtime || '23:00'}-${sleepSchedule.wakeTime || '07:00'} schedule`,
      "Create a calming bedtime routine",
      "Avoid screens before sleep"
    ];
    
    const movementTips = [
      `${activityLevel === 'high' ? 'Maintain' : 'Increase'} daily activity`,
      "Take regular movement breaks",
      "Try different types of exercise"
    ];
    
    return {
      dailyEvents: events,
      recommendations: {
        nutrition: nutritionTips[Math.floor(Math.random() * nutritionTips.length)],
        sleep: sleepTips[Math.floor(Math.random() * sleepTips.length)],
        movement: movementTips[Math.floor(Math.random() * movementTips.length)]
      }
    };
  }
}

module.exports = new GeminiService();