/**
 * Workout Validation Hook
 * 
 * React hook that provides real-time validation functionality using WorkoutValidationService.
 * Handles field-level and form-level validation with suggestions and contextual feedback.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  WorkoutValidationService,
  type FieldSuggestion,
  type EnhancedValidationResult,
  type ValidationServiceOptions
} from '../services';
import {
  type ValidationResult,
  type WorkoutValidation,
  type FieldValidation
} from '../utils';

export interface UseWorkoutValidationOptions extends Partial<ValidationServiceOptions> {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface UseWorkoutValidationReturn {
  // Validation results
  workoutValidation: WorkoutValidation & {
    suggestions: { [field: string]: FieldSuggestion[] };
    contextualInfo: string[];
  };
  fieldValidations: { [fieldName: string]: EnhancedValidationResult };
  
  // Validation state
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  isValidating: boolean;
  
  // Actions
  validateField: (fieldName: string, value: any, context?: any) => EnhancedValidationResult;
  validateWorkout: (workout: any) => void;
  clearValidation: (fieldName?: string) => void;
  getSuggestions: (fieldName: string, value: any, context?: any) => FieldSuggestion[];
  
  // Configuration
  updateOptions: (options: Partial<ValidationServiceOptions>) => void;
  enable: () => void;
  disable: () => void;
}

/**
 * Hook for workout validation with real-time feedback
 */
export function useWorkoutValidation(
  workout: any,
  options: UseWorkoutValidationOptions = {}
): UseWorkoutValidationReturn {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    enableCaching = true,
    cacheTimeToLive = 5000,
    enableSuggestions = true,
    contextualValidation = true
  } = options;

  // State management
  const [workoutValidation, setWorkoutValidation] = useState<WorkoutValidation & {
    suggestions: { [field: string]: FieldSuggestion[] };
    contextualInfo: string[];
  }>({
    isValid: true,
    errors: [],
    warnings: [],
    fieldValidation: {},
    suggestions: {},
    contextualInfo: []
  });

  const [fieldValidations, setFieldValidations] = useState<{ [fieldName: string]: EnhancedValidationResult }>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  // Service instance ref
  const serviceRef = useRef<WorkoutValidationService | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized service options
  const serviceOptions = useMemo(() => ({
    enableCaching,
    cacheTimeToLive,
    enableSuggestions,
    contextualValidation
  }), [enableCaching, cacheTimeToLive, enableSuggestions, contextualValidation]);

  // Initialize service
  useEffect(() => {
    serviceRef.current = new WorkoutValidationService(serviceOptions);
  }, [serviceOptions]);

  // Debounced validation function
  const debouncedValidateWorkout = useCallback((workoutData: any) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (!serviceRef.current || !isEnabled) return;

      setIsValidating(true);
      try {
        const result = serviceRef.current.validateWorkoutEnhanced(workoutData);
        setWorkoutValidation(result);
      } catch (error) {
        console.error('Workout validation error:', error);
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);
  }, [debounceMs, isEnabled]);

  // Validate workout when it changes
  useEffect(() => {
    if (validateOnChange && workout && isEnabled) {
      debouncedValidateWorkout(workout);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [workout, validateOnChange, debouncedValidateWorkout, isEnabled]);

  // Actions
  const validateField = useCallback((
    fieldName: string, 
    value: any, 
    context?: any
  ): EnhancedValidationResult => {
    if (!serviceRef.current || !isEnabled) {
      return { isValid: true };
    }

    try {
      const result = serviceRef.current.validateFieldEnhanced(fieldName, value, context);
      
      // Update field validations state
      setFieldValidations(prev => ({
        ...prev,
        [fieldName]: result
      }));

      return result;
    } catch (error) {
      console.error(`Field validation error for ${fieldName}:`, error);
      return {
        isValid: false,
        error: 'Validation error occurred'
      };
    }
  }, [isEnabled]);

  const validateWorkoutAction = useCallback((workoutData: any) => {
    if (!serviceRef.current || !isEnabled) return;

    setIsValidating(true);
    try {
      const result = serviceRef.current.validateWorkoutEnhanced(workoutData);
      setWorkoutValidation(result);
    } catch (error) {
      console.error('Workout validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [isEnabled]);

  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setFieldValidations(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    } else {
      setFieldValidations({});
      setWorkoutValidation({
        isValid: true,
        errors: [],
        warnings: [],
        fieldValidation: {},
        suggestions: {},
        contextualInfo: []
      });
    }
  }, []);

  const getSuggestions = useCallback((
    fieldName: string, 
    value: any, 
    context?: any
  ): FieldSuggestion[] => {
    if (!serviceRef.current) return [];

    try {
      return serviceRef.current.getSuggestions(fieldName, value, context);
    } catch (error) {
      console.error(`Error getting suggestions for ${fieldName}:`, error);
      return [];
    }
  }, []);

  const updateOptions = useCallback((newOptions: Partial<ValidationServiceOptions>) => {
    if (serviceRef.current) {
      serviceRef.current.updateOptions(newOptions);
    }
  }, []);

  const enable = useCallback(() => {
    setIsEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
    clearValidation();
  }, [clearValidation]);

  // Computed values
  const isValid = useMemo(() => 
    workoutValidation.isValid && !Object.values(fieldValidations).some(f => !f.isValid),
    [workoutValidation.isValid, fieldValidations]
  );

  const hasErrors = useMemo(() => 
    workoutValidation.errors.length > 0 || Object.values(fieldValidations).some(f => !f.isValid),
    [workoutValidation.errors, fieldValidations]
  );

  const hasWarnings = useMemo(() => 
    workoutValidation.warnings.length > 0 || Object.values(fieldValidations).some(f => f.warning),
    [workoutValidation.warnings, fieldValidations]
  );

  return {
    workoutValidation,
    fieldValidations,
    isValid,
    hasErrors,
    hasWarnings,
    isValidating,
    validateField,
    validateWorkout: validateWorkoutAction,
    clearValidation,
    getSuggestions,
    updateOptions,
    enable,
    disable
  };
}

/**
 * Hook for individual field validation
 */
export function useFieldValidation(
  fieldName: string,
  value: any,
  context?: any,
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounceMs?: number;
  } = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
  } = options;

  const [validation, setValidation] = useState<EnhancedValidationResult>({ isValid: true });
  const [isValidating, setIsValidating] = useState(false);
  const serviceRef = useRef<WorkoutValidationService | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize service
  useEffect(() => {
    serviceRef.current = new WorkoutValidationService();
  }, []);

  // Debounced validation
  const debouncedValidate = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (!serviceRef.current) return;

      setIsValidating(true);
      try {
        const result = serviceRef.current.validateFieldEnhanced(fieldName, value, context);
        setValidation(result);
      } catch (error) {
        console.error(`Field validation error for ${fieldName}:`, error);
        setValidation({
          isValid: false,
          error: 'Validation error occurred'
        });
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);
  }, [fieldName, value, context, debounceMs]);

  // Validate on change
  useEffect(() => {
    if (validateOnChange) {
      debouncedValidate();
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [validateOnChange, debouncedValidate]);

  // Manual validation trigger
  const validate = useCallback(() => {
    if (!serviceRef.current) return;

    setIsValidating(true);
    try {
      const result = serviceRef.current.validateFieldEnhanced(fieldName, value, context);
      setValidation(result);
    } catch (error) {
      console.error(`Field validation error for ${fieldName}:`, error);
      setValidation({
        isValid: false,
        error: 'Validation error occurred'
      });
    } finally {
      setIsValidating(false);
    }
  }, [fieldName, value, context]);

  // Blur handler
  const handleBlur = useCallback(() => {
    if (validateOnBlur) {
      validate();
    }
  }, [validateOnBlur, validate]);

  return {
    validation,
    isValidating,
    validate,
    handleBlur,
    isValid: validation.isValid,
    error: validation.error,
    warning: validation.warning,
    suggestions: validation.suggestions || [],
    helpText: validation.helpText
  };
} 