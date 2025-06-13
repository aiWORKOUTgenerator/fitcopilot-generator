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
  validateMuscleSelection,
  MUSCLE_GROUP_COMBINATIONS,
  getMusclesInGroup,
  getMuscleGroupInfo
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

/**
 * Muscle Selection Utility Functions
 * 
 * Helper functions for muscle group selection, formatting, validation,
 * and integration with the workout generation system.
 */

/**
 * Format muscle selection data for API calls
 */
export const formatMuscleSelectionForAPI = (
  selectionData: MuscleSelectionData,
  primaryFocus?: MuscleGroup
): WorkoutGenerationMusclePayload => {
  return {
    targetMuscleGroups: selectionData.selectedGroups,
    specificMuscles: selectionData.selectedMuscles,
    primaryFocus: primaryFocus || (selectionData.selectedGroups.length > 0 ? selectionData.selectedGroups[0] : undefined)
  };
};

/**
 * Format muscle selection for display text
 */
export const formatMuscleSelectionDisplay = (selectionData: MuscleSelectionData): string => {
  if (selectionData.selectedGroups.length === 0) {
    return 'All muscle groups';
  }
  
  // Helper function to safely get muscle group display name
  const getGroupDisplay = (group: MuscleGroup): string => {
    try {
      return muscleGroupData[group]?.display || group.toString();
    } catch (error) {
      console.warn(`[MuscleHelpers] Invalid muscle group in display: ${group}`, error);
      return group.toString();
    }
  };
  
  if (selectionData.selectedGroups.length === 1) {
    return getGroupDisplay(selectionData.selectedGroups[0]);
  }
  
  if (selectionData.selectedGroups.length === 2) {
    return `${getGroupDisplay(selectionData.selectedGroups[0])} & ${getGroupDisplay(selectionData.selectedGroups[1])}`;
  }
  
  // For 3+ groups, show first two and "& X more"
  const firstTwo = selectionData.selectedGroups.slice(0, 2)
    .map(group => getGroupDisplay(group))
    .join(', ');
  const remaining = selectionData.selectedGroups.length - 2;
  
  return `${firstTwo} & ${remaining} more`;
};

/**
 * Get suggested muscle group combinations based on current selection
 */
export const getSuggestedCombinations = (currentSelection: MuscleGroup[]): Array<{
  name: string;
  groups: MuscleGroup[];
  description: string;
}> => {
  const suggestions: Array<{ name: string; groups: MuscleGroup[]; description: string; }> = [];
  
  // If no current selection, show popular combinations
  if (currentSelection.length === 0) {
    return Object.entries(MUSCLE_GROUP_COMBINATIONS).map(([name, groups]) => ({
      name,
      groups: groups as MuscleGroup[],
      description: `Target ${groups.length} muscle groups: ${groups.join(', ')}`
    }));
  }
  
  // If one group selected, suggest complementary groups
  if (currentSelection.length === 1) {
    const selected = currentSelection[0];
    
    switch (selected) {
      case MuscleGroup.Chest:
        suggestions.push(
          {
            name: 'Push Focus',
            groups: [MuscleGroup.Chest, MuscleGroup.Shoulders, MuscleGroup.Arms],
            description: 'Complete upper body pushing muscles'
          },
          {
            name: 'Upper Body',
            groups: [MuscleGroup.Chest, MuscleGroup.Back],
            description: 'Balanced upper body development'
          }
        );
        break;
      case MuscleGroup.Back:
        suggestions.push(
          {
            name: 'Pull Focus',
            groups: [MuscleGroup.Back, MuscleGroup.Arms],
            description: 'Complete upper body pulling muscles'
          },
          {
            name: 'Posture & Core',
            groups: [MuscleGroup.Back, MuscleGroup.Core],
            description: 'Strengthen posture and stability'
          }
        );
        break;
      case MuscleGroup.Legs:
        suggestions.push(
          {
            name: 'Lower Body',
            groups: [MuscleGroup.Legs, MuscleGroup.Core],
            description: 'Complete lower body and core strength'
          }
        );
        break;
    }
  }
  
  return suggestions.filter(suggestion => 
    suggestion.groups.length <= MUSCLE_SELECTION_LIMITS.MAX_GROUPS &&
    !suggestion.groups.every(group => currentSelection.includes(group))
  );
};

