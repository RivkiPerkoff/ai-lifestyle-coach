const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: { maxOutputTokens: 2048 } 
    });
  }

  async generateDailyPlan(userProfile, currentPlan = null) {
    const prompt = this.buildPrompt(userProfile, currentPlan);
    
    try {
      console.log('Generating plan for user profile:', userProfile);
      console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
      
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

  buildPrompt(profile, currentPlan) {
    const { age, bmi, activityLevel, workSchedule, sleepSchedule, goals, preferences, planModifications } = profile;
    
    let prompt = `
Create a personalized daily wellness plan in JSON format for:
- Age: ${age}, BMI: ${bmi}, Activity: ${activityLevel}
- Work: ${workSchedule.startTime}-${workSchedule.endTime}
- Sleep: ${sleepSchedule.bedtime}-${sleepSchedule.wakeTime}
- Goals: ${goals.join(', ')}
- Enabled features: ${Object.entries(preferences).filter(([k,v]) => v).map(([k]) => k).join(', ')}
`;

    if (currentPlan && planModifications) {
      prompt += `

CURRENT PLAN:
${JSON.stringify(currentPlan.dailyEvents || [], null, 2)}

USER REQUESTED MODIFICATIONS: "${planModifications}"

INSTRUCTIONS:
1. Use the CURRENT PLAN as the baseline.
2. Apply the USER REQUESTED MODIFICATIONS (e.g., increase duration, change time).
3. Keep the rest of the schedule as similar as possible to the CURRENT PLAN.
4. Return the FULL updated plan in JSON format.`;
    } else if (planModifications) {
      prompt += `\nIMPORTANT - USER REQUESTED CHANGES: ${planModifications}\nPlease incorporate these specific changes into the schedule while maintaining balance.`;
    }

    prompt += `

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
    return prompt;
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
    
    // 1. Morning Routine
    if (preferences.hydration) {
      events.push({
        time: sleepSchedule.wakeTime,
        title: "Morning Hydration",
        description: "Start your day with a large glass of water",
        category: "hydration",
        duration: 5
      });
    }
    
    // 2. Breakfast
    if (preferences.nutrition) {
      events.push({
        time: "08:30",
        title: "Energizing Breakfast",
        description: "High protein breakfast to start the day",
        category: "nutrition",
        duration: 20
      });
    }

    // 3. Lunch
    if (preferences.nutrition) {
      events.push({
        time: "13:00",
        title: "Lunch Break",
        description: "Balanced meal with vegetables and protein",
        category: "nutrition",
        duration: 30
      });
    }

    // 4. Afternoon Movement
    if (preferences.movement) {
      events.push({
        time: workSchedule.endTime || "17:00",
        title: "Daily Exercise",
        description: activityLevel === 'high' ? "HIIT or Cardio session" : "Brisk walk or light yoga",
        category: "movement",
        duration: 30
      });
    }

    // 5. Dinner
    if (preferences.nutrition) {
      events.push({
        time: "19:30",
        title: "Dinner",
        description: "Light dinner, try to avoid heavy carbs",
        category: "nutrition",
        duration: 30
      });
    }

    // 6. Sleep
    if (preferences.sleep) {
      events.push({
        time: sleepSchedule.bedtime,
        title: "Sleep Time",
        description: "Lights out, phone away",
        category: "sleep",
        duration: 0
      });
    }
    
    return {
      dailyEvents: events.sort((a, b) => a.time.localeCompare(b.time)),
      recommendations: {
        nutrition: "Focus on whole foods and stay hydrated throughout the day.",
        sleep: `Try to maintain a consistent sleep schedule between ${sleepSchedule.bedtime} and ${sleepSchedule.wakeTime}.`,
        movement: "Aim for at least 30 minutes of moderate activity daily."
      }
    };
  }
}

module.exports = new GeminiService();