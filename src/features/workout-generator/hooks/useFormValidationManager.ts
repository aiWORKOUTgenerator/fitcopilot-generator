/**
 * Form Validation Management Hook
 * 
 * Specialized hook for managing form validation logic including modular card support.
 * Extracted from useWorkoutForm.ts to follow Single Responsibility Principle.
 */

import { useCallback } from 'react';
import { WorkoutFormParams, SessionSpecificInputs } from '../types/workout';
import { useFormValidation } from './useFormValidation';

/**
 * Hook for managing form validation with modular card support
 * 
 * @param formValues - Current form values state
 * @param dispatch - Form dispatch function for setting errors
 * @returns Form validation management utilities
 */
export function useFormValidationManager(
  formValues: Partial<WorkoutFormParams>,
  dispatch: React.Dispatch<any>
) {
  
  // Use the existing form validation hook
  const validation = useFormValidation();
  
  // Standard form validation
  const validateForm = useCallback(() => {
    const isValid = validation.validateForm(formValues);
    dispatch({ type: 'SET_FORM_ERRORS', payload: validation.errors });
    return isValid;
  }, [formValues, dispatch, validation]);
  
  // Enhanced validation with modular card support
  const validateFormWithModularSupport = useCallback(() => {
    // Map focus values from sessionInputs to goals values
    const mapFocusToGoals = (focus?: string): string => {
      switch (focus) {
        case 'fat-burning': return 'lose-weight';
        case 'muscle-building': return 'build-muscle';
        case 'endurance': return 'improve-endurance';
        case 'strength': return 'increase-strength';
        case 'flexibility': return 'enhance-flexibility';
        case 'general-fitness': return 'general-fitness';
        default: return 'general-fitness'; // Default fallback
      }
    };

    // Create a mapped version of form values that includes session inputs
    const mappedFormValues = {
      ...formValues,
      // Map session inputs to main form fields for validation
      duration: formValues.sessionInputs?.timeConstraintsToday || formValues.duration,
      goals: formValues.sessionInputs?.todaysFocus 
        ? mapFocusToGoals(formValues.sessionInputs.todaysFocus)
        : formValues.goals,
      // Set default difficulty if not set (modular cards don't set this yet)
      difficulty: formValues.difficulty || 'intermediate'
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useFormValidationManager] Validating with mapped values:', {
        original: formValues,
        mapped: mappedFormValues,
        sessionInputs: formValues.sessionInputs,
        focusMapping: {
          from: formValues.sessionInputs?.todaysFocus,
          to: mappedFormValues.goals
        }
      });
    }

    const isValid = validation.validateForm(mappedFormValues);
    dispatch({ type: 'SET_FORM_ERRORS', payload: validation.errors });
    return isValid;
  }, [formValues, dispatch, validation]);
  
  // Reset form errors
  const resetFormErrors = useCallback(() => {
    validation.resetErrors();
    dispatch({ type: 'SET_FORM_ERRORS', payload: null });
  }, [dispatch, validation]);
  
  // Get validation status for modular cards
  const getModularCardValidationStatus = useCallback(() => {
    const sessionInputs = formValues.sessionInputs;
    
    return {
      // Required fields validation
      hasDuration: !!(sessionInputs?.timeConstraintsToday || formValues.duration),
      hasFocus: !!(sessionInputs?.todaysFocus || formValues.goals),
      hasIntensity: !!(sessionInputs?.dailyIntensityLevel || formValues.intensity),
      
      // Optional fields status
      hasEquipment: !!(sessionInputs?.equipmentAvailableToday?.length || formValues.equipment?.length),
      hasRestrictions: !!(sessionInputs?.healthRestrictionsToday?.length || formValues.restrictions),
      hasLocation: !!(sessionInputs?.locationToday || sessionInputs?.environment),
      hasMood: !!(sessionInputs?.moodLevel),
      hasEnergy: !!(sessionInputs?.energyLevel),
      hasSleep: !!(sessionInputs?.sleepQuality),
      hasCustomization: !!(sessionInputs?.workoutCustomization),
      hasMuscleTargeting: !!(sessionInputs?.focusArea?.length || sessionInputs?.muscleTargeting),
      
      // Overall completion percentage
      completionPercentage: calculateCompletionPercentage(sessionInputs, formValues)
    };
  }, [formValues]);
  
  // Calculate completion percentage for WorkoutGeneratorGrid
  const calculateCompletionPercentage = (
    sessionInputs: SessionSpecificInputs | undefined,
    formValues: Partial<WorkoutFormParams>
  ): number => {
    const totalCards = 11; // Total number of WorkoutGeneratorGrid cards
    let completedCards = 0;
    
    // Check each modular card
    if (sessionInputs?.todaysFocus || formValues.goals) completedCards++;
    if (sessionInputs?.dailyIntensityLevel || formValues.intensity) completedCards++;
    if (sessionInputs?.timeConstraintsToday || formValues.duration) completedCards++;
    if (sessionInputs?.equipmentAvailableToday?.length || formValues.equipment?.length) completedCards++;
    if (sessionInputs?.healthRestrictionsToday?.length || formValues.restrictions) completedCards++;
    if (sessionInputs?.locationToday || sessionInputs?.environment) completedCards++;
    if (sessionInputs?.moodLevel) completedCards++;
    if (sessionInputs?.energyLevel) completedCards++;
    if (sessionInputs?.sleepQuality) completedCards++;
    if (sessionInputs?.workoutCustomization) completedCards++;
    if (sessionInputs?.focusArea?.length || sessionInputs?.muscleTargeting) completedCards++;
    
    return Math.round((completedCards / totalCards) * 100);
  };
  
  // Get missing required fields for user feedback
  const getMissingRequiredFields = useCallback((): string[] => {
    const missing: string[] = [];
    const sessionInputs = formValues.sessionInputs;
    
    // Check required fields
    if (!(sessionInputs?.timeConstraintsToday || formValues.duration)) {
      missing.push('Workout Duration');
    }
    
    if (!(sessionInputs?.todaysFocus || formValues.goals)) {
      missing.push('Fitness Goal');
    }
    
    // Note: Intensity is derived from other fields, so not strictly required
    
    return missing;
  }, [formValues]);
  
  // Check if form has minimum required data for generation
  const hasMinimumRequiredData = useCallback((): boolean => {
    return getMissingRequiredFields().length === 0;
  }, [getMissingRequiredFields]);

  return {
    // Validation state from validation hook
    ...validation,
    
    // Form validation methods
    validateForm,
    validateFormWithModularSupport,
    resetFormErrors,
    
    // Modular card validation utilities
    getModularCardValidationStatus,
    getMissingRequiredFields,
    hasMinimumRequiredData,
    
    // Computed validation state
    isValid: validation.isFormValid(formValues),
    completionPercentage: calculateCompletionPercentage(formValues.sessionInputs, formValues)
  };
} 