/**
 * Muscle Targeting Service
 * 
 * Handles muscle targeting logic and muscle group processing.
 * Extracted from workoutService.ts for better separation of concerns.
 */
import { logger } from '../utils/logger';

export interface MuscleTargetingData {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  muscleGroups: string[];
  targetingStrategy: 'focused' | 'balanced' | 'compound';
}

/**
 * Extract muscle targeting information from workout data
 */
export function extractMuscleTargeting(workoutData: any): MuscleTargetingData | null {
  logger.debug('Extracting muscle targeting data', {
    hasPrimaryMuscle: !!workoutData.primary_muscle_focus,
    hasSessionInputs: !!workoutData.sessionInputs,
    hasMuscleTargeting: !!workoutData.muscleTargeting
  });

  const targeting: MuscleTargetingData = {
    primaryMuscles: [],
    secondaryMuscles: [],
    muscleGroups: [],
    targetingStrategy: 'balanced'
  };

  // Extract from primary_muscle_focus field
  if (workoutData.primary_muscle_focus) {
    const primaryMuscle = workoutData.primary_muscle_focus;
    if (typeof primaryMuscle === 'string') {
      targeting.primaryMuscles.push(primaryMuscle);
    } else if (Array.isArray(primaryMuscle)) {
      targeting.primaryMuscles.push(...primaryMuscle);
    }
  }

  // Extract from sessionInputs (WorkoutGeneratorGrid data)
  if (workoutData.sessionInputs && workoutData.sessionInputs.focusArea) {
    const focusArea = workoutData.sessionInputs.focusArea;
    if (typeof focusArea === 'string') {
      targeting.muscleGroups.push(focusArea);
    } else if (Array.isArray(focusArea)) {
      targeting.muscleGroups.push(...focusArea);
    }
  }

  // Extract from muscleTargeting field (if present)
  if (workoutData.muscleTargeting) {
    const muscleTargeting = workoutData.muscleTargeting;
    
    if (muscleTargeting.selectedGroups && Array.isArray(muscleTargeting.selectedGroups)) {
      targeting.muscleGroups.push(...muscleTargeting.selectedGroups);
    }
    
    if (muscleTargeting.selectedMuscles && Array.isArray(muscleTargeting.selectedMuscles)) {
      targeting.primaryMuscles.push(...muscleTargeting.selectedMuscles);
    }
  }

  // Determine targeting strategy
  targeting.targetingStrategy = determineMuscleTargetingStrategy(targeting);

  // Remove duplicates
  targeting.primaryMuscles = [...new Set(targeting.primaryMuscles)];
  targeting.secondaryMuscles = [...new Set(targeting.secondaryMuscles)];
  targeting.muscleGroups = [...new Set(targeting.muscleGroups)];

  const hasTargeting = targeting.primaryMuscles.length > 0 || 
                      targeting.secondaryMuscles.length > 0 || 
                      targeting.muscleGroups.length > 0;

  if (!hasTargeting) {
    logger.debug('No muscle targeting data found');
    return null;
  }

  logger.debug('Muscle targeting extracted', {
    primaryMuscles: targeting.primaryMuscles.length,
    secondaryMuscles: targeting.secondaryMuscles.length,
    muscleGroups: targeting.muscleGroups.length,
    strategy: targeting.targetingStrategy
  });

  return targeting;
}

/**
 * Determine muscle targeting strategy based on selected muscles
 */
function determineMuscleTargetingStrategy(targeting: MuscleTargetingData): MuscleTargetingData['targetingStrategy'] {
  const totalTargets = targeting.primaryMuscles.length + targeting.muscleGroups.length;
  
  if (totalTargets === 1) {
    return 'focused';
  } else if (totalTargets >= 4) {
    return 'compound';
  } else {
    return 'balanced';
  }
}

/**
 * Format muscle targeting for display
 */
export function formatMuscleTargeting(targeting: MuscleTargetingData): string {
  const parts: string[] = [];
  
  if (targeting.muscleGroups.length > 0) {
    parts.push(targeting.muscleGroups.join(', '));
  }
  
  if (targeting.primaryMuscles.length > 0) {
    const specificMuscles = targeting.primaryMuscles.filter(muscle => 
      !targeting.muscleGroups.some(group => 
        muscle.toLowerCase().includes(group.toLowerCase())
      )
    );
    
    if (specificMuscles.length > 0) {
      parts.push(`(+${specificMuscles.length} specific muscles)`);
    }
  }
  
  return parts.join(' ') || 'Full Body';
}

/**
 * Check if workout targets specific muscle group
 */
export function targetsMuscleGroup(workoutData: any, muscleGroup: string): boolean {
  const targeting = extractMuscleTargeting(workoutData);
  
  if (!targeting) return false;
  
  const lowerMuscleGroup = muscleGroup.toLowerCase();
  
  return targeting.muscleGroups.some(group => group.toLowerCase().includes(lowerMuscleGroup)) ||
         targeting.primaryMuscles.some(muscle => muscle.toLowerCase().includes(lowerMuscleGroup));
}

/**
 * Get muscle targeting summary for API requests
 */
export function getMuscleTargetingSummary(workoutData: any): string {
  const targeting = extractMuscleTargeting(workoutData);
  
  if (!targeting) return '';
  
  const summary = formatMuscleTargeting(targeting);
  const strategy = targeting.targetingStrategy;
  
  return `${summary} (${strategy} targeting)`;
} 