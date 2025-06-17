import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { OnboardingData } from '@/types/database';

interface Props {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep2({ data, onUpdate, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<string[]>([]);

  const validate = () => {
    const newErrors: string[] = [];
    if (!data.height_cm || data.height_cm < 100 || data.height_cm > 250) {
      newErrors.push('Height must be between 100-250 cm');
    }
    if (!data.weight_kg || data.weight_kg < 30 || data.weight_kg > 300) {
      newErrors.push('Weight must be between 30-300 kg');
    }
    if (!data.training_experience) newErrors.push('Training experience is required');
    if (!data.fitness_goal) newErrors.push('Fitness goal is required');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];
  const goalOptions = ['Build Muscle', 'Lose Fat', 'Recomp', 'General Fitness'];

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Physical & Fitness Info</Text>
      <Text style={styles.stepSubtitle}>
        Help us understand your fitness level and goals
      </Text>

      <View style={styles.form}>
        <View style={styles.inputRow}>
          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>Height (cm) *</Text>
            <TextInput
              style={[styles.input, errors.some(e => e.includes('Height')) && styles.inputError]}
              value={data.height_cm?.toString() || ''}
              onChangeText={(text) => onUpdate({ height_cm: parseInt(text) || undefined })}
              placeholder="170"
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>Weight (kg) *</Text>
            <TextInput
              style={[styles.input, errors.some(e => e.includes('Weight')) && styles.inputError]}
              value={data.weight_kg?.toString() || ''}
              onChangeText={(text) => onUpdate({ weight_kg: parseFloat(text) || undefined })}
              placeholder="70"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Training Experience *</Text>
          <View style={styles.optionContainer}>
            {experienceOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  data.training_experience === option && styles.optionButtonActive
                ]}
                onPress={() => onUpdate({ training_experience: option })}
              >
                <Text style={[
                  styles.optionText,
                  data.training_experience === option && styles.optionTextActive
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fitness Goal *</Text>
          <View style={styles.goalContainer}>
            {goalOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.goalButton,
                  data.fitness_goal === option && styles.goalButtonActive
                ]}
                onPress={() => onUpdate({ fitness_goal: option })}
              >
                <Text style={[
                  styles.goalText,
                  data.fitness_goal === option && styles.goalTextActive
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>• {error}</Text>
            ))}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
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
  inputError: {
    borderColor: '#EF4444',
  },
  optionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  optionButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  goalContainer: {
    gap: 12,
  },
  goalButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  goalButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  goalText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  goalTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});