import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Exercise } from '@/types/database';
import { Save, X } from 'lucide-react-native';

interface Props {
  exercise: Exercise;
  onLog: (data: {
    sets: number;
    reps: number;
    weight_kg: number;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export function LogExerciseForm({ exercise, onLog, onCancel }: Props) {
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('0');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const setsNum = parseInt(sets);
    const repsNum = parseInt(reps);
    const weightNum = parseFloat(weight);

    if (isNaN(setsNum) || setsNum < 1) {
      Alert.alert('Invalid Input', 'Sets must be a positive number');
      return;
    }

    if (isNaN(repsNum) || repsNum < 1) {
      Alert.alert('Invalid Input', 'Reps must be a positive number');
      return;
    }

    if (isNaN(weightNum) || weightNum < 0) {
      Alert.alert('Invalid Input', 'Weight must be a non-negative number');
      return;
    }

    onLog({
      sets: setsNum,
      reps: repsNum,
      weight_kg: weightNum,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.muscleGroup}>{exercise.target_muscle_group}</Text>
        </View>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sets</Text>
            <TextInput
              style={styles.input}
              value={sets}
              onChangeText={setSets}
              keyboardType="numeric"
              placeholder="3"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Reps</Text>
            <TextInput
              style={styles.input}
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              placeholder="10"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about this set..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.logButton} onPress={handleSubmit}>
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.logButtonText}>Log Exercise</Text>
        </TouchableOpacity>
      </View>

      {exercise.instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>{exercise.instructions}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  muscleGroup: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 4,
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 14,
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
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});