/**
 * Validate muscle selection against user profile and preferences
 */
export const validateMuscleSelectionWithProfile = (
  selectionData: MuscleSelectionData,
  profilePreferences?: ProfileMusclePreferences
): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  if (!profilePreferences) {
    return { isValid: true, warnings, suggestions };
  }
  
  // Check for avoided muscles
  if (profilePreferences.avoidedMuscles.length > 0) {
    Object.entries(selectionData.selectedMuscles).forEach(([group, muscles]) => {
      const conflictingMuscles = muscles?.filter(muscle => 
        profilePreferences.avoidedMuscles.includes(muscle)
      ) || [];
      
      if (conflictingMuscles.length > 0) {
        warnings.push(`Avoid ${conflictingMuscles.join(', ')} based on your profile`);
      }
    });
  }
  
  // Check for recently targeted muscles (recovery time)
  if (profilePreferences.lastTargeted) {
    const recentlyTargeted = selectionData.selectedGroups.filter(group => {
      const lastWorkout = profilePreferences.lastTargeted[group];
      if (!lastWorkout) return false;
      
      const daysSince = Math.floor((Date.now() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince < 2; // Less than 2 days recovery
    });
    
    if (recentlyTargeted.length > 0) {
      warnings.push(`Recently targeted: ${recentlyTargeted.join(', ')} - consider rest time`);
    }
  }
  
  // Suggest favorite groups if not selected
  if (profilePreferences.favoriteGroups.length > 0) {
    const unselectedFavorites = profilePreferences.favoriteGroups.filter(group => 
      !selectionData.selectedGroups.includes(group)
    );
    
    if (unselectedFavorites.length > 0 && selectionData.selectedGroups.length < MUSCLE_SELECTION_LIMITS.MAX_GROUPS) {
      suggestions.push(`Consider adding: ${unselectedFavorites.slice(0, 2).join(', ')}`);
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
};

/**
 * Calculate workout balance score based on muscle selection
 */
export const calculateWorkoutBalance = (selectionData: MuscleSelectionData): {
  score: number;
  analysis: string;
  recommendations: string[];
} => {
  const recommendations: string[] = [];
  let score = 0;
  
  const selectedGroups = selectionData.selectedGroups;
  const hasUpper = selectedGroups.some(group => 
    [MuscleGroup.Chest, MuscleGroup.Back, MuscleGroup.Arms, MuscleGroup.Shoulders].includes(group)
  );
  const hasLower = selectedGroups.includes(MuscleGroup.Legs);
  const hasCore = selectedGroups.includes(MuscleGroup.Core);
  const hasPush = selectedGroups.some(group => 
    [MuscleGroup.Chest, MuscleGroup.Shoulders].includes(group)
  );
  const hasPull = selectedGroups.includes(MuscleGroup.Back);
  
  // Balance scoring
  if (hasUpper && hasLower) score += 30;
  if (hasCore) score += 20;
  if (hasPush && hasPull) score += 25;
  if (selectedGroups.length >= 2) score += 15;
  if (selectedGroups.length === 3) score += 10;
  
  // Generate analysis and recommendations
  let analysis = '';
  if (score >= 80) {
    analysis = 'Excellent balance - targets multiple muscle groups effectively';
  } else if (score >= 60) {
    analysis = 'Good balance - solid muscle group selection';
  } else if (score >= 40) {
    analysis = 'Moderate balance - consider adding complementary groups';
  } else {
    analysis = 'Limited balance - focused on specific areas';
  }
  
  // Specific recommendations
  if (!hasCore && selectedGroups.length < MUSCLE_SELECTION_LIMITS.MAX_GROUPS) {
    recommendations.push('Add Core for better stability and functional strength');
  }
  if (hasPush && !hasPull && selectedGroups.length < MUSCLE_SELECTION_LIMITS.MAX_GROUPS) {
    recommendations.push('Add Back exercises to balance pushing movements');
  }
  if (hasPull && !hasPush && selectedGroups.length < MUSCLE_SELECTION_LIMITS.MAX_GROUPS) {
    recommendations.push('Add Chest or Shoulders to balance pulling movements');
  }
  if (hasUpper && !hasLower && selectedGroups.length < MUSCLE_SELECTION_LIMITS.MAX_GROUPS) {
    recommendations.push('Add Legs for a more complete workout');
  }
  
  return { score, analysis, recommendations };
};

/**
 * Generate muscle selection summary with rich information
 */
export const generateMuscleSelectionSummary = (selectionData: MuscleSelectionData): MuscleSelectionSummary & {
  balance: ReturnType<typeof calculateWorkoutBalance>;
  estimatedDuration: number;
  difficulty: 'Low' | 'Medium' | 'High';
} => {
  const totalGroups = selectionData.selectedGroups.length;
  let totalMuscles = 0;
  
  const groupSummary = selectionData.selectedGroups.map(group => {
    const selectedMuscles = selectionData.selectedMuscles[group] || [];
    
    // Safety check: ensure group exists in muscleGroupData
    let totalMusclesInGroup = 0;
    try {
      totalMusclesInGroup = getMusclesInGroup(group).length;
    } catch (error) {
      console.warn(`[MuscleHelpers] Invalid muscle group: ${group}`, error);
      totalMusclesInGroup = 0;
    }
    
    totalMuscles += selectedMuscles.length;
    
    return {
      group,
      muscleCount: selectedMuscles.length,
      isComplete: selectedMuscles.length === totalMusclesInGroup
    };
  });
  
  // Generate display text
  let displayText = formatMuscleSelectionDisplay(selectionData);
  
  // Calculate estimated duration (base 20min + 10min per additional group)
  const estimatedDuration = Math.max(20, 20 + (totalGroups - 1) * 10);
  
  // Determine difficulty based on selection complexity
  let difficulty: 'Low' | 'Medium' | 'High' = 'Low';
  if (totalGroups >= 3 || totalMuscles > 8) {
    difficulty = 'High';
  } else if (totalGroups === 2 || totalMuscles > 4) {
    difficulty = 'Medium';
  }
  
  return {
    totalGroups,
    totalMuscles,
    groupSummary,
    displayText,
    balance: calculateWorkoutBalance(selectionData),
    estimatedDuration,
    difficulty
  };
};

/**
 * Create muscle selection from user preferences
 */
export const createMuscleSelectionFromPreferences = (
  preferences: ProfileMusclePreferences,
  maxGroups: number = MUSCLE_SELECTION_LIMITS.MAX_GROUPS
): MuscleSelectionData => {
  const selectedGroups = preferences.favoriteGroups.slice(0, maxGroups);
  const selectedMuscles: { [key in MuscleGroup]?: string[] } = {};
  
  // Initialize with focus areas if available
  selectedGroups.forEach(group => {
    const groupMuscles = getMusclesInGroup(group);
    const focusedMuscles = preferences.focusAreas.filter(muscle => 
      groupMuscles.includes(muscle)
    );
    
    selectedMuscles[group] = focusedMuscles;
  });
  
  return {
    selectedGroups,
    selectedMuscles
  };
};

/**
 * Export muscle selection to various formats
 */
export const exportMuscleSelection = {
  // Export to simple array format
  toArray: (selectionData: MuscleSelectionData): string[] => {
    return selectionData.selectedGroups.map(group => muscleGroupData[group].display);
  },
  
  // Export to detailed object format
  toDetailedObject: (selectionData: MuscleSelectionData) => {
    return selectionData.selectedGroups.map(group => ({
      group,
      display: muscleGroupData[group].display,
      icon: muscleGroupData[group].icon,
      muscles: selectionData.selectedMuscles[group] || [],
      allMuscles: getMusclesInGroup(group)
    }));
  },
  
  // Export to workout generation format
  toWorkoutFormat: formatMuscleSelectionForAPI,
  
  // Export to display text
  toDisplayText: formatMuscleSelectionDisplay
}; 