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
 * User identity data source for tracking fallback hierarchy
 */
export type UserDataSource = 
  | 'profile_meta'      // Data from profile-specific meta fields
  | 'wordpress_user'    // Data from WordPress user table/meta
  | 'generated'         // Generated data (e.g., avatar URLs)
  | 'fallback';         // Default fallback values

/**
 * Avatar display type for UI components
 */
export type AvatarType = 'image' | 'initials' | 'default';

/**
 * User identity fields extracted from UserProfile for display purposes
 */
export interface UserIdentity {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Enhanced user identity with computed display properties
 */
export interface EnhancedUserIdentity extends UserIdentity {
  // Computed display properties
  fullName: string;           // firstName + lastName or best available name
  initials: string;           // Generated initials for avatar fallback
  hasCompleteIdentity: boolean; // Whether user has sufficient identity data
  
  // Data source tracking for debugging/analytics
  dataSources: {
    firstName: UserDataSource;
    lastName: UserDataSource;
    email: UserDataSource;
    displayName: UserDataSource;
    avatarUrl: UserDataSource;
  };
}

/**
 * User profile interface containing all fitness-related user data with WordPress integration
 * 
 * This interface combines WordPress user data with fitness profile information,
 * providing a comprehensive user profile with fallback hierarchy support.
 */
export interface UserProfile {
  // === USER IDENTITY SECTION ===
  // Core identifier
  id: number;
  
  // WordPress user fields (always available)
  username?: string;        // WordPress user_login
  displayName?: string;     // WordPress display_name
  avatarUrl?: string;       // Generated via get_avatar_url()
  
  // User identity fields with WordPress fallback support
  firstName?: string;       // Profile meta OR WordPress first_name
  lastName?: string;        // Profile meta OR WordPress last_name  
  email?: string;          // Profile meta OR WordPress user_email
  
  // === FITNESS PROFILE SECTION ===
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
  
  // Workout preferences
  preferredWorkoutDuration?: number; // in minutes
  workoutFrequency: WorkoutFrequency;
  customFrequency?: string;
  favoriteExercises?: string[];
  dislikedExercises?: string[];
  
  // === META INFORMATION SECTION ===
  lastUpdated: string; // ISO date string
  profileComplete: boolean;
  completedWorkouts: number;
}

/**
 * Partial profile for updates (excludes read-only fields)
 */
export type PartialUserProfile = Partial<Omit<UserProfile, 'id' | 'lastUpdated' | 'completedWorkouts'>>;

/**
 * User identity section of the profile (for focused updates)
 */
export type UserIdentityUpdate = Pick<UserProfile, 'firstName' | 'lastName' | 'email'>;

/**
 * Fitness profile section (excludes user identity and meta)
 */
export type FitnessProfileData = Omit<UserProfile, 
  | 'id' | 'username' | 'firstName' | 'lastName' | 'email' | 'displayName' | 'avatarUrl'
  | 'lastUpdated' | 'profileComplete' | 'completedWorkouts'
>;

/**
 * Profile meta information section
 */
export type ProfileMetaData = Pick<UserProfile, 'lastUpdated' | 'profileComplete' | 'completedWorkouts'>;

/**
 * WordPress user fields that are always available
 */
export type WordPressUserData = Pick<UserProfile, 'username' | 'displayName' | 'avatarUrl'>;

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
 * Profile validation result for form handling
 */
export interface ProfileValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  completionPercentage: number;
  missingRequiredFields: string[];
}

/**
 * Profile completion status for step tracking
 */
export interface ProfileCompletionStatus {
  overallComplete: boolean;
  identityComplete: boolean;
  fitnessComplete: boolean;
  preferencesComplete: boolean;
  completedSteps: number[];
  totalSteps: number;
  completionPercentage: number;
}

/**
 * Enhanced profile form state with WordPress integration
 */
export interface EnhancedProfileFormState extends ProfileFormState {
  userIdentity: UserIdentity | null;
  hasWordPressData: boolean;
  dataSourceInfo: Record<string, UserDataSource>;
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

/**
 * Default user identity for new profiles
 */
export const INITIAL_USER_IDENTITY: UserIdentity = {
  id: 0,
  username: undefined,
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  displayName: undefined,
  avatarUrl: undefined
}; 