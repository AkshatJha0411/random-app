// COMMENTED OUT: This file is disabled as per user request to remove /workout-details from the app.
// import { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { useAuth } from '@/hooks/useAuth';
// import { supabase } from '@/lib/supabase';
// import { Workout, Exercise } from '@/types/database';
// import { ArrowLeft, Play, CreditCard as Edit, Trash2, Users, User } from 'lucide-react-native';

// interface WorkoutWithExercises extends Workout {
//   exercises: Exercise[];
// }

// export default function WorkoutDetailsScreen() {
//   const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
//   const { user } = useAuth();
//   const router = useRouter();
//   const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (workoutId) {
//       loadWorkoutDetails();
//     }
//   }, [workoutId]);

//   const loadWorkoutDetails = async () => {
//     if (!workoutId || !user?.email) return;

//     try {
//       const { data: workoutData, error } = await supabase
//         .from('workouts')
//         .select(`
//           *,
//           workout_exercises!inner(
//             order_index,
//             exercise:exercises(*)
//           )
//         `)
//         .eq('id', workoutId)
//         .single();

//       if (error) throw error;

//       // Transform data to include exercises in order
//       const transformedWorkout: WorkoutWithExercises = {
//         ...workoutData,
//         exercises: workoutData.workout_exercises
//           ?.sort((a: any, b: any) => a.order_index - b.order_index)
//           .map((we: any) => we.exercise) || []
//       };

//       setWorkout(transformedWorkout);
//     } catch (error) {
//       console.error('Error loading workout details:', error);
//       Alert.alert('Error', 'Failed to load workout details');
//       router.back();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStartWorkout = () => {
//     // Navigate to log workout with this workout pre-selected
//     router.push({
//       pathname: '/start-workout',
//       params: { workoutId: workoutId }
//     });
//   };

//   const handleEditWorkout = () => {
//     if (!workout?.creator_email) {
//       Alert.alert('Cannot Edit', 'Default workouts cannot be edited');
//       return;
//     }

//     router.push({
//       pathname: '/edit-workout',
//       params: { workoutId: workoutId }
//     });
//   };

//   const handleDeleteWorkout = () => {
//     if (!workout?.creator_email) {
//       Alert.alert('Cannot Delete', 'Default workouts cannot be deleted');
//       return;
//     }

//     Alert.alert(
//       'Delete Workout',
//       `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const { error } = await supabase
//                 .from('workouts')
//                 .delete()
//                 .eq('id', workoutId);

//               if (error) throw error;

//               Alert.alert('Success', 'Workout deleted successfully');
//               router.back();
//             } catch (error) {
//               console.error('Error deleting workout:', error);
//               Alert.alert('Error', 'Failed to delete workout');
//             }
//           }
//         }
//       ]
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Loading workout...</Text>
//       </View>
//     );
//   }

//   if (!workout) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Workout not found</Text>
//       </View>
//     );
//   }

//   const isDefault = !workout.creator_email;
//   const isOwner = workout.creator_email === user?.email;

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <ArrowLeft size={24} color="#6B7280" />
//         </TouchableOpacity>
//         
//         <View style={styles.headerActions}>
//           {isOwner && (
//             <>
//               <TouchableOpacity
//                 style={styles.actionButton}
//                 onPress={handleEditWorkout}
//               >
//                 <Edit size={20} color="#6B7280" />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.actionButton}
//                 onPress={handleDeleteWorkout}
//               >
//                 <Trash2 size={20} color="#EF4444" />
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       </View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         <View style={styles.workoutHeader}>
//           <View style={styles.workoutTitleContainer}>
//             <Text style={styles.workoutName}>{workout.name}</Text>
//             <View style={styles.workoutBadge}>
//               {isDefault ? (
//                 <Users size={16} color="#10B981" />
//               ) : (
//                 <User size={16} color="#3B82F6" />
//               )}
//               <Text style={[
//                 styles.workoutBadgeText,
//                 { color: isDefault ? '#10B981' : '#3B82F6' }
//               ]}>
//                 {isDefault ? 'Default' : 'Custom'}
//               </Text>
//             </View>
//           </View>
//           
//           {workout.level && (
//             <Text style={styles.workoutLevel}>Level: {workout.level}</Text>
//           )}
//           
//           {workout.notes && (
//             <Text style={styles.workoutNotes}>{workout.notes}</Text>
//           )}
//         </View>

