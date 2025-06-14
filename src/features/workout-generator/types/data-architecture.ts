/**
 * Data Architecture Types
 * 
 * Clear separation between static profile data and dynamic session data
 * for optimal workout generation and user experience.
 */

/**
 * PROFILE DATA (Static/Persistent)
 * 
 * User preferences and characteristics that rarely change.
 * Stored in WordPress user_meta and managed via Profile API.
 * Used to provide context and suggestions for session data.
 */
export interface ProfileWorkoutData {
  /** User's fitness level */
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  
  /** Long-term fitness goals (rarely change) */
  primaryGoals: string[];
  
  /** Equipment the user owns/has regular access to */
  ownedEquipment: string[];
  
  /** Permanent health restrictions or considerations */
  healthRestrictions: string[];
  
  /** Preferred workout duration ranges */
  preferredDurations: {
    minimum: number;
    maximum: number;
    typical: number;
  };
  
  /** General availability patterns */
  availabilityPattern: {
    weekdays: number; // minutes per day
    weekends: number; // minutes per day
    frequency: number; // workouts per week
  };
  
  /** Muscle group preferences (for suggestions, not targeting) */
  musclePreferences: {
    favoriteGroups: string[];
    avoidedGroups: string[];
    lastTargeted: Record<string, Date>;
  };
  
  /** Workout style preferences */
  stylePreferences: {
    preferredIntensity: number; // 1-5 default preference
    preferredEnvironment: 'gym' | 'home' | 'outdoors' | 'mixed';
    workoutTypes: string[]; // HIIT, strength, cardio, etc.
  };
}

/**
 * SESSION DATA (Dynamic/Temporary)
 * 
 * Workout-specific data that changes frequently, often daily.
 * Stored in sessionStorage/form state with optional API persistence.
 * Represents the user's current state and today's workout needs.
 */
export interface SessionWorkoutData {
  /** Today's specific muscle targeting (from MuscleGroupCard) */
  muscleTargeting: {
    selectedGroups: string[];
    specificMuscles: Record<string, string[]>;
    primaryFocus?: string;
    selectionSummary: string;
  };
  
  /** Today's available time (may differ from profile preferences) */
  timeAvailable: number; // minutes
  
  /** Current energy/motivation level */
  energyLevel: number; // 1-5 scale
  
  /** Today's workout focus */
  todaysFocus: 'fat-burning' | 'muscle-building' | 'endurance' | 'strength' | 'flexibility' | 'general-fitness';
  
  /** Today's desired intensity */
  intensityLevel: number; // 1-6 scale
  
  /** Equipment available today (subset of owned equipment) */
  equipmentToday: string[];
  
  /** Today's workout environment */
  environmentToday: 'gym' | 'home' | 'outdoors' | 'travel' | 'limited-space';
  
  /** Current physical state */
  physicalState: {
    soreness: string[]; // body areas currently sore
    sleepQuality: number; // 1-5 scale
    stressLevel: number; // 1-5 scale
    healthRestrictionsToday: string[]; // subset of profile restrictions active today
  };
  
  /** Workout customization for today */
  customization: {
    specificRequest?: string;
    avoidToday?: string[];
    emphasizeToday?: string[];
  };
}

/**
 * COMBINED WORKOUT CONTEXT
 * 
 * Merged data structure that combines profile and session data
 * for workout generation. This is what gets sent to the AI provider.
 */
export interface WorkoutGenerationContext {
  /** Static profile data for context */
  profile: ProfileWorkoutData;
  
  /** Dynamic session data for targeting */
  session: SessionWorkoutData;
  
  /** Computed fields based on profile + session */
  computed: {
    /** Effective duration (session overrides profile) */
    effectiveDuration: number;
    
    /** Effective equipment (intersection of owned + available today) */
    effectiveEquipment: string[];
    
    /** Effective restrictions (profile + today's additions) */
    effectiveRestrictions: string[];
    
    /** Profile-based muscle suggestions for today's focus */
    suggestedMuscles: string[];
    
    /** Intensity adjustment based on energy/sleep/stress */
    adjustedIntensity: number;
  };
}

/**
 * DATA PERSISTENCE STRATEGIES
 */
export interface DataPersistenceConfig {
  profile: {
    storage: 'user_meta';
    endpoint: '/wp-json/fitcopilot/v1/profile';
    caching: 'long_term'; // Cache for hours/days
    syncFrequency: 'on_change'; // Only when user explicitly updates
  };
  
  session: {
    storage: 'session_storage' | 'local_storage' | 'api_temp';
    endpoint: '/wp-json/fitcopilot/v1/session-data';
    caching: 'short_term'; // Cache for minutes/hours
    syncFrequency: 'frequent'; // On every significant change
    expiration: '24_hours'; // Auto-clear old session data
  };
}

/**
 * MUSCLE TARGETING CLASSIFICATION
 * 
 * Muscle selection clearly falls into SESSION data category
 * because it represents today's workout targeting, not permanent preferences.
 */
export interface MuscleTargetingStrategy {
  /** Profile provides suggestions based on goals */
  profileSuggestions: {
    source: 'profile.musclePreferences.favoriteGroups';
    purpose: 'suggest_options';
    frequency: 'rarely_changes';
  };
  
  /** Session provides actual targeting for today */
  sessionTargeting: {
    source: 'session.muscleTargeting';
    purpose: 'workout_generation';
    frequency: 'daily_or_per_workout';
    storage: 'session_storage + optional_api_persistence';
  };
} 