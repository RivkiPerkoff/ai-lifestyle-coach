import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { UserProfile } from '../types';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState<UserProfile>({
    age: 25,
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    workSchedule: {
      startTime: '09:00',
      endTime: '17:00',
      workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    sleepSchedule: {
      bedtime: '23:00',
      wakeTime: '07:00'
    },
    goals: [],
    preferences: {
      nutrition: true,
      hydration: true,
      movement: true,
      sleep: true,
      relaxation: true,
      digitalWellness: true,
      outdoorTime: true
    }
  });

  const handleGoalToggle = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handlePreferenceToggle = (pref: keyof typeof profile.preferences) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [pref]: !prev.preferences[pref]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.updateProfile(profile);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Let's Get to Know You</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div style={{ marginBottom: '2rem' }}>
            <h3>Basic Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-input"
                  value={profile.age}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
                  min="13"
                  max="120"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={profile.height}
                  onChange={(e) => setProfile(prev => ({ ...prev, height: Number(e.target.value) }))}
                  min="100"
                  max="250"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  className="form-input"
                  value={profile.weight}
                  onChange={(e) => setProfile(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  min="30"
                  max="300"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Activity Level</label>
              <select
                className="form-input"
                value={profile.activityLevel}
                onChange={(e) => setProfile(prev => ({ ...prev, activityLevel: e.target.value as any }))}
              >
                <option value="low">Low (Sedentary)</option>
                <option value="moderate">Moderate (Some exercise)</option>
                <option value="high">High (Very active)</option>
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ marginBottom: '2rem' }}>
            <h3>Your Schedule</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Work Start Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={profile.workSchedule.startTime}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    workSchedule: { ...prev.workSchedule, startTime: e.target.value }
                  }))}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Work End Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={profile.workSchedule.endTime}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    workSchedule: { ...prev.workSchedule, endTime: e.target.value }
                  }))}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Bedtime</label>
                <input
                  type="time"
                  className="form-input"
                  value={profile.sleepSchedule.bedtime}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    sleepSchedule: { ...prev.sleepSchedule, bedtime: e.target.value }
                  }))}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Wake Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={profile.sleepSchedule.wakeTime}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    sleepSchedule: { ...prev.sleepSchedule, wakeTime: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Goals */}
          <div style={{ marginBottom: '2rem' }}>
            <h3>Your Goals</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
              {[
                { key: 'energy', label: 'More Energy' },
                { key: 'routine', label: 'Better Routine' },
                { key: 'consistency', label: 'Consistency' },
                { key: 'balance', label: 'Work-Life Balance' }
              ].map(goal => (
                <label key={goal.key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={profile.goals.includes(goal.key)}
                    onChange={() => handleGoalToggle(goal.key)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {goal.label}
                </label>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div style={{ marginBottom: '2rem' }}>
            <h3>What would you like to include?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
              {[
                { key: 'nutrition', label: 'Nutrition Tips' },
                { key: 'hydration', label: 'Hydration Reminders' },
                { key: 'movement', label: 'Movement Breaks' },
                { key: 'sleep', label: 'Sleep Optimization' },
                { key: 'relaxation', label: 'Relaxation Moments' },
                { key: 'digitalWellness', label: 'Digital Wellness' },
                { key: 'outdoorTime', label: 'Outdoor Time' }
              ].map(pref => (
                <label key={pref.key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={profile.preferences[pref.key as keyof typeof profile.preferences]}
                    onChange={() => handlePreferenceToggle(pref.key as keyof typeof profile.preferences)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {pref.label}
                </label>
              ))}
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Your Plan...' : 'Create My Plan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;