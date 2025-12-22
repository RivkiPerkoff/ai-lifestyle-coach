import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { planService } from '../services/api';
import { DailyPlan } from '../types';
import Chat from '../components/Chat';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    setError('');
    
    try {
      const newPlan = await planService.generatePlan();
      setPlan(newPlan);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanUpdateNeeded = () => {
    // Regenerate plan when AI suggests an update
    generatePlan();
  };

  useEffect(() => {
    if (user?.isOnboarded) {
      generatePlan();
    }
  }, [user]);

  if (!user?.isOnboarded) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>Welcome to AI Lifestyle Coach!</h2>
          <p>Please complete your onboarding to get started.</p>
          <a href="/onboarding" className="btn btn-primary">Complete Setup</a>
        </div>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    hydration: '#3b82f6',
    movement: '#10b981',
    nutrition: '#f59e0b',
    relaxation: '#8b5cf6',
    sleep: '#6366f1',
    digital: '#ef4444'
  };

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Your Daily Plan</h1>
          <div>
            <button 
              onClick={generatePlan} 
              className="btn btn-primary" 
              style={{ marginRight: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'New Plan'}
            </button>
            <button 
              onClick={() => setIsChatOpen(true)} 
              className="btn" 
              style={{ background: '#10b981', color: 'white', marginRight: '1rem' }}
            >
              💬 Chat with Coach
            </button>
            <button onClick={logout} className="btn" style={{ background: '#f3f4f6' }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {error && (
          <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {loading && (
          <div className="card" style={{ textAlign: 'center' }}>
            <p>Generating your personalized plan...</p>
          </div>
        )}

        {plan && (
          <>
            {/* Recommendations */}
            <div className="card">
              <h2 style={{ marginBottom: '1rem' }}>Today's Recommendations</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
                  <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>🥗 Nutrition</h4>
                  <p style={{ fontSize: '0.9rem' }}>{plan.recommendations.nutrition}</p>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
                  <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>🏃 Movement</h4>
                  <p style={{ fontSize: '0.9rem' }}>{plan.recommendations.movement}</p>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
                  <h4 style={{ color: '#6366f1', marginBottom: '0.5rem' }}>😴 Sleep</h4>
                  <p style={{ fontSize: '0.9rem' }}>{plan.recommendations.sleep}</p>
                </div>
              </div>
            </div>

            {/* Daily Events */}
            <div className="card">
              <h2 style={{ marginBottom: '1rem' }}>Your Schedule</h2>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {plan.dailyEvents
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((event, index) => (
                    <div 
                      key={index} 
                      className="event-card"
                      style={{ 
                        borderLeftColor: categoryColors[event.category] || '#3b82f6'
                      }}
                    >
                      <div className="event-time">{event.time}</div>
                      <div className="event-title">{event.title}</div>
                      <div className="event-description">{event.description}</div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#9ca3af', 
                        marginTop: '0.25rem' 
                      }}>
                        {event.duration} minutes • {event.category}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* BMI Info */}
            {user.profile?.bmi && (
              <div className="card">
                <h3>Health Info</h3>
                <p>BMI: {user.profile.bmi} 
                  <span style={{ 
                    marginLeft: '0.5rem', 
                    fontSize: '0.9rem', 
                    color: '#6b7280' 
                  }}>
                    ({user.profile.height}cm, {user.profile.weight}kg)
                  </span>
                </p>
              </div>
            )}
          </>
        )}

        {!plan && !loading && !error && (
          <div className="card" style={{ textAlign: 'center' }}>
            <h2>Ready to start your wellness journey?</h2>
            <p style={{ marginBottom: '1rem' }}>Click "New Plan" to generate your personalized daily schedule.</p>
            <button onClick={generatePlan} className="btn btn-primary">
              Generate My Plan
            </button>
          </div>
        )}
      </div>
      
      {/* Floating Chat Button */}
      {plan && !isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 999,
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          💬
        </button>
      )}
      
      {/* Chat Component */}
      <Chat 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onPlanUpdateNeeded={handlePlanUpdateNeeded}
      />
    </div>
  );
};

export default Dashboard;