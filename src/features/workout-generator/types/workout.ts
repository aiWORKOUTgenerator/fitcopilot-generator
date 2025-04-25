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
 * Workout form parameters
 */
export interface WorkoutFormParams {
  duration: number;
  difficulty: WorkoutDifficulty;
  equipment?: string[];
  goals: string;
  restrictions?: string;
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