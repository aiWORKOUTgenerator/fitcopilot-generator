/**
 * WorkoutData Services Index
 * 
 * Centralized exports for workout data processing services.
 * Part of Week 1 Foundation Sprint - Service Layer Organization.
 */

// Core transformation service
export { default as WorkoutTransformer } from './WorkoutTransformer';
export { WorkoutTransformer } from './WorkoutTransformer';

// Data validation service  
export { default as WorkoutValidator } from './WorkoutValidator';
export { WorkoutValidator } from './WorkoutValidator';

// Re-export key types for convenience
// Note: These will be migrated to dedicated type files in Week 1, Day 3
export type { ValidationResult } from './WorkoutValidator';

/**
 * Service Usage Examples:
 * 
 * import { WorkoutTransformer, WorkoutValidator } from './services/workoutData';
 * 
 * // Transform raw API data
 * const displayWorkout = WorkoutTransformer.transformForDisplay(rawWorkout);
 * 
 * // Validate workout data
 * const validation = WorkoutValidator.validateWorkout(rawWorkout);
 * if (!validation.isValid) {
 *   console.error('Validation errors:', validation.errors);
 * }
 * 
 * // Batch transformation
 * const displayWorkouts = WorkoutTransformer.transformMultipleForDisplay(rawWorkouts);
 */ 