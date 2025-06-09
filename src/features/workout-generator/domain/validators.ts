/**
 * Validators for the workout generator
 */
import { WorkoutFormParams, SessionSpecificInputs } from '../types/workout';

/**
 * Type for validation errors
 */
export type ValidationErrors = {
  [key in keyof WorkoutFormParams]?: string;
};

/**
 * Type for session input validation errors
 */
export type SessionInputValidationErrors = {
  [key in keyof SessionSpecificInputs]?: string;
};

/**
 * Type for validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: SessionInputValidationErrors;
}

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

/**
 * Validate session inputs with extended WorkoutGrid fields
 * 
 * @param sessionInputs - The session inputs to validate
 * @returns Validation result with errors if any
 */
export function validateSessionInputs(sessionInputs?: SessionSpecificInputs): ValidationResult {
  const errors: SessionInputValidationErrors = {};
  
  if (!sessionInputs) {
    return { isValid: true, errors };
  }
  
  // Validate existing fields (unchanged)
  if (sessionInputs.energyLevel && (sessionInputs.energyLevel < 1 || sessionInputs.energyLevel > 5)) {
    errors.energyLevel = 'Energy level must be between 1 and 5';
  }
  
  if (sessionInputs.moodLevel && (sessionInputs.moodLevel < 1 || sessionInputs.moodLevel > 5)) {
    errors.moodLevel = 'Mood level must be between 1 and 5';
  }
  
  if (sessionInputs.sleepQuality && (sessionInputs.sleepQuality < 1 || sessionInputs.sleepQuality > 5)) {
    errors.sleepQuality = 'Sleep quality must be between 1 and 5';
  }
  
  if (sessionInputs.availableTime && sessionInputs.availableTime < 5) {
    errors.availableTime = 'Available time must be at least 5 minutes';
  }
  
  // Validate new WorkoutGrid fields
  if (sessionInputs.dailyIntensityLevel && (sessionInputs.dailyIntensityLevel < 1 || sessionInputs.dailyIntensityLevel > 6)) {
    errors.dailyIntensityLevel = 'Daily intensity level must be between 1 and 6';
  }
  
  if (sessionInputs.timeConstraintsToday && sessionInputs.timeConstraintsToday < 5) {
    errors.timeConstraintsToday = 'Time constraints must be at least 5 minutes';
  }
  
  const validFocusOptions = ['fat-burning', 'muscle-building', 'endurance', 'strength', 'flexibility', 'general-fitness'];
  if (sessionInputs.todaysFocus && !validFocusOptions.includes(sessionInputs.todaysFocus)) {
    errors.todaysFocus = 'Invalid focus option selected';
  }
  
  const validEnvironments = ['gym', 'home', 'outdoors', 'travel', 'limited-space'];
  if (sessionInputs.environment && !validEnvironments.includes(sessionInputs.environment)) {
    errors.environment = 'Invalid environment selected';
  }
  
  if (sessionInputs.locationToday && !validEnvironments.includes(sessionInputs.locationToday)) {
    errors.locationToday = 'Invalid location selected';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 