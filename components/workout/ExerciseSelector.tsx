import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import { Exercise } from '@/types/database';
import { Search, Dumbbell } from 'lucide-react-native';

interface Props {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
}

export function ExerciseSelector({ exercises, onSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

  const muscleGroups = Array.from(
    new Set(exercises.map(e => e.target_muscle_group))
  ).sort();

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.target_muscle_group.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscleGroup = !selectedMuscleGroup || exercise.target_muscle_group === selectedMuscleGroup;
    return matchesSearch && matchesMuscleGroup;
  });

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => onSelect(item)}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <View style={[styles.levelBadge, getLevelColor(item.level)]}>
          <Text style={[styles.levelText, getLevelTextColor(item.level)]}>
            {item.level}
          </Text>
        </View>
      </View>
      <Text style={styles.muscleGroup}>{item.target_muscle_group}</Text>
      <Text style={styles.equipment}>{item.equipment_used} • {item.exercise_type}</Text>
      {item.instructions && (
        <Text style={styles.instructions} numberOfLines={2}>
          {item.instructions}
        </Text>
      )}
    </TouchableOpacity>
  );

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

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !selectedMuscleGroup && styles.filterButtonActive
          ]}
          onPress={() => setSelectedMuscleGroup(null)}
        >
          <Text style={[
            styles.filterText,
            !selectedMuscleGroup && styles.filterTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
        {muscleGroups.map(group => (
          <TouchableOpacity
            key={group}
            style={[
              styles.filterButton,
              selectedMuscleGroup === group && styles.filterButtonActive
            ]}
            onPress={() => setSelectedMuscleGroup(group)}
          >
            <Text style={[
              styles.filterText,
              selectedMuscleGroup === group && styles.filterTextActive
            ]}>
              {group}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredExercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Dumbbell size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No exercises found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
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
  muscleGroup: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  equipment: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});