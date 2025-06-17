/*
  # Comprehensive Exercise Library Update

  1. Clear existing exercises and add comprehensive library
  2. Update default workouts with better exercise selection
  3. Ensure proper muscle group categorization
*/

-- Clear existing exercises and workout_exercises
DELETE FROM workout_exercises;
DELETE FROM exercises;

-- Insert comprehensive exercise library
INSERT INTO exercises (name, target_muscle_group, equipment_used, exercise_type, level, instructions) VALUES

-- Chest exercises
('Barbell Bench Press', 'Chest', 'Barbell', 'Compound', 'Intermediate', 'Lie on bench, grip bar wider than shoulders, lower to chest, press up'),
('Dumbbell Bench Press', 'Chest', 'Dumbbell', 'Compound', 'Beginner', 'Lie on bench, press dumbbells from chest level'),
('Incline Barbell Bench Press', 'Chest', 'Barbell', 'Compound', 'Intermediate', 'Set bench to 30-45 degrees, press barbell from chest'),
('Incline Dumbbell Press', 'Chest', 'Dumbbell', 'Compound', 'Intermediate', 'Set bench to 30-45 degrees, press dumbbells from chest level'),
('Decline Barbell Bench Press', 'Chest', 'Barbell', 'Compound', 'Advanced', 'Set bench to decline, press barbell from chest'),
('Decline Dumbbell Press', 'Chest', 'Dumbbell', 'Compound', 'Advanced', 'Set bench to decline, press dumbbells from chest'),
('Push-Up', 'Chest', 'Bodyweight', 'Compound', 'Beginner', 'Start in plank position, lower chest to ground, push back up'),
('Incline Push-Up', 'Chest', 'Bodyweight', 'Compound', 'Beginner', 'Hands on elevated surface, perform push-up'),
('Decline Push-Up', 'Chest', 'Bodyweight', 'Compound', 'Intermediate', 'Feet elevated, hands on ground, perform push-up'),
('Chest Fly', 'Chest', 'Dumbbell', 'Isolation', 'Beginner', 'Lie on bench, arc dumbbells from above chest to sides'),
('Cable Crossover', 'Chest', 'Machine', 'Isolation', 'Intermediate', 'Stand between cables, bring handles together in front of chest'),
('Pec Deck Machine', 'Chest', 'Machine', 'Isolation', 'Beginner', 'Sit at machine, bring arms together in front of chest'),
('Dips', 'Chest', 'Bodyweight', 'Compound', 'Intermediate', 'Support body on parallel bars, lower until shoulders below elbows'),
('Svend Press', 'Chest', 'Dumbbell', 'Isolation', 'Beginner', 'Hold plates together, press away from chest'),
('Landmine Press', 'Chest', 'Barbell', 'Compound', 'Intermediate', 'Press barbell from chest in landmine setup'),

-- Back exercises
('Pull-Up', 'Back', 'Bodyweight', 'Compound', 'Intermediate', 'Hang from bar, pull body up until chin over bar'),
('Chin-Up', 'Back', 'Bodyweight', 'Compound', 'Intermediate', 'Hang from bar with underhand grip, pull up'),
('Lat Pulldown', 'Back', 'Machine', 'Compound', 'Beginner', 'Sit at machine, pull bar down to upper chest'),
('Bent-Over Barbell Row', 'Back', 'Barbell', 'Compound', 'Intermediate', 'Bend at hips, row bar to lower chest'),
('Dumbbell Row', 'Back', 'Dumbbell', 'Compound', 'Beginner', 'Support on bench, row dumbbell to hip'),
('T-Bar Row', 'Back', 'Barbell', 'Compound', 'Intermediate', 'Straddle bar, row to chest'),
('Seated Cable Row', 'Back', 'Machine', 'Compound', 'Beginner', 'Sit at cable machine, pull handle to abdomen'),
('Inverted Row', 'Back', 'Bodyweight', 'Compound', 'Beginner', 'Hang under bar, pull chest to bar'),
('Deadlift', 'Back', 'Barbell', 'Compound', 'Advanced', 'Stand with bar over feet, grip bar, lift by extending hips and knees'),
('Rack Pull', 'Back', 'Barbell', 'Compound', 'Intermediate', 'Deadlift from elevated position'),
('Face Pull', 'Back', 'Machine', 'Isolation', 'Beginner', 'Pull cable to face level'),
('Shrugs', 'Back', 'Barbell', 'Isolation', 'Beginner', 'Lift shoulders straight up'),
('Good Morning', 'Back', 'Barbell', 'Compound', 'Intermediate', 'Bend forward at hips with bar on shoulders'),
('Superman Exercise', 'Back', 'Bodyweight', 'Isolation', 'Beginner', 'Lie face down, lift chest and legs'),

