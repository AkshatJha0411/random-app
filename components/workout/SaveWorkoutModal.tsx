import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Save, X } from 'lucide-react-native';

interface WorkoutSession {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: number;
  notes?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (workoutName: string, exercises: WorkoutSession[]) => Promise<void>;
  sessionData: WorkoutSession[];
  loading?: boolean;
}

export function SaveWorkoutModal({ 
  visible, 
  onClose, 
  onSave, 
  sessionData, 
  loading = false 
}: Props) {
  const [workoutName, setWorkoutName] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (sessionData.length === 0) {
      Alert.alert('Error', 'No exercises to save');
      return;
    }

    try {
      await onSave(workoutName.trim(), sessionData);
      setWorkoutName('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const handleClose = () => {
    setWorkoutName('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Save as Custom Workout</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Save this workout as a template for future use
          </Text>

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
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this workout..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={200}
              />
            </View>

            <View style={styles.exercisePreview}>
              <Text style={styles.previewTitle}>
                Exercises ({sessionData.length})
              </Text>
              <View style={styles.exerciseList}>
                {sessionData.slice(0, 3).map((exercise, index) => (
                  <Text key={index} style={styles.exerciseItem}>
                    • {exercise.exercise_name}
                  </Text>
                ))}
                {sessionData.length > 3 && (
                  <Text style={styles.moreExercises}>
                    +{sessionData.length - 3} more exercises
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={loading}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Workout'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  form: {
    gap: 20,
    marginBottom: 24,
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
  exercisePreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  exerciseList: {
    gap: 4,
  },
  exerciseItem: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  moreExercises: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});