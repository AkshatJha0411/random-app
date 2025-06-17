/*
  # Fitness Tracker Database Schema

  1. New Tables
    - `users` - User profiles with onboarding data
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `age` (integer)
      - `gender` (text)
      - `height_cm` (integer)
      - `weight_kg` (decimal)
      - `training_experience` (text)
      - `fitness_goal` (text)
      - `equipment_available` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `exercises` - Global exercise library
      - `id` (uuid, primary key)
      - `name` (text)
      - `target_muscle_group` (text)
      - `equipment_used` (text)
      - `exercise_type` (text)
      - `level` (text)
      - `instructions` (text)
      - `media_url` (text)

    - `workouts` - Workout templates (default + custom)
      - `id` (uuid, primary key)
      - `name` (text)
      - `creator_email` (text, nullable for default workouts)
      - `level` (text)
      - `notes` (text)
      - `created_at` (timestamp)

    - `workout_exercises` - Junction table for workout-exercise relationships
      - `id` (uuid, primary key)
      - `workout_id` (uuid, foreign key)
      - `exercise_id` (uuid, foreign key)
      - `order_index` (integer)

    - `workout_logs` - User workout session tracking
      - `id` (uuid, primary key)
      - `user_email` (text, foreign key)
      - `workout_id` (uuid, foreign key)
      - `exercise_id` (uuid, foreign key)
      - `sets` (integer)
      - `reps` (integer)
      - `weight_kg` (decimal)
      - `notes` (text)
      - `logged_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Allow public read access to exercises table
    - Allow public read access to default workouts
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  age integer,
  gender text CHECK (gender IN ('Male', 'Female', 'Other')),
  height_cm integer,
  weight_kg decimal(5,2),
  training_experience text CHECK (training_experience IN ('Beginner', 'Intermediate', 'Advanced')),
  fitness_goal text CHECK (fitness_goal IN ('Build Muscle', 'Lose Fat', 'Recomp', 'General Fitness')),
  equipment_available text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_muscle_group text NOT NULL,
  equipment_used text NOT NULL,
  exercise_type text CHECK (exercise_type IN ('Compound', 'Isolation')) DEFAULT 'Compound',
  level text CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
  instructions text,
  media_url text,
  created_at timestamptz DEFAULT now()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  creator_email text,
  level text CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create workout_exercises junction table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create workout_logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text REFERENCES users(email) ON DELETE CASCADE NOT NULL,
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  sets integer NOT NULL DEFAULT 1,
  reps integer NOT NULL DEFAULT 1,
  weight_kg decimal(6,2) DEFAULT 0,
  notes text,
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.email() = email);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.email() = email);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.email() = email)
  WITH CHECK (auth.email() = email);

-- RLS Policies for exercises table (public read)
CREATE POLICY "Anyone can read exercises" ON exercises
  FOR SELECT TO authenticated
  USING (true);

-- RLS Policies for workouts table
CREATE POLICY "Anyone can read default workouts" ON workouts
  FOR SELECT TO authenticated
  USING (creator_email IS NULL OR creator_email = auth.email());

CREATE POLICY "Users can create custom workouts" ON workouts
  FOR INSERT TO authenticated
  WITH CHECK (creator_email = auth.email());

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE TO authenticated
  USING (creator_email = auth.email())
  WITH CHECK (creator_email = auth.email());

-- RLS Policies for workout_exercises table
CREATE POLICY "Anyone can read workout exercises for accessible workouts" ON workout_exercises
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts w 
      WHERE w.id = workout_id 
      AND (w.creator_email IS NULL OR w.creator_email = auth.email())
    )
  );

CREATE POLICY "Users can manage exercises for own workouts" ON workout_exercises
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts w 
      WHERE w.id = workout_id 
      AND w.creator_email = auth.email()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts w 
      WHERE w.id = workout_id 
      AND w.creator_email = auth.email()
    )
  );

-- RLS Policies for workout_logs table
CREATE POLICY "Users can manage own workout logs" ON workout_logs
  FOR ALL TO authenticated
  USING (user_email = auth.email())
  WITH CHECK (user_email = auth.email());

-- Insert default exercises
INSERT INTO exercises (name, target_muscle_group, equipment_used, exercise_type, level, instructions) VALUES
-- Chest exercises
('Bench Press', 'Chest', 'Barbell', 'Compound', 'Intermediate', 'Lie on bench, grip bar wider than shoulders, lower to chest, press up'),
('Incline Dumbbell Press', 'Chest', 'Dumbbell', 'Compound', 'Intermediate', 'Set bench to 30-45 degrees, press dumbbells from chest level'),
('Push-ups', 'Chest', 'Bodyweight', 'Compound', 'Beginner', 'Start in plank position, lower chest to ground, push back up'),
('Dips', 'Chest', 'Bodyweight', 'Compound', 'Intermediate', 'Support body on parallel bars, lower until shoulders below elbows'),
('Chest Fly', 'Chest', 'Dumbbell', 'Isolation', 'Beginner', 'Lie on bench, arc dumbbells from above chest to sides'),

-- Back exercises
('Deadlift', 'Back', 'Barbell', 'Compound', 'Advanced', 'Stand with bar over feet, grip bar, lift by extending hips and knees'),
('Pull-ups', 'Back', 'Bodyweight', 'Compound', 'Intermediate', 'Hang from bar, pull body up until chin over bar'),
('Lat Pulldown', 'Back', 'Machine', 'Compound', 'Beginner', 'Sit at machine, pull bar down to upper chest'),
('Bent-over Row', 'Back', 'Barbell', 'Compound', 'Intermediate', 'Bend at hips, row bar to lower chest'),
('Seated Cable Row', 'Back', 'Machine', 'Compound', 'Beginner', 'Sit at cable machine, pull handle to abdomen'),

-- Leg exercises
('Squat', 'Quads', 'Barbell', 'Compound', 'Intermediate', 'Bar on shoulders, lower until thighs parallel to ground'),
('Deadlift', 'Hamstrings', 'Barbell', 'Compound', 'Advanced', 'Stand with bar over feet, grip bar, lift by extending hips and knees'),
('Lunge', 'Quads', 'Bodyweight', 'Compound', 'Beginner', 'Step forward, lower back knee toward ground'),
('Leg Press', 'Quads', 'Machine', 'Compound', 'Beginner', 'Sit in machine, press weight with feet'),
('Calf Raise', 'Calves', 'Bodyweight', 'Isolation', 'Beginner', 'Rise up on toes, lower slowly'),

-- Shoulder exercises
('Overhead Press', 'Shoulders', 'Barbell', 'Compound', 'Intermediate', 'Press bar from shoulders straight overhead'),
('Lateral Raise', 'Shoulders', 'Dumbbell', 'Isolation', 'Beginner', 'Raise dumbbells to sides until parallel to ground'),
('Front Raise', 'Shoulders', 'Dumbbell', 'Isolation', 'Beginner', 'Raise dumbbells in front to shoulder height'),
('Reverse Fly', 'Shoulders', 'Dumbbell', 'Isolation', 'Beginner', 'Bend forward, raise dumbbells to sides'),

-- Arm exercises
('Bicep Curl', 'Biceps', 'Dumbbell', 'Isolation', 'Beginner', 'Curl dumbbells toward shoulders, lower slowly'),
('Tricep Pushdown', 'Triceps', 'Machine', 'Isolation', 'Beginner', 'Push cable handle down, extend arms fully'),
('Hammer Curl', 'Biceps', 'Dumbbell', 'Isolation', 'Beginner', 'Curl dumbbells with neutral grip'),
('Close-grip Push-up', 'Triceps', 'Bodyweight', 'Compound', 'Beginner', 'Push-up with hands close together'),

-- Core exercises
('Plank', 'Core', 'Bodyweight', 'Isolation', 'Beginner', 'Hold body in straight line from head to heels'),
('Crunches', 'Core', 'Bodyweight', 'Isolation', 'Beginner', 'Lie on back, curl shoulders toward knees'),
('Russian Twists', 'Core', 'Bodyweight', 'Isolation', 'Beginner', 'Sit with knees bent, rotate torso side to side'),
('Mountain Climbers', 'Core', 'Bodyweight', 'Compound', 'Intermediate', 'In plank position, alternate bringing knees to chest');

-- Create default workouts
INSERT INTO workouts (name, creator_email, level, notes) VALUES
('Push Day', NULL, 'Intermediate', 'Upper body pushing muscles - chest, shoulders, triceps'),
('Pull Day', NULL, 'Intermediate', 'Upper body pulling muscles - back, biceps'),
('Leg Day', NULL, 'Intermediate', 'Lower body muscles - quads, hamstrings, glutes, calves');

-- Get workout IDs and exercise IDs for linking
DO $$
DECLARE
    push_workout_id uuid;
    pull_workout_id uuid;
    leg_workout_id uuid;
    bench_press_id uuid;
    overhead_press_id uuid;
    tricep_pushdown_id uuid;
    deadlift_id uuid;
    lat_pulldown_id uuid;
    bicep_curl_id uuid;
    squat_id uuid;
    lunge_id uuid;
    calf_raise_id uuid;
BEGIN
    -- Get workout IDs
    SELECT id INTO push_workout_id FROM workouts WHERE name = 'Push Day' AND creator_email IS NULL;
    SELECT id INTO pull_workout_id FROM workouts WHERE name = 'Pull Day' AND creator_email IS NULL;
    SELECT id INTO leg_workout_id FROM workouts WHERE name = 'Leg Day' AND creator_email IS NULL;

    -- Get exercise IDs
    SELECT id INTO bench_press_id FROM exercises WHERE name = 'Bench Press';
    SELECT id INTO overhead_press_id FROM exercises WHERE name = 'Overhead Press';
    SELECT id INTO tricep_pushdown_id FROM exercises WHERE name = 'Tricep Pushdown';
    SELECT id INTO deadlift_id FROM exercises WHERE name = 'Deadlift';
    SELECT id INTO lat_pulldown_id FROM exercises WHERE name = 'Lat Pulldown';
    SELECT id INTO bicep_curl_id FROM exercises WHERE name = 'Bicep Curl';
    SELECT id INTO squat_id FROM exercises WHERE name = 'Squat';
    SELECT id INTO lunge_id FROM exercises WHERE name = 'Lunge';
    SELECT id INTO calf_raise_id FROM exercises WHERE name = 'Calf Raise';

    -- Link exercises to Push Day workout
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES
    (push_workout_id, bench_press_id, 1),
    (push_workout_id, overhead_press_id, 2),
    (push_workout_id, tricep_pushdown_id, 3);

    -- Link exercises to Pull Day workout
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES
    (pull_workout_id, deadlift_id, 1),
    (pull_workout_id, lat_pulldown_id, 2),
    (pull_workout_id, bicep_curl_id, 3);

    -- Link exercises to Leg Day workout
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES
    (leg_workout_id, squat_id, 1),
    (leg_workout_id, lunge_id, 2),
    (leg_workout_id, calf_raise_id, 3);
END $$;