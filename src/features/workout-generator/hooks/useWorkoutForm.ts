/**
 * Hook for managing workout form state and validation
 */

import { useCallback, useEffect } from 'react';
import { WorkoutFormParams, WorkoutDifficulty, SessionSpecificInputs } from '../types/workout';
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
  
  // Set session inputs
  const setSessionInputs = useCallback((sessionInputs: SessionSpecificInputs) => {
    updateField('sessionInputs', sessionInputs);
  }, [updateField]);
  
  // Set intensity
  const setIntensity = useCallback((intensity: number) => {
    updateField('intensity', intensity);
  }, [updateField]);
  
  // === NEW CONVENIENCE METHODS FOR WORKOUTGRID INTEGRATION ===
  
  // Add convenience setters for individual WorkoutGrid fields
  const setTodaysFocus = useCallback((focus: string) => {
    const currentSessionInputs = formValues.sessionInputs || {};
    setSessionInputs({
      ...currentSessionInputs,
      todaysFocus: focus as any // Type assertion for string literal types
    });
  }, [formValues.sessionInputs, setSessionInputs]);

  const setDailyIntensityLevel = useCallback((level: number) => {
    const currentSessionInputs = formValues.sessionInputs || {};
    setSessionInputs({
      ...currentSessionInputs,
      dailyIntensityLevel: level
    });
  }, [formValues.sessionInputs, setSessionInputs]);
  
  const setHealthRestrictionsToday = useCallback((restrictions: string[]) => {
    const currentSessionInputs = formValues.sessionInputs || {};
    setSessionInputs({
      ...currentSessionInputs,
      healthRestrictionsToday: restrictions
    });
  }, [formValues.sessionInputs, setSessionInputs]);
  
  const setEquipmentAvailableToday = useCallback((equipment: string[]) => {
    const currentSessionInputs = formValues.sessionInputs || {};
    setSessionInputs({
      ...currentSessionInputs,
      equipmentAvailableToday: equipment
    });
  }, [formValues.sessionInputs, setSessionInputs]);
  
  const setTimeConstraintsToday = useCallback((time: number) => {
    const currentSessionInputs = formValues.sessionInputs || {};
    setSessionInputs({
      ...currentSessionInputs,
      timeConstraintsToday: time
    });
  }, [formValues.sessionInputs, setSessionInputs]);
  
  const setLocationToday = useCallback((location: string) => {
    const currentSessionInputs = formValues.sessionInputs || {};
    setSessionInputs({
      ...currentSessionInputs,
      locationToday: location as any // Type assertion for string literal types
    });
  }, [formValues.sessionInputs, setSessionInputs]);
  
  const setEnergyLevel = useCallback((level: number) => {
    const currentSessionInputs = formValues.sessionInputs || {};
    setSessionInputs({
      ...currentSessionInputs,
      energyLevel: level
    });
  }, [formValues.sessionInputs, setSessionInputs]);
  
  const setMoodLevel = useCallback((level: number) => {
    const currentSessionInputs = formValues.sessionInputs || {};
    setSessionInputs({
      ...currentSessionInputs,
      moodLevel: level
    });
  }, [formValues.sessionInputs, setSessionInputs]);
  
  const setSleepQuality = useCallback((level: number) => {
    const currentSessionInputs = formValues.sessionInputs || {};
    setSessionInputs({
      ...currentSessionInputs,
      sleepQuality: level
    });
  }, [formValues.sessionInputs, setSessionInputs]);
  
  const setWorkoutCustomization = useCallback((customization: string) => {
    const currentSessionInputs = formValues.sessionInputs || {};
    setSessionInputs({
      ...currentSessionInputs,
      workoutCustomization: customization
    });
  }, [formValues.sessionInputs, setSessionInputs]);
  
  // Validate the form
  const validateForm = useCallback(() => {
    const isValid = validation.validateForm(formValues);
    dispatch({ type: 'SET_FORM_ERRORS', payload: validation.errors });
    return isValid;
  }, [formValues, dispatch, validation]);
  
  // Validate form with modular card support
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
    
    console.log('[useWorkoutForm] Validating with mapped values:', {
      original: formValues,
      mapped: mappedFormValues,
      sessionInputs: formValues.sessionInputs,
      focusMapping: {
        from: formValues.sessionInputs?.todaysFocus,
        to: mappedFormValues.goals
      }
    });

    const isValid = validation.validateForm(mappedFormValues);
    dispatch({ type: 'SET_FORM_ERRORS', payload: validation.errors });
    return isValid;
  }, [formValues, dispatch, validation]);
  
  // Reset form errors
  const resetFormErrors = useCallback(() => {
    validation.resetErrors();
    dispatch({ type: 'SET_FORM_ERRORS', payload: null });
  }, [dispatch, validation]);
  
  // Get mapped form values for generation (includes session input mapping and muscle targeting)
  const getMappedFormValues = useCallback((): Partial<WorkoutFormParams> => {
    // Map focus values from sessionInputs to goals values
    const mapFocusToGoals = (focus?: string): string => {
      switch (focus) {
        case 'fat-burning': return 'lose-weight';
        case 'muscle-building': return 'build-muscle';
        case 'endurance': return 'improve-endurance';
        case 'strength': return 'increase-strength';
        case 'flexibility': return 'enhance-flexibility';
        case 'general-fitness': return 'general-fitness';
        default: return 'general-fitness';
      }
    };

    // Create mapped form values for generation
    const mappedValues = {
      ...formValues,
      // Map session inputs to main form fields for generation
      duration: formValues.sessionInputs?.timeConstraintsToday || formValues.duration,
      goals: formValues.sessionInputs?.todaysFocus 
        ? mapFocusToGoals(formValues.sessionInputs.todaysFocus)
        : formValues.goals,
      difficulty: formValues.difficulty || 'intermediate',
      // Preserve session inputs for AI context
      sessionInputs: formValues.sessionInputs
    };

    // Include muscle targeting data from sessionInputs (muscle integration hook syncs here)
    if (formValues.sessionInputs?.muscleTargeting) {
      mappedValues.muscleTargeting = formValues.sessionInputs.muscleTargeting;
    }

    // Include muscle selection data if available (from muscle integration hook)
    if (formValues.muscleSelection) {
      mappedValues.muscleSelection = formValues.muscleSelection;
    }

    // Include direct muscle targeting fields for backward compatibility
    if (formValues.targetMuscleGroups) {
      mappedValues.targetMuscleGroups = formValues.targetMuscleGroups;
    }
    if (formValues.specificMuscles) {
      mappedValues.specificMuscles = formValues.specificMuscles;
    }
    if (formValues.primaryFocus) {
      mappedValues.primaryFocus = formValues.primaryFocus;
    }

    // Extract muscle targeting from sessionInputs.muscleTargeting for backward compatibility
    if (formValues.sessionInputs?.muscleTargeting) {
      const sessionMuscleTargeting = formValues.sessionInputs.muscleTargeting;
      mappedValues.targetMuscleGroups = sessionMuscleTargeting.targetMuscleGroups;
      mappedValues.specificMuscles = sessionMuscleTargeting.specificMuscles;
      mappedValues.primaryFocus = sessionMuscleTargeting.primaryFocus;
    }

    // Include focus area from sessionInputs (muscle groups as strings)
    if (formValues.sessionInputs?.focusArea?.length) {
      mappedValues.focusArea = formValues.sessionInputs.focusArea;
    }

    return mappedValues;
  }, [formValues]);
  
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
    validateFormWithModularSupport,
    resetFormErrors,
    
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
    
    // New WorkoutGrid convenience methods
    setTodaysFocus,
    setDailyIntensityLevel,
    setHealthRestrictionsToday,
    setEquipmentAvailableToday,
    setTimeConstraintsToday,
    setLocationToday,
    setEnergyLevel,
    setMoodLevel,
    setSleepQuality,
    setWorkoutCustomization,
    
    // Storage
    clearFormStorage,
    hasStoredData: persistence.hasStoredData,
    
    // New getMappedFormValues method
    getMappedFormValues
  };
} 