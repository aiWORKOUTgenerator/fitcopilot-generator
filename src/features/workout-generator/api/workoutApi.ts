/**
 * Workout API module
 * 
 * Provides functions for interacting with the workout generation API
 */
import { apiFetch } from './client';
import { formatError } from '../utils/formatErrorMessage';
import { WorkoutData } from '../utils/workoutCache';
import { useApiRequest } from '../hooks/useApiRequest';
import { API_ENDPOINTS } from './endpoints';
import { WorkoutSection } from '../types/workout';
import { useState, useRef } from 'react';

/**
 * Types for the API client
 */
export interface WorkoutParams {
  duration: number;
  goal?: string;
  equipment?: string[];
  fitness_level?: string;
  focus_areas?: string[];
  limitations?: string[];
  [key: string]: any;
}

export interface Workout {
  id: number;
  title: string;
  description?: string;
  duration?: number;
  exercises?: Exercise[];
  equipment?: string[];
  goal?: string;
  difficulty?: string;
  created_at?: string;
  completed_at?: string | null;
  completion_data?: WorkoutCompletionData | null;
  [key: string]: any;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  rest?: number;
  description?: string;
  equipment?: string[];
  [key: string]: any;
}

export interface WorkoutCompletionData {
  rating?: number;
  note?: string;
  completed_at?: string;
  duration_actual?: number;
  [key: string]: any;
}

