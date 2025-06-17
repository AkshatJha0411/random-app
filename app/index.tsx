import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!loading && user) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (profile) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } else if (!loading && !user) {
        router.replace('/auth');
      }
    };

    checkUserProfile();
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});