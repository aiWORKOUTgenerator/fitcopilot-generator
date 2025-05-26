/**
 * User Profile Types
 * 
 * This file defines the data structure for user fitness profiles
 */

/**
 * FitnessLevel represents the user's current fitness experience
 */
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * FitnessGoal represents possible fitness goals a user might have
 */
export type FitnessGoal = 
  | 'weight_loss' 
  | 'muscle_building' 
  | 'endurance' 
  | 'flexibility' 
  | 'general_fitness'
  | 'strength'
  | 'rehabilitation'
  | 'sport_specific'
  | 'custom';

/**
 * Equipment represents available fitness equipment
 */
export type Equipment = 
  | 'none'
  | 'dumbbells'
  | 'resistance_bands'
  | 'barbell'
  | 'kettlebell'
  | 'pull_up_bar'
  | 'bench'
  | 'stability_ball'
  | 'treadmill'
  | 'bicycle'
  | 'rowing_machine'
  | 'elliptical'
  | 'other';

/**
 * Physical limitation types that might affect workout routines
 */
export type LimitationType = 
  | 'none'
  | 'lower_back'
  | 'knee'
  | 'shoulder'
  | 'hip'
  | 'neck'
  | 'wrist'
  | 'ankle'
  | 'cardiovascular'
  | 'other';

/**
 * Workout location preference
 */
export type WorkoutLocation = 'home' | 'gym' | 'outdoors' | 'anywhere';

/**
 * Workout frequency preference
 */
export type WorkoutFrequency = '1-2' | '3-4' | '5+' | 'custom';

/**
 * User profile interface containing all fitness-related user data
 */
export interface UserProfile {
  // User identifiers
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  
  // Basic fitness information
  fitnessLevel: FitnessLevel;
  goals: FitnessGoal[];
  customGoal?: string;
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  height?: number;
  heightUnit?: 'cm' | 'ft';
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  
  // Equipment & location
  availableEquipment: Equipment[];
  customEquipment?: string;
  preferredLocation: WorkoutLocation;
  
  // Health considerations
  limitations: LimitationType[];
  limitationNotes?: string;
  medicalConditions?: string;
  
  // Preferences
  preferredWorkoutDuration?: number; // in minutes
  workoutFrequency: WorkoutFrequency;
  customFrequency?: string;
  favoriteExercises?: string[];
  dislikedExercises?: string[];
  
  // Meta information
  lastUpdated: string; // ISO date string
  profileComplete: boolean;
  completedWorkouts: number;
}

/**
 * Partial profile for updates
 */
export type PartialUserProfile = Partial<Omit<UserProfile, 'id' | 'lastUpdated' | 'completedWorkouts'>>;

/**
 * Profile form state for step-by-step profile creation
 */
export interface ProfileFormState {
  currentStep: number;
  totalSteps: number;
  formData: PartialUserProfile;
  validationErrors: Record<string, string>;
  isDirty: boolean;
  isSubmitting: boolean;
}

/**
 * Initial empty profile state
 */
export const INITIAL_PROFILE: PartialUserProfile = {
  fitnessLevel: 'beginner',
  goals: ['general_fitness'],
  availableEquipment: ['none'],
  limitations: ['none'],
  preferredLocation: 'home',
  workoutFrequency: '3-4',
  profileComplete: false
}; 