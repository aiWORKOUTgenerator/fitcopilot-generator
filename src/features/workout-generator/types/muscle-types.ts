/**
 * Muscle Group Selector Types
 * 
 * TypeScript definitions for the muscle targeting system.
 * Based on the 6-group muscle classification system.
 */

/**
 * Primary muscle groups for workout targeting
 */
export enum MuscleGroup {
  Back = 'Back',
  Chest = 'Chest',
  Arms = 'Arms',
  Shoulders = 'Shoulders',
  Core = 'Core',
  Legs = 'Legs'
}

/**
 * Complete muscle selection data structure
 */
export interface MuscleSelectionData {
  selectedGroups: MuscleGroup[];
  selectedMuscles: {
    [key in MuscleGroup]?: string[];
  };
}

/**
 * Muscle group data with display information and muscle lists
 */
export interface MuscleGroupData {
  [key in MuscleGroup]: {
    display: string;
    icon: string;
    muscles: string[];
    description?: string;
  };
}

/**
 * Individual muscle group information
 */
export interface MuscleGroupInfo {
  display: string;
  icon: string;
  muscles: string[];
  description?: string;
}

/**
 * Muscle selection validation result
 */
export interface MuscleSelectionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canAddMore: boolean;
  maxGroupsReached: boolean;
}

/**
 * Muscle selection hook return type
 */
export interface UseMuscleSelectionReturn {
  selectionData: MuscleSelectionData;
  addMuscleGroup: (group: MuscleGroup) => void;
  removeMuscleGroup: (group: MuscleGroup) => void;
  toggleMuscle: (group: MuscleGroup, muscle: string) => void;
  clearSelection: () => void;
  canAddMore: boolean;
  validation: MuscleSelectionValidation;
  
  // Additional helper methods
  getSelectionSummary: () => MuscleSelectionSummary;
  getMusclesInGroup: (group: MuscleGroup) => string[];
  isMuscleSelected: (group: MuscleGroup, muscle: string) => boolean;
  isGroupSelected: (group: MuscleGroup) => boolean;
  getAvailableGroups: () => MuscleGroup[];
  
  // Persistence helpers
  hasStoredData: boolean;
  clearStoredData: () => void;
}

/**
 * Muscle group dropdown props
 */
export interface MuscleGroupDropdownProps {
  selectedGroups: MuscleGroup[];
  onGroupSelect: (group: MuscleGroup) => void;
  disabled?: boolean;
  maxGroups?: number;
  placeholder?: string;
}

/**
 * Muscle group chip props
 */
export interface MuscleGroupChipProps {
  group: MuscleGroup;
  onRemove: (group: MuscleGroup) => void;
  selectedMuscleCount?: number;
  totalMuscleCount?: number;
}

/**
 * Muscle detail grid props
 */
export interface MuscleDetailGridProps {
  group: MuscleGroup;
  selectedMuscles: string[];
  onMuscleToggle: (muscle: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

/**
 * Profile muscle preferences (for integration with existing profile system)
 */
export interface ProfileMusclePreferences {
  favoriteGroups: MuscleGroup[];
  focusAreas: string[];
  avoidedMuscles: string[];
  lastTargeted: {
    [key in MuscleGroup]?: Date;
  };
}

/**
 * API payload for workout generation with muscle targeting
 */
export interface WorkoutGenerationMusclePayload {
  targetMuscleGroups: MuscleGroup[];
  specificMuscles: {
    [key in MuscleGroup]?: string[];
  };
  avoidMuscles?: string[];
  primaryFocus?: MuscleGroup;
}

/**
 * Muscle selection summary for display
 */
export interface MuscleSelectionSummary {
  totalGroups: number;
  totalMuscles: number;
  groupSummary: Array<{
    group: MuscleGroup;
    muscleCount: number;
    isComplete: boolean;
  }>;
  displayText: string;
} 