/**
 * Form Validation Utilities
 * 
 * Comprehensive validation functions for workout editor forms
 * with type-safe validation rules and user-friendly error messages.
 */

import { WorkoutDifficulty } from '../../../types/workout';

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  suggestion?: string;
}

export interface FieldValidation {
  [fieldName: string]: ValidationResult;
}

export interface WorkoutValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldValidation: FieldValidation;
}

// Validation rule types
export type ValidationRule<T = any> = (value: T, context?: any) => ValidationResult;

// Common validation rules
export const ValidationRules = {
  // Required field validation
  required: (message = 'This field is required'): ValidationRule<any> => 
    (value) => ({
      isValid: value !== null && value !== undefined && value !== '',
      error: value !== null && value !== undefined && value !== '' ? undefined : message
    }),

  // String length validation
  minLength: (min: number, message?: string): ValidationRule<string> =>
    (value) => ({
      isValid: !value || value.length >= min,
      error: (!value || value.length >= min) ? undefined : 
        message || `Must be at least ${min} characters long`
    }),

  maxLength: (max: number, message?: string): ValidationRule<string> =>
    (value) => ({
      isValid: !value || value.length <= max,
      error: (!value || value.length <= max) ? undefined : 
        message || `Must be no more than ${max} characters long`
    }),

  // Number validation
  min: (min: number, message?: string): ValidationRule<number> =>
    (value) => ({
      isValid: value === null || value === undefined || value >= min,
      error: (value === null || value === undefined || value >= min) ? undefined : 
        message || `Must be at least ${min}`
    }),

  max: (max: number, message?: string): ValidationRule<number> =>
    (value) => ({
      isValid: value === null || value === undefined || value <= max,
      error: (value === null || value === undefined || value <= max) ? undefined : 
        message || `Must be no more than ${max}`
    }),

  // Pattern validation
  pattern: (regex: RegExp, message: string): ValidationRule<string> =>
    (value) => ({
      isValid: !value || regex.test(value),
      error: (!value || regex.test(value)) ? undefined : message
    }),

  // Email validation
  email: (): ValidationRule<string> =>
    ValidationRules.pattern(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address'
    ),

  // Workout-specific validations
  workoutTitle: (): ValidationRule<string> =>
    (value) => {
      if (!value || value.trim() === '') {
        return { isValid: false, error: 'Workout title is required' };
      }
      
      if (value.length < 3) {
        return { isValid: false, error: 'Title must be at least 3 characters long' };
      }
      
      if (value.length > 100) {
        return { isValid: false, error: 'Title must be no more than 100 characters long' };
      }
      
      if (value.length > 50) {
        return { 
          isValid: true, 
          warning: 'Long titles may be truncated in some views' 
        };
      }
      
      return { isValid: true };
    },

  workoutDuration: (): ValidationRule<number> =>
    (value) => {
      if (value === null || value === undefined) {
        return { isValid: false, error: 'Duration is required' };
      }
      
      if (value < 5) {
        return { isValid: false, error: 'Duration must be at least 5 minutes' };
      }
      
      if (value > 180) {
        return { isValid: false, error: 'Duration cannot exceed 180 minutes' };
      }
      
      if (value > 120) {
        return { 
          isValid: true, 
          warning: 'Very long workouts may be difficult to complete' 
        };
      }
      
      return { isValid: true };
    },

  workoutDifficulty: (): ValidationRule<WorkoutDifficulty> =>
    (value) => {
      const validDifficulties: WorkoutDifficulty[] = ['beginner', 'intermediate', 'advanced'];
      
      if (!value) {
        return { isValid: false, error: 'Please select a difficulty level' };
      }
      
      if (!validDifficulties.includes(value)) {
        return { isValid: false, error: 'Invalid difficulty level' };
      }
      
      return { isValid: true };
    },

  exerciseName: (): ValidationRule<string> =>
    (value) => {
      if (!value || value.trim() === '') {
        return { isValid: false, error: 'Exercise name is required' };
      }
      
      if (value.length < 2) {
        return { isValid: false, error: 'Exercise name must be at least 2 characters long' };
      }
      
      if (value.length > 80) {
        return { isValid: false, error: 'Exercise name must be no more than 80 characters long' };
      }
      
      return { isValid: true };
    },

  exerciseSets: (): ValidationRule<number> =>
    (value) => {
      if (value === null || value === undefined) {
        return { isValid: false, error: 'Number of sets is required' };
      }
      
      if (value < 1) {
        return { isValid: false, error: 'Must have at least 1 set' };
      }
      
      if (value > 10) {
        return { isValid: false, error: 'Cannot exceed 10 sets' };
      }
      
      if (value > 6) {
        return { 
          isValid: true, 
          warning: 'High number of sets may increase workout fatigue' 
        };
      }
      
      return { isValid: true };
    },

  exerciseReps: (): ValidationRule<string | number> =>
    (value) => {
      if (!value) {
        return { isValid: false, error: 'Reps or duration is required' };
      }
      
      // Handle string values like "8-12" or "30 seconds"
      if (typeof value === 'string') {
        if (value.trim() === '') {
          return { isValid: false, error: 'Reps or duration is required' };
        }
        
        if (value.length > 50) {
          return { isValid: false, error: 'Reps description is too long' };
        }
        
        return { isValid: true };
      }
      
      // Handle numeric values
      if (typeof value === 'number') {
        if (value < 1) {
          return { isValid: false, error: 'Must have at least 1 rep' };
        }
        
        if (value > 100) {
          return { isValid: false, error: 'Cannot exceed 100 reps' };
        }
        
        if (value > 50) {
          return { 
            isValid: true, 
            warning: 'High rep count may be challenging' 
          };
        }
      }
      
      return { isValid: true };
    },

  exerciseRestPeriod: (): ValidationRule<number> =>
    (value) => {
      // Rest period is optional
      if (value === null || value === undefined || value === 0) {
        return { isValid: true };
      }
      
      if (value < 0) {
        return { isValid: false, error: 'Rest period cannot be negative' };
      }
      
      if (value > 600) { // 10 minutes
        return { isValid: false, error: 'Rest period cannot exceed 10 minutes' };
      }
      
      if (value > 300) { // 5 minutes
        return { 
          isValid: true, 
          warning: 'Long rest periods may extend workout duration significantly' 
        };
      }
      
      return { isValid: true };
    }
};

