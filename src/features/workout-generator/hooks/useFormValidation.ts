/**
 * useFormValidation hook
 * 
 * Provides form validation functions for the workout generator
 */
import { useCallback, useState } from 'react';
import { WorkoutFormParams } from '../types/workout';
import { validateWorkoutForm, ValidationErrors, isWorkoutFormValid } from '../domain/validators';

/**
 * Hook for form validation
 * 
 * @param initialValues - Initial form values
 * @returns Form validation utilities
 */
export function useFormValidation(initialValues: Partial<WorkoutFormParams> = {}) {
  const [errors, setErrors] = useState<ValidationErrors | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Validate the entire form
   * 
   * @param values - Form values to validate
   * @returns Whether the form is valid
   */
  const validateForm = useCallback((values: Partial<WorkoutFormParams> = initialValues): boolean => {
    const validationErrors = validateWorkoutForm(values);
    setErrors(validationErrors);
    return validationErrors === null;
  }, [initialValues]);

  /**
   * Mark a field as touched
   * 
   * @param field - Field name to mark as touched
   */
  const touchField = useCallback((field: keyof WorkoutFormParams) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  /**
   * Reset touch status for all fields
   */
  const resetTouched = useCallback(() => {
    setTouched({});
  }, []);

  /**
   * Check if a field has errors and has been touched
   * 
   * @param field - Field name to check
   * @returns Whether the field has an error and has been touched
   */
  const hasFieldError = useCallback((field: keyof WorkoutFormParams): boolean => {
    return Boolean(touched[field] && errors && errors[field]);
  }, [touched, errors]);

  /**
   * Get the error message for a field
   * 
   * @param field - Field name to get error for
   * @returns Error message or undefined
   */
  const getFieldError = useCallback((field: keyof WorkoutFormParams): string | undefined => {
    return errors?.[field];
  }, [errors]);

  /**
   * Reset all errors
   */
  const resetErrors = useCallback(() => {
    setErrors(null);
  }, []);

  /**
   * Check if form is valid
   * 
   * @param values - Form values to check
   * @returns Whether the form is valid
   */
  const isFormValid = useCallback((values: Partial<WorkoutFormParams> = initialValues): boolean => {
    return isWorkoutFormValid(values);
  }, [initialValues]);

  return {
    errors,
    touched,
    validateForm,
    touchField,
    resetTouched,
    hasFieldError,
    getFieldError,
    resetErrors,
    isFormValid
  };
} 