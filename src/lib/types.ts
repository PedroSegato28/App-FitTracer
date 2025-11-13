// Types for Workout Tracker App

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  notes?: string;
  completed?: boolean;
}

export interface Workout {
  id: string;
  name: string;
  day: string;
  exercises: Exercise[];
  color: string;
  inProgress?: boolean;
  startedAt?: string;
}

export interface Schedule {
  id: string;
  workoutId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  time: string;
  active: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  completed: boolean;
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  exercises: Exercise[];
  duration?: number;
  notes?: string;
  completedExercises: number;
  totalExercises: number;
  points: number;
}

export interface UserStats {
  totalWorkouts: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  weeklyFrequency: number;
}