-- Shoulder exercises
('Overhead Press', 'Shoulders', 'Barbell', 'Compound', 'Intermediate', 'Press bar from shoulders straight overhead'),
('Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell', 'Compound', 'Beginner', 'Press dumbbells overhead from shoulder level'),
('Arnold Press', 'Shoulders', 'Dumbbell', 'Compound', 'Intermediate', 'Rotate dumbbells while pressing overhead'),
('Lateral Raise', 'Shoulders', 'Dumbbell', 'Isolation', 'Beginner', 'Raise dumbbells to sides until parallel to ground'),
('Front Raise', 'Shoulders', 'Dumbbell', 'Isolation', 'Beginner', 'Raise dumbbells in front to shoulder height'),
('Rear Delt Fly', 'Shoulders', 'Dumbbell', 'Isolation', 'Beginner', 'Bend forward, raise dumbbells to sides'),
('Upright Row', 'Shoulders', 'Barbell', 'Compound', 'Intermediate', 'Pull bar up along body to chest level'),
('Push Press', 'Shoulders', 'Barbell', 'Compound', 'Advanced', 'Use leg drive to assist overhead press'),
('Handstand Push-Up', 'Shoulders', 'Bodyweight', 'Compound', 'Advanced', 'Inverted push-up against wall'),
('Cable Lateral Raise', 'Shoulders', 'Machine', 'Isolation', 'Beginner', 'Raise cable handle to side'),

-- Biceps exercises
('Barbell Curl', 'Biceps', 'Barbell', 'Isolation', 'Beginner', 'Curl barbell toward shoulders, lower slowly'),
('Dumbbell Curl', 'Biceps', 'Dumbbell', 'Isolation', 'Beginner', 'Curl dumbbells toward shoulders, lower slowly'),
('Hammer Curl', 'Biceps', 'Dumbbell', 'Isolation', 'Beginner', 'Curl dumbbells with neutral grip'),
('Preacher Curl', 'Biceps', 'Barbell', 'Isolation', 'Intermediate', 'Curl with arms supported on preacher bench'),
('Concentration Curl', 'Biceps', 'Dumbbell', 'Isolation', 'Beginner', 'Seated, curl one arm at a time'),
('Incline Dumbbell Curl', 'Biceps', 'Dumbbell', 'Isolation', 'Intermediate', 'Curl on incline bench'),
('Cable Curl', 'Biceps', 'Machine', 'Isolation', 'Beginner', 'Curl cable handle toward shoulders'),
('EZ-Bar Curl', 'Biceps', 'Barbell', 'Isolation', 'Beginner', 'Curl EZ-bar toward shoulders'),

-- Triceps exercises
('Close-Grip Bench Press', 'Triceps', 'Barbell', 'Compound', 'Intermediate', 'Bench press with narrow grip'),
('Triceps Dips', 'Triceps', 'Bodyweight', 'Compound', 'Intermediate', 'Dip between parallel bars or bench'),
('Triceps Pushdown', 'Triceps', 'Machine', 'Isolation', 'Beginner', 'Push cable handle down, extend arms fully'),
('Overhead Triceps Extension', 'Triceps', 'Dumbbell', 'Isolation', 'Beginner', 'Extend dumbbell overhead'),
('Skull Crusher', 'Triceps', 'Barbell', 'Isolation', 'Intermediate', 'Lower bar to forehead, extend back up'),
('Triceps Kickbacks', 'Triceps', 'Dumbbell', 'Isolation', 'Beginner', 'Bend over, extend arm behind body'),
('Diamond Push-Up', 'Triceps', 'Bodyweight', 'Compound', 'Intermediate', 'Push-up with hands in diamond shape'),

-- Forearm exercises
('Wrist Curl', 'Forearms', 'Dumbbell', 'Isolation', 'Beginner', 'Curl wrists upward'),
('Reverse Wrist Curl', 'Forearms', 'Dumbbell', 'Isolation', 'Beginner', 'Curl wrists backward'),
('Wrist Roller', 'Forearms', 'Bodyweight', 'Isolation', 'Intermediate', 'Roll weight up and down with wrists'),
('Farmers Carry', 'Forearms', 'Dumbbell', 'Compound', 'Beginner', 'Walk while carrying heavy weights'),
('Reverse Curl', 'Forearms', 'Barbell', 'Isolation', 'Beginner', 'Curl with overhand grip'),

