import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/database';
import { User as UserIcon, Settings, LogOut, CreditCard as Edit } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              router.replace('/auth');
            }
          },
        },
      ]
    );
  };

  const formatGoal = (goal?: string) => {
    switch (goal) {
      case 'Build Muscle': return 'Build Muscle';
      case 'Lose Fat': return 'Lose Fat';
      case 'Recomp': return 'Body Recomposition';
      case 'General Fitness': return 'General Fitness';
      default: return 'Not specified';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileIconContainer}>
          <UserIcon size={40} color="#3B82F6" />
        </View>
        <Text style={styles.name}>{profile?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {profile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{profile.age || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{profile.gender || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>
                {profile.height_cm ? `${profile.height_cm} cm` : 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>
                {profile.weight_kg ? `${profile.weight_kg} kg` : 'Not specified'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {profile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Experience Level</Text>
              <Text style={styles.infoValue}>
                {profile.training_experience || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fitness Goal</Text>
              <Text style={styles.infoValue}>
                {formatGoal(profile.fitness_goal)}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Available Equipment</Text>
              <View style={styles.equipmentContainer}>
                {profile.equipment_available && profile.equipment_available.length > 0 ? (
                  profile.equipment_available.map((equipment, index) => (
                    <View key={index} style={styles.equipmentTag}>
                      <Text style={styles.equipmentText}>{equipment}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoValue}>None specified</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available in a future update')}
          >
            <Edit size={20} color="#3B82F6" />
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Settings will be available in a future update')}
          >
            <Settings size={20} color="#6B7280" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.actionText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    padding: 32,
    paddingTop: 80,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoColumn: {
    gap: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  infoValue: {
    fontSize: 16,
    color: '#6B7280',
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentTag: {
    backgroundColor: '#EBF4FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  equipmentText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  signOutText: {
    color: '#EF4444',
  },
});