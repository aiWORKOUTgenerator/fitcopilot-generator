/**
 * Validators for the workout generator
 */
import { WorkoutFormParams } from '../types/workout';

/**
 * Type for validation errors
 */
export type ValidationErrors = {
  [key in keyof WorkoutFormParams]?: string;
};

/**
 * Validates the workout form
 * 
 * @param formValues - The form values to validate
 * @returns Validation errors or null if valid
 */
export function validateWorkoutForm(formValues: Partial<WorkoutFormParams>): ValidationErrors | null {
  const errors: ValidationErrors = {};

  // Validate required fields
  if (!formValues.goals) {
    errors.goals = 'Please select a fitness goal';
  }

  if (!formValues.difficulty) {
    errors.difficulty = 'Please select your experience level';
  }

  if (!formValues.duration) {
    errors.duration = 'Please select a workout duration';
  }
  
  // Additional validation for restrictions
  if (formValues.restrictions && formValues.restrictions.length > 500) {
    errors.restrictions = 'Restrictions text is too long, please keep it under 500 characters';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Checks if the workout form is valid
 * 
 * @param formValues - The form values to check
 * @returns Whether the form is valid
 */
export function isWorkoutFormValid(formValues: Partial<WorkoutFormParams>): boolean {
  return Boolean(
    formValues.goals &&
    formValues.difficulty &&
    formValues.duration
  );
} 