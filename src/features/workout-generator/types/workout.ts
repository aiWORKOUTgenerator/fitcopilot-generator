/**
 * Workout difficulty levels
 */
export type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced';

// PHASE 5: New fitness-specific types
/**
 * Fitness level (user's experience)
 */
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Intensity level (today's workout intensity)
 */
export type IntensityLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Exercise complexity level
 */
export type ExerciseComplexity = 'basic' | 'moderate' | 'advanced';

/**
 * Form steps type
 */
export type FormSteps = 'input' | 'preview' | 'generating' | 'completed';

/**
 * Exercise with duration (for warm-up/cool-down)
 */
export interface TimedExercise {
  id?: string;
  name: string;
  duration: string;
  description: string;
  notes?: string;
  type?: 'timed' | 'warm-up' | 'cool-down';
  section?: string;
}

/**
 * Exercise with sets and reps (for main workout)
 */
export interface SetsExercise {
  id?: string;
  name: string;
  sets: number;
  reps: number | string;
  description: string;
  notes?: string;
  type?: 'strength' | 'main';
  section?: string;
}

/**
 * Exercise can be either timed or sets-based
 */
export type Exercise = TimedExercise | SetsExercise;

/**
 * Workout section (warm-up, main workout, cool-down)
 */
export interface WorkoutSection {
  name: string;
  duration: number;
  exercises: Exercise[];
}

/**
 * Generated workout structure - aligned with WordPress response format
 */
export interface GeneratedWorkout {
  /**
   * Optional ID when the workout is saved
   */
  id?: string | number;
  
  /**
   * WordPress post ID (backend response format)
   */
  post_id?: string | number;
  
  /**
   * Workout title
   */
  title: string;
  
  /**
   * Workout description/notes - WordPress field
   */
  description?: string;
  
  /**
   * Workout notes - WordPress field (alternative naming)
   */
  notes?: string;
  
  /**
   * Workout duration in minutes
   */
  duration?: number;
  
  // PHASE 2: New fitness-specific fields in generated workouts
  /**
   * User's fitness level (replaces vague "difficulty" concept)
   */
  fitness_level?: WorkoutDifficulty;
  
  /**
   * Workout intensity level (1-5 scale)
   */
  intensity_level?: number;
  
  /**
   * Exercise complexity level (basic, moderate, advanced)
   */
  exercise_complexity?: 'basic' | 'moderate' | 'advanced';
  
  // SPRINT 2: NEW WorkoutGeneratorGrid response fields following fitness model
  /**
   * User's stress level during workout generation
   */
  stress_level?: 'low' | 'moderate' | 'high' | 'very_high';
  
  /**
   * User's energy level during workout generation
   */
  energy_level?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  
  /**
   * User's sleep quality affecting workout generation
   */
  sleep_quality?: 'poor' | 'fair' | 'good' | 'excellent';
  
  /**
   * Workout location context
   */
  location?: 'home' | 'gym' | 'outdoors' | 'travel' | 'any';
  
  /**
   * Custom notes provided for workout generation
   */
  custom_notes?: string;
  
  /**
   * Primary muscle focus for the workout
   */
  primary_muscle_focus?: string;
  
  /**
   * Complete session context from generation
   */
  session_context?: {
    daily_state: {
      stress?: string;
      energy?: string;
      sleep?: string;
    };
    environment: {
      location?: string;
      equipment?: string[];
    };
    focus: {
      primary_goal?: string;
      muscle_groups?: string[];
      restrictions?: string[];
    };
    customization: {
      notes?: string;
      intensity_preference?: number;
    };
  };
  
  // BACKWARD COMPATIBILITY: Keep difficulty field during transition
  /**
   * Workout difficulty level (legacy field)
   */
  difficulty?: WorkoutDifficulty;
  
  /**
   * Equipment required - WordPress field
   */
  equipment?: string[];
  
  /**
   * Fitness goals - WordPress field
   */
  goals?: string[];
  
  /**
   * List of exercises (can be mixed duration/sets-based)
   */
  exercises: Exercise[];
  
  /**
   * Workout sections (warm-up, main workout, cool-down) - optional
   */
  sections?: WorkoutSection[];
  
  /**
   * Creation timestamp
   */
  created_at?: string;
  
  /**
   * Last updated timestamp
   */
  updated_at?: string;
  
  /**
   * Workout version for editing
   */
  version?: number;
  
  /**
   * Last modified timestamp
   */
  lastModified?: string;
  
  /**
   * User who last modified
   */
  modifiedBy?: string | number;
  
  /**
   * Session-specific inputs from workout generation
   * Contains all the user selections from WorkoutGeneratorGrid
   */
  sessionInputs?: SessionSpecificInputs;
}

/**
 * Session-specific inputs that may change with each workout
 */
export interface SessionSpecificInputs {
  /**
   * Amount of time available for the current workout session (in minutes)
   */
  availableTime?: number;
  
  /**
   * Current energy or motivation level (1-5 scale)
   */
  energyLevel?: number;
  
  /**
   * Specific body area to focus on for the current session
   */
  focusArea?: string[];
  
  /**
   * Areas of the body that are currently sore or experiencing pain
   */
  currentSoreness?: string[];
  
  /**
   * Current mood or stress level that may affect the workout
   */
  moodLevel?: number;
  
  /**
   * Quality of sleep from the previous night (1-5 scale)
   */
  sleepQuality?: number;
  
  /**
   * Current workout environment (gym, home, travel, etc.)
   */
  environment?: 'gym' | 'home' | 'outdoors' | 'travel' | 'limited-space';
  
  /**
   * Today's primary workout focus selected from WorkoutGrid
   * Maps to the 6 focus options in the WorkoutGeneratorGrid
   */
  todaysFocus?: 'fat-burning' | 'muscle-building' | 'endurance' | 'strength' | 'flexibility' | 'general-fitness';
  
  /**
   * Today's intensity level (1-6 scale from WorkoutGrid)
   * 1=Very Low, 2=Low, 3=Moderate, 4=High, 5=Very High, 6=Extreme
   */
  dailyIntensityLevel?: number;
  
  /**
   * Health limitations active today (subset of profile limitations)
   * User can specify which of their profile health considerations apply today
   */
  healthRestrictionsToday?: string[];
  
  /**
   * Equipment specifically available for today's workout
   * May differ from profile equipment based on location/access
   */
  equipmentAvailableToday?: string[];
  
  /**
   * Actual time available for today's workout (overrides profile frequency suggestions)
   * This is the real constraint for today, different from general availableTime
   */
  timeConstraintsToday?: number;
  
  /**
   * Where working out today (may differ from profile preferred location)
   * Today's actual location choice
   */
  locationToday?: 'home' | 'gym' | 'outdoors' | 'travel' | 'limited-space';
  
  /**
   * Custom workout preferences or additional context not covered by other fields
   * Free-form text input for specific requests, modifications, or notes
   */
  workoutCustomization?: string;
}

/**
 * Workout Form Parameters
 * PHASE 2: Enhanced with fitness-specific parameters and muscle targeting integration
 */
export interface WorkoutFormParams {
  duration: number;
  
  // PHASE 2: New fitness-specific parameters
  /**
   * User's fitness level (replaces vague "difficulty" concept)
   */
  fitness_level?: WorkoutDifficulty;
  
  /**
   * Workout intensity level (1-5 scale: Low to High)
   */
  intensity_level?: number;
  
  /**
   * Exercise complexity level (basic, moderate, advanced)
   */
  exercise_complexity?: 'basic' | 'moderate' | 'advanced';
  
  // SPRINT 2: NEW WorkoutGeneratorGrid parameters following fitness model
  /**
   * User's current stress level affecting workout adaptation
   */
  stress_level?: 'low' | 'moderate' | 'high' | 'very_high';
  
  /**
   * User's current energy/motivation level for workout intensity
   */
  energy_level?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  
  /**
   * User's recent sleep quality affecting recovery and intensity
   */
  sleep_quality?: 'poor' | 'fair' | 'good' | 'excellent';
  
  /**
   * Today's workout location (may differ from profile preference)
   */
  location?: 'home' | 'gym' | 'outdoors' | 'travel' | 'any';
  
  /**
   * Custom workout notes and specific user requests
   */
  custom_notes?: string;
  
  /**
   * Primary muscle focus for enhanced targeting
   */
  primary_muscle_focus?: string;
  
  /**
   * Structured session context containing all daily selections
   */
  session_context?: {
    daily_state: {
      stress?: string;
      energy?: string;
      sleep?: string;
    };
    environment: {
      location?: string;
      equipment?: string[];
    };
    focus: {
      primary_goal?: string;
      muscle_groups?: string[];
      restrictions?: string[];
    };
    customization: {
      notes?: string;
      intensity_preference?: number;
    };
  };
  
  // BACKWARD COMPATIBILITY: Keep existing fields during transition
  difficulty: WorkoutDifficulty;
  intensity?: number;
  
  equipment?: string[];
  goals: string;
  restrictions?: string;
  preferences?: string;
  
  /**
   * Dynamic inputs specific to the current workout session
   * Extended to include WorkoutGrid daily selections
   */
  sessionInputs?: SessionSpecificInputs;
  
  /**
   * Muscle targeting data from muscle selection integration
   * Added to support the new muscle-form integration architecture
   */
  muscleTargeting?: {
    /**
     * Selected muscle groups for targeting
     */
    targetMuscleGroups: import('./muscle-types').MuscleGroup[];
    
    /**
     * Specific muscles selected within each group
     */
    specificMuscles: Record<import('./muscle-types').MuscleGroup, string[]>;
    
    /**
     * Primary focus muscle group (first selected)
     */
    primaryFocus: import('./muscle-types').MuscleGroup | undefined;
    
    /**
     * Human-readable summary of muscle selection
     */
    selectionSummary: string;
  };
  
  /**
   * Complete muscle selection data (for advanced processing)
   * Includes the full muscle selection state for detailed workout generation
   */
  muscleSelection?: import('./muscle-types').MuscleSelectionData;
  
  /**
   * Backward compatibility fields for direct muscle targeting
   * These fields provide direct access to muscle data for legacy API integrations
   */
  targetMuscleGroups?: string[];
  specificMuscles?: { [key: string]: string[] };
  primaryFocus?: string;
  
  /**
   * Focus area from sessionInputs (muscle groups as strings)
   * Used for muscle targeting integration
   */
  focusArea?: string[];
}

/**
 * Saved workout with metadata
 */
export interface SavedWorkout {
  id: number;
  title: string;
  date: string;
  excerpt?: string;
  duration: number;
  difficulty: WorkoutDifficulty;
  content?: string;
  rating?: number;
}

/**
 * Workout list response
 */
export interface WorkoutListResponse {
  workouts: SavedWorkout[];
  total: number;
  totalPages: number;
  currentPage: number;
} 