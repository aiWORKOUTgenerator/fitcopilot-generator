/**
 * Muscle Group Data Constants
 * 
 * Comprehensive muscle group and individual muscle data for workout targeting.
 * Based on the 6-group muscle classification system from the previous project.
 */

import { MuscleGroup, MuscleGroupData } from '../types/muscle-types';

/**
 * Complete muscle group data with muscles, icons, and descriptions
 */
export const muscleGroupData: MuscleGroupData = {
  [MuscleGroup.Back]: {
    display: 'Back',
    icon: '🏋️',
    description: 'Upper and lower back muscles for posture and pulling strength',
    muscles: [
      'Lats',
      'Rhomboids', 
      'Middle Traps',
      'Lower Traps',
      'Rear Delts'
    ]
  },
  [MuscleGroup.Chest]: {
    display: 'Chest',
    icon: '💪',
    description: 'Pectoral muscles for pushing movements and upper body strength',
    muscles: [
      'Upper Chest',
      'Middle Chest', 
      'Lower Chest'
    ]
  },
  [MuscleGroup.Arms]: {
    display: 'Arms',
    icon: '💪',
    description: 'Biceps, triceps, and forearms for arm strength and definition',
    muscles: [
      'Biceps',
      'Triceps',
      'Forearms'
    ]
  },
  [MuscleGroup.Shoulders]: {
    display: 'Shoulders',
    icon: '🤸',
    description: 'Deltoid muscles for shoulder stability and overhead movements',
    muscles: [
      'Front Delts',
      'Side Delts', 
      'Rear Delts'
    ]
  },
  [MuscleGroup.Core]: {
    display: 'Core',
    icon: '🧘',
    description: 'Abdominal and core muscles for stability and functional strength',
    muscles: [
      'Upper Abs',
      'Lower Abs',
      'Obliques',
      'Transverse Abdominis'
    ]
  },
  [MuscleGroup.Legs]: {
    display: 'Legs',
    icon: '🦵',
    description: 'Lower body muscles for power, stability, and functional movement',
    muscles: [
      'Quadriceps',
      'Hamstrings',
      'Glutes',
      'Calves'
    ]
  }
};

/**
 * Default muscle group selection limits
 */
export const MUSCLE_SELECTION_LIMITS = {
  MAX_GROUPS: 3,
  MIN_GROUPS: 1,
  MAX_SPECIFIC_MUSCLES_PER_GROUP: 10,
  MIN_SPECIFIC_MUSCLES_PER_GROUP: 0
} as const;

/**
 * Muscle group display order for UI components
 */
export const MUSCLE_GROUP_DISPLAY_ORDER: MuscleGroup[] = [
  MuscleGroup.Back,
  MuscleGroup.Chest,
  MuscleGroup.Arms,
  MuscleGroup.Shoulders,
  MuscleGroup.Core,
  MuscleGroup.Legs
];

/**
 * Common muscle group combinations for workout suggestions
 */
export const MUSCLE_GROUP_COMBINATIONS = {
  'Upper Body Push': [MuscleGroup.Chest, MuscleGroup.Shoulders, MuscleGroup.Arms],
  'Upper Body Pull': [MuscleGroup.Back, MuscleGroup.Arms],
  'Lower Body': [MuscleGroup.Legs, MuscleGroup.Core],
  'Full Body': [MuscleGroup.Back, MuscleGroup.Chest, MuscleGroup.Legs],
  'Core Focus': [MuscleGroup.Core, MuscleGroup.Back],
  'Arms & Shoulders': [MuscleGroup.Arms, MuscleGroup.Shoulders]
} as const;

/**
 * Muscle group workout frequency recommendations
 */
export const MUSCLE_GROUP_FREQUENCY = {
  [MuscleGroup.Back]: { minDays: 2, maxDays: 3, restDays: 1 },
  [MuscleGroup.Chest]: { minDays: 2, maxDays: 3, restDays: 1 },
  [MuscleGroup.Arms]: { minDays: 2, maxDays: 4, restDays: 1 },
  [MuscleGroup.Shoulders]: { minDays: 2, maxDays: 3, restDays: 1 },
  [MuscleGroup.Core]: { minDays: 3, maxDays: 6, restDays: 0 },
  [MuscleGroup.Legs]: { minDays: 2, maxDays: 3, restDays: 1 }
} as const;

/**
 * Muscle group difficulty levels for progression
 */
export const MUSCLE_GROUP_DIFFICULTY = {
  [MuscleGroup.Back]: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  [MuscleGroup.Chest]: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  [MuscleGroup.Arms]: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  [MuscleGroup.Shoulders]: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  [MuscleGroup.Core]: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  [MuscleGroup.Legs]: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
} as const;

/**
 * Muscle group equipment preferences
 */
export const MUSCLE_GROUP_EQUIPMENT = {
  [MuscleGroup.Back]: ['Pull-up Bar', 'Dumbbells', 'Resistance Bands', 'Barbell'],
  [MuscleGroup.Chest]: ['Dumbbells', 'Bench', 'Barbell', 'No Equipment'],
  [MuscleGroup.Arms]: ['Dumbbells', 'Resistance Bands', 'Barbell', 'No Equipment'],
  [MuscleGroup.Shoulders]: ['Dumbbells', 'Resistance Bands', 'Barbell', 'No Equipment'],
  [MuscleGroup.Core]: ['No Equipment', 'Yoga Mat', 'Medicine Ball', 'Stability Ball'],
  [MuscleGroup.Legs]: ['No Equipment', 'Dumbbells', 'Barbell', 'Resistance Bands']
} as const;

/**
 * Helper function to get all muscle groups
 */
export const getAllMuscleGroups = (): MuscleGroup[] => {
  return MUSCLE_GROUP_DISPLAY_ORDER;
};

/**
 * Helper function to get muscle group info
 */
export const getMuscleGroupInfo = (group: MuscleGroup) => {
  return muscleGroupData[group];
};

/**
 * Helper function to get all muscles in a group
 */
export const getMusclesInGroup = (group: MuscleGroup): string[] => {
  return muscleGroupData[group].muscles;
};

/**
 * Helper function to get muscle group by muscle name
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
 * Helper function to validate muscle selection
 */
export const validateMuscleSelection = (selectionData: any) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (selectionData.selectedGroups.length > MUSCLE_SELECTION_LIMITS.MAX_GROUPS) {
    errors.push(`Maximum ${MUSCLE_SELECTION_LIMITS.MAX_GROUPS} muscle groups allowed`);
  }
  
  if (selectionData.selectedGroups.length < MUSCLE_SELECTION_LIMITS.MIN_GROUPS) {
    warnings.push('At least one muscle group is recommended');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    canAddMore: selectionData.selectedGroups.length < MUSCLE_SELECTION_LIMITS.MAX_GROUPS,
    maxGroupsReached: selectionData.selectedGroups.length >= MUSCLE_SELECTION_LIMITS.MAX_GROUPS
  };
}; 