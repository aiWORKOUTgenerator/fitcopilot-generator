/**
 * Hook for managing workout form state and validation
 */

import { useCallback, useEffect } from 'react';
import { WorkoutFormParams, WorkoutDifficulty, SessionSpecificInputs } from '../types/workout';
import { useWorkoutGenerator } from '../context/WorkoutGeneratorContext';
import { useFormPersistence } from './useFormPersistence';
import { useSessionInputs } from './useSessionInputs';
import { useFormValidationManager } from './useFormValidationManager';
import { useProfileIntegration } from './useProfileIntegration';
import { useApiMapping } from './useApiMapping';

// Storage key for form values
const FORM_STORAGE_KEY = 'fitcopilot_workout_form';

/**
 * Hook for form state management
 */
export function useWorkoutForm() {
  const { state, dispatch } = useWorkoutGenerator();
  const { formValues, generatedWorkout } = state.domain;
  const { formErrors, status, loading } = state.ui;
  
  // Form validation with dispatch function
  const validation = useFormValidationManager(formValues, dispatch);
  
  // Profile integration using specialized hook
  const profileIntegration = useProfileIntegration(formValues);
  
  // API mapping using specialized hook
  const apiMapping = useApiMapping(formValues);
  
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

    // STEP 1: Enhanced debugging for form state capture verification
    if (process.env.NODE_ENV === 'development') {
      console.log(`[useWorkoutForm] STEP 1 DEBUG: Field updated - ${String(field)}:`, {
        field,
        value,
        timestamp: new Date().toISOString(),
        formState: {
          ...formValues,
          ...update
        },
        sessionInputs: formValues.sessionInputs,
        workoutGridIntegration: 'STEP_1_VERIFICATION'
      });
    }
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
  
  // Set session inputs with functional update support
  const setSessionInputs = useCallback((sessionInputs: SessionSpecificInputs | ((current: SessionSpecificInputs) => SessionSpecificInputs)) => {
    if (typeof sessionInputs === 'function') {
      // Functional update - get current sessionInputs and apply the function
      const currentSessionInputs = formValues.sessionInputs || {};
      const updatedSessionInputs = sessionInputs(currentSessionInputs);
      updateField('sessionInputs', updatedSessionInputs);
    } else {
      // Direct update
      updateField('sessionInputs', sessionInputs);
    }
  }, [updateField, formValues.sessionInputs]);

  // Session input management using specialized hook
  const sessionInputsManager = useSessionInputs(formValues.sessionInputs, setSessionInputs);
  
  // Set intensity
  const setIntensity = useCallback((intensity: number) => {
    updateField('intensity', intensity);
  }, [updateField]);
  
  // SPRINT 2: NEW convenience setters for enhanced WorkoutGeneratorGrid parameters
  
  // Set stress level (mapped from mood)
  const setStressLevel = useCallback((stressLevel: 'low' | 'moderate' | 'high' | 'very_high') => {
    updateField('stress_level', stressLevel);
  }, [updateField]);
  
  // Set energy level 
  const setEnergyLevelDirect = useCallback((energyLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high') => {
    updateField('energy_level', energyLevel);
  }, [updateField]);
  
  // Set sleep quality
  const setSleepQualityDirect = useCallback((sleepQuality: 'poor' | 'fair' | 'good' | 'excellent') => {
    updateField('sleep_quality', sleepQuality);
  }, [updateField]);
  
  // Set location
  const setLocationDirect = useCallback((location: 'home' | 'gym' | 'outdoors' | 'travel' | 'any') => {
    updateField('location', location);
  }, [updateField]);
  
  // Set custom notes
  const setCustomNotes = useCallback((notes: string) => {
    updateField('custom_notes', notes);
  }, [updateField]);
  
  // Set primary muscle focus
  const setPrimaryMuscleFocus = useCallback((focus: string) => {
    updateField('primary_muscle_focus', focus);
  }, [updateField]);
  
  // Get mapped form values for generation using API mapping hook
  const getMappedFormValues = useCallback((): Partial<WorkoutFormParams> => {
    const mappedValues = apiMapping.getMappedFormValues();
    
    // Log mapping results in development mode
    apiMapping.logMappingResults(mappedValues);
    
    return mappedValues;
  }, [apiMapping]);


  
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
    
    // Validation state and methods from validation manager
    ...validation,
    
    // Form update methods
    updateForm,
    updateField,
    setDuration,
    setDifficulty,
    setGoals,
    setEquipment,
    setRestrictions,
    setSessionInputs,
    setIntensity,
    
    // Session input methods from specialized hook
    ...sessionInputsManager,
    
    // SPRINT 2: Enhanced WorkoutGeneratorGrid parameters
    setStressLevel,
    setEnergyLevelDirect,
    setSleepQualityDirect,
    setLocationDirect,
    setCustomNotes,
    setPrimaryMuscleFocus,
    
    // Storage
    clearFormStorage,
    hasStoredData: persistence.hasStoredData,
    
    // New getMappedFormValues method
    getMappedFormValues
  };
} 