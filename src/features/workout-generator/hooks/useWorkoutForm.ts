/**
 * Hook for managing workout form state and validation
 */

import { useCallback, useEffect } from 'react';
import { WorkoutFormParams, WorkoutDifficulty } from '../types/workout';
import { useWorkoutGenerator } from '../context/WorkoutGeneratorContext';
import { useFormValidation } from './useFormValidation';
import { useFormPersistence } from './useFormPersistence';

// Storage key for form values
const FORM_STORAGE_KEY = 'fitcopilot_workout_form';

/**
 * Hook for form state management
 */
export function useWorkoutForm() {
  const { state, dispatch } = useWorkoutGenerator();
  const { formValues, generatedWorkout } = state.domain;
  const { formErrors, status, loading } = state.ui;
  
  // Form validation
  const validation = useFormValidation(formValues);
  
  // Form persistence
  const persistence = useFormPersistence<Partial<WorkoutFormParams>>(FORM_STORAGE_KEY, formValues);
  
  // On mount, load form values from session storage
  useEffect(() => {
    const storedValues = persistence.loadData();
    if (storedValues) {
      dispatch({ type: 'UPDATE_FORM', payload: storedValues });
    }
  }, [dispatch, persistence]);
  
  // Update form values
  const updateForm = useCallback((values: Partial<WorkoutFormParams>) => {
    dispatch({ type: 'UPDATE_FORM', payload: values });
    
    // Save to session storage
    persistence.saveData({
      ...formValues,
      ...values
    });
  }, [dispatch, formValues, persistence]);
  
  // Update individual form field
  const updateField = useCallback(<K extends keyof WorkoutFormParams>(field: K, value: WorkoutFormParams[K]) => {
    const update = { [field]: value } as Partial<WorkoutFormParams>;
    dispatch({ type: 'UPDATE_FORM', payload: update });
    
    validation.touchField(field);
    
    // Save to session storage
    persistence.saveData({
      ...formValues,
      ...update
    });
  }, [dispatch, formValues, persistence, validation]);
  
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
    const isValid = validation.validateForm(formValues);
    dispatch({ type: 'SET_FORM_ERRORS', payload: validation.errors });
    return isValid;
  }, [formValues, dispatch, validation]);
  
  // Reset form errors
  const resetFormErrors = useCallback(() => {
    validation.resetErrors();
    dispatch({ type: 'SET_FORM_ERRORS', payload: null });
  }, [dispatch, validation]);
  
  // Clear form storage
  const clearFormStorage = useCallback(() => {
    persistence.clearData();
  }, [persistence]);
  
  return {
    // Form values
    formValues,
    formErrors,
    status,
    loading,
    generatedWorkout,
    
    // Validation state from validation hook
    ...validation,
    
    // Form validation
    isValid: validation.isFormValid(formValues),
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
    clearFormStorage,
    hasStoredData: persistence.hasStoredData
  };
} 