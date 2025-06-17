import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Workout, Exercise } from '@/types/database';
import { Plus, Calendar, Users, User, Play } from 'lucide-react-native';

interface WorkoutWithExercises extends Workout {
  exercises: Exercise[];
}

export default function WorkoutsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, [user]);

  const loadWorkouts = async () => {
    if (!user?.email) return;

    try {
      const { data: workoutsData, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises!inner(
            order_index,
            exercise:exercises(*)
          )
        `)
        .or(`creator_email.is.null,creator_email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include exercises
      const transformedWorkouts: WorkoutWithExercises[] = workoutsData?.map(workout => ({
        ...workout,
        exercises: workout.workout_exercises
          ?.sort((a: any, b: any) => a.order_index - b.order_index)
          .map((we: any) => we.exercise) || []
      })) || [];

      setWorkouts(transformedWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
      Alert.alert('Error', 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkout = () => {
    router.push('/create-workout');
  };

  const handleStartWorkout = (workout: WorkoutWithExercises) => {
    router.push({
      pathname: '/start-workout',
      params: { workoutId: workout.id }
    });
  };

  const renderWorkoutCard = (workout: WorkoutWithExercises) => {
    const isDefault = !workout.creator_email;
    
    return (
      <View key={workout.id} style={styles.workoutCard}>
        <View style={styles.workoutContent}>
          <View style={styles.workoutHeader}>
            <View style={styles.workoutTitleContainer}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <View style={styles.workoutBadge}>
                {isDefault ? (
                  <Users size={12} color="#10B981" />
                ) : (
                  <User size={12} color="#3B82F6" />
                )}
                <Text style={[
                  styles.workoutBadgeText,
                  { color: isDefault ? '#10B981' : '#3B82F6' }
                ]}>
                  {isDefault ? 'Default' : 'Custom'}
                </Text>
              </View>
            </View>
            <Text style={styles.exerciseCount}>
              {workout.exercises?.length || 0} exercises
            </Text>
          </View>

          {workout.notes && (
            <Text style={styles.workoutNotes}>{workout.notes}</Text>
          )}

          <View style={styles.exercisesList}>
            {workout.exercises?.slice(0, 3).map((exercise, index) => (
              <Text key={exercise.id} style={styles.exerciseItem}>
                • {exercise.name}
              </Text>
            ))}
            {(workout.exercises?.length || 0) > 3 && (
              <Text style={styles.moreExercises}>
                +{(workout.exercises?.length || 0) - 3} more exercises
              </Text>
            )}
          </View>
        </View>

        <View style={styles.workoutActions}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStartWorkout(workout)}
          >
            <Play size={16} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading workouts...</Text>
      </View>
    );
  }

  const defaultWorkouts = workouts.filter(w => !w.creator_email);
  const customWorkouts = workouts.filter(w => w.creator_email);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateWorkout}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Workouts</Text>
          <Text style={styles.sectionSubtitle}>
            Pre-made workouts to get you started
          </Text>
          {defaultWorkouts.map(renderWorkoutCard)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Custom Workouts</Text>
          <Text style={styles.sectionSubtitle}>
            Workouts you've created
          </Text>
          {customWorkouts.length > 0 ? (
            customWorkouts.map(renderWorkoutCard)
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No custom workouts yet</Text>
              <Text style={styles.emptyStateText}>
                Create your first custom workout to see it here
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleCreateWorkout}
              >
                <Text style={styles.emptyStateButtonText}>Create Workout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  createButtonText: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutContent: {
    padding: 20,
  },
  workoutHeader: {
    marginBottom: 12,
  },
  workoutTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  workoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  workoutBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  workoutNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  exercisesList: {
    gap: 4,
  },
  exerciseItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  moreExercises: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 1,
    overflow: 'hidden',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    gap: 6,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});