/**
 * Workout Service
 * 
 * Provides functions for interacting with the workout API.
 * TEMPORARY: Using mock data to prevent dashboard loading issues.
 * TODO: Re-enable API client once browser compatibility issues are resolved.
 */
import { GeneratedWorkout } from '../types/workout';
// TEMPORARY: Disable API client imports to prevent browser compatibility issues
// import { apiClient, ApiError, ApiErrorCode } from '../../../common/api';

/**
 * Get a single workout by ID
 * @param id - The workout ID
 * @returns Promise with the workout data
 * TEMPORARY: Returns mock data to prevent dashboard loading issues
 */
export async function getWorkout(id: string): Promise<GeneratedWorkout> {
  console.log('TEMPORARY: getWorkout called with mock data for ID:', id);
  
  // Return mock workout data
  return {
    id: parseInt(id) || 1,
    title: 'Sample Workout',
    description: 'A sample workout for testing',
    duration: 30,
    difficulty: 'intermediate',
    exercises: [
      {
        name: 'Push-ups',
        sets: 3,
        reps: 10,
        duration: 0,
        rest: 60
      },
      {
        name: 'Squats',
        sets: 3,
        reps: 15,
        duration: 0,
        rest: 60
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Get all workouts
 * @param page - Optional page number for pagination
 * @param perPage - Optional number of workouts per page
 * @returns Promise with the workouts data
 * TEMPORARY: Returns mock data to prevent dashboard loading issues
 */
export async function getWorkouts(page = 1, perPage = 10): Promise<GeneratedWorkout[]> {
  console.log('TEMPORARY: getWorkouts called with mock data');
  
  // Return mock workouts array
  return [
    {
      id: 1,
      title: 'Morning HIIT',
      description: 'High-intensity interval training for the morning',
      duration: 20,
      difficulty: 'beginner',
      exercises: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Strength Training',
      description: 'Full body strength workout',
      duration: 45,
      difficulty: 'intermediate',
      exercises: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

/**
 * Generate a new workout
 * @param workoutRequest - The workout generation request data
 * @returns Promise with the generated workout data
 * TEMPORARY: Returns mock data to prevent dashboard loading issues
 */
export async function generateWorkout(workoutRequest: any): Promise<GeneratedWorkout> {
  console.log('TEMPORARY: generateWorkout called with mock data for request:', workoutRequest);
  
  // Return mock generated workout
  return {
    id: Date.now(), // Use timestamp as unique ID
    title: 'AI Generated Workout',
    description: 'A personalized workout generated based on your preferences',
    duration: workoutRequest?.duration || 30,
    difficulty: workoutRequest?.difficulty || 'intermediate',
    exercises: [
      {
        name: 'Jumping Jacks',
        sets: 3,
        reps: 20,
        duration: 0,
        rest: 30
      },
      {
        name: 'Push-ups',
        sets: 3,
        reps: 10,
        duration: 0,
        rest: 60
      },
      {
        name: 'Squats',
        sets: 3,
        reps: 15,
        duration: 0,
        rest: 60
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Save a workout (create or update)
 * @param workout - The workout data to save
 * @returns Promise with the saved workout data
 * TEMPORARY: Returns mock data to prevent dashboard loading issues
 */
export async function saveWorkout(workout: GeneratedWorkout): Promise<GeneratedWorkout> {
  console.log('TEMPORARY: saveWorkout called with mock data for workout:', workout.title);
  
  // Return the workout with updated timestamp
  return {
    ...workout,
    id: workout.id || Date.now(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Delete a workout
 * @param id - The workout ID to delete
 * @returns Promise indicating success
 * TEMPORARY: Returns mock success to prevent dashboard loading issues
 */
export async function deleteWorkout(id: string): Promise<boolean> {
  console.log('TEMPORARY: deleteWorkout called with mock data for ID:', id);
  
  // Always return success
  return true;
}

/**
 * Mark a workout as completed
 * @param id - The workout ID to mark as completed
 * @returns Promise with the updated workout data
 * TEMPORARY: Returns mock data to prevent dashboard loading issues
 */
export async function completeWorkout(id: string): Promise<GeneratedWorkout> {
  console.log('TEMPORARY: completeWorkout called with mock data for ID:', id);
  
  // Return mock completed workout
  return {
    id: parseInt(id) || 1,
    title: 'Completed Workout',
    description: 'This workout has been marked as completed',
    duration: 30,
    difficulty: 'intermediate',
    exercises: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
} 