const express = require('express');
const Joi = require('joi');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Profile update schema
const profileSchema = Joi.object({
  age: Joi.number().min(13).max(120),
  height: Joi.number().min(100).max(250),
  weight: Joi.number().min(30).max(300),
  activityLevel: Joi.string().valid('low', 'moderate', 'high'),
  workSchedule: Joi.object({
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    workDays: Joi.array().items(Joi.string())
  }),
  sleepSchedule: Joi.object({
    bedtime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    wakeTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  }),
  goals: Joi.array().items(Joi.string().valid('energy', 'routine', 'consistency', 'balance')),
  preferences: Joi.object({
    nutrition: Joi.boolean(),
    hydration: Joi.boolean(),
    movement: Joi.boolean(),
    sleep: Joi.boolean(),
    relaxation: Joi.boolean(),
    digitalWellness: Joi.boolean(),
    outdoorTime: Joi.boolean()
  })
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile (onboarding)
router.put('/profile', auth, async (req, res) => {
  try {
    const { error } = profileSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        profile: req.body,
        isOnboarded: true
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;