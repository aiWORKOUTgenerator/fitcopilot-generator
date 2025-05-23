/**
 * Workout Editor Types
 * 
 * Type definitions for the workout editor components and related functionality.
 * These types represent the data models used throughout the editor workflow.
 */

import { GeneratedWorkout, WorkoutDifficulty, Exercise } from './workout';

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
 * API request/response types following guidelines
 */
export interface SaveWorkoutRequest {
  /** Workout data to save */
  workout: WorkoutEditorData;
}

/**
 * Response from saving a workout
 */
export interface SaveWorkoutResponse {
  /** Saved workout data */
  workout: WorkoutEditorData;
  /** Post ID of the saved workout */
  postId: number;
}

/**
 * Convert GeneratedWorkout to editor format
 * 
 * @param workout - The generated workout to convert
 * @param postId - Optional post ID if the workout is already saved
 * @returns The workout in editor format
 */
export function convertToEditorFormat(workout: GeneratedWorkout, postId?: number): WorkoutEditorData {
  // Extract exercises from all workout sections
  const exercises: EditorExercise[] = [];
  let totalDuration = 0;
  
  // Process all sections to get exercises
  workout.sections.forEach((section, sectionIndex) => {
    // Track total duration
    totalDuration += section.duration || 0;
    
    // Process exercises in each section
    section.exercises.forEach((exercise, exerciseIndex) => {
      const exerciseId = `exercise-${sectionIndex}-${exerciseIndex}`;
      
      // Handle sets-based exercises
      if ('sets' in exercise) {
        exercises.push({
          id: exerciseId,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          notes: `${section.name}: ${exercise.description}`
        });
      }
      // Handle timed exercises (convert to sets format for editor)
      else if ('duration' in exercise) {
        exercises.push({
          id: exerciseId,
          name: exercise.name,
          sets: 1, // Default to 1 set for timed exercises
          reps: exercise.duration, // Use duration as "reps"
          notes: `${section.name} (Timed): ${exercise.description}`
        });
      }
    });
  });
  
  // If no exercises were found, log for debugging
  if (exercises.length === 0) {
    console.warn('No exercises were extracted from the workout:', workout);
  }
  
  return {
    title: workout.title,
    difficulty: workout.difficulty || 'intermediate',
    duration: totalDuration || 30,
    equipment: workout.equipment || [],
    goals: workout.goals || [],
    exercises,
    notes: workout.notes || '',
    postId,
    lastModified: new Date().toISOString(),
    version: 1
  };
} 