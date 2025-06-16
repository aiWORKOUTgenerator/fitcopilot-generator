/**
 * API Mapping Hook
 * 
 * Specialized hook for managing API parameter mapping and data transformation.
 * Extracted from useWorkoutForm.ts to follow Single Responsibility Principle.
 */

import { useCallback } from 'react';
import { WorkoutFormParams, SessionSpecificInputs } from '../types/workout';
import { useProfileIntegration } from './useProfileIntegration';

/**
 * Hook for managing API parameter mapping and data transformation
 * 
 * @param formValues - Current form values state
 * @returns API mapping utilities and transformed data
 */
export function useApiMapping(formValues: Partial<WorkoutFormParams>) {
  
  // Get profile integration for enhanced parameter mapping
  const profileIntegration = useProfileIntegration(formValues);
  
  // Map focus values from sessionInputs to goals values
  const mapFocusToGoals = useCallback((focus?: string): string => {
    switch (focus) {
      case 'fat-burning': return 'lose-weight';
      case 'muscle-building': return 'build-muscle';
      case 'endurance': return 'improve-endurance';
      case 'strength': return 'increase-strength';
      case 'flexibility': return 'enhance-flexibility';
      case 'general-fitness': return 'general-fitness';
      default: return 'general-fitness';
    }
  }, []);

  // SPRINT 2: NEW WorkoutGeneratorGrid parameter mapping following fitness model
  const mapStressLevel = useCallback((): 'moderate' | 'low' | 'high' | 'very_high' | undefined => {
    // Priority: sessionInputs > direct form value
    if (formValues.sessionInputs?.moodLevel) {
      // Map 1-5 scale to stress levels
      const stressMapping = {
        1: 'very_high' as const,  // Very stressed (mood 1)
        2: 'high' as const,       // Stressed (mood 2)
        3: 'moderate' as const,   // Neutral (mood 3) 
        4: 'low' as const,        // Good mood (mood 4)
        5: 'low' as const         // Great mood (mood 5)
      };
      return stressMapping[formValues.sessionInputs.moodLevel as keyof typeof stressMapping] || 'moderate';
    }
    return formValues.stress_level || undefined;
  }, [formValues.sessionInputs?.moodLevel, formValues.stress_level]);

  const mapEnergyLevel = useCallback((): 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' | undefined => {
    // Priority: sessionInputs > direct form value
    if (formValues.sessionInputs?.energyLevel) {
      // Map 1-5 scale to energy levels
      const energyMapping = {
        1: 'very_low' as const,
        2: 'low' as const, 
        3: 'moderate' as const,
        4: 'high' as const,
        5: 'very_high' as const
      };
      return energyMapping[formValues.sessionInputs.energyLevel as keyof typeof energyMapping] || 'moderate';
    }
    return formValues.energy_level || undefined;
  }, [formValues.sessionInputs?.energyLevel, formValues.energy_level]);

  const mapSleepQuality = useCallback((): 'poor' | 'fair' | 'good' | 'excellent' | undefined => {
    // Priority: sessionInputs > direct form value
    if (formValues.sessionInputs?.sleepQuality) {
      // Map 1-5 scale to sleep quality
      const sleepMapping = {
        1: 'poor' as const,
        2: 'fair' as const,
        3: 'good' as const, 
        4: 'good' as const,
        5: 'excellent' as const
      };
      return sleepMapping[formValues.sessionInputs.sleepQuality as keyof typeof sleepMapping] || 'good';
    }
    return formValues.sleep_quality || undefined;
  }, [formValues.sessionInputs?.sleepQuality, formValues.sleep_quality]);

  const mapLocation = useCallback((): 'home' | 'gym' | 'outdoors' | 'travel' | 'any' => {
    // Priority: sessionInputs > direct form value
    if (formValues.sessionInputs?.locationToday) {
      const location = formValues.sessionInputs.locationToday;
      if (['home', 'gym', 'outdoors', 'travel'].includes(location)) {
        return location as 'home' | 'gym' | 'outdoors' | 'travel';
      }
    }
    if (formValues.sessionInputs?.environment) {
      const environment = formValues.sessionInputs.environment;
      if (['home', 'gym', 'outdoors', 'travel'].includes(environment)) {
        return environment as 'home' | 'gym' | 'outdoors' | 'travel';
      }
    }
    if (formValues.location && ['home', 'gym', 'outdoors', 'travel', 'any'].includes(formValues.location)) {
      return formValues.location as 'home' | 'gym' | 'outdoors' | 'travel' | 'any';
    }
    return 'any';
  }, [formValues.sessionInputs?.locationToday, formValues.sessionInputs?.environment, formValues.location]);

  const getCustomNotes = useCallback((): string => {
    // Combine custom notes from multiple sources
    const sources = [
      formValues.custom_notes || '',
      formValues.sessionInputs?.workoutCustomization || '',
      formValues.preferences || ''
    ].filter(Boolean);
    
    return sources.join('; ');
  }, [formValues.custom_notes, formValues.sessionInputs?.workoutCustomization, formValues.preferences]);

  const getPrimaryMuscleFocus = useCallback((): string | undefined => {
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
    return undefined;
  }, [formValues.primary_muscle_focus, formValues.muscleTargeting?.primaryFocus, formValues.sessionInputs?.focusArea]);

  // Create session context for structured daily selections
  const createSessionContext = useCallback(() => {
    return {
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
        intensity_preference: profileIntegration.deriveIntensityLevel()
      }
    };
  }, [mapStressLevel, mapEnergyLevel, mapSleepQuality, mapLocation, mapFocusToGoals, getCustomNotes, profileIntegration, formValues]);

  // Enhanced muscle targeting integration
  const integrateMuscleTargeting = useCallback((baseParams: Partial<WorkoutFormParams>) => {
    const enhancedParams = { ...baseParams };

    // Include muscle targeting data from sessionInputs (muscle integration hook syncs here)
    // Note: muscleTargeting property may not exist on SessionSpecificInputs type
    if (formValues.sessionInputs && 'muscleTargeting' in formValues.sessionInputs) {
      enhancedParams.muscleTargeting = (formValues.sessionInputs as any).muscleTargeting;
    }

    // Include muscle selection data if available (from muscle integration hook)
    if (formValues.muscleSelection) {
      enhancedParams.muscleSelection = formValues.muscleSelection;
    }

    // Include direct muscle targeting fields for backward compatibility
    if (formValues.targetMuscleGroups) {
      enhancedParams.targetMuscleGroups = formValues.targetMuscleGroups;
    }
    if (formValues.specificMuscles) {
      enhancedParams.specificMuscles = formValues.specificMuscles;
    }
    if (formValues.primaryFocus) {
      enhancedParams.primaryFocus = formValues.primaryFocus;
    }

    // Extract muscle targeting from sessionInputs.muscleTargeting for backward compatibility
    if (formValues.sessionInputs && 'muscleTargeting' in formValues.sessionInputs) {
      const sessionMuscleTargeting = (formValues.sessionInputs as any).muscleTargeting;
      enhancedParams.targetMuscleGroups = sessionMuscleTargeting.targetMuscleGroups;
      enhancedParams.specificMuscles = sessionMuscleTargeting.specificMuscles;
      enhancedParams.primaryFocus = sessionMuscleTargeting.primaryFocus;
    }

    // Include focus area from sessionInputs (muscle groups as strings)
    if (formValues.sessionInputs?.focusArea?.length) {
      enhancedParams.focusArea = formValues.sessionInputs.focusArea;
      
      // CRITICAL FIX: Ensure muscle targeting data flows to PremiumPreview
      if (!enhancedParams.muscleTargeting && formValues.sessionInputs.focusArea.length > 0) {
        enhancedParams.muscleTargeting = {
          targetMuscleGroups: formValues.sessionInputs.focusArea,
          specificMuscles: {},
          primaryFocus: formValues.sessionInputs.focusArea[0]
        };
      }
    }

    return enhancedParams;
  }, [formValues]);

  // Get mapped form values for generation (includes session input mapping, muscle targeting, and profile integration)
  const getMappedFormValues = useCallback((): Partial<WorkoutFormParams> => {
    // Create mapped form values for generation with SPRINT 2 enhancements
    const mappedValues = {
      ...formValues,
      // Map session inputs to main form fields for generation
      duration: formValues.sessionInputs?.timeConstraintsToday || formValues.duration,
      goals: formValues.sessionInputs?.todaysFocus 
        ? mapFocusToGoals(formValues.sessionInputs.todaysFocus)
        : formValues.goals,
      
      // PHASE 4: New fitness-specific parameters with form field priority
      fitness_level: profileIntegration.finalFitnessLevel,
      intensity_level: profileIntegration.deriveIntensityLevel(),
      exercise_complexity: profileIntegration.deriveExerciseComplexity() as 'basic' | 'moderate' | 'advanced',
      
      // SPRINT 2: NEW WorkoutGeneratorGrid parameters following fitness model
      stress_level: mapStressLevel(),
      energy_level: mapEnergyLevel(),
      sleep_quality: mapSleepQuality(),
      location: mapLocation(),
      custom_notes: getCustomNotes(),
      primary_muscle_focus: getPrimaryMuscleFocus(),
      
      // SPRINT 2: NEW Structured session context (all daily selections)
      session_context: createSessionContext(),
      
      // BACKWARD COMPATIBILITY: Keep difficulty for transition period
      difficulty: profileIntegration.finalFitnessLevel,
      
      // Preserve session inputs for AI context
      sessionInputs: formValues.sessionInputs
    };

    // Use profile integration to enhance parameters with profile data
    const enhancedMappedValues = profileIntegration.enhanceParametersWithProfile(mappedValues);

    // Integrate muscle targeting data
    const finalMappedValues = integrateMuscleTargeting(enhancedMappedValues);

    return finalMappedValues;
  }, [
    formValues,
    mapFocusToGoals,
    profileIntegration,
    mapStressLevel,
    mapEnergyLevel,
    mapSleepQuality,
    mapLocation,
    getCustomNotes,
    getPrimaryMuscleFocus,
    createSessionContext,
    integrateMuscleTargeting
  ]);

  // Create comprehensive debugging information
  const createDebuggingInfo = useCallback((mappedValues: Partial<WorkoutFormParams>) => {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }

    return {
      transformationResults: {
        // Profile integration (existing)
        hasProfile: !!profileIntegration.profile,
        profileFitnessLevel: profileIntegration.profile?.fitnessLevel,
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
      
      // NEW: Parameter mapping verification
      parameterMappingChain: {
        // Stress mapping verification
        stressMappingChain: {
          rawMoodLevel: formValues.sessionInputs?.moodLevel,
          mappedStressLevel: mappedValues.stress_level,
          mappingFunction: 'mapStressLevel()',
          isSuccessful: !!mappedValues.stress_level
        },
        
        // Energy mapping verification  
        energyMappingChain: {
          rawEnergyLevel: formValues.sessionInputs?.energyLevel,
          mappedEnergyLevel: mappedValues.energy_level,
          mappingFunction: 'mapEnergyLevel()',
          isSuccessful: !!mappedValues.energy_level
        },
        
        // Sleep mapping verification
        sleepMappingChain: {
          rawSleepQuality: formValues.sessionInputs?.sleepQuality,
          mappedSleepQuality: mappedValues.sleep_quality,
          mappingFunction: 'mapSleepQuality()',
          isSuccessful: !!mappedValues.sleep_quality
        },
        
        // Location mapping verification
        locationMappingChain: {
          rawLocationToday: formValues.sessionInputs?.locationToday,
          rawEnvironment: formValues.sessionInputs?.environment,
          mappedLocation: mappedValues.location,
          mappingFunction: 'mapLocation()',
          isSuccessful: mappedValues.location !== 'any'
        }
      },
      
      // NEW: Integration status
      integrationStatus: {
        totalFormFields: Object.keys(formValues).length,
        sessionInputsFields: formValues.sessionInputs ? Object.keys(formValues.sessionInputs).length : 0,
        mappedParametersCount: Object.keys(mappedValues).length,
        workoutGridIntegrationStatus: formValues.sessionInputs ? 'ACTIVE' : 'INACTIVE',
        nextDebuggingStep: 'STEP_2_API_PAYLOAD_INSPECTION'
      }
    };
  }, [formValues, profileIntegration]);

  // Log debugging information
  const logMappingResults = useCallback((mappedValues: Partial<WorkoutFormParams>) => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const debugInfo = createDebuggingInfo(mappedValues);
    if (debugInfo) {
      console.log('[useApiMapping] API parameter mapping completed:', debugInfo);
    }
  }, [createDebuggingInfo]);

  return {
    // Core mapping functions
    getMappedFormValues,
    
    // Individual mapping utilities
    mapFocusToGoals,
    mapStressLevel,
    mapEnergyLevel,
    mapSleepQuality,
    mapLocation,
    getCustomNotes,
    getPrimaryMuscleFocus,
    
    // Advanced mapping utilities
    createSessionContext,
    integrateMuscleTargeting,
    
    // Debugging utilities
    createDebuggingInfo,
    logMappingResults,
    
    // Profile integration access
    profileIntegration
  };
} 