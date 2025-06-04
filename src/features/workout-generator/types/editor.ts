/**
 * Workout Editor Types
 * 
 * Type definitions for the workout editor components and related functionality.
 * These types represent the data models used throughout the editor workflow.
 */

import { GeneratedWorkout, WorkoutDifficulty, Exercise, SetsExercise, TimedExercise } from './workout';

/**
 * Core workout editor data model
 * Represents a workout in the editor format with all editable properties
 */
export interface WorkoutEditorData {
  /** Workout title */
  title: string;
  /** Difficulty level of the workout */
  difficulty: WorkoutDifficulty;
  /** Duration in minutes */
  duration: number;
  /** List of equipment required for the workout */
  equipment: string[];
  /** List of fitness goals this workout targets */
  goals: string[];
  /** List of exercises in this workout */
  exercises: EditorExercise[];
  /** Optional additional notes about the workout */
  notes?: string;
  /** Optional version number for tracking changes */
  version?: number;
  /** ISO timestamp of last modification */
  lastModified?: string;
  /** WordPress post ID if the workout is saved */
  postId?: number;
}

/**
 * Exercise in the editor format
 * Represents a single exercise with all editable properties
 */
export interface EditorExercise {
  /** Unique identifier for the exercise within this workout */
  id: string;
  /** Name of the exercise */
  name: string;
  /** Number of sets to perform */
  sets: number;
  /** Number of reps or rep range (e.g. "8-12") */
  reps: number | string;
  /** Rest period between sets in seconds */
  restPeriod?: number;
  /** Additional notes or form cues for this exercise */
  notes?: string;
  /** Alternative exercises that can be substituted */
  substitutions?: string[];
  /** Original AI-generated description before parsing */
  originalDescription?: string;
  /** Status of the parsing operation */
  parsingStatus?: 'parsed' | 'manual' | 'needs_review';
  /** Confidence score of the parsing (0-1) */
  parsingConfidence?: number;
}

/**
 * Validation errors structure
 * Maps field names to error messages
 */
export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Editor API error response
 * Used for parsing API validation errors
 */
export interface EditorApiErrorResponse {
  validation_errors: Record<string, string>;
  code: string;
}

/**
 * Editor state interface
 * Represents the complete state managed by the editor context
 */
export interface WorkoutEditorState {
  /** Current workout being edited */
  workout: WorkoutEditorData;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Whether data is being loaded */
  isLoading: boolean;
  /** Any validation errors that should be displayed */
  validationErrors: ValidationErrors;
  /** Original workout data for comparison and reset functionality */
  originalWorkout?: WorkoutEditorData;
}

/**
 * Convert GeneratedWorkout to editor format
 * 
 * @deprecated This conversion function will be removed in SPRINT PLAN Story 3 & 5
 * As per SPRINT PLAN: "Remove data conversion calls" and "No data transformation layers"
 * Future: Use direct WordPress response format parsing instead
 * 
 * @param workout - The generated workout to convert
 * @param postId - Optional post ID if the workout is already saved (legacy parameter)
 * @returns The workout in editor format
 */
export function convertToEditorFormat(workout: GeneratedWorkout, postId?: number): WorkoutEditorData {
  // Extract postId from workout.id or use provided postId parameter
  const resolvedPostId = workout.id ? Number(workout.id) : postId;
  
  // Extract exercises from all workout sections
  const exercises: EditorExercise[] = [];
  let totalDuration = 0;
  
  // Helper function to check if exercise is SetsExercise
  const isSetsExercise = (exercise: Exercise): exercise is SetsExercise => {
    return 'sets' in exercise && 'reps' in exercise;
  };
  
  // Helper function to check if exercise is TimedExercise
  const isTimedExercise = (exercise: Exercise): exercise is TimedExercise => {
    return 'duration' in exercise;
  };
  
  // FIRST: Check if workout has direct exercises array (new format)
  if (workout.exercises && Array.isArray(workout.exercises)) {
    workout.exercises.forEach((exercise) => {
      if (isSetsExercise(exercise)) {
        exercises.push({
          id: exercise.id || `${exercises.length + 1}`,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          notes: exercise.description || exercise.notes || ''
        });
      } else if (isTimedExercise(exercise)) {
        // Convert timed exercises to sets format for editor
        exercises.push({
          id: exercise.id || `${exercises.length + 1}`,
          name: exercise.name,
          sets: 1,
          reps: exercise.duration, // Use duration as reps
          notes: exercise.description || exercise.notes || ''
        });
        
        // Add to total duration if it's a number
        const durationNum = parseInt(exercise.duration);
        if (!isNaN(durationNum)) {
          totalDuration += durationNum;
        }
      }
    });
  }
  
  // FALLBACK: Extract from sections if exercises array is empty
  if (exercises.length === 0 && workout.sections && Array.isArray(workout.sections)) {
    workout.sections.forEach((section) => {
      if (section.exercises && Array.isArray(section.exercises)) {
        section.exercises.forEach((exercise) => {
          if (isSetsExercise(exercise)) {
            exercises.push({
              id: exercise.id || `section-${exercises.length + 1}`,
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              notes: exercise.description || exercise.notes || ''
            });
          } else if (isTimedExercise(exercise)) {
            exercises.push({
              id: exercise.id || `section-${exercises.length + 1}`,
              name: exercise.name,
              sets: 1,
              reps: exercise.duration,
              notes: exercise.description || exercise.notes || ''
            });
            
            const durationNum = parseInt(exercise.duration);
            if (!isNaN(durationNum)) {
              totalDuration += durationNum;
            }
          }
        });
      }
    });
  }
  
  return {
    postId: resolvedPostId,
    title: workout.title || '',
    difficulty: workout.difficulty || 'intermediate',
    duration: workout.duration || totalDuration || 30,
    equipment: workout.equipment || [],
    goals: workout.goals || [],
    exercises,
    notes: workout.notes || workout.description || '',
    lastModified: workout.lastModified || new Date().toISOString(),
    version: workout.version
  };
} 