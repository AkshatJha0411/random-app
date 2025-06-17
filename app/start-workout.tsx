import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Exercise, Workout } from '@/types/database';
import { ArrowLeft, Plus, Minus, Timer, Save, Search } from 'lucide-react-native';

interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
}

interface ExerciseWithSets extends Exercise {
  sets: WorkoutSet[];
  order_index: number;
}

export default function StartWorkoutScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const isMountedRef = useRef(true);
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithSets[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Early return if workoutId is not available
  if (!workoutId || typeof workoutId !== 'string') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Invalid workout ID</Text>
        <TouchableOpacity
          style={styles.backToWorkoutsButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backToWorkoutsText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    // Set mounted flag to true when component mounts
    isMountedRef.current = true;
    
    console.log('useEffect: workoutId is', workoutId, 'user is', user);
    if (workoutId && user?.email) {
      loadWorkout();
      loadAllExercises();
    }

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMountedRef.current = false;
    };
  }, [workoutId, user]);

  useEffect(() => {
    // Filter exercises based on search query
    if (searchQuery.trim() === '') {
      if (isMountedRef.current) {
        setFilteredExercises(allExercises);
      }
    } else {
      const filtered = allExercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.target_muscle_group.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (isMountedRef.current) {
        setFilteredExercises(filtered);
      }
    }
  }, [searchQuery, allExercises]);

  const loadWorkout = async () => {
    console.log('loadWorkout called');
    if (!workoutId) {
      console.log('Early return: no workoutId');
      return;
    }
    if (!user?.email) {
      console.log('Early return: no user email');
      return;
    }

    try {
      console.log('Loading workout with ID:', workoutId);
      if (isMountedRef.current) {
        setErrorMsg(null);
      }
      
      // First, get the workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      console.log('Workout fetch result:', { workoutData, workoutError });

      if (workoutError) {
        if (isMountedRef.current) {
          setErrorMsg('Workout fetch error: ' + workoutError.message);
        }
        throw workoutError;
      }

      if (isMountedRef.current) {
        setWorkout(workoutData);
      }

      // Then get the workout exercises with exercise details
      const { data: workoutExercisesData, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select(`
          order_index,
          exercise:exercises (
            id,
            name,
            target_muscle_group,
            equipment_used,
            exercise_type,
            level,
            instructions,
            media_url,
            created_at
          )
        `)
        .eq('workout_id', workoutId)
        .order('order_index');

      console.log('Workout exercises fetch result:', { workoutExercisesData, exercisesError });

      if (exercisesError) {
        if (isMountedRef.current) {
          setErrorMsg('Exercises fetch error: ' + exercisesError.message);
        }
        throw exercisesError;
      }

      if (!workoutExercisesData || workoutExercisesData.length === 0) {
        if (isMountedRef.current) {
          setErrorMsg('No exercises found for this workout.');
        }
      }

      // Transform the data to include sets
      const workoutExercises: ExerciseWithSets[] = workoutExercisesData?.map((we: any) => ({
        ...we.exercise,
        order_index: we.order_index,
        sets: [{ id: '1', weight: '0', reps: '0' }], // Default one set
      })) || [];

      if (isMountedRef.current) {
        setExercises(workoutExercises);
      }
    } catch (error: any) {
      console.error('Error loading workout:', error);
      if (isMountedRef.current) {
        setErrorMsg('Error loading workout: ' + (error?.message || error));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      console.log('setLoading(false) called');
    }
  };

  const loadAllExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      
      if (isMountedRef.current) {
        setAllExercises(data || []);
        setFilteredExercises(data || []);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const addSet = (exerciseIndex: number) => {
    if (!isMountedRef.current) return;
    
    setExercises(prev => prev.map((exercise, index) => {
      if (index === exerciseIndex) {
        const newSetId = (exercise.sets.length + 1).toString();
        return {
          ...exercise,
          sets: [...exercise.sets, { id: newSetId, weight: '0', reps: '0' }]
        };
      }
      return exercise;
    }));
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (!isMountedRef.current) return;
    
    setExercises(prev => prev.map((exercise, index) => {
      if (index === exerciseIndex && exercise.sets.length > 1) {
        return {
          ...exercise,
          sets: exercise.sets.filter((_, i) => i !== setIndex)
        };
      }
      return exercise;
    }));
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    if (!isMountedRef.current) return;
    
    setExercises(prev => prev.map((exercise, index) => {
      if (index === exerciseIndex) {
        return {
          ...exercise,
          sets: exercise.sets.map((set, i) => {
            if (i === setIndex) {
              return { ...set, [field]: value };
            }
            return set;
          })
        };
      }
      return exercise;
    }));
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    if (!isMountedRef.current) return;
    
    const newExercise: ExerciseWithSets = {
      ...exercise,
      order_index: exercises.length + 1,
      sets: [{ id: '1', weight: '0', reps: '0' }]
    };
    setExercises(prev => [...prev, newExercise]);
    setShowAddExercise(false);
    setSearchQuery('');
  };

  const removeExercise = (exerciseIndex: number) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (isMountedRef.current) {
              setExercises(prev => prev.filter((_, index) => index !== exerciseIndex));
            }
          }
        }
      ]
    );
  };

  const saveWorkout = async () => {
    if (!user?.email || !isMountedRef.current) return;

    setSaving(true);
    try {
      // Save each set as a separate workout log entry
      const workoutLogs = [];
      
      for (const exercise of exercises) {
        for (const set of exercise.sets) {
          const weight = parseFloat(set.weight) || 0;
          const reps = parseInt(set.reps) || 0;
          
          if (reps > 0) { // Only save sets with reps
            workoutLogs.push({
              user_email: user.email,
              workout_id: workoutId,
              exercise_id: exercise.id,
              sets: 1, // Each entry represents one set
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

      const { error } = await supabase
        .from('workout_logs')
        .insert(workoutLogs);

      if (error) throw error;

      Alert.alert(
        'Workout Saved!',
        `Successfully logged ${workoutLogs.length} sets across ${exercises.length} exercises.`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workout...</Text>
        {errorMsg && <Text style={{ color: 'red', marginTop: 16 }}>{errorMsg}</Text>}
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Workout not found</Text>
        <TouchableOpacity
          style={styles.backToWorkoutsButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backToWorkoutsText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showAddExercise) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (isMountedRef.current) {
                setShowAddExercise(false);
                setSearchQuery('');
              }
            }}
          >
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Exercise</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              value={searchQuery}
              onChangeText={(text) => {
                if (isMountedRef.current) {
                  setSearchQuery(text);
                }
              }}
            />
          </View>
        </View>

        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item: exercise }) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseOption}
              onPress={() => addExerciseToWorkout(exercise)}
            >
              <Text style={styles.exerciseOptionName}>{exercise.name}</Text>
              <Text style={styles.exerciseOptionDetails}>
                {exercise.target_muscle_group} • {exercise.equipment_used}
              </Text>
              <View style={styles.exerciseOptionMeta}>
                <View style={[styles.levelBadge, getLevelColor(exercise.level)]}>
                  <Text style={[styles.levelText, getLevelTextColor(exercise.level)]}>
                    {exercise.level}
                  </Text>
                </View>
                <Text style={styles.exerciseType}>{exercise.exercise_type}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No exercises found</Text>
              <Text style={styles.noResultsSubtext}>Try adjusting your search</Text>
            </View>
          )}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{workout.name}</Text>
          <Text style={styles.subtitle}>
            {workout.level} • {exercises.length} exercises
          </Text>
        </View>
        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => {/* Add timer functionality */}}
        >
          <Timer size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item: exercise, index: exerciseIndex }) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.target_muscle_group} • {exercise.exercise_type} • {exercise.equipment_used}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeExerciseButton}
                onPress={() => removeExercise(exerciseIndex)}
              >
                <Minus size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.setsContainer}>
              <View style={styles.setsHeader}>
                <Text style={styles.setNumber}>#</Text>
                <Text style={styles.setLabel}>Weight (kg)</Text>
                <Text style={styles.setLabel}>Reps</Text>
                <View style={styles.setActions} />
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setNumber}>{setIndex + 1}</Text>
                  <TextInput
                    style={styles.setInput}
                    value={set.weight}
                    onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'weight', value)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <TextInput
                    style={styles.setInput}
                    value={set.reps}
                    onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'reps', value)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <TouchableOpacity
                    style={[
                      styles.removeSetButton,
                      exercise.sets.length === 1 && styles.removeSetButtonDisabled
                    ]}
                    onPress={() => removeSet(exerciseIndex, setIndex)}
                    disabled={exercise.sets.length === 1}
                  >
                    <Minus size={16} color={exercise.sets.length === 1 ? "#D1D5DB" : "#EF4444"} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => addSet(exerciseIndex)}
              >
                <Plus size={16} color="#3B82F6" />
                <Text style={styles.addSetText}>Add Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No exercises in this workout</Text>
            <Text style={styles.emptyStateText}>Add some exercises to get started</Text>
            <TouchableOpacity
              style={styles.addFirstExerciseButton}
              onPress={() => {
                if (isMountedRef.current) {
                  setShowAddExercise(true);
                }
              }}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addFirstExerciseText}>Add First Exercise</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => {
              if (isMountedRef.current) {
                setShowAddExercise(true);
              }
            }}
          >
            <Plus size={20} color="#3B82F6" />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveWorkout}
          disabled={saving}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Workout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Beginner': return { backgroundColor: '#D1FAE5' };
    case 'Intermediate': return { backgroundColor: '#FEF3C7' };
    case 'Advanced': return { backgroundColor: '#FEE2E2' };
    default: return { backgroundColor: '#F3F4F6' };
  }
};

const getLevelTextColor = (level: string) => {
  switch (level) {
    case 'Beginner': return { color: '#065F46' };
    case 'Intermediate': return { color: '#92400E' };
    case 'Advanced': return { color: '#991B1B' };
    default: return { color: '#6B7280' };
  }
};

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
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  backToWorkoutsButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backToWorkoutsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  timerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  addFirstExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  addFirstExerciseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  removeExerciseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsContainer: {
    gap: 8,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  setNumber: {
    width: 30,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  setLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  setActions: {
    width: 32,
  },
  removeSetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSetButtonDisabled: {
    backgroundColor: '#F9FAFB',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 6,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  exerciseGrid: {
    gap: 12,
  },
  exerciseOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
  },
  exerciseOptionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  exerciseOptionDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  exerciseOptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseType: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});