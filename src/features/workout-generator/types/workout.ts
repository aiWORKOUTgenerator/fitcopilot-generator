/**
 * Workout difficulty levels
 */
export type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced';

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
  
  /**
   * Workout difficulty level
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
}

/**
 * Workout form parameters
 */
export interface WorkoutFormParams {
  duration: number;
  difficulty: WorkoutDifficulty;
  equipment?: string[];
  goals: string;
  restrictions?: string;
  preferences?: string;
  
  /**
   * Workout intensity level (1-5 scale: Low to High)
   */
  intensity?: number;
  
  /**
   * Dynamic inputs specific to the current workout session
   */
  sessionInputs?: SessionSpecificInputs;
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