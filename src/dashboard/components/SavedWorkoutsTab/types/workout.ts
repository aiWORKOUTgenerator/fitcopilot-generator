/**
 * Workout Type Definitions
 * 
 * Core types for workout data structures and related interfaces.
 * Will be populated during type migration from existing components.
 */

// ===========================================
// CORE WORKOUT TYPES
// ===========================================
// These will be migrated from WorkoutGrid.tsx and other components

// Base workout interface (to be extracted from DisplayWorkout)
// export interface Workout {
//   id: string | number;
//   title: string;
//   description: string;
//   duration: number;
//   difficulty: DifficultyLevel;
//   exercises: Exercise[];
//   created_at: string;
//   updated_at: string;
//   workoutType: string;
//   equipment: string[];
//   isCompleted: boolean;
//   completedAt?: string;
//   tags: string[];
//   isFavorite?: boolean;
//   rating?: number;
// }

// Workout display interface (current DisplayWorkout from WorkoutGrid.tsx)
// Will be moved here during migration
// export interface DisplayWorkout extends Workout {
//   createdAt: string; // For backward compatibility
//   lastModified: string; // For backward compatibility
// }

// Exercise types
// export interface Exercise {
//   name: string;
//   description?: string;
//   sets?: number;
//   reps?: number;
//   duration?: string;
//   equipment?: string[];
//   category?: string;
// }

// Workout section (for structured workouts)
// export interface WorkoutSection {
//   name: string;
//   duration: number;
//   exercises: Exercise[];
// }

// ===========================================
// WORKOUT METADATA TYPES
// ===========================================

// Difficulty levels
// export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Workout types/categories
// export type WorkoutType = 
//   | 'Cardio'
//   | 'Strength'
//   | 'Flexibility'
//   | 'HIIT'
//   | 'Yoga'
//   | 'Pilates'
//   | 'General';

// Equipment types
// export type EquipmentType = 
//   | 'none'
//   | 'dumbbells'
//   | 'resistance_bands'
//   | 'barbell'
//   | 'kettlebell'
//   | 'pull_up_bar'
//   | 'bench'
//   | 'stability_ball'
//   | 'treadmill'
//   | 'bicycle'
//   | 'rowing_machine'
//   | 'elliptical'
//   | 'other';

// ===========================================
// WORKOUT STATUS TYPES
// ===========================================

// Completion status
// export interface WorkoutCompletion {
//   workoutId: string | number;
//   completedAt: string;
//   duration?: number; // Actual time taken
//   notes?: string;
//   rating?: number;
// }

// Workout progress
// export interface WorkoutProgress {
//   totalExercises: number;
//   completedExercises: number;
//   currentExercise?: number;
//   timeElapsed?: number;
// }

// ===========================================
// TRANSFORMATION TYPES
// ===========================================
// For service layer (WorkoutTransformer)

// Raw workout data from API (before transformation)
// export interface RawWorkoutData {
//   id?: string | number;
//   post_id?: number;
//   title?: string;
//   post_title?: string;
//   description?: string;
//   post_content?: string;
//   workout_data?: string | object;
//   sections?: WorkoutSection[];
//   exercises?: Exercise[];
//   duration?: number;
//   difficulty?: string;
//   equipment?: string[];
//   post_date?: string;
//   date?: string;
//   created_at?: string;
//   post_modified?: string;
//   modified?: string;
//   updated_at?: string;
//   [key: string]: any; // Allow additional properties
// }

// Transformation options
// export interface TransformationOptions {
//   validateExercises?: boolean;
//   includeEmptyWorkouts?: boolean;
//   defaultDifficulty?: DifficultyLevel;
//   defaultDuration?: number;
// }

// ===========================================
// MIGRATION STATUS
// ===========================================
/**
 * Type Migration Progress:
 * 
 * ⏳ Pending Migration (Week 1, Day 3):
 * - DisplayWorkout from WorkoutGrid.tsx
 * - Exercise interfaces from various components
 * - Workout metadata types
 * - Raw data transformation types
 * 
 * ✅ Ready for Implementation:
 * - Type structure and organization
 * - Placeholder interfaces for service layer
 * - Documentation and migration plan
 * 
 * 🔄 Future Enhancements:
 * - Workout analytics types
 * - Performance metrics types
 * - User preference types
 * - Social features types (sharing, etc.)
 * 
 * All types are commented out until migration to prevent
 * conflicts with existing component definitions.
 */ 