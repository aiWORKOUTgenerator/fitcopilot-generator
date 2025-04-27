/**
 * Centralized state management types
 * 
 * This file contains type definitions for state management across the feature.
 */

/**
 * State Types for the Workout Generator feature
 * 
 * Contains state-related type definitions for the workout generator
 */
import { WorkoutContent, OpenAILogEntry } from './api';
import { GenerationStatus } from '../context/WorkoutGeneratorContext';

/**
 * Interface for the user's specific workout request
 */
export interface WorkoutRequest {
  specificRequest: string;
  duration?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string[];
  goals?: string;
  restrictions?: string;
}

/**
 * Interface for the main workout state
 */
export interface WorkoutState {
  specificRequest: string;
  status: GenerationStatus;
  workoutId?: number;
  content?: WorkoutContent;
  error?: string;
  showLogs: boolean;
  logs: OpenAILogEntry[];
  profile: UserProfileState;
}

/**
 * Interface for user profile state
 */
export interface UserProfileState {
  isComplete: boolean;
  needsPrompt: boolean;
  fitnessLevel?: string;
  goals?: string[];
  limitations?: string;
  preferredEquipment?: string[];
}

/**
 * Initial state for the workout generator
 */
export const initialWorkoutState: WorkoutState = {
  specificRequest: '',
  status: 'idle',
  workoutId: undefined,
  content: undefined,
  error: undefined,
  showLogs: false,
  logs: [],
  profile: {
    isComplete: false,
    needsPrompt: true
  }
}; 