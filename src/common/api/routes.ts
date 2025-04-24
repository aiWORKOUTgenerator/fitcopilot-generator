/**
 * API route constants for FitCopilot
 * 
 * All API routes are defined here as constants to ensure consistency
 * and make updates easier if the API version or paths change.
 */

// API version
export const API_VERSION = 'v1';

// Base paths
export const GENERATE_PATH = '/generate';
export const WORKOUTS_PATH = '/workouts';
export const PROFILE_PATH = '/profile';

/**
 * Generate a workout via AI
 */
export const GENERATE_WORKOUT = GENERATE_PATH;

/**
 * Get a list of workouts
 */
export const GET_WORKOUTS = WORKOUTS_PATH;

/**
 * Get a single workout by ID
 * 
 * @param id The workout ID
 */
export const GET_WORKOUT = (id: number): string => `${WORKOUTS_PATH}/${id}`;

/**
 * Update a workout's metadata
 * 
 * @param id The workout ID
 */
export const UPDATE_WORKOUT = (id: number): string => `${WORKOUTS_PATH}/${id}`;

/**
 * Mark a workout as completed
 * 
 * @param id The workout ID
 */
export const COMPLETE_WORKOUT = (id: number): string => `${WORKOUTS_PATH}/${id}/complete`;

/**
 * Get user profile data
 */
export const GET_PROFILE = PROFILE_PATH;

/**
 * Update user profile data
 */
export const UPDATE_PROFILE = PROFILE_PATH; 