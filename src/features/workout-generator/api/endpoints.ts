/**
 * API Endpoints for the Workout Generator feature
 * 
 * Constants for all endpoints used in the feature to ensure consistency
 */

// API namespace - MUST match exactly what's defined in WorkoutEndpoints.php
const API_NAMESPACE = '/wp-json/fitcopilot/v1';

// Export endpoints as constants
export const API_ENDPOINTS = {
  // Workout generation
  GENERATE: `${API_NAMESPACE}/generate`,
  
  // Workout management
  WORKOUTS: `${API_NAMESPACE}/workouts`,
  WORKOUT: (id: number) => `${API_NAMESPACE}/workouts/${id}`,
  COMPLETE_WORKOUT: (id: number) => `${API_NAMESPACE}/workouts/${id}/complete`,
  
  // User profile
  PROFILE: `${API_NAMESPACE}/profile`,
}; 