import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types/database';
import { ExerciseSelector } from '@/components/workout/ExerciseSelector';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react-native';

interface SelectedExercise extends Exercise {
  order_index: number;
}

export default function CreateWorkoutScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutLevel, setWorkoutLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      setExercises(data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert('Error', 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const isAlreadySelected = selectedExercises.some(ex => ex.id === exercise.id);
    
    if (isAlreadySelected) {
      Alert.alert('Exercise Already Added', 'This exercise is already in your workout');
      return;
    }

    const newExercise: SelectedExercise = {
      ...exercise,
      order_index: selectedExercises.length + 1,
    };

    setSelectedExercises(prev => [...prev, newExercise]);
    setShowExerciseSelector(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev
        .filter(ex => ex.id !== exerciseId)
        .map((ex, index) => ({ ...ex, order_index: index + 1 }))
    );
  };

  const handleMoveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    setSelectedExercises(prev => {
      const currentIndex = prev.findIndex(ex => ex.id === exerciseId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newArray = [...prev];
      [newArray[currentIndex], newArray[newIndex]] = [newArray[newIndex], newArray[currentIndex]];
      
      return newArray.map((ex, index) => ({ ...ex, order_index: index + 1 }));
    });
  };

  const handleSaveWorkout = async () => {
    if (!user?.email) return;

    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    setSaving(true);
    try {
      // Create the workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          name: workoutName.trim(),
          creator_email: user.email,
          level: workoutLevel,
          notes: workoutNotes.trim() || null,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Link exercises to the workout
      const workoutExercises = selectedExercises.map(exercise => ({
        workout_id: workoutData.id,
        exercise_id: exercise.id,
        order_index: exercise.order_index,
      }));

      const { error: linkError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);

      if (linkError) throw linkError;

      Alert.alert(
        'Success!',
        `"${workoutName}" has been created successfully.`,
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
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading exercises...</Text>
      </View>
    );
  }

  if (showExerciseSelector) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowExerciseSelector(false)}
          >
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Exercise</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <ExerciseSelector
            exercises={exercises}
            onSelect={handleAddExercise}
          />
        </View>
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
        <Text style={styles.title}>Create Workout</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveWorkout}
          disabled={saving}
        >
          <Save size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Details</Text>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Workout Name *</Text>
              <TextInput
                style={styles.input}
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="Enter workout name"
                maxLength={50}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Level</Text>
              <View style={styles.levelContainer}>
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      workoutLevel === level && styles.levelButtonActive
                    ]}
                    onPress={() => setWorkoutLevel(level)}
                  >
                    <Text style={[
                      styles.levelText,
                      workoutLevel === level && styles.levelTextActive
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={workoutNotes}
                onChangeText={setWorkoutNotes}
                placeholder="Add any notes about this workout..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={200}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.exercisesHeader}>
            <Text style={styles.sectionTitle}>
              Exercises ({selectedExercises.length})
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowExerciseSelector(true)}
            >
              <Plus size={20} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length > 0 ? (
            <View style={styles.exercisesList}>
              {selectedExercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.target_muscle_group} • {exercise.equipment_used}
                    </Text>
                  </View>
                  
                  <View style={styles.exerciseActions}>
                    <View style={styles.orderButtons}>
                      <TouchableOpacity
                        style={[
                          styles.orderButton,
                          index === 0 && styles.orderButtonDisabled
                        ]}
                        onPress={() => handleMoveExercise(exercise.id, 'up')}
                        disabled={index === 0}
                      >
                        <Text style={styles.orderButtonText}>↑</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.orderButton,
                          index === selectedExercises.length - 1 && styles.orderButtonDisabled
                        ]}
                        onPress={() => handleMoveExercise(exercise.id, 'down')}
                        disabled={index === selectedExercises.length - 1}
                      >
                        <Text style={styles.orderButtonText}>↓</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveExercise(exercise.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Plus size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No exercises added</Text>
              <Text style={styles.emptyStateText}>
                Add exercises to create your custom workout
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setShowExerciseSelector(true)}
              >
                <Text style={styles.emptyStateButtonText}>Add First Exercise</Text>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 20,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  notesInput: {
    minHeight: 80,
  },
  levelContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  levelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  levelButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  levelTextActive: {
    color: '#3B82F6',
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderButtons: {
    gap: 4,
  },
  orderButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderButtonDisabled: {
    opacity: 0.3,
  },
  orderButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
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