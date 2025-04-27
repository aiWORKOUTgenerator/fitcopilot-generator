/**
 * API Types for the Workout Generator feature
 * 
 * Contains type definitions for API requests and responses
 */

/**
 * Request payload for generating a workout
 */
export interface WorkoutRequest {
  specific_request: string;
  duration?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string[];
  goals?: string;
  restrictions?: string;
}

/**
 * Exercise information within a workout
 */
export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: string;
  description: string;
}

/**
 * Warmup or cooldown activity within a workout
 */
export interface Activity {
  name: string;
  duration: string;
  description: string;
}

/**
 * Structure of a complete workout
 */
export interface WorkoutContent {
  title: string;
  description: string;
  warmup: Activity[];
  exercises: Exercise[];
  cooldown: Activity[];
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

/**
 * OpenAI log entry
 */
export interface OpenAILogEntry {
  id: string;
  timestamp: string;
  prompt: string;
  response: string;
  tokens_used: number;
  model: string;
}

/**
 * Workout history item
 */
export interface WorkoutHistoryItem {
  id: number;
  title: string;
  date_created: string;
  date_completed?: string;
  completed: boolean;
  duration: number;
  difficulty: string;
  equipment: string[];
} 