-- Quadriceps exercises
('Back Squat', 'Quads', 'Barbell', 'Compound', 'Intermediate', 'Bar on shoulders, lower until thighs parallel to ground'),
('Front Squat', 'Quads', 'Barbell', 'Compound', 'Advanced', 'Bar in front, squat down keeping chest up'),
('Leg Press', 'Quads', 'Machine', 'Compound', 'Beginner', 'Sit in machine, press weight with feet'),
('Lunges', 'Quads', 'Bodyweight', 'Compound', 'Beginner', 'Step forward, lower back knee toward ground'),
('Step-Ups', 'Quads', 'Bodyweight', 'Compound', 'Beginner', 'Step up onto elevated surface'),
('Leg Extension', 'Quads', 'Machine', 'Isolation', 'Beginner', 'Extend legs from seated position'),
('Bulgarian Split Squat', 'Quads', 'Bodyweight', 'Compound', 'Intermediate', 'Single leg squat with rear foot elevated'),
('Hack Squat', 'Quads', 'Machine', 'Compound', 'Intermediate', 'Squat on hack squat machine'),

-- Hamstring exercises
('Romanian Deadlift', 'Hamstrings', 'Barbell', 'Compound', 'Intermediate', 'Hinge at hips, lower bar to mid-shin'),
('Leg Curl', 'Hamstrings', 'Machine', 'Isolation', 'Beginner', 'Curl legs toward glutes'),
('Glute-Ham Raise', 'Hamstrings', 'Bodyweight', 'Compound', 'Advanced', 'Raise body using hamstrings'),
('Stiff Leg Deadlift', 'Hamstrings', 'Dumbbell', 'Compound', 'Beginner', 'Keep legs straight, hinge at hips'),
('Kettlebell Swing', 'Hamstrings', 'Kettlebells', 'Compound', 'Intermediate', 'Swing kettlebell to shoulder height'),

-- Glute exercises
('Hip Thrust', 'Glutes', 'Barbell', 'Compound', 'Intermediate', 'Thrust hips up with bar across hips'),
('Glute Bridge', 'Glutes', 'Bodyweight', 'Isolation', 'Beginner', 'Lift hips off ground'),
('Sumo Deadlift', 'Glutes', 'Barbell', 'Compound', 'Intermediate', 'Wide stance deadlift'),
('Cable Kickback', 'Glutes', 'Machine', 'Isolation', 'Beginner', 'Kick leg back against cable resistance'),
('Clamshells', 'Glutes', 'Bodyweight', 'Isolation', 'Beginner', 'Open and close legs like clamshell'),

-- Calf exercises
('Standing Calf Raise', 'Calves', 'Bodyweight', 'Isolation', 'Beginner', 'Rise up on toes, lower slowly'),
('Seated Calf Raise', 'Calves', 'Machine', 'Isolation', 'Beginner', 'Raise calves from seated position'),
('Donkey Calf Raise', 'Calves', 'Bodyweight', 'Isolation', 'Intermediate', 'Bend over, raise calves'),
('Jump Rope', 'Calves', 'Bodyweight', 'Compound', 'Beginner', 'Jump rope staying on balls of feet'),

-- Core exercises
('Plank', 'Core', 'Bodyweight', 'Isolation', 'Beginner', 'Hold body in straight line from head to heels'),
('Crunch', 'Core', 'Bodyweight', 'Isolation', 'Beginner', 'Lie on back, curl shoulders toward knees'),
('Sit-Up', 'Core', 'Bodyweight', 'Isolation', 'Beginner', 'Sit up from lying position'),
('Leg Raise', 'Core', 'Bodyweight', 'Isolation', 'Intermediate', 'Raise legs while lying on back'),
('Russian Twist', 'Core', 'Bodyweight', 'Isolation', 'Beginner', 'Sit with knees bent, rotate torso side to side'),
('Bicycle Crunch', 'Core', 'Bodyweight', 'Isolation', 'Beginner', 'Alternate elbow to opposite knee'),
('Hanging Leg Raise', 'Core', 'Bodyweight', 'Isolation', 'Advanced', 'Hang from bar, raise legs'),
('Cable Woodchopper', 'Core', 'Machine', 'Compound', 'Intermediate', 'Rotate torso pulling cable across body'),
('Ab Wheel Rollout', 'Core', 'Bodyweight', 'Compound', 'Advanced', 'Roll ab wheel forward and back'),
('Mountain Climber', 'Core', 'Bodyweight', 'Compound', 'Intermediate', 'In plank position, alternate bringing knees to chest'),

-- Full Body / Compound exercises
('Burpee', 'Full Body', 'Bodyweight', 'Compound', 'Intermediate', 'Squat, jump back to plank, push-up, jump forward, jump up'),
('Clean and Press', 'Full Body', 'Barbell', 'Compound', 'Advanced', 'Clean bar to shoulders, press overhead'),
('Snatch', 'Full Body', 'Barbell', 'Compound', 'Advanced', 'Lift bar from ground to overhead in one motion'),
('Thruster', 'Full Body', 'Dumbbell', 'Compound', 'Intermediate', 'Squat and press in one motion'),
('Turkish Get-Up', 'Full Body', 'Kettlebells', 'Compound', 'Advanced', 'Complex movement from lying to standing');

-- Update default workouts with better exercise selection
DO $$
DECLARE
    push_workout_id uuid;
    pull_workout_id uuid;
    leg_workout_id uuid;
    
    -- Exercise IDs
    bench_press_id uuid;
    incline_db_press_id uuid;
    dips_id uuid;
    overhead_press_id uuid;
    lateral_raise_id uuid;
    tricep_pushdown_id uuid;
    
    deadlift_id uuid;
    lat_pulldown_id uuid;
    bent_row_id uuid;
    face_pull_id uuid;
    barbell_curl_id uuid;
    hammer_curl_id uuid;
    
    back_squat_id uuid;
    romanian_dl_id uuid;
    leg_press_id uuid;
    leg_curl_id uuid;
    calf_raise_id uuid;
    lunges_id uuid;
BEGIN
    -- Get workout IDs
    SELECT id INTO push_workout_id FROM workouts WHERE name = 'Push Day' AND creator_email IS NULL;
    SELECT id INTO pull_workout_id FROM workouts WHERE name = 'Pull Day' AND creator_email IS NULL;
    SELECT id INTO leg_workout_id FROM workouts WHERE name = 'Leg Day' AND creator_email IS NULL;

    -- Get exercise IDs for Push Day
    SELECT id INTO bench_press_id FROM exercises WHERE name = 'Barbell Bench Press';
    SELECT id INTO incline_db_press_id FROM exercises WHERE name = 'Incline Dumbbell Press';
    SELECT id INTO dips_id FROM exercises WHERE name = 'Triceps Dips';
    SELECT id INTO overhead_press_id FROM exercises WHERE name = 'Overhead Press';
    SELECT id INTO lateral_raise_id FROM exercises WHERE name = 'Lateral Raise';
    SELECT id INTO tricep_pushdown_id FROM exercises WHERE name = 'Triceps Pushdown';

    -- Get exercise IDs for Pull Day
    SELECT id INTO deadlift_id FROM exercises WHERE name = 'Deadlift';
    SELECT id INTO lat_pulldown_id FROM exercises WHERE name = 'Lat Pulldown';
    SELECT id INTO bent_row_id FROM exercises WHERE name = 'Bent-Over Barbell Row';
    SELECT id INTO face_pull_id FROM exercises WHERE name = 'Face Pull';
    SELECT id INTO barbell_curl_id FROM exercises WHERE name = 'Barbell Curl';
    SELECT id INTO hammer_curl_id FROM exercises WHERE name = 'Hammer Curl';

    -- Get exercise IDs for Leg Day
    SELECT id INTO back_squat_id FROM exercises WHERE name = 'Back Squat';
    SELECT id INTO romanian_dl_id FROM exercises WHERE name = 'Romanian Deadlift';
    SELECT id INTO leg_press_id FROM exercises WHERE name = 'Leg Press';
    SELECT id INTO leg_curl_id FROM exercises WHERE name = 'Leg Curl';
    SELECT id INTO calf_raise_id FROM exercises WHERE name = 'Standing Calf Raise';
    SELECT id INTO lunges_id FROM exercises WHERE name = 'Lunges';

    -- Link exercises to Push Day workout
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES
    (push_workout_id, bench_press_id, 1),
    (push_workout_id, incline_db_press_id, 2),
    (push_workout_id, dips_id, 3),
    (push_workout_id, overhead_press_id, 4),
    (push_workout_id, lateral_raise_id, 5),
    (push_workout_id, tricep_pushdown_id, 6);

    -- Link exercises to Pull Day workout
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES
    (pull_workout_id, deadlift_id, 1),
    (pull_workout_id, lat_pulldown_id, 2),
    (pull_workout_id, bent_row_id, 3),
    (pull_workout_id, face_pull_id, 4),
    (pull_workout_id, barbell_curl_id, 5),
    (pull_workout_id, hammer_curl_id, 6);

    -- Link exercises to Leg Day workout
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES
    (leg_workout_id, back_squat_id, 1),
    (leg_workout_id, romanian_dl_id, 2),
    (leg_workout_id, leg_press_id, 3),
    (leg_workout_id, leg_curl_id, 4),
    (leg_workout_id, lunges_id, 5),
    (leg_workout_id, calf_raise_id, 6);
END $$;