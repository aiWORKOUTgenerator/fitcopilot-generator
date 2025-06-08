/**
 * Custom hook for managing muscle group selection state
 * 
 * Provides state management for muscle group selection with validation,
 * persistence, and integration with existing workout form patterns.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  MuscleGroup, 
  MuscleSelectionData, 
  UseMuscleSelectionReturn,
  MuscleSelectionValidation,
  MuscleSelectionSummary
} from '../types/muscle-types';
import { 
  muscleGroupData, 
  MUSCLE_SELECTION_LIMITS,
  validateMuscleSelection,
  getMusclesInGroup 
} from '../constants/muscle-data';
import { useFormPersistence } from './useFormPersistence';

// Storage key for muscle selection persistence
const MUSCLE_SELECTION_STORAGE_KEY = 'fitcopilot_muscle_selection';

/**
 * Initial empty muscle selection state
 */
const initialMuscleSelection: MuscleSelectionData = {
  selectedGroups: [],
  selectedMuscles: {}
};

/**
 * Hook for muscle selection state management
 */
export const useMuscleSelection = (
  maxGroups: number = MUSCLE_SELECTION_LIMITS.MAX_GROUPS,
  enablePersistence: boolean = true
): UseMuscleSelectionReturn => {
  
  // Main selection state
  const [selectionData, setSelectionData] = useState<MuscleSelectionData>(initialMuscleSelection);
  
  // Form persistence for muscle selection
  const persistence = useFormPersistence<MuscleSelectionData>(
    MUSCLE_SELECTION_STORAGE_KEY, 
    selectionData,
    enablePersistence
  );
  
  // Load persisted data on mount
  useEffect(() => {
    if (enablePersistence) {
      const storedData = persistence.loadData();
      if (storedData && (storedData.selectedGroups.length > 0 || Object.keys(storedData.selectedMuscles).length > 0)) {
        setSelectionData(storedData);
      }
    }
  }, [enablePersistence, persistence]);
  
  // Persist data whenever selection changes
  useEffect(() => {
    if (enablePersistence) {
      persistence.saveData(selectionData);
    }
  }, [selectionData, enablePersistence, persistence]);
  
  // Add muscle group to selection
  const addMuscleGroup = useCallback((group: MuscleGroup) => {
    setSelectionData(current => {
      // Don't add if already selected or at max limit
      if (current.selectedGroups.includes(group) || current.selectedGroups.length >= maxGroups) {
        return current;
      }
      
      return {
        ...current,
        selectedGroups: [...current.selectedGroups, group],
        selectedMuscles: {
          ...current.selectedMuscles,
          [group]: [] // Initialize empty muscle array for new group
        }
      };
    });
  }, [maxGroups]);
  
  // Remove muscle group from selection
  const removeMuscleGroup = useCallback((group: MuscleGroup) => {
    setSelectionData(current => {
      const newSelectedGroups = current.selectedGroups.filter(g => g !== group);
      const newSelectedMuscles = { ...current.selectedMuscles };
      delete newSelectedMuscles[group];
      
      return {
        selectedGroups: newSelectedGroups,
        selectedMuscles: newSelectedMuscles
      };
    });
  }, []);
  
  // Toggle individual muscle within a group
  const toggleMuscle = useCallback((group: MuscleGroup, muscle: string) => {
    setSelectionData(current => {
      // Make sure the group is selected first
      if (!current.selectedGroups.includes(group)) {
        return current;
      }
      
      const currentMuscles = current.selectedMuscles[group] || [];
      const newMuscles = currentMuscles.includes(muscle)
        ? currentMuscles.filter(m => m !== muscle)
        : [...currentMuscles, muscle];
      
      return {
        ...current,
        selectedMuscles: {
          ...current.selectedMuscles,
          [group]: newMuscles
        }
      };
    });
  }, []);
  
  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectionData(initialMuscleSelection);
    if (enablePersistence) {
      persistence.clearData();
    }
  }, [enablePersistence, persistence]);
  
  // Check if more groups can be added
  const canAddMore = useMemo(() => {
    return selectionData.selectedGroups.length < maxGroups;
  }, [selectionData.selectedGroups.length, maxGroups]);
  
  // Validation state
  const validation = useMemo((): MuscleSelectionValidation => {
    const result = validateMuscleSelection(selectionData);
    
    return {
      ...result,
      canAddMore,
      maxGroupsReached: selectionData.selectedGroups.length >= maxGroups
    };
  }, [selectionData, canAddMore, maxGroups]);
  
  // Get selection summary for display
  const getSelectionSummary = useCallback((): MuscleSelectionSummary => {
    const totalGroups = selectionData.selectedGroups.length;
    let totalMuscles = 0;
    
    const groupSummary = selectionData.selectedGroups.map(group => {
      const selectedMuscles = selectionData.selectedMuscles[group] || [];
      const totalMusclesInGroup = getMusclesInGroup(group).length;
      totalMuscles += selectedMuscles.length;
      
      return {
        group,
        muscleCount: selectedMuscles.length,
        isComplete: selectedMuscles.length === totalMusclesInGroup
      };
    });
    
    // Generate display text
    let displayText = '';
    if (totalGroups === 0) {
      displayText = 'No muscle groups selected';
    } else if (totalGroups === 1) {
      displayText = `1 muscle group selected`;
    } else {
      displayText = `${totalGroups} muscle groups selected`;
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
  }, [selectionData]);
  
  // Get muscles selected in a specific group
  const getMusclesInGroup = useCallback((group: MuscleGroup): string[] => {
    return selectionData.selectedMuscles[group] || [];
  }, [selectionData.selectedMuscles]);
  
  // Check if a specific muscle is selected
  const isMuscleSelected = useCallback((group: MuscleGroup, muscle: string): boolean => {
    const groupMuscles = selectionData.selectedMuscles[group] || [];
    return groupMuscles.includes(muscle);
  }, [selectionData.selectedMuscles]);
  
  // Check if a group is selected
  const isGroupSelected = useCallback((group: MuscleGroup): boolean => {
    return selectionData.selectedGroups.includes(group);
  }, [selectionData.selectedGroups]);
  
  // Get available muscle groups (not yet selected)
  const getAvailableGroups = useCallback((): MuscleGroup[] => {
    return Object.values(MuscleGroup).filter(group => !selectionData.selectedGroups.includes(group));
  }, [selectionData.selectedGroups]);
  
  return {
    selectionData,
    addMuscleGroup,
    removeMuscleGroup,
    toggleMuscle,
    clearSelection,
    canAddMore,
    validation,
    
    // Additional helper methods
    getSelectionSummary,
    getMusclesInGroup,
    isMuscleSelected,
    isGroupSelected,
    getAvailableGroups,
    
    // Persistence helpers
    hasStoredData: enablePersistence ? persistence.hasStoredData : false,
    clearStoredData: enablePersistence ? persistence.clearData : () => {}
  };
}; 