import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types/database';
import { ExerciseSelector } from '@/components/workout/ExerciseSelector';
import { LogExerciseForm } from '@/components/workout/LogExerciseForm';
import { RestTimer } from '@/components/workout/RestTimer';
import { SaveWorkoutModal } from '@/components/workout/SaveWorkoutModal';
import { Dumbbell, CircleCheck as CheckCircle, Timer, Save } from 'lucide-react-native';
import { WorkoutLogger, ExerciseWithSets, WorkoutSet } from '@/components/workout/WorkoutLogger';

interface WorkoutSession {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: number;
  notes?: string;
}

export default function LogWorkoutScreen() {
  const { user } = useAuth();
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggerKey, setLoggerKey] = useState(0);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      if (error) throw error;
      setAllExercises(data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert('Error', 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (exercises: ExerciseWithSets[]) => {
    if (!user?.email) return;
    // Save each set as a separate workout log entry
    const workoutLogs = [];
    for (const exercise of exercises) {
      for (const set of exercise.sets) {
        const weight = parseFloat(set.weight) || 0;
        const reps = parseInt(set.reps) || 0;
        if (reps > 0) {
          workoutLogs.push({
            user_email: user.email,
            exercise_id: exercise.id,
            sets: 1,
            reps: reps,
            weight_kg: weight,
            logged_at: new Date().toISOString(),
          });
        }
      }
    }
    if (workoutLogs.length === 0) {
      Alert.alert('No Data', 'Please add some reps to save your workout');
      return;
    }
    try {
      const { error } = await supabase.from('workout_logs').insert(workoutLogs);
      if (error) throw error;
      Alert.alert('Workout Logged!', `Successfully logged ${workoutLogs.length} sets across ${exercises.length} exercises.`);
      setLoggerKey(prev => prev + 1);
    } catch (error) {
      console.error('Error logging workout:', error);
      Alert.alert('Error', 'Failed to log workout');
    }
  };

  return (
    <WorkoutLogger
      key={loggerKey}
      initialExercises={[]}
      allExercises={allExercises}
      onSave={handleSave}
      loading={loading}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sessionSection: {
    padding: 24,
    paddingBottom: 0,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  saveTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  saveTemplateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  sessionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sessionExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sessionDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  sessionNotes: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
});