/**
 * WorkoutValidator Service
 * 
 * Validates workout data integrity and provides validation utilities.
 * Created during Week 1 Foundation Sprint.
 */

import { VALIDATION_CONSTANTS, ERROR_MESSAGES } from '../../constants/workoutConstants';
import type { DisplayWorkout } from './WorkoutTransformer';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExerciseValidationResult {
  isValid: boolean;
  errors: string[];
  exerciseIndex?: number;
}

export class WorkoutValidator {
  /**
   * Validate a complete workout object
   * 
   * @param workout - Workout object to validate
   * @returns Validation result with errors and warnings
   */
  static validateWorkout(workout: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Check if workout exists
      if (!workout) {
        result.errors.push('Workout object is null or undefined');
        result.isValid = false;
        return result;
      }

      // Validate required fields
      this.validateRequiredFields(workout, result);
      
      // Validate field formats and values
      this.validateFieldFormats(workout, result);
      
      // Validate exercises
      this.validateExercises(workout, result);
      
      // Validate metadata
      this.validateMetadata(workout, result);

      // Set overall validity
      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Validation error: ${error.message}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validate required fields are present
   * 
   * @param workout - Workout to validate
   * @param result - Validation result to update
   */
  private static validateRequiredFields(workout: any, result: ValidationResult): void {
    const requiredFields = ['id', 'title'];
    
    for (const field of requiredFields) {
      if (workout[field] === undefined || workout[field] === null) {
        result.errors.push(`Missing required field: ${field}`);
      }
    }

    // Check for empty strings
    if (typeof workout.title === 'string' && workout.title.trim().length === 0) {
      result.errors.push('Title cannot be empty');
    }
  }

  /**
   * Validate field formats and value ranges
   * 
   * @param workout - Workout to validate
   * @param result - Validation result to update
   */
  private static validateFieldFormats(workout: any, result: ValidationResult): void {
    // Validate title length
    if (typeof workout.title === 'string') {
      if (workout.title.length < VALIDATION_CONSTANTS.MIN_WORKOUT_TITLE_LENGTH) {
        result.errors.push(`Title too short (minimum ${VALIDATION_CONSTANTS.MIN_WORKOUT_TITLE_LENGTH} characters)`);
      }
      if (workout.title.length > VALIDATION_CONSTANTS.MAX_WORKOUT_TITLE_LENGTH) {
        result.errors.push(`Title too long (maximum ${VALIDATION_CONSTANTS.MAX_WORKOUT_TITLE_LENGTH} characters)`);
      }
    }

    // Validate description length
    if (workout.description && typeof workout.description === 'string') {
      if (workout.description.length > VALIDATION_CONSTANTS.MAX_WORKOUT_DESCRIPTION_LENGTH) {
        result.errors.push(`Description too long (maximum ${VALIDATION_CONSTANTS.MAX_WORKOUT_DESCRIPTION_LENGTH} characters)`);
      }
    }

    // Validate duration
    if (workout.duration !== undefined) {
      if (typeof workout.duration !== 'number' || isNaN(workout.duration)) {
        result.errors.push('Duration must be a valid number');
      } else {
        if (workout.duration < VALIDATION_CONSTANTS.MIN_DURATION_MINUTES) {
          result.errors.push(`Duration too short (minimum ${VALIDATION_CONSTANTS.MIN_DURATION_MINUTES} minutes)`);
        }
        if (workout.duration > VALIDATION_CONSTANTS.MAX_DURATION_MINUTES) {
          result.errors.push(`Duration too long (maximum ${VALIDATION_CONSTANTS.MAX_DURATION_MINUTES} minutes)`);
        }
      }
    }

    // Validate difficulty
    if (workout.difficulty !== undefined) {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      if (!validDifficulties.includes(workout.difficulty)) {
        result.errors.push(`Invalid difficulty level: ${workout.difficulty}`);
      }
    }

    // Validate rating
    if (workout.rating !== undefined) {
      if (typeof workout.rating !== 'number' || 
          workout.rating < VALIDATION_CONSTANTS.MIN_RATING || 
          workout.rating > VALIDATION_CONSTANTS.MAX_RATING) {
        result.errors.push(`Rating must be between ${VALIDATION_CONSTANTS.MIN_RATING} and ${VALIDATION_CONSTANTS.MAX_RATING}`);
      }
    }

    // Validate dates
    this.validateDates(workout, result);
  }

  /**
   * Validate date fields
   * 
   * @param workout - Workout to validate
   * @param result - Validation result to update
   */
  private static validateDates(workout: any, result: ValidationResult): void {
    const dateFields = ['createdAt', 'created_at', 'updatedAt', 'updated_at', 'completedAt'];
    
    for (const field of dateFields) {
      if (workout[field] !== undefined) {
        const date = new Date(workout[field]);
        if (isNaN(date.getTime())) {
          result.errors.push(`Invalid date format for ${field}: ${workout[field]}`);
        } else {
          // Check for unreasonable dates
          const now = new Date();
          const minDate = new Date('2020-01-01'); // Reasonable minimum date
          const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year in future
          
          if (date < minDate) {
            result.warnings.push(`${field} seems too old: ${workout[field]}`);
          }
          if (date > maxDate) {
            result.warnings.push(`${field} is in the future: ${workout[field]}`);
          }
        }
      }
    }
  }

  /**
   * Validate exercises array
   * 
   * @param workout - Workout to validate
   * @param result - Validation result to update
   */
  private static validateExercises(workout: any, result: ValidationResult): void {
    if (!workout.exercises) {
      result.warnings.push('No exercises array found');
      return;
    }

    if (!Array.isArray(workout.exercises)) {
      result.errors.push('Exercises must be an array');
      return;
    }

    if (workout.exercises.length === 0) {
      result.warnings.push('Workout has no exercises');
      return;
    }

    // Validate individual exercises
    workout.exercises.forEach((exercise: any, index: number) => {
      const exerciseResult = this.validateExercise(exercise, index);
      if (!exerciseResult.isValid) {
        result.errors.push(...exerciseResult.errors);
      }
    });
  }

  /**
   * Validate individual exercise
   * 
   * @param exercise - Exercise to validate
   * @param index - Exercise index in array
   * @returns Exercise validation result
   */
  static validateExercise(exercise: any, index?: number): ExerciseValidationResult {
    const result: ExerciseValidationResult = {
      isValid: true,
      errors: [],
      exerciseIndex: index
    };

    if (!exercise) {
      result.errors.push(`Exercise ${index !== undefined ? index + 1 : ''} is null or undefined`);
      result.isValid = false;
      return result;
    }

    // Check for required exercise fields
    if (!exercise.name || typeof exercise.name !== 'string' || exercise.name.trim().length === 0) {
      result.errors.push(`Exercise ${index !== undefined ? index + 1 : ''} missing or invalid name`);
    }

    // Validate exercise has either sets/reps or duration
    const hasSetsReps = (exercise.sets && exercise.reps) || exercise.repetitions;
    const hasDuration = exercise.duration && typeof exercise.duration === 'number';
    
    if (!hasSetsReps && !hasDuration) {
      result.warnings.push(`Exercise ${index !== undefined ? index + 1 : ''} (${exercise.name}) has no sets/reps or duration`);
    }

    // Validate sets and reps if present
    if (exercise.sets !== undefined) {
      if (typeof exercise.sets !== 'number' || exercise.sets < 1 || exercise.sets > 50) {
        result.errors.push(`Exercise ${index !== undefined ? index + 1 : ''} has invalid sets: ${exercise.sets}`);
      }
    }

    if (exercise.reps !== undefined) {
      if (typeof exercise.reps !== 'number' || exercise.reps < 1 || exercise.reps > 1000) {
        result.errors.push(`Exercise ${index !== undefined ? index + 1 : ''} has invalid reps: ${exercise.reps}`);
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate workout metadata
   * 
   * @param workout - Workout to validate
   * @param result - Validation result to update
   */
  private static validateMetadata(workout: any, result: ValidationResult): void {
    // Validate equipment array
    if (workout.equipment !== undefined) {
      if (!Array.isArray(workout.equipment)) {
        result.errors.push('Equipment must be an array');
      } else {
        // Check for valid equipment strings
        workout.equipment.forEach((eq: any, index: number) => {
          if (typeof eq !== 'string' || eq.trim().length === 0) {
            result.warnings.push(`Equipment item ${index + 1} is not a valid string`);
          }
        });
      }
    }

    // Validate tags array
    if (workout.tags !== undefined) {
      if (!Array.isArray(workout.tags)) {
        result.warnings.push('Tags should be an array');
      } else {
        workout.tags.forEach((tag: any, index: number) => {
          if (typeof tag !== 'string' || tag.trim().length === 0) {
            result.warnings.push(`Tag ${index + 1} is not a valid string`);
          }
        });
      }
    }

    // Validate boolean fields
    const booleanFields = ['isCompleted', 'isFavorite'];
    for (const field of booleanFields) {
      if (workout[field] !== undefined && typeof workout[field] !== 'boolean') {
        result.warnings.push(`${field} should be a boolean value`);
      }
    }
  }

  /**
   * Quick validation for basic workout requirements
   * 
   * @param workout - Workout to validate
   * @returns True if workout meets minimum requirements
   */
  static isValidBasicWorkout(workout: any): boolean {
    return !!(
      workout &&
      (workout.id || workout.id === 0) &&
      workout.title &&
      typeof workout.title === 'string' &&
      workout.title.trim().length > 0
    );
  }

  /**
   * Validate workout data from API response
   * 
   * @param workoutData - Raw workout data from API
   * @returns Validation result
   */
  static validateApiResponse(workoutData: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!workoutData) {
      result.errors.push('API response is empty');
      result.isValid = false;
      return result;
    }

    // Check for WordPress post structure
    if (workoutData.post_type && workoutData.post_type !== 'wg_workout') {
      result.warnings.push(`Unexpected post type: ${workoutData.post_type}`);
    }

    // Validate workout_data field if present
    if (workoutData.workout_data) {
      try {
        const parsedData = typeof workoutData.workout_data === 'string' 
          ? JSON.parse(workoutData.workout_data) 
          : workoutData.workout_data;
          
        if (!parsedData.exercises && !parsedData.sections) {
          result.warnings.push('workout_data contains no exercises or sections');
        }
      } catch (error) {
        result.errors.push(`Invalid JSON in workout_data: ${error.message}`);
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Get validation summary for debugging
   * 
   * @param workout - Workout to analyze
   * @returns Human-readable validation summary
   */
  static getValidationSummary(workout: any): string {
    const validation = this.validateWorkout(workout);
    
    const parts = [
      `Workout ${workout?.id || 'unknown'}: ${validation.isValid ? 'VALID' : 'INVALID'}`
    ];

    if (validation.errors.length > 0) {
      parts.push(`Errors: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      parts.push(`Warnings: ${validation.warnings.join(', ')}`);
    }

    return parts.join(' | ');
  }
}

export default WorkoutValidator; 