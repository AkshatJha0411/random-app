# Background and Motivation
The user wants the 'Start Workout' feature to load all exercises in the selected workout and allow input for sets, reps, and weight. Currently, clicking 'Start' results in an infinite loading state ('Loading workout...'). This prevents users from logging their workouts, which is a core feature of the app.

# Key Challenges and Analysis
- The infinite loading suggests a possible issue with data fetching, state management, or rendering logic after clicking 'Start'.
- The app should fetch all exercises for the selected workout and render input fields for sets, reps, and weight.
- There may be issues with the Supabase query, component state, or error handling.
- The UI/UX should be smooth, with clear feedback if data fails to load.

# High-level Task Breakdown
- [ ] 1. Investigate the code that runs when 'Start' is clicked (likely in app/start-workout.tsx or related component).
  - Success: Identify where the loading state is set and what triggers the data fetch.
- [ ] 2. Check the data fetching logic for exercises in the selected workout.
  - Success: Confirm that the correct Supabase query is made and returns expected data.
- [ ] 3. Ensure the UI renders all exercises and input fields for sets, reps, and weight after data loads.
  - Success: User sees a list of exercises with input fields after clicking 'Start'.
- [ ] 4. Add error handling and user feedback for failed data loads.
  - Success: User sees a helpful error message if loading fails.
- [ ] 5. Test the full flow and verify that users can input and save sets, reps, and weight for each exercise.
  - Success: Data entry works and persists as expected.

# Project Status Board
- [x] Investigate 'Start' button logic and loading state
- [x] Debug/fix data fetching for workout exercises
- [x] Render exercise list and input fields
- [ ] Add error handling and feedback
- [ ] Test and verify full flow
- [x] Comment out all `/workout-details` code and links.
- [x] Refactor workout card UI as specified.
- [ ] Test and verify UI/UX changes.

# Executor's Feedback or Assistance Requests
## Investigation Results (Task 1)
- The 'Start' button in the workout list navigates to `/start-workout` with the correct `workoutId` parameter.
- In `start-workout.tsx`, the `loadWorkout` function fetches the workout and its exercises from Supabase.
- The loading state (`loading`) is set to `false` only after the fetch completes (success or error).
- If the fetch fails or returns no exercises, the UI may get stuck on 'Loading workout...'.
- The exercises are expected to be in the `workout_exercises` table, joined with `exercises`.
- Next step: Check if the Supabase query is returning the expected data and debug why exercises may not be loading (Task 2).

## Investigation Results (Task 2)
- The `workout_exercises` table is a junction table with `workout_id`, `exercise_id`, and `order_index`.
- The query in `start-workout.tsx` fetches exercises via:
  ```js
  supabase.from('workout_exercises').select(`order_index, exercises (...)`).eq('workout_id', workoutId)
  ```
- This is correct if the foreign key from `workout_exercises.exercise_id` to `exercises.id` is set up and the join alias is `exercises`.
- However, in other parts of the codebase (e.g., workout-details), the join is written as:
  ```js
  workout_exercises!inner(order_index, exercise:exercises(*))
  ```
  and the field is accessed as `exercise`, not `exercises`.
- This mismatch may cause the exercises not to load in `start-workout.tsx`.
- **Next step:** Update the Supabase query in `start-workout.tsx` to use the correct join alias (`exercise:exercises(*)`) and field name (`exercise`), then test if exercises load as expected.

## Code Change (Task 3)
- Updated the Supabase query in `start-workout.tsx` to use the correct join alias (`exercise:exercises(*)`).
- Updated the mapping to use `we.exercise` instead of `we.exercises`.
- **Next step:** Test the full flow: Click 'Start' on a workout and verify that all exercises load and input fields for sets, reps, and weight are shown.

- `/workout-details` screen and all navigation to it have been commented out (not deleted) as requested.
- The workout card UI has been refactored: only the Start button is clickable, and it covers the entire bottom of the card with blue theme and symmetrical rounded corners. The Default/Custom tag and card body are non-clickable.
- Please manually test the UI to confirm the changes meet your requirements. Let me know if you need further adjustments or if I should proceed to mark the task as complete. 