const express = require('express');
const auth = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const User = require('../models/User');

const router = express.Router();

// Generate daily plan
router.post('/generate', auth, async (req, res) => {
  try {
    if (!req.user.isOnboarded) {
      return res.status(400).json({ error: 'Please complete onboarding first' });
    }

    const plan = await geminiService.generateDailyPlan(req.user.profile, req.user.currentPlan);
    
    // Clear modifications after generating
    if (req.user.profile.planModifications) {
      await User.findByIdAndUpdate(req.user._id, {
        'profile.planModifications': null
      });
    }
    
    res.json({
      plan,
      generatedAt: new Date().toISOString(),
      userId: req.user._id
    });
  } catch (error) {
    console.error('Plan generation error:', error);
    res.status(500).json({ error: 'Failed to generate plan' });
  }
});

module.exports = router;