export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: 'study' | 'workout' | 'nutrition' | 'general';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export interface StudySubject {
  id: string;
  name: string;
  targetHoursPerWeek: number;
  color: string;
  notes: string;
}

export interface StudyLog {
  id: string;
  subjectId: string;
  durationMinutes: number;
  date: string; // ISO date YYYY-MM-DD
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number; // in kg or lbs
  completed?: boolean;
}

export interface WorkoutRoutine {
  id: string;
  name: string; // e.g. "Push Day", "Pull Day", "Legs"
  exercises: Exercise[];
  dayOfWeek?: number[]; // indices 0-6 or empty for anytime
}

export interface WorkoutLog {
  id: string;
  routineName: string;
  exercises: Exercise[];
  date: string; // YYYY-MM-DD
  durationMinutes: number;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fat: number; // in g
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string; // YYYY-MM-DD
}

export interface WaterLog {
  id: string;
  amountMl: number;
  date: string; // YYYY-MM-DD
}

export interface Alarm {
  id: string;
  label: string;
  time: string; // HH:MM
  active: boolean;
  repeatDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  category: 'study' | 'workout' | 'meal' | 'general';
  soundType: 'digital' | 'analog' | 'soothing' | 'cosmic';
}

export interface DailyGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
}
