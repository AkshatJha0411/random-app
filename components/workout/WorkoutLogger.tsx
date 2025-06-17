import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { Exercise } from '@/types/database';
import { Plus, Minus, Search, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
}

export interface ExerciseWithSets extends Exercise {
  sets: WorkoutSet[];
  order_index: number;
}

interface WorkoutLoggerProps {
  initialExercises?: ExerciseWithSets[];
  allExercises: Exercise[];
  onSave: (exercises: ExerciseWithSets[]) => Promise<void>;
  loading?: boolean;
}

const LOG_WORKOUT_SESSION_KEY = 'log_workout_session';

export function WorkoutLogger({ initialExercises = [], allExercises, onSave, loading }: WorkoutLoggerProps) {
  const [exercises, setExercises] = useState<ExerciseWithSets[]>(initialExercises);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(allExercises);
  const [saving, setSaving] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');

  // Compute unique muscle groups in alphabetical order
  const muscleGroups = useMemo(() => {
    const groups = Array.from(new Set(allExercises.map(e => e.target_muscle_group)));
    return ['All', ...groups.sort((a, b) => a.localeCompare(b))];
  }, [allExercises]);

  // Load session from storage on mount
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(LOG_WORKOUT_SESSION_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setExercises(parsed);
        } catch {}
      }
    })();
  }, []);

  // Save session to storage whenever exercises change
  useEffect(() => {
    AsyncStorage.setItem(LOG_WORKOUT_SESSION_KEY, JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    let filtered = allExercises;
    if (selectedMuscle !== 'All') {
      filtered = filtered.filter(e => e.target_muscle_group === selectedMuscle);
    }
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.target_muscle_group.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredExercises(filtered);
  }, [searchQuery, allExercises, selectedMuscle]);

  const addSet = (exerciseIndex: number) => {
    setExercises(prev => prev.map((exercise, index) => {
      if (index === exerciseIndex) {
        const newSetId = (exercise.sets.length + 1).toString();
        return {
          ...exercise,
          sets: [...exercise.sets, { id: newSetId, weight: '', reps: '10' }]
        };
      }
      return exercise;
    }));
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
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
    const newExercise: ExerciseWithSets = {
      ...exercise,
      order_index: exercises.length + 1,
      sets: [{ id: '1', weight: '', reps: '10' }]
    };
    setExercises(prev => [...prev, newExercise]);
    setShowAddExercise(false);
    setSearchQuery('');
  };

  const removeExercise = (exerciseIndex: number) => {
    setExercises(prev => prev.filter((_, index) => index !== exerciseIndex));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(exercises);
    setSaving(false);
    await AsyncStorage.removeItem(LOG_WORKOUT_SESSION_KEY);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
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
              setShowAddExercise(false);
              setSearchQuery('');
              setSelectedMuscle('All');
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
              onChangeText={setSearchQuery}
            />
          </View>
          {/* Muscle group filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleFilterScroll} contentContainerStyle={styles.muscleFilterContainer}>
            {muscleGroups.map(group => (
              <TouchableOpacity
                key={group}
                style={[styles.muscleFilterButton, selectedMuscle === group && styles.muscleFilterButtonActive]}
                onPress={() => setSelectedMuscle(group)}
              >
                <Text style={[styles.muscleFilterText, selectedMuscle === group && styles.muscleFilterTextActive]}>{group}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.exerciseGrid}>
            {filteredExercises.map((exercise) => (
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
                  <Text style={styles.exerciseType}>{exercise.exercise_type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {filteredExercises.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No exercises found</Text>
              <Text style={styles.noResultsSubtext}>Try adjusting your search</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topSpacer} />
        {exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id + '-' + exerciseIndex} style={styles.exerciseCard}>
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
              </View>
              {exercise.sets.map((set, setIndex) => (
                <View key={set.id + '-' + setIndex} style={styles.setRow}>
                  <Text style={styles.setNumber}>{setIndex + 1}</Text>
                  <TextInput
                    style={styles.setInput}
                    keyboardType="numeric"
                    value={set.weight}
                    onChangeText={value => updateSet(exerciseIndex, setIndex, 'weight', value)}
                    placeholder=""
                  />
                  <TextInput
                    style={[styles.setInput, styles.setInputReps]}
                    keyboardType="numeric"
                    value={set.reps}
                    onChangeText={value => updateSet(exerciseIndex, setIndex, 'reps', value)}
                    placeholder="10"
                  />
                  {exercise.sets.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeSetButton}
                      onPress={() => removeSet(exerciseIndex, setIndex)}
                    >
                      <Minus size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => addSet(exerciseIndex)}
              >
                <Text style={styles.addSetText}>+ Add Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowAddExercise(true)}
        >
          <Plus size={20} color="#3B82F6" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Workout'}</Text>
      </TouchableOpacity>
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
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
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
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    // Add appropriate styles for setsContainer
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
    flex: 0.7,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  setLabel: {
    flex: 1.5,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  setInput: {
    flex: 1.5,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  setInputReps: {
    marginLeft: 8,
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
  exerciseGrid: {
    gap: 12,
  },
  exerciseOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  topSpacer: {
    height: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    gap: 8,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  muscleFilterScroll: {
    padding: 12,
  },
  muscleFilterContainer: {
    gap: 8,
  },
  muscleFilterButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 8,
  },
  muscleFilterButtonActive: {
    borderColor: '#3B82F6',
  },
  muscleFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  muscleFilterTextActive: {
    fontWeight: '700',
    color: '#3B82F6',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 16,
  },
  addExerciseText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '700',
  },
}); 