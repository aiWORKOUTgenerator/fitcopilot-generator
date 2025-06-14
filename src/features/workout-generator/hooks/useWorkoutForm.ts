/**
 * Hook for managing workout form state and validation
 */

import { useCallback, useEffect } from 'react';
import { WorkoutFormParams, WorkoutDifficulty, SessionSpecificInputs } from '../types/workout';
import { useWorkoutGenerator } from '../context/WorkoutGeneratorContext';
import { useFormValidation } from './useFormValidation';
import { useFormPersistence } from './useFormPersistence';
import { useProfile } from '../../profile/context';
import { mapProfileToWorkoutContext } from '../utils/profileMapping';

// Storage key for form values
const FORM_STORAGE_KEY = 'fitcopilot_workout_form';

/**
 * Hook for form state management
 */
export function useWorkoutForm() {
  const { state, dispatch } = useWorkoutGenerator();
  const { formValues, generatedWorkout } = state.domain;
  const { formErrors, status, loading } = state.ui;
  
  // Profile context for fitness level integration
  const { state: profileState } = useProfile();
  const { profile } = profileState;
  
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
  
  // Set intensity
  const setIntensity = useCallback((intensity: number) => {
    updateField('intensity', intensity);
  }, [updateField]);
  
  // === NEW CONVENIENCE METHODS FOR WORKOUTGRID INTEGRATION ===
  
  // Add convenience setters for individual WorkoutGrid fields
  const setTodaysFocus = useCallback((focus: string) => {
    setSessionInputs(current => ({
      ...current,
      todaysFocus: focus as any // Type assertion for string literal types
    }));
  }, [setSessionInputs]);

  const setDailyIntensityLevel = useCallback((level: number) => {
    setSessionInputs(current => ({
      ...current,
      dailyIntensityLevel: level
    }));
  }, [setSessionInputs]);
  
  const setHealthRestrictionsToday = useCallback((restrictions: string[]) => {
    setSessionInputs(current => ({
      ...current,
      healthRestrictionsToday: restrictions
    }));
  }, [setSessionInputs]);
  
  const setEquipmentAvailableToday = useCallback((equipment: string[]) => {
    setSessionInputs(current => ({
      ...current,
      equipmentAvailableToday: equipment
    }));
  }, [setSessionInputs]);
  
  const setTimeConstraintsToday = useCallback((time: number) => {
    setSessionInputs(current => ({
      ...current,
      timeConstraintsToday: time
    }));
  }, [setSessionInputs]);
  
  const setLocationToday = useCallback((location: string) => {
    setSessionInputs(current => ({
      ...current,
      locationToday: location as any // Type assertion for string literal types
    }));
  }, [setSessionInputs]);
  
  const setEnergyLevel = useCallback((level: number) => {
    setSessionInputs(current => ({
      ...current,
      energyLevel: level
    }));
  }, [setSessionInputs]);
  
  const setMoodLevel = useCallback((level: number) => {
    setSessionInputs(current => ({
      ...current,
      moodLevel: level
    }));
  }, [setSessionInputs]);
  
  const setSleepQuality = useCallback((level: number) => {
    setSessionInputs(current => ({
      ...current,
      sleepQuality: level
    }));
  }, [setSessionInputs]);
  
  const setWorkoutCustomization = useCallback((customization: string) => {
    setSessionInputs(current => ({
      ...current,
      workoutCustomization: customization
    }));
  }, [setSessionInputs]);
  
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
  
  // Enhanced session input updater for WorkoutGeneratorGrid cards
  const updateSessionInput = useCallback(<K extends keyof SessionSpecificInputs>(
    field: K, 
    value: SessionSpecificInputs[K]
  ) => {
    const currentSessionInputs = formValues.sessionInputs || {};
    const updatedSessionInputs = {
      ...currentSessionInputs,
      [field]: value
    };
    
    updateField('sessionInputs', updatedSessionInputs);

    // STEP 1: Enhanced debugging for session input capture
    if (process.env.NODE_ENV === 'development') {
      console.log(`[useWorkoutForm] STEP 1 DEBUG: Session input updated - ${String(field)}:`, {
        field,
        value,
        timestamp: new Date().toISOString(),
        sessionInputsBefore: currentSessionInputs,
        sessionInputsAfter: updatedSessionInputs,
        workoutGridCard: getCardNameFromField(field),
        dataFlowStep: 'CARD_TO_SESSION_INPUTS'
      });
    }
  }, [formValues.sessionInputs, updateField]);
  
  // Helper function to identify which WorkoutGeneratorGrid card updated the field
  const getCardNameFromField = (field: keyof SessionSpecificInputs): string => {
    const fieldToCardMap: Record<string, string> = {
      'todaysFocus': 'WorkoutFocusCard',
      'dailyIntensityLevel': 'IntensityCard', 
      'timeConstraintsToday': 'DurationCard',
      'equipmentAvailableToday': 'EquipmentCard',
      'healthRestrictionsToday': 'RestrictionsCard',
      'locationToday': 'LocationCard',
      'environment': 'LocationCard',
      'energyLevel': 'EnergyMoodCard',
      'moodLevel': 'StressMoodCard',
      'sleepQuality': 'SleepQualityCard',
      'workoutCustomization': 'WorkoutCustomizationCard',
      'focusArea': 'MuscleGroupCard',
      'muscleTargeting': 'MuscleGroupCard'
    };
    return fieldToCardMap[String(field)] || 'UnknownCard';
  };
  
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
  
  // Get mapped form values for generation (includes session input mapping, muscle targeting, and profile integration)
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

    // Get profile mapping for fitness level integration
    const profileMapping = profile ? mapProfileToWorkoutContext(profile) : null;
    
          // PHASE 3: Map profile fitness level to new fitness-specific parameters (PROFILE DATA ONLY)
    const profileFitnessLevel = profileMapping?.fitnessLevel || 'intermediate';
    const finalFitnessLevel = profileFitnessLevel; // FITNESS LEVEL COMES FROM PROFILE ONLY
    
    // PHASE 3: Derive fitness-specific parameters from form fields, session inputs, and profile data
    const deriveIntensityLevel = (): number => {
      // Priority: form field > sessionInputs > formValues > profile default
      if (formValues.intensity_level) {
        return formValues.intensity_level;
      }
      if (formValues.sessionInputs?.dailyIntensityLevel) {
        return formValues.sessionInputs.dailyIntensityLevel;
      }
      if (formValues.intensity) {
        return formValues.intensity;
      }
      // Default based on fitness level
      const intensityDefaults = { beginner: 2, intermediate: 3, advanced: 4 };
      return intensityDefaults[finalFitnessLevel as keyof typeof intensityDefaults] || 3;
    };
    
    const deriveExerciseComplexity = (): string => {
      // PHASE 3: Priority to form field, then derive from fitness level
      if (formValues.exercise_complexity) {
        return formValues.exercise_complexity;
      }
      const complexityMapping = {
        beginner: 'basic',
        intermediate: 'moderate',
        advanced: 'advanced'
      };
      return complexityMapping[finalFitnessLevel as keyof typeof complexityMapping] || 'moderate';
    };

    // SPRINT 2: NEW WorkoutGeneratorGrid parameter mapping following fitness model
    const mapStressLevel = (): string | null => {
      // Priority: sessionInputs > direct form value
      if (formValues.sessionInputs?.moodLevel) {
        // Map 1-5 scale to stress levels
        const stressMapping = {
          1: 'very_high',  // Very stressed (mood 1)
          2: 'high',       // Stressed (mood 2)
          3: 'moderate',   // Neutral (mood 3) 
          4: 'low',        // Good mood (mood 4)
          5: 'low'         // Great mood (mood 5)
        };
        return stressMapping[formValues.sessionInputs.moodLevel as keyof typeof stressMapping] || 'moderate';
      }
      return formValues.stress_level || null;
    };

    const mapEnergyLevel = (): string | null => {
      // Priority: sessionInputs > direct form value
      if (formValues.sessionInputs?.energyLevel) {
        // Map 1-5 scale to energy levels
        const energyMapping = {
          1: 'very_low',
          2: 'low', 
          3: 'moderate',
          4: 'high',
          5: 'very_high'
        };
        return energyMapping[formValues.sessionInputs.energyLevel as keyof typeof energyMapping] || 'moderate';
      }
      return formValues.energy_level || null;
    };

    const mapSleepQuality = (): string | null => {
      // Priority: sessionInputs > direct form value
      if (formValues.sessionInputs?.sleepQuality) {
        // Map 1-5 scale to sleep quality
        const sleepMapping = {
          1: 'poor',
          2: 'fair',
          3: 'good', 
          4: 'good',
          5: 'excellent'
        };
        return sleepMapping[formValues.sessionInputs.sleepQuality as keyof typeof sleepMapping] || 'good';
      }
      return formValues.sleep_quality || null;
    };

    const mapLocation = (): string => {
      // Priority: sessionInputs > direct form value
      if (formValues.sessionInputs?.locationToday) {
        return formValues.sessionInputs.locationToday;
      }
      if (formValues.sessionInputs?.environment) {
        return formValues.sessionInputs.environment;
      }
      return formValues.location || 'any';
    };

    const getCustomNotes = (): string => {
      // Combine custom notes from multiple sources
      const sources = [
        formValues.custom_notes || '',
        formValues.sessionInputs?.workoutCustomization || '',
        formValues.preferences || ''
      ].filter(Boolean);
      
      return sources.join('; ');
    };

    const getPrimaryMuscleFocus = (): string | null => {
      // Priority: direct field > muscle targeting > focus area
      if (formValues.primary_muscle_focus) {
        return formValues.primary_muscle_focus;
      }
      if (formValues.muscleTargeting?.primaryFocus) {
        return formValues.muscleTargeting.primaryFocus;
      }
      if (formValues.sessionInputs?.focusArea?.length) {
        return formValues.sessionInputs.focusArea[0]; // First selected muscle group
      }
      return null;
    };

    // Create mapped form values for generation with SPRINT 2 enhancements
    const mappedValues = {
      ...formValues,
      // Map session inputs to main form fields for generation
      duration: formValues.sessionInputs?.timeConstraintsToday || formValues.duration,
      goals: formValues.sessionInputs?.todaysFocus 
        ? mapFocusToGoals(formValues.sessionInputs.todaysFocus)
        : formValues.goals,
      
      // PHASE 3: New fitness-specific parameters with form field priority
      fitness_level: finalFitnessLevel,
      intensity_level: deriveIntensityLevel(),
      exercise_complexity: deriveExerciseComplexity(),
      
      // SPRINT 2: NEW WorkoutGeneratorGrid parameters following fitness model
      stress_level: mapStressLevel(),
      energy_level: mapEnergyLevel(),
      sleep_quality: mapSleepQuality(),
      location: mapLocation(),
      custom_notes: getCustomNotes(),
      primary_muscle_focus: getPrimaryMuscleFocus(),
      
      // SPRINT 2: NEW Structured session context (all daily selections)
      session_context: {
        daily_state: {
          stress: mapStressLevel(),
          energy: mapEnergyLevel(),
          sleep: mapSleepQuality()
        },
        environment: {
          location: mapLocation(),
          equipment: formValues.sessionInputs?.equipmentAvailableToday || formValues.equipment || []
        },
        focus: {
          primary_goal: formValues.sessionInputs?.todaysFocus ? mapFocusToGoals(formValues.sessionInputs.todaysFocus) : formValues.goals,
          muscle_groups: formValues.sessionInputs?.focusArea || [],
          restrictions: formValues.sessionInputs?.healthRestrictionsToday || []
        },
        customization: {
          notes: getCustomNotes(),
          intensity_preference: deriveIntensityLevel()
        }
      },
      
      // BACKWARD COMPATIBILITY: Keep difficulty for transition period
      difficulty: finalFitnessLevel,
      
      // Preserve session inputs for AI context
      sessionInputs: formValues.sessionInputs,
      // Include profile context for OpenAI
      profileContext: profileMapping ? {
        fitnessLevel: profileMapping.fitnessLevel,
        goals: profileMapping.goals,
        workoutFrequency: profileMapping.workoutFrequency,
        availableEquipment: profileMapping.availableEquipment,
        preferredLocation: profileMapping.preferredLocation
      } : null
    };

    // SPRINT 2: Enhanced logging following fitness parameter pattern
    if (process.env.NODE_ENV === 'development') {
      console.log('[useWorkoutForm] STEP 1 VERIFICATION: Complete form state capture analysis:', {
        // === STEP 1: RAW FORM STATE VERIFICATION ===
        rawFormState: {
          formValues: formValues,
          sessionInputs: formValues.sessionInputs,
          hasSessionInputs: !!formValues.sessionInputs,
          sessionInputsKeys: formValues.sessionInputs ? Object.keys(formValues.sessionInputs) : []
        },

        // === STEP 1: WORKOUTGRID CARD DATA CAPTURE ===
        workoutGridCapture: {
          // Focus Card
          todaysFocus: formValues.sessionInputs?.todaysFocus,
          todaysFocusSource: formValues.sessionInputs?.todaysFocus ? 'WorkoutFocusCard' : 'NOT_CAPTURED',
          
          // Intensity Card  
          dailyIntensityLevel: formValues.sessionInputs?.dailyIntensityLevel,
          intensitySource: formValues.sessionInputs?.dailyIntensityLevel ? 'IntensityCard' : 'NOT_CAPTURED',
          
          // Duration Card
          timeConstraintsToday: formValues.sessionInputs?.timeConstraintsToday,
          durationSource: formValues.sessionInputs?.timeConstraintsToday ? 'DurationCard' : 'NOT_CAPTURED',
          
          // Equipment Card
          equipmentAvailableToday: formValues.sessionInputs?.equipmentAvailableToday,
          equipmentSource: formValues.sessionInputs?.equipmentAvailableToday ? 'EquipmentCard' : 'NOT_CAPTURED',
          
          // Restrictions Card
          healthRestrictionsToday: formValues.sessionInputs?.healthRestrictionsToday,
          restrictionsSource: formValues.sessionInputs?.healthRestrictionsToday ? 'RestrictionsCard' : 'NOT_CAPTURED',
          
          // Location Card
          locationToday: formValues.sessionInputs?.locationToday,
          environment: formValues.sessionInputs?.environment,
          locationSource: (formValues.sessionInputs?.locationToday || formValues.sessionInputs?.environment) ? 'LocationCard' : 'NOT_CAPTURED',
          
          // Energy/Mood Card
          energyLevel: formValues.sessionInputs?.energyLevel,
          energySource: formValues.sessionInputs?.energyLevel ? 'EnergyMoodCard' : 'NOT_CAPTURED',
          
          // Stress/Mood Card
          moodLevel: formValues.sessionInputs?.moodLevel,
          stressSource: formValues.sessionInputs?.moodLevel ? 'StressMoodCard' : 'NOT_CAPTURED',
          
          // Sleep Quality Card
          sleepQuality: formValues.sessionInputs?.sleepQuality,
          sleepSource: formValues.sessionInputs?.sleepQuality ? 'SleepQualityCard' : 'NOT_CAPTURED',
          
          // Customization Card
          workoutCustomization: formValues.sessionInputs?.workoutCustomization,
          customizationSource: formValues.sessionInputs?.workoutCustomization ? 'WorkoutCustomizationCard' : 'NOT_CAPTURED',
          
          // Muscle Group Card
          focusArea: formValues.sessionInputs?.focusArea,
          muscleTargeting: formValues.sessionInputs?.muscleTargeting,
          muscleSource: (formValues.sessionInputs?.focusArea || formValues.sessionInputs?.muscleTargeting) ? 'MuscleGroupCard' : 'NOT_CAPTURED'
        },

        // === STEP 1: DATA TRANSFORMATION VERIFICATION ===
        transformationResults: {
          // Profile integration (existing)
          hasProfile: !!profile,
          profileFitnessLevel: profile?.fitnessLevel,
          fitnessLevel: mappedValues.fitness_level,
          intensityLevel: mappedValues.intensity_level,
          exerciseComplexity: mappedValues.exercise_complexity,
          
          // NEW: WorkoutGeneratorGrid parameters
          daily_state: {
            stress_level: mappedValues.stress_level,
            energy_level: mappedValues.energy_level,
            sleep_quality: mappedValues.sleep_quality
          },
          environment: {
            location: mappedValues.location,
            equipment_count: (mappedValues.session_context?.environment?.equipment || []).length
          },
          customization: {
            custom_notes_length: (mappedValues.custom_notes || '').length,
            primary_muscle_focus: mappedValues.primary_muscle_focus
          }
        },

        // === STEP 1: PARAMETER MAPPING VERIFICATION ===
        mappingVerification: {
          // Stress mapping verification
          stressMappingChain: {
            rawMoodLevel: formValues.sessionInputs?.moodLevel,
            mappedStressLevel: mapStressLevel(),
            mappingFunction: 'mapStressLevel()',
            isSuccessful: !!mapStressLevel()
          },
          
          // Energy mapping verification  
          energyMappingChain: {
            rawEnergyLevel: formValues.sessionInputs?.energyLevel,
            mappedEnergyLevel: mapEnergyLevel(),
            mappingFunction: 'mapEnergyLevel()',
            isSuccessful: !!mapEnergyLevel()
          },
          
          // Sleep mapping verification
          sleepMappingChain: {
            rawSleepQuality: formValues.sessionInputs?.sleepQuality,
            mappedSleepQuality: mapSleepQuality(),
            mappingFunction: 'mapSleepQuality()',
            isSuccessful: !!mapSleepQuality()
          },
          
          // Location mapping verification
          locationMappingChain: {
            rawLocationToday: formValues.sessionInputs?.locationToday,
            rawEnvironment: formValues.sessionInputs?.environment,
            mappedLocation: mapLocation(),
            mappingFunction: 'mapLocation()',
            isSuccessful: mapLocation() !== 'any'
          }
        },

        // === STEP 1: MISSING DATA IDENTIFICATION ===
        missingDataAnalysis: {
          missingCards: [
            !formValues.sessionInputs?.todaysFocus && 'WorkoutFocusCard',
            !formValues.sessionInputs?.dailyIntensityLevel && 'IntensityCard',
            !formValues.sessionInputs?.timeConstraintsToday && 'DurationCard',
            !formValues.sessionInputs?.equipmentAvailableToday && 'EquipmentCard',
            !formValues.sessionInputs?.healthRestrictionsToday && 'RestrictionsCard',
            !(formValues.sessionInputs?.locationToday || formValues.sessionInputs?.environment) && 'LocationCard',
            !formValues.sessionInputs?.energyLevel && 'EnergyMoodCard',
            !formValues.sessionInputs?.moodLevel && 'StressMoodCard',
            !formValues.sessionInputs?.sleepQuality && 'SleepQualityCard',
            !formValues.sessionInputs?.workoutCustomization && 'WorkoutCustomizationCard',
            !(formValues.sessionInputs?.focusArea || formValues.sessionInputs?.muscleTargeting) && 'MuscleGroupCard'
          ].filter(Boolean),
          
          capturedCards: [
            formValues.sessionInputs?.todaysFocus && 'WorkoutFocusCard',
            formValues.sessionInputs?.dailyIntensityLevel && 'IntensityCard',
            formValues.sessionInputs?.timeConstraintsToday && 'DurationCard',
            formValues.sessionInputs?.equipmentAvailableToday && 'EquipmentCard',
            formValues.sessionInputs?.healthRestrictionsToday && 'RestrictionsCard',
            (formValues.sessionInputs?.locationToday || formValues.sessionInputs?.environment) && 'LocationCard',
            formValues.sessionInputs?.energyLevel && 'EnergyMoodCard',
            formValues.sessionInputs?.moodLevel && 'StressMoodCard',
            formValues.sessionInputs?.sleepQuality && 'SleepQualityCard',
            formValues.sessionInputs?.workoutCustomization && 'WorkoutCustomizationCard',
            (formValues.sessionInputs?.focusArea || formValues.sessionInputs?.muscleTargeting) && 'MuscleGroupCard'
          ].filter(Boolean),
          
          captureSuccessRate: `${[
            formValues.sessionInputs?.todaysFocus,
            formValues.sessionInputs?.dailyIntensityLevel,
            formValues.sessionInputs?.timeConstraintsToday,
            formValues.sessionInputs?.equipmentAvailableToday,
            formValues.sessionInputs?.healthRestrictionsToday,
            (formValues.sessionInputs?.locationToday || formValues.sessionInputs?.environment),
            formValues.sessionInputs?.energyLevel,
            formValues.sessionInputs?.moodLevel,
            formValues.sessionInputs?.sleepQuality,
            formValues.sessionInputs?.workoutCustomization,
            (formValues.sessionInputs?.focusArea || formValues.sessionInputs?.muscleTargeting)
          ].filter(Boolean).length}/11 cards (${Math.round([
            formValues.sessionInputs?.todaysFocus,
            formValues.sessionInputs?.dailyIntensityLevel,
            formValues.sessionInputs?.timeConstraintsToday,
            formValues.sessionInputs?.equipmentAvailableToday,
            formValues.sessionInputs?.healthRestrictionsToday,
            (formValues.sessionInputs?.locationToday || formValues.sessionInputs?.environment),
            formValues.sessionInputs?.energyLevel,
            formValues.sessionInputs?.moodLevel,
            formValues.sessionInputs?.sleepQuality,
            formValues.sessionInputs?.workoutCustomization,
            (formValues.sessionInputs?.focusArea || formValues.sessionInputs?.muscleTargeting)
          ].filter(Boolean).length / 11 * 100)}%)`
        },

        // === STEP 1: FINAL VERIFICATION SUMMARY ===
        step1Summary: {
          verificationPhase: 'STEP_1_FORM_STATE_CAPTURE',
          timestamp: new Date().toISOString(),
          totalFormFields: Object.keys(formValues).length,
          sessionInputsFields: formValues.sessionInputs ? Object.keys(formValues.sessionInputs).length : 0,
          mappedParametersCount: Object.keys(mappedValues).length,
          workoutGridIntegrationStatus: formValues.sessionInputs ? 'ACTIVE' : 'INACTIVE',
          nextDebuggingStep: 'STEP_2_API_PAYLOAD_INSPECTION'
        }
      });
    }

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
      
      // CRITICAL FIX: Ensure muscle targeting data flows to PremiumPreview
      if (!mappedValues.muscleTargeting && formValues.sessionInputs.focusArea.length > 0) {
        mappedValues.muscleTargeting = {
          targetMuscleGroups: formValues.sessionInputs.focusArea,
          specificMuscles: {},
          primaryFocus: formValues.sessionInputs.focusArea[0],
          selectionSummary: formValues.sessionInputs.focusArea.join(', ')
        };
      }
    }

    return mappedValues;
  }, [formValues, profile]);
  
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
    updateSessionInput,
    setDuration,
    setDifficulty,
    setGoals,
    setEquipment,
    setRestrictions,
    setSessionInputs,
    setIntensity,
    
    // New WorkoutGrid convenience methods (legacy)
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
    
    // SPRINT 2: NEW convenience setters for enhanced WorkoutGeneratorGrid parameters
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