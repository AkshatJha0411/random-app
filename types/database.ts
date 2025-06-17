export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  training_experience?: string;
  fitness_goal?: string;
  equipment_available?: string[];
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  target_muscle_group: string;
  equipment_used: string;
  exercise_type: string;
  level: string;
  instructions?: string;
  media_url?: string;
  created_at: string;
}

export interface Workout {
  id: string;
  name: string;
  creator_email?: string;
  level?: string;
  notes?: string;
  created_at: string;
  exercises?: Exercise[];
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  exercise?: Exercise;
}

export interface WorkoutLog {
  id: string;
  user_email: string;
  workout_id?: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight_kg: number;
  notes?: string;
  logged_at: string;
  created_at: string;
  exercise?: Exercise;
  workout?: Workout;
}

export interface OnboardingData {
  name: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  training_experience: string;
  fitness_goal: string;
  equipment_available: string[];
}