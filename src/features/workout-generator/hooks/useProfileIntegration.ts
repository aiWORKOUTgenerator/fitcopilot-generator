/**
 * Profile Integration Hook
 * 
 * Specialized hook for managing profile integration with workout form data.
 * Extracted from useWorkoutForm.ts to follow Single Responsibility Principle.
 */

import { useCallback, useMemo } from 'react';
import { WorkoutFormParams, SessionSpecificInputs } from '../types/workout';
import { useProfile } from '../../profile/context';
import { mapProfileToWorkoutContext } from '../utils/profileMapping';

/**
 * Hook for managing profile integration with workout form data
 * 
 * @param formValues - Current form values state
 * @returns Profile integration utilities and mapped data
 */
export function useProfileIntegration(formValues: Partial<WorkoutFormParams>) {
  
  // Get profile state
  const profileState = useProfile();
  const { profile } = profileState;
  
  // Get profile mapping for fitness level integration
  const profileMapping = useMemo(() => {
    return profile ? mapProfileToWorkoutContext(profile) : null;
  }, [profile]);
  
  // PHASE 3: Map profile fitness level to new fitness-specific parameters (PROFILE DATA ONLY)
  const profileFitnessLevel = useMemo(() => {
    return profileMapping?.fitnessLevel || 'intermediate';
  }, [profileMapping]);
  
  const finalFitnessLevel = profileFitnessLevel; // FITNESS LEVEL COMES FROM PROFILE ONLY
  
  // PHASE 3: Derive fitness-specific parameters from form fields, session inputs, and profile data
  const deriveIntensityLevel = useCallback((): number => {
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
  }, [formValues, finalFitnessLevel]);
  
  const deriveExerciseComplexity = useCallback((): string => {
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
  }, [formValues, finalFitnessLevel]);

  // Create comprehensive profile context for API payload
  const createProfileContext = useCallback(() => {
    if (!profile || !profileMapping) {
      return null;
    }

    return {
      // Core profile data
      profile_goals: profileMapping.goals || [],
      profile_equipment: profileMapping.availableEquipment || [],
      profile_fitness_level: profileMapping.fitnessLevel || 'intermediate',
      profile_workout_frequency: profileMapping.workoutFrequency || '2-3',
      profile_preferred_location: profileMapping.preferredLocation || 'any',
      
      // Enhanced profile context for OpenAI
      profileContext: {
        fitnessLevel: profileMapping.fitnessLevel,
        goals: profileMapping.goals,
        workoutFrequency: profileMapping.workoutFrequency,
        availableEquipment: profileMapping.availableEquipment,
        preferredLocation: profileMapping.preferredLocation,
        
        // Physical information if available
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        gender: profile.gender,
        limitations: profile.limitations,
        limitationNotes: profile.limitationNotes
      }
    };
  }, [profile, profileMapping]);

  // Enhanced parameter mapping with profile integration
  const enhanceParametersWithProfile = useCallback((baseParams: Partial<WorkoutFormParams>) => {
    const profileContext = createProfileContext();
    
    if (!profileContext) {
      return baseParams;
    }

    // Enhanced parameters with profile integration
    const enhancedParams = {
      ...baseParams,
      
      // PHASE 3: Map profile fitness level to new fitness-specific parameters
      fitness_level: finalFitnessLevel,
      intensity_level: deriveIntensityLevel(),
      exercise_complexity: deriveExerciseComplexity(),
      
      // Include profile data directly in API payload
      ...profileContext
    };

    // Enhanced debugging for profile integration
    if (process.env.NODE_ENV === 'development') {
      console.log('[useProfileIntegration] Profile integration applied:', {
        originalParams: baseParams,
        enhancedParams,
        profileData: {
          fitnessLevel: finalFitnessLevel,
          derivedIntensity: deriveIntensityLevel(),
          derivedComplexity: deriveExerciseComplexity(),
          profileContext: profileContext.profileContext
        },
        integrationStep: 'PROFILE_TO_API_PAYLOAD'
      });
    }

    return enhancedParams;
  }, [createProfileContext, finalFitnessLevel, deriveIntensityLevel, deriveExerciseComplexity]);

  // Get profile-based defaults for form fields
  const getProfileDefaults = useCallback(() => {
    if (!profileMapping) {
      return {};
    }

    return {
      goals: profileMapping.goals?.[0] || 'general-fitness',
      equipment: profileMapping.availableEquipment || [],
      difficulty: profileMapping.fitnessLevel || 'intermediate',
      location: profileMapping.preferredLocation || 'any'
    };
  }, [profileMapping]);

  // Check if profile data is available and complete
  const getProfileStatus = useCallback(() => {
    return {
      hasProfile: !!profile,
      isProfileComplete: !!(profile && profileMapping?.fitnessLevel && profileMapping?.goals?.length),
      profileCompleteness: profile ? calculateProfileCompleteness(profile) : 0,
      missingProfileFields: profile ? getMissingProfileFields(profile) : []
    };
  }, [profile, profileMapping]);

  // Calculate profile completeness percentage
  const calculateProfileCompleteness = (profileData: any): number => {
    const requiredFields = ['fitnessLevel', 'goals', 'workoutFrequency'];
    const optionalFields = ['availableEquipment', 'preferredLocation', 'age', 'weight', 'height'];
    
    let completedRequired = 0;
    let completedOptional = 0;
    
    // Check required fields
    requiredFields.forEach(field => {
      if (profileData[field] && (Array.isArray(profileData[field]) ? profileData[field].length > 0 : true)) {
        completedRequired++;
      }
    });
    
    // Check optional fields
    optionalFields.forEach(field => {
      if (profileData[field] && (Array.isArray(profileData[field]) ? profileData[field].length > 0 : true)) {
        completedOptional++;
      }
    });
    
    // Weight required fields more heavily (70% of score)
    const requiredScore = (completedRequired / requiredFields.length) * 0.7;
    const optionalScore = (completedOptional / optionalFields.length) * 0.3;
    
    return Math.round((requiredScore + optionalScore) * 100);
  };

  // Get missing profile fields for user guidance
  const getMissingProfileFields = (profileData: any): string[] => {
    const missing: string[] = [];
    
    if (!profileData.fitnessLevel) missing.push('Fitness Level');
    if (!profileData.goals || profileData.goals.length === 0) missing.push('Fitness Goals');
    if (!profileData.workoutFrequency) missing.push('Workout Frequency');
    
    return missing;
  };

  return {
    // Profile state
    profile,
    profileMapping,
    profileState,
    
    // Profile-derived values
    profileFitnessLevel,
    finalFitnessLevel,
    
    // Profile integration methods
    enhanceParametersWithProfile,
    createProfileContext,
    getProfileDefaults,
    getProfileStatus,
    
    // Derived parameter methods
    deriveIntensityLevel,
    deriveExerciseComplexity,
    
    // Profile status utilities
    hasProfile: !!profile,
    isProfileComplete: !!(profile && profileMapping?.fitnessLevel && profileMapping?.goals?.length),
    profileCompleteness: profile ? calculateProfileCompleteness(profile) : 0
  };
} 