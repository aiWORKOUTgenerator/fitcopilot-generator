/**
 * Muscle Module Exports
 * 
 * Centralized exports for all muscle targeting utilities.
 */
export { 
  extractMuscleTargeting, 
  formatMuscleTargeting, 
  targetsMuscleGroup, 
  getMuscleTargetingSummary,
  type MuscleTargetingData
} from './muscleTargetingService';

export { 
  normalizeMuscleGroup, 
  normalizeMuscleGroups, 
  getMuscleGroupDisplayName, 
  muscleGroupsOverlap, 
  groupMusclesByRegion,
  MUSCLE_GROUP_MAPPINGS
} from './muscleDataMapper'; 