//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>
//             Exercises ({workout.exercises.length})
//           </Text>
//           
//           <View style={styles.exercisesList}>
//             {workout.exercises.map((exercise, index) => (
//               <View key={exercise.id} style={styles.exerciseCard}>
//                 <View style={styles.exerciseNumber}>
//                   <Text style={styles.exerciseNumberText}>{index + 1}</Text>
//                 </View>
//                 
//                 <View style={styles.exerciseInfo}>
//                   <Text style={styles.exerciseName}>{exercise.name}</Text>
//                   <Text style={styles.exerciseDetails}>
//                     {exercise.target_muscle_group} • {exercise.equipment_used}
//                   </Text>
//                   <View style={styles.exerciseMeta}>
//                     <View style={styles.exerciseTypeTag}>
//                       <Text style={styles.exerciseTypeText}>
//                         {exercise.exercise_type}
//                       </Text>
//                     </View>
//                     <View style={[styles.exerciseLevelTag, getLevelColor(exercise.level)]}>
//                       <Text style={[styles.exerciseLevelText, getLevelTextColor(exercise.level)]}>
//                         {exercise.level}
//                       </Text>
//                     </View>
//                   </View>
//                   
//                   {exercise.instructions && (
//                     <Text style={styles.exerciseInstructions} numberOfLines={2}>
//                       {exercise.instructions}
//                     </Text>
//                   )}
//                 </View>
//               </View>
//             ))}
//           </View>
//         </View>
//       </ScrollView>

//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={styles.startButton}
//           onPress={handleStartWorkout}
//         >
//           <Play size={24} color="#FFFFFF" />
//           <Text style={styles.startButtonText}>Start Workout</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const getLevelColor = (level: string) => {
//   switch (level) {
//     case 'Beginner': return { backgroundColor: '#D1FAE5' };
//     case 'Intermediate': return { backgroundColor: '#FEF3C7' };
//     case 'Advanced': return { backgroundColor: '#FEE2E2' };
//     default: return { backgroundColor: '#F3F4F6' };
//   }
// };

// const getLevelTextColor = (level: string) => {
//   switch (level) {
//     case 'Beginner': return { color: '#065F46' };
//     case 'Intermediate': return { color: '#92400E' };
//     case 'Advanced': return { color: '#991B1B' };
//     default: return { color: '#6B7280' };
//   }
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 24,
//     paddingTop: 60,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#F3F4F6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   actionButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#F3F4F6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   content: {
//     flex: 1,
//   },
//   workoutHeader: {
//     padding: 24,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   workoutTitleContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   workoutName: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1F2937',
//     flex: 1,
//     marginRight: 16,
//   },
//   workoutBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//     borderRadius: 16,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     gap: 6,
//   },
//   workoutBadgeText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   workoutLevel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#6B7280',
//     marginBottom: 8,
//   },
//   workoutNotes: {
//     fontSize: 16,
//     color: '#6B7280',
//     lineHeight: 24,
//   },
//   section: {
//     padding: 24,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 16,
//   },
//   exercisesList: {
//     gap: 16,
//   },
//   exerciseCard: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     gap: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   exerciseNumber: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#3B82F6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   exerciseNumberText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },
//   exerciseInfo: {
//     flex: 1,
//     gap: 8,
//   },
//   exerciseName: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1F2937',
//   },
//   exerciseDetails: {
//     fontSize: 16,
//     color: '#3B82F6',
//     fontWeight: '600',
//   },
//   exerciseMeta: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   exerciseTypeTag: {
//     backgroundColor: '#EBF4FF',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//   },
//   exerciseTypeText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#3B82F6',
//   },
//   exerciseLevelTag: {
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//   },
//   exerciseLevelText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   exerciseInstructions: {
//     fontSize: 14,
//     color: '#6B7280',
//     lineHeight: 20,
//   },
//   footer: {
//     padding: 24,
//     backgroundColor: '#FFFFFF',
//     borderTopWidth: 1,
//     borderTopColor: '#F3F4F6',
//   },
//   startButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#10B981',
//     borderRadius: 16,
//     padding: 20,
//     gap: 12,
//     shadowColor: '#10B981',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   startButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '700',
//   },
// });