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
  name: string;
  duration: string;
  description: string;
}

/**
 * Exercise with sets and reps (for main workout)
 */
export interface SetsExercise {
  name: string;
  sets: number;
  reps: number;
  description: string;
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
 * Generated workout structure
 */
export interface GeneratedWorkout {
  title: string;
  sections: WorkoutSection[];
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