/**
 * Validates a complete workout object
 */
export function validateWorkout(workout: any): WorkoutValidation {
  const fieldValidation: FieldValidation = {};
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate title
  const titleResult = ValidationRules.workoutTitle()(workout.title);
  fieldValidation.title = titleResult;
  if (!titleResult.isValid && titleResult.error) {
    errors.push(titleResult.error);
  }
  if (titleResult.warning) {
    warnings.push(titleResult.warning);
  }

  // Validate duration
  const durationResult = ValidationRules.workoutDuration()(workout.duration);
  fieldValidation.duration = durationResult;
  if (!durationResult.isValid && durationResult.error) {
    errors.push(durationResult.error);
  }
  if (durationResult.warning) {
    warnings.push(durationResult.warning);
  }

  // Validate difficulty
  const difficultyResult = ValidationRules.workoutDifficulty()(workout.difficulty);
  fieldValidation.difficulty = difficultyResult;
  if (!difficultyResult.isValid && difficultyResult.error) {
    errors.push(difficultyResult.error);
  }

  // Validate exercises
  if (!workout.exercises || workout.exercises.length === 0) {
    errors.push('At least one exercise is required');
    fieldValidation.exercises = { isValid: false, error: 'At least one exercise is required' };
  } else {
    // Validate each exercise
    workout.exercises.forEach((exercise: any, index: number) => {
      const exerciseErrors: string[] = [];
      
      const nameResult = ValidationRules.exerciseName()(exercise.name);
      if (!nameResult.isValid && nameResult.error) {
        exerciseErrors.push(`Exercise ${index + 1}: ${nameResult.error}`);
      }
      
      const setsResult = ValidationRules.exerciseSets()(exercise.sets);
      if (!setsResult.isValid && setsResult.error) {
        exerciseErrors.push(`Exercise ${index + 1}: ${setsResult.error}`);
      }
      
      const repsResult = ValidationRules.exerciseReps()(exercise.reps);
      if (!repsResult.isValid && repsResult.error) {
        exerciseErrors.push(`Exercise ${index + 1}: ${repsResult.error}`);
      }
      
      errors.push(...exerciseErrors);
    });
    
    fieldValidation.exercises = { isValid: errors.length === 0 };
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fieldValidation
  };
}

/**
 * Validates a single field with the given rules
 */
export function validateField<T>(
  value: T, 
  rules: ValidationRule<T>[], 
  context?: any
): ValidationResult {
  for (const rule of rules) {
    const result = rule(value, context);
    if (!result.isValid) {
      return result;
    }
    // Return first warning or suggestion if found
    if (result.warning || result.suggestion) {
      return result;
    }
  }
  
  return { isValid: true };
}

/**
 * Creates a validation schema for object validation
 */
export function createValidationSchema<T extends Record<string, any>>(
  schema: { [K in keyof T]?: ValidationRule<T[K]>[] }
) {
  return function validateObject(obj: T): { [K in keyof T]?: ValidationResult } {
    const results: { [K in keyof T]?: ValidationResult } = {};
    
    for (const [key, rules] of Object.entries(schema)) {
      if (rules && Array.isArray(rules)) {
        results[key as keyof T] = validateField(obj[key as keyof T], rules, obj);
      }
    }
    
    return results;
  };
}

/**
 * Utility to check if any validation results contain errors
 */
export function hasValidationErrors(results: Record<string, ValidationResult>): boolean {
  return Object.values(results).some(result => !result.isValid);
}

/**
 * Utility to extract all error messages from validation results
 */
export function getValidationErrors(results: Record<string, ValidationResult>): string[] {
  return Object.values(results)
    .filter(result => !result.isValid && result.error)
    .map(result => result.error!);
}

/**
 * Utility to extract all warning messages from validation results
 */
export function getValidationWarnings(results: Record<string, ValidationResult>): string[] {
  return Object.values(results)
    .filter(result => result.warning)
    .map(result => result.warning!);
} 