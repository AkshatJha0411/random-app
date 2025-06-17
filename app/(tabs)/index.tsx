import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { User, Workout, WorkoutLog } from '@/types/database';
import { Dumbbell, TrendingUp, Calendar, Plus } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({ workouts: 0, exercises: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.email) return;

    try {
      // Load user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Load recent workout logs (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: logsData } = await supabase
        .from('workout_logs')
        .select(`
          *,
          exercise:exercises(*),
          workout:workouts(*)
        `)
        .eq('user_email', user.email)
        .gte('logged_at', weekAgo.toISOString())
        .order('logged_at', { ascending: false })
        .limit(5);

      if (logsData) {
        setRecentWorkouts(logsData);
        
        // Calculate weekly stats
        const uniqueWorkouts = new Set(logsData.map(log => log.logged_at.split('T')[0])).size;
        const totalExercises = logsData.length;
        setWeeklyStats({ workouts: uniqueWorkouts, exercises: totalExercises });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.name || 'Fitness Enthusiast'}!</Text>
          <Text style={styles.subGreeting}>Ready for your next workout?</Text>
        </View>
        <View style={styles.iconContainer}>
          <Dumbbell size={32} color="#3B82F6" />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Calendar size={24} color="#10B981" />
          <Text style={styles.statValue}>{weeklyStats.workouts}</Text>
          <Text style={styles.statLabel}>Workouts This Week</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{weeklyStats.exercises}</Text>
          <Text style={styles.statLabel}>Exercises Logged</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/log-workout')}
          >
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Log Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push('/workouts')}
          >
            <Calendar size={24} color="#3B82F6" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Browse Workouts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentWorkouts.length > 0 ? (
          <View style={styles.activityContainer}>
            {recentWorkouts.map((log) => (
              <View key={log.id} style={styles.activityItem}>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityExercise}>{log.exercise?.name}</Text>
                  <Text style={styles.activityDetails}>
                    {log.sets} sets × {log.reps} reps
                    {log.weight_kg > 0 && ` @ ${log.weight_kg}kg`}
                  </Text>
                </View>
                <Text style={styles.activityDate}>
                  {formatDate(log.logged_at)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent activity</Text>
            <Text style={styles.emptyStateSubtext}>
              Log your first workout to see your progress here
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
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
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  subGreeting: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#3B82F6',
  },
  activityContainer: {
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
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  activityDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  activityDate: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});