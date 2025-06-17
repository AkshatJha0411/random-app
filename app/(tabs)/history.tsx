import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { WorkoutLog } from '@/types/database';
import { Calendar, TrendingUp, Dumbbell } from 'lucide-react-native';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadWorkoutHistory();
  }, [user, selectedPeriod]);

  const loadWorkoutHistory = async () => {
    if (!user?.email) return;

    try {
      let query = supabase
        .from('workout_logs')
        .select(`
          *,
          exercise:exercises(*),
          workout:workouts(*)
        `)
        .eq('user_email', user.email)
        .order('logged_at', { ascending: false });

      // Apply date filter
      if (selectedPeriod !== 'all') {
        const date = new Date();
        if (selectedPeriod === 'week') {
          date.setDate(date.getDate() - 7);
        } else if (selectedPeriod === 'month') {
          date.setDate(date.getDate() - 30);
        }
        query = query.gte('logged_at', date.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setWorkoutLogs(data || []);
    } catch (error) {
      console.error('Error loading workout history:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupLogsByDate = (logs: WorkoutLog[]) => {
    const grouped: { [key: string]: WorkoutLog[] } = {};
    logs.forEach(log => {
      const date = new Date(log.logged_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    return grouped;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const calculateStats = () => {
    const totalWorkouts = Object.keys(groupLogsByDate(workoutLogs)).length;
    const totalExercises = workoutLogs.length;
    const totalWeight = workoutLogs.reduce((sum, log) => sum + (log.weight_kg * log.sets * log.reps), 0);
    
    return { totalWorkouts, totalExercises, totalWeight };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading history...</Text>
      </View>
    );
  }

  const groupedLogs = groupLogsByDate(workoutLogs);
  const stats = calculateStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout History</Text>
        <View style={styles.periodSelector}>
          {(['week', 'month', 'all'] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive
              ]}>
                {period === 'week' ? '7 days' : period === 'month' ? '30 days' : 'All time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Calendar size={24} color="#10B981" />
          <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Dumbbell size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{stats.totalExercises}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{Math.round(stats.totalWeight)}kg</Text>
          <Text style={styles.statLabel}>Total Volume</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedLogs).length > 0 ? (
          Object.entries(groupedLogs).map(([date, logs]) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateTitle}>{formatDate(date)}</Text>
              <View style={styles.logsContainer}>
                {logs.map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logInfo}>
                      <Text style={styles.exerciseName}>{log.exercise?.name}</Text>
                      <Text style={styles.logDetails}>
                        {log.sets} sets × {log.reps} reps
                        {log.weight_kg > 0 && ` @ ${log.weight_kg}kg`}
                      </Text>
                      {log.notes && (
                        <Text style={styles.logNotes}>{log.notes}</Text>
                      )}
                    </View>
                    <Text style={styles.logTime}>
                      {new Date(log.logged_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No workout history</Text>
            <Text style={styles.emptyStateText}>
              Start logging your workouts to see your progress here
            </Text>
          </View>
        )}
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
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodTextActive: {
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  logsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  logDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  logNotes: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  logTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
});