export interface UserProfile {
  user_id: number;
  fitness_level?: string;
  preferences?: {
    goals?: string[];
    equipment?: string[];
    focus_areas?: string[];
    limitations?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Workout form parameters type
 */
export interface WorkoutFormParams {
  duration: number;
  difficulty: string;
  goals: string;
  equipment?: string[];
  restrictions?: string;
  specific_request?: string;
  [key: string]: unknown;
}

/**
 * Generated workout type
 */
export interface GeneratedWorkout {
  title: string;
  description: string;
  exercises: WorkoutExercise[];
  calories_burned: number;
  metadata: Record<string, unknown>;
  sections: WorkoutSection[];
}

/**
 * Workout exercise type
 */
export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  rest?: number;
  description?: string;
  [key: string]: unknown;
}

/**
 * Response type for workout generation
 */
export interface WorkoutResponse {
  success: boolean;
  data: {
    workout: WorkoutData;
    post_id: number;
    job_id?: string;
  };
  message?: string;
  code?: string;
}

/**
 * Hook for generating a workout
 */
const useGenerateWorkout = () => {
  const {
    request,
    data: workout,
    error,
    isLoading,
    abort,
    reset
  } = useApiRequest<Workout>();

  const generateWorkout = async (params: WorkoutParams) => {
    return await request({
      url: API_ENDPOINTS.GENERATE,
      options: {
        method: 'POST',
        body: JSON.stringify(params)
      },
      handleUnauthorized: true
    });
  };

  return {
    generateWorkout,
    abortRequest: abort,
    resetState: reset,
    workout,
    error,
    isLoading
  };
};

/**
 * Hook for fetching all workouts
 */
const useGetWorkouts = () => {
  const {
    request,
    data: workouts,
    error,
    isLoading,
    abort,
    reset
  } = useApiRequest<Workout[]>();

  const fetchWorkouts = async () => {
    return await request({
      url: API_ENDPOINTS.WORKOUTS,
      options: { method: 'GET' },
      handleUnauthorized: true
    });
  };

  return {
    fetchWorkouts,
    abortRequest: abort,
    resetState: reset,
    workouts,
    error,
    isLoading
  };
};

/**
 * Hook for fetching a single workout by ID
 */
const useGetWorkout = () => {
  const {
    request,
    data: workout,
    error,
    isLoading,
    abort,
    reset
  } = useApiRequest<Workout>();

  const fetchWorkout = async (id: number) => {
    return await request({
      url: API_ENDPOINTS.WORKOUT(id),
      options: { method: 'GET' },
      handleUnauthorized: true
    });
  };

  return {
    fetchWorkout,
    abortRequest: abort,
    resetState: reset,
    workout,
    error,
    isLoading
  };
};

/**
 * Hook for saving a workout (create or update)
 */
const useSaveWorkout = () => {
  const {
    request,
    data: workout,
    error,
    isLoading,
    abort,
    reset
  } = useApiRequest<Workout>();

  const saveWorkout = async (workoutData: Partial<Workout>) => {
    const { id } = workoutData;
    
    if (id) {
      // Update existing workout
      return await request({
        url: API_ENDPOINTS.WORKOUT(id),
        options: {
          method: 'PUT',
          body: JSON.stringify(workoutData)
        },
        handleUnauthorized: true
      });
    } else {
      // Create new workout
      return await request({
        url: API_ENDPOINTS.WORKOUTS,
        options: {
          method: 'POST',
          body: JSON.stringify(workoutData)
        },
        handleUnauthorized: true
      });
    }
  };

  return {
    saveWorkout,
    abortRequest: abort,
    resetState: reset,
    workout,
    error,
    isLoading
  };
};

/**
 * Hook for marking a workout as completed
 */
const useCompleteWorkout = () => {
  const {
    request,
    data: response,
    error,
    isLoading,
    abort,
    reset
  } = useApiRequest<{ success: boolean }>();

  const completeWorkout = async (id: number, completionData: WorkoutCompletionData) => {
    return await request({
      url: API_ENDPOINTS.COMPLETE_WORKOUT(id),
      options: {
        method: 'POST',
        body: JSON.stringify(completionData)
      },
      handleUnauthorized: true
    });
  };

  return {
    completeWorkout,
    abortRequest: abort,
    resetState: reset,
    response,
    error,
    isLoading
  };
};

/**
 * Hook for fetching user profile
 */
const useGetProfile = () => {
  const {
    request,
    data: profile,
    error,
    isLoading,
    abort,
    reset
  } = useApiRequest<UserProfile>();

  const fetchProfile = async () => {
    return await request({
      url: API_ENDPOINTS.PROFILE,
      options: { method: 'GET' },
      handleUnauthorized: true
    });
  };

  return {
    fetchProfile,
    abortRequest: abort,
    resetState: reset,
    profile,
    error,
    isLoading
  };
};

/**
 * Hook for updating user profile
 */
const useUpdateProfile = () => {
  const {
    request,
    data: profile,
    error,
    isLoading,
    abort,
    reset
  } = useApiRequest<UserProfile>();

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    return await request({
      url: API_ENDPOINTS.PROFILE,
      options: {
        method: 'PUT',
        body: JSON.stringify(profileData)
      },
      handleUnauthorized: true
    });
  };

  return {
    updateProfile,
    abortRequest: abort,
    resetState: reset,
    profile,
    error,
    isLoading
  };
};

// Export all hooks as workoutApi object
export const workoutApi = {
  useGenerateWorkout,
  useGetWorkouts,
  useGetWorkout,
  useSaveWorkout,
  useCompleteWorkout,
  useGetProfile,
  useUpdateProfile
};

/**
 * Generate a workout using the provided parameters
 * 
 * @param params - Workout generation parameters
 * @returns Promise resolving to the generated workout
 * @throws Formatted error if the request fails
 */
export async function generateWorkout(params: WorkoutFormParams): Promise<GeneratedWorkout> {
  try {
    // Add specific_request parameter from form values if missing
    const enhancedParams = {
      ...params,
      specific_request: params.specific_request || `A ${params.difficulty} level ${params.duration}-minute workout focusing on ${params.goals}${params.restrictions ? ` with restrictions: ${params.restrictions}` : ''}`
    };

    return await apiFetch<GeneratedWorkout>(
      API_ENDPOINTS.GENERATE,
      {
        method: 'POST',
        body: JSON.stringify(enhancedParams)
      }
    );
  } catch (error) {
    throw formatError(error);
  }
}

/**
 * Generate a workout directly using OpenAI (synchronous)
 * 
 * @param specificRequest - Specific workout request text
 * @param options - Additional options for workout generation
 * @returns Promise resolving to the workout response
 * @throws Formatted error if the request fails
 */
export async function generateWorkoutDirect(
  specificRequest: string,
  options: Record<string, unknown> = {}
): Promise<WorkoutResponse> {
  try {
    const body = {
      specific_request: specificRequest,
      ...options
    };

    return await apiFetch<WorkoutResponse>(
      API_ENDPOINTS.GENERATE,
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    );
  } catch (error) {
    throw formatError(error);
  }
}

/**
 * Get a list of saved workouts
 * 
 * @returns Promise resolving to a list of workouts
 * @throws Formatted error if the request fails
 */
export async function getWorkouts(): Promise<WorkoutData[]> {
  try {
    const response = await apiFetch<{ success: boolean; data: WorkoutData[] }>(API_ENDPOINTS.WORKOUTS);
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
}

/**
 * Get a single workout by ID
 * 
 * @param id - Workout ID
 * @returns Promise resolving to the workout data
 * @throws Formatted error if the request fails
 */
export async function getWorkout(id: number): Promise<WorkoutData> {
  try {
    const response = await apiFetch<{ success: boolean; data: WorkoutData }>(API_ENDPOINTS.WORKOUT(id));
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
}

/**
 * Mark a workout as completed
 * 
 * @param id - Workout ID
 * @param completionData - Completion data like rating, notes, duration, date, etc.
 * @returns Promise resolving to the updated workout data
 * @throws Formatted error if the request fails
 */
export async function completeWorkout(
  id: number, 
  completionData: WorkoutCompletionData = {}
): Promise<WorkoutData> {
  try {
    const response = await apiFetch<{ success: boolean; data: WorkoutData }>(
      API_ENDPOINTS.COMPLETE_WORKOUT(id),
      {
        method: 'POST',
        body: JSON.stringify(completionData)
      }
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
}

/**
 * Update a workout's metadata
 * 
 * @param id - Workout ID
 * @param metadata - Metadata to update
 * @returns Promise resolving to the updated workout data
 * @throws Formatted error if the request fails
 */
export async function updateWorkout(
  id: number,
  metadata: Record<string, unknown>
): Promise<WorkoutData> {
  try {
    const response = await apiFetch<{ success: boolean; data: WorkoutData }>(
      API_ENDPOINTS.WORKOUT(id),
      {
        method: 'PUT',
        body: JSON.stringify(metadata)
      }
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
}

export interface WorkoutHistoryParams {
  page?: number;
  per_page?: number;
  status?: 'any' | 'completed' | 'pending';
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'title';
}

export interface WorkoutHistoryResponse {
  workouts: Workout[];
  total: number;
  total_pages: number;
}

/**
 * Get workout history
 * 
 * @param params - Parameters for fetching workout history
 * @returns Promise with workout history data
 */
export const getWorkoutHistory = async (params?: WorkoutHistoryParams): Promise<WorkoutHistoryResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.order) queryParams.set('order', params.order);
    if (params.orderby) queryParams.set('orderby', params.orderby);
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString 
    ? `${API_ENDPOINTS.WORKOUTS}?${queryString}`
    : API_ENDPOINTS.WORKOUTS;
  
  return await apiFetch<WorkoutHistoryResponse>(endpoint, {
    method: 'GET',
  });
};

/**
 * Delete a workout
 * 
 * @param id - ID of the workout to delete
 * @returns Promise with deletion status
 */
export const deleteWorkout = async (id: number): Promise<{ success: boolean }> => {
  return await apiFetch<{ success: boolean }>(API_ENDPOINTS.WORKOUT(id), {
    method: 'DELETE',
  });
}; 