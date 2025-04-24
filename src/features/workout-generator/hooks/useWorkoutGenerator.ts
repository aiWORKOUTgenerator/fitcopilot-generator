/**
 * Hook for generating workout plans
 */
import { useState } from 'react';
import { apiFetch } from '../../../utils/api';

export interface WorkoutRequest {
  /** User's fitness goal */
  goal: string;
  /** User's experience level */
  experienceLevel: string;
  /** Desired workout duration in minutes */
  duration: string;
  /** Equipment available to the user */
  equipment: string[];
  /** Any restrictions or limitations */
  restrictions?: string;
}

export interface Workout {
  /** Unique identifier for the workout */
  id: string;
  /** Title of the workout */
  title: string;
  /** Brief description of the workout */
  description: string;
  /** When the workout was created */
  createdAt: string;
  /** Detailed content of the workout */
  content: string;
  /** Metadata for the workout */
  meta: {
    /** User's fitness goal */
    goal: string;
    /** User's experience level */
    experienceLevel: string;
    /** Duration of the workout in minutes */
    duration: string;
    /** Equipment used in the workout */
    equipment: string[];
    /** Any restrictions considered */
    restrictions?: string;
  };
}

/**
 * Custom hook for generating workout plans
 * 
 * @returns {Object} Methods and state for workout generation
 */
export const useWorkoutGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedWorkout, setGeneratedWorkout] = useState<Workout | null>(null);

  /**
   * Generate a workout plan based on user input
   * 
   * @param {WorkoutRequest} request - Workout generation parameters
   * @returns {Promise<Workout|null>} Generated workout or null on error
   */
  const generateWorkout = async (request: WorkoutRequest): Promise<Workout | null> => {
    setIsGenerating(true);
    setError(null);
    setGeneratedWorkout(null);
    
    try {
      const response = await apiFetch<Workout>({
        path: '/workouts/generate',
        method: 'POST',
        data: request,
      });
      
      setGeneratedWorkout(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to generate workout. Please try again.';
      
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Reset the workout generation state
   */
  const reset = () => {
    setGeneratedWorkout(null);
    setError(null);
  };

  return {
    generateWorkout,
    isGenerating,
    generatedWorkout,
    error,
    reset,
  };
}; 