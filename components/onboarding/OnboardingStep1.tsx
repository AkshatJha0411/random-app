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
}

export function OnboardingStep1({ data, onUpdate, onNext }: Props) {
  const [errors, setErrors] = useState<string[]>([]);
  const next = "hello";          
  const validate = () => {
    const newErrors: string[] = [];
    if (!data.name?.trim()) newErrors.push('Name is required');
    if (!data.age || data.age < 13 || data.age > 100) newErrors.push('Age must be between 13-100');
    if (!data.gender) newErrors.push('Gender is required');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const genderOptions = ['Male', 'Female', 'Other'];

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>
        Tell us a bit about yourself to personalize your experience
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, errors.includes('Name is required') && styles.inputError]}
            value={data.name || ''}
            onChangeText={(text) => onUpdate({ name: text })}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age *</Text>
          <TextInput
            style={[styles.input, errors.some(e => e.includes('Age')) && styles.inputError]}
            value={data.age?.toString() || ''}
            onChangeText={(text) => onUpdate({ age: parseInt(text) || undefined })}
            placeholder="Enter your age"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.optionContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  data.gender === option && styles.optionButtonActive
                ]}
                onPress={() => onUpdate({ gender: option })}
              >
                <Text style={[
                  styles.optionText,
                  data.gender === option && styles.optionTextActive
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

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
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
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  optionTextActive: {
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
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});