/**
 * Hook for managing workout form state and validation
 */

import { useCallback, useEffect } from 'react';
import { WorkoutFormParams, WorkoutDifficulty } from '../types/workout';
import { useWorkoutGenerator } from '../context/WorkoutGeneratorContext';
import { validateWorkoutForm, isWorkoutFormValid } from '../domain/validators';

// Storage key for form values
const FORM_STORAGE_KEY = 'fitcopilot_workout_form';

/**
 * Save form values to session storage
 */
function saveFormToStorage(formValues: Partial<WorkoutFormParams>) {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formValues));
  } catch (e) {
    console.warn('Failed to save form state to session storage:', e);
  }
}

/**
 * Load form values from session storage
 */
function loadFormFromStorage(): Partial<WorkoutFormParams> | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = sessionStorage.getItem(FORM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load form state from session storage:', e);
  }
  return null;
}

/**
 * Hook for form state management
 */
export function useWorkoutForm() {
  const { state, dispatch } = useWorkoutGenerator();
  const { formValues, generatedWorkout } = state.domain;
  const { formErrors, status, loading } = state.ui;
  
  // On mount, load form values from session storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedValues = loadFormFromStorage();
    if (storedValues) {
      dispatch({ type: 'UPDATE_FORM', payload: storedValues });
    }
  }, [dispatch]);
  
  // Update form values
  const updateForm = useCallback((values: Partial<WorkoutFormParams>) => {
    dispatch({ type: 'UPDATE_FORM', payload: values });
    
    // Save to session storage
    saveFormToStorage({
      ...formValues,
      ...values
    });
  }, [dispatch, formValues]);
  
  // Update individual form field
  const updateField = useCallback((field: keyof WorkoutFormParams, value: any) => {
    const update = { [field]: value };
    dispatch({ type: 'UPDATE_FORM', payload: update });
    
    // Save to session storage
    saveFormToStorage({
      ...formValues,
      ...update
    });
  }, [dispatch, formValues]);
  
  // Set duration
  const setDuration = useCallback((duration: number) => {
    updateField('duration', duration);
  }, [updateField]);
  
  // Set difficulty
  const setDifficulty = useCallback((difficulty: WorkoutDifficulty) => {
    updateField('difficulty', difficulty);
  }, [updateField]);
  
  // Set goals
  const setGoals = useCallback((goals: string) => {
    updateField('goals', goals);
  }, [updateField]);
  
  // Set equipment
  const setEquipment = useCallback((equipment: string[]) => {
    updateField('equipment', equipment);
  }, [updateField]);
  
  // Set restrictions
  const setRestrictions = useCallback((restrictions: string) => {
    updateField('restrictions', restrictions);
  }, [updateField]);
  
  // Validate the form
  const validateForm = useCallback(() => {
    const errors = validateWorkoutForm(formValues);
    dispatch({ type: 'SET_FORM_ERRORS', payload: errors });
    return errors === null;
  }, [formValues, dispatch]);
  
  // Reset form errors
  const resetFormErrors = useCallback(() => {
    dispatch({ type: 'SET_FORM_ERRORS', payload: null });
  }, [dispatch]);
  
  // Clear form storage
  const clearFormStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(FORM_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear form storage:', e);
    }
  }, []);
  
  return {
    // Form values
    formValues,
    formErrors,
    status,
    loading,
    generatedWorkout,
    
    // Form validation
    isValid: isWorkoutFormValid(formValues),
    validateForm,
    resetFormErrors,
    
    // Form update methods
    updateForm,
    updateField,
    setDuration,
    setDifficulty,
    setGoals,
    setEquipment,
    setRestrictions,
    
    // Storage
    clearFormStorage
  };
} 