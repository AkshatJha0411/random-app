import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { OnboardingData } from '@/types/database';

interface Props {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}

export function OnboardingStep3({ data, onUpdate, onNext, onBack, loading }: Props) {
  const equipmentOptions = [
    'Dumbbells',
    'Barbell',
    'Machine',
    'Bodyweight',
    'Kettlebells',
    'Bands',
  ];

  const toggleEquipment = (equipment: string) => {
    const current = data.equipment_available || [];
    const updated = current.includes(equipment)
      ? current.filter(item => item !== equipment)
      : [...current, equipment];
    onUpdate({ equipment_available: updated });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Available Equipment</Text>
      <Text style={styles.stepSubtitle}>
        Select all equipment you have access to. This helps us recommend suitable workouts.
      </Text>

      <View style={styles.form}>
        <View style={styles.equipmentGrid}>
          {equipmentOptions.map((equipment) => (
            <TouchableOpacity
              key={equipment}
              style={[
                styles.equipmentButton,
                (data.equipment_available || []).includes(equipment) && styles.equipmentButtonActive
              ]}
              onPress={() => toggleEquipment(equipment)}
            >
              <Text style={[
                styles.equipmentText,
                (data.equipment_available || []).includes(equipment) && styles.equipmentTextActive
              ]}>
                {equipment}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.completeButton, loading && styles.buttonDisabled]} 
            onPress={onNext}
            disabled={loading}
          >
            <Text style={styles.completeButtonText}>
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </Text>
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
    gap: 32,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  equipmentButton: {
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  equipmentButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  equipmentText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  equipmentTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
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
  completeButton: {
    flex: 2,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});