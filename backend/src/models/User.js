const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    age: { type: Number, min: 13, max: 120 },
    height: { type: Number, min: 100, max: 250 }, // cm
    weight: { type: Number, min: 30, max: 300 }, // kg
    bmi: { type: Number },
    activityLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      default: 'moderate'
    },
    workSchedule: {
      startTime: String, // "09:00"
      endTime: String,   // "17:00"
      workDays: [String] // ["monday", "tuesday", ...]
    },
    sleepSchedule: {
      bedtime: String,   // "23:00"
      wakeTime: String   // "07:00"
    },
    goals: [{
      type: String,
      enum: ['energy', 'routine', 'consistency', 'balance']
    }],
    preferences: {
      nutrition: { type: Boolean, default: true },
      hydration: { type: Boolean, default: true },
      movement: { type: Boolean, default: true },
      sleep: { type: Boolean, default: true },
      relaxation: { type: Boolean, default: true },
      digitalWellness: { type: Boolean, default: true },
      outdoorTime: { type: Boolean, default: true }
    }
  },
  googleCalendar: {
    accessToken: String,
    refreshToken: String,
    calendarId: String
  },
  isOnboarded: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Calculate BMI before saving
userSchema.pre('save', function(next) {
  if (this.profile.height && this.profile.weight) {
    const heightInM = this.profile.height / 100;
    this.profile.bmi = Math.round((this.profile.weight / (heightInM * heightInM)) * 10) / 10;
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);