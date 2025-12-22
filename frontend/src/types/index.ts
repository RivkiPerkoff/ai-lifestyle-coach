export interface User {
  id: string;
  email: string;
  isOnboarded: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  bmi?: number;
  activityLevel: 'low' | 'moderate' | 'high';
  workSchedule: {
    startTime: string;
    endTime: string;
    workDays: string[];
  };
  sleepSchedule: {
    bedtime: string;
    wakeTime: string;
  };
  goals: string[];
  preferences: {
    nutrition: boolean;
    hydration: boolean;
    movement: boolean;
    sleep: boolean;
    relaxation: boolean;
    digitalWellness: boolean;
    outdoorTime: boolean;
  };
}

export interface DailyEvent {
  time: string;
  title: string;
  description: string;
  category: 'hydration' | 'movement' | 'nutrition' | 'relaxation' | 'sleep' | 'digital';
  duration: number;
}

export interface DailyPlan {
  dailyEvents: DailyEvent[];
  recommendations: {
    nutrition: string;
    sleep: string;
    movement: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}