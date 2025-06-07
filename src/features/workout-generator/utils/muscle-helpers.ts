/**
 * Muscle Group Helper Functions
 * 
 * Utility functions for muscle group operations, data manipulation,
 * and integration with the muscle selector system.
 */

import { 
  MuscleGroup, 
  MuscleSelectionData, 
  MuscleSelectionValidation,
  MuscleSelectionSummary,
  ProfileMusclePreferences,
  WorkoutGenerationMusclePayload
} from '../types/muscle-types';
import { 
  muscleGroupData, 
  MUSCLE_SELECTION_LIMITS, 
  MUSCLE_GROUP_DISPLAY_ORDER,
  validateMuscleSelection 
} from '../constants/muscle-data';

/**
 * Get all available muscle groups in display order
 */
export const getAllMuscleGroups = (): MuscleGroup[] => {
  return MUSCLE_GROUP_DISPLAY_ORDER;
};

/**
 * Get muscle group display name
 */
export const getMuscleGroupDisplayName = (group: MuscleGroup): string => {
  return muscleGroupData[group]?.display || group;
};

/**
 * Get muscle group icon
 */
export const getMuscleGroupIcon = (group: MuscleGroup): string => {
  return muscleGroupData[group]?.icon || '💪';
};

/**
 * Get muscle group description
 */
export const getMuscleGroupDescription = (group: MuscleGroup): string => {
  return muscleGroupData[group]?.description || '';
};

/**
 * Get all muscles in a specific group
 */
export const getMusclesInGroup = (group: MuscleGroup): string[] => {
  return muscleGroupData[group]?.muscles || [];
};

/**
 * Get muscle group for a specific muscle name
 */
export const getMuscleGroupForMuscle = (muscleName: string): MuscleGroup | null => {
  for (const [group, data] of Object.entries(muscleGroupData)) {
    if (data.muscles.includes(muscleName)) {
      return group as MuscleGroup;
    }
  }
  return null;
};

/**
 * Format muscle name consistently
 */
export const formatMuscle = (muscle: string): string => {
  return muscle.trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format muscle selection for API calls
 */
export const formatMuscleSelection = (selectionData: MuscleSelectionData): WorkoutGenerationMusclePayload => {
  return {
    targetMuscleGroups: selectionData.selectedGroups,
    specificMuscles: selectionData.selectedMuscles,
    primaryFocus: selectionData.selectedGroups[0] || undefined
  };
};

/**
 * Validate muscle selection data
 */
export const validateMuscleSelectionData = (selectionData: MuscleSelectionData): MuscleSelectionValidation => {
  return validateMuscleSelection(selectionData);
};

/**
 * Create muscle selection summary
 */
export const createMuscleSelectionSummary = (selectionData: MuscleSelectionData): MuscleSelectionSummary => {
  const totalGroups = selectionData.selectedGroups.length;
  const totalMuscles = Object.values(selectionData.selectedMuscles || {})
    .reduce((acc, muscles) => acc + (muscles?.length || 0), 0);

  const groupSummary = selectionData.selectedGroups.map(group => {
    const selectedMuscles = selectionData.selectedMuscles?.[group] || [];
    const totalMusclesInGroup = getMusclesInGroup(group).length;
    
    return {
      group,
      muscleCount: selectedMuscles.length,
      isComplete: selectedMuscles.length === totalMusclesInGroup
    };
  });

  let displayText = '';
  if (totalGroups === 0) {
    displayText = 'No muscle groups selected';
  } else if (totalGroups === 1) {
    displayText = `${getMuscleGroupDisplayName(selectionData.selectedGroups[0])}`;
  } else if (totalGroups === 2) {
    displayText = `${getMuscleGroupDisplayName(selectionData.selectedGroups[0])} & ${getMuscleGroupDisplayName(selectionData.selectedGroups[1])}`;
  } else {
    displayText = `${totalGroups} muscle groups`;
  }

  if (totalMuscles > 0) {
    displayText += ` (${totalMuscles} specific muscles)`;
  }

  return {
    totalGroups,
    totalMuscles,
    groupSummary,
    displayText
  };
};

/**
 * Check if can add more muscle groups
 */
export const canAddMoreGroups = (selectionData: MuscleSelectionData): boolean => {
  return selectionData.selectedGroups.length < MUSCLE_SELECTION_LIMITS.MAX_GROUPS;
};

/**
 * Check if selection has reached maximum groups
 */
export const hasReachedMaxGroups = (selectionData: MuscleSelectionData): boolean => {
  return selectionData.selectedGroups.length >= MUSCLE_SELECTION_LIMITS.MAX_GROUPS;
};

/**
 * Get remaining group slots
 */
export const getRemainingGroupSlots = (selectionData: MuscleSelectionData): number => {
  return Math.max(0, MUSCLE_SELECTION_LIMITS.MAX_GROUPS - selectionData.selectedGroups.length);
};

/**
 * Convert muscle arrays to group arrays (legacy support)
 */
export const convertMusclesToGroups = (muscles: string[]): MuscleGroup[] => {
  const groups = new Set<MuscleGroup>();
  
  muscles.forEach(muscle => {
    const group = getMuscleGroupForMuscle(muscle);
    if (group) {
      groups.add(group);
    }
  });
  
  return Array.from(groups);
};

/**
 * Get muscle info from exercise data (for integration with existing systems)
 */
export const getMuscleInfo = (exerciseData: any): {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  muscleGroups: MuscleGroup[];
} => {
  const primaryMuscles = exerciseData.primaryMuscles || exerciseData.primary_muscles || [];
  const secondaryMuscles = exerciseData.secondaryMuscles || exerciseData.secondary_muscles || [];
  
  const allMuscles = [...primaryMuscles, ...secondaryMuscles];
  const muscleGroups = convertMusclesToGroups(allMuscles);
  
  return {
    primaryMuscles: primaryMuscles.map(formatMuscle),
    secondaryMuscles: secondaryMuscles.map(formatMuscle),
    muscleGroups
  };
};

/**
 * Create empty muscle selection data
 */
export const createEmptyMuscleSelection = (): MuscleSelectionData => {
  return {
    selectedGroups: [],
    selectedMuscles: {}
  };
};

/**
 * Clone muscle selection data
 */
export const cloneMuscleSelection = (selectionData: MuscleSelectionData): MuscleSelectionData => {
  return {
    selectedGroups: [...selectionData.selectedGroups],
    selectedMuscles: Object.fromEntries(
      Object.entries(selectionData.selectedMuscles || {}).map(([group, muscles]) => [
        group,
        [...(muscles || [])]
      ])
    )
  };
};

/**
 * Merge muscle selections (useful for profile integration)
 */
export const mergeMuscleSelections = (
  selection1: MuscleSelectionData,
  selection2: MuscleSelectionData
): MuscleSelectionData => {
  const mergedGroups = new Set([...selection1.selectedGroups, ...selection2.selectedGroups]);
  const mergedMuscles: { [key in MuscleGroup]?: string[] } = {};
  
  // Merge selected muscles, avoiding duplicates
  [...selection1.selectedGroups, ...selection2.selectedGroups].forEach(group => {
    const muscles1 = selection1.selectedMuscles?.[group] || [];
    const muscles2 = selection2.selectedMuscles?.[group] || [];
    mergedMuscles[group] = Array.from(new Set([...muscles1, ...muscles2]));
  });
  
  return {
    selectedGroups: Array.from(mergedGroups).slice(0, MUSCLE_SELECTION_LIMITS.MAX_GROUPS),
    selectedMuscles: mergedMuscles
  };
};

/**
 * Convert profile muscle preferences to selection data
 */
export const profileToMuscleSelection = (preferences: ProfileMusclePreferences): MuscleSelectionData => {
  return {
    selectedGroups: preferences.favoriteGroups.slice(0, MUSCLE_SELECTION_LIMITS.MAX_GROUPS),
    selectedMuscles: {}
  };
};

/**
 * Convert muscle selection to profile preferences
 */
export const muscleSelectionToProfile = (
  selectionData: MuscleSelectionData
): Partial<ProfileMusclePreferences> => {
  return {
    favoriteGroups: selectionData.selectedGroups,
    focusAreas: Object.values(selectionData.selectedMuscles || {}).flat()
  };
};

/**
 * Get suggested muscle groups based on current selection
 */
export const getSuggestedMuscleGroups = (
  currentSelection: MuscleSelectionData,
  workoutType?: string
): MuscleGroup[] => {
  const currentGroups = new Set(currentSelection.selectedGroups);
  const suggestions: MuscleGroup[] = [];
  
  // Basic suggestion logic based on workout type and current selection
  if (workoutType === 'upper_body' || currentGroups.has(MuscleGroup.Chest)) {
    if (!currentGroups.has(MuscleGroup.Back)) suggestions.push(MuscleGroup.Back);
    if (!currentGroups.has(MuscleGroup.Shoulders)) suggestions.push(MuscleGroup.Shoulders);
    if (!currentGroups.has(MuscleGroup.Arms)) suggestions.push(MuscleGroup.Arms);
  }
  
  if (workoutType === 'lower_body' || currentGroups.has(MuscleGroup.Legs)) {
    if (!currentGroups.has(MuscleGroup.Core)) suggestions.push(MuscleGroup.Core);
  }
  
  // If no specific suggestions, return remaining groups
  if (suggestions.length === 0) {
    const allGroups = getAllMuscleGroups();
    return allGroups.filter(group => !currentGroups.has(group));
  }
  
  return suggestions.filter(group => !currentGroups.has(group));
};

/**
 * Check if muscle selection is empty
 */
export const isMuscleSelectionEmpty = (selectionData: MuscleSelectionData): boolean => {
  return selectionData.selectedGroups.length === 0;
};

/**
 * Check if muscle selection has specific muscles
 */
export const hasSpecificMuscles = (selectionData: MuscleSelectionData): boolean => {
  return Object.values(selectionData.selectedMuscles || {}).some(muscles => muscles && muscles.length > 0);
}; 