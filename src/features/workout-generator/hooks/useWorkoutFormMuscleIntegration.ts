/**
 * Workout Form Muscle Integration Hook
 * 
 * Architectural bridge between muscle selection domain and workout form domain.
 * Implements clean separation of concerns with proper data flow orchestration.
 * 
 * This hook serves as the Application Layer component that orchestrates
 * the integration between:
 * - Muscle Selection Domain (useMuscleSelection)
 * - Muscle API Persistence Layer (POST /muscle-selection)
 * - Workout Form Domain (useWorkoutForm) 
 * - Profile Domain (useProfile)
 * 
 * Key Architectural Principles:
 * - Single Responsibility: Only handles muscle-form integration
 * - Dependency Inversion: Depends on abstractions, not concretions
 * - Open/Closed: Extensible for other form integrations
 * - Interface Segregation: Clean, focused interfaces
 * - API-First: Integrates with unique muscle API endpoints
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWorkoutForm } from './useWorkoutForm';
import { useMuscleSelection } from './useMuscleSelection';
import { useProfile } from '../../profile/context';
import { MuscleSelectionData, MuscleGroup } from '../types/muscle-types';
import { formatMuscleSelectionForAPI, generateMuscleSelectionSummary } from '../utils/muscle-helpers';
import { WorkoutFormParams } from '../types/workout';

/**
 * API Service for muscle selection persistence
 */
const muscleSelectionAPI = {
  async save(selectionData: MuscleSelectionData): Promise<boolean> {
    try {
      const response = await fetch('/wp-json/fitcopilot/v1/muscle-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedGroups: selectionData.selectedGroups,
          selectedMuscles: selectionData.selectedMuscles
        })
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('[MuscleAPI] Save failed:', error);
      return false;
    }
  },
  
  async load(): Promise<MuscleSelectionData | null> {
    try {
      const response = await fetch('/wp-json/fitcopilot/v1/muscle-selection');
      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          selectedGroups: result.data.selectedGroups || [],
          selectedMuscles: result.data.selectedMuscles || {}
        };
      }
      return null;
    } catch (error) {
      console.error('[MuscleAPI] Load failed:', error);
      return null;
    }
  }
};

/**
 * Integration state interface for type safety
 */
export interface MuscleFormIntegrationState {
  // Muscle selection state
  muscleSelection: MuscleSelectionData;
  hasMuscleSelection: boolean;
  
  // Form integration state
  isIntegrated: boolean;
  isSynced: boolean;
  
  // Validation state
  isValid: boolean;
  validationErrors: string[];
  
  // Profile integration
  hasProfileSuggestions: boolean;
  profileSuggestedGroups: MuscleGroup[];
}

/**
 * Integration actions interface for clean API
 */
export interface MuscleFormIntegrationActions {
  // Core integration actions
  syncMuscleSelectionToForm: () => void;
  clearMuscleSelection: () => void;
  resetIntegration: () => void;
  
  // Form data preparation
  getFormDataWithMuscleSelection: () => WorkoutFormParams & {
    muscleSelection: MuscleSelectionData;
    muscleTargeting: {
      targetMuscleGroups: MuscleGroup[];
      specificMuscles: Record<MuscleGroup, string[]>;
      primaryFocus: MuscleGroup | undefined;
      selectionSummary: string;
    };
  };
  
  // Validation
  validateIntegratedForm: () => boolean;
  
  // Profile integration
  applySuggestedMuscleGroups: (groups: MuscleGroup[]) => void;
}

/**
 * Integration hook return interface
 */
export interface UseWorkoutFormMuscleIntegrationReturn {
  // State
  state: MuscleFormIntegrationState;
  
  // Actions
  actions: MuscleFormIntegrationActions;
  
  // Computed values
  completionPercentage: number;
  selectionSummary: string;
  
  // Integration metadata
  metadata: {
    lastSyncTimestamp: number | null;
    integrationVersion: string;
    isDebugging: boolean;
  };
}

/**
 * Configuration options for the integration
 */
interface MuscleFormIntegrationOptions {
  // Sync behavior
  autoSync?: boolean;
  syncDebounceMs?: number;
  
  // Validation
  requireMuscleSelection?: boolean;
  maxMuscleGroups?: number;
  
  // Profile integration
  enableProfileSuggestions?: boolean;
  
  // Debug mode
  enableDebugLogging?: boolean;
}

/**
 * Default configuration - Production optimized for Target Muscles card
 */
const DEFAULT_OPTIONS: Required<MuscleFormIntegrationOptions> = {
  autoSync: true,        // ✅ ENABLED: Auto-sync muscle selection to form state
  syncDebounceMs: 150,   // ✅ OPTIMIZED: Faster sync for better UX  
  requireMuscleSelection: false,
  maxMuscleGroups: 3,
  enableProfileSuggestions: true,
  enableDebugLogging: false
};

/**
 * Main integration hook implementation
 * 
 * Provides clean, type-safe integration between muscle selection and workout form
 * following clean architecture principles.
 */
export function useWorkoutFormMuscleIntegration(
  options: MuscleFormIntegrationOptions = {}
): UseWorkoutFormMuscleIntegrationReturn {
  
  // Merge with defaults
  const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  
  // Core dependencies
  const workoutForm = useWorkoutForm();
  const muscleSelection = useMuscleSelection(config.maxMuscleGroups, true);
  const { profileData, isLoading: profileLoading } = useProfile();
  
  // Integration state tracking
  const lastSyncTimestamp = useRef<number | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debug logging utility
  const debugLog = useCallback((message: string, data?: any) => {
    if (config.enableDebugLogging) {
      console.log(`[MuscleFormIntegration] ${message}`, data);
    }
  }, [config.enableDebugLogging]);
  
  // Profile-based muscle suggestions
  const profileSuggestedGroups = useMemo((): MuscleGroup[] => {
    if (!config.enableProfileSuggestions || !profileData?.goals) return [];
    
    // Map profile goals to suggested muscle groups
    const goalToMuscleMap: Record<string, MuscleGroup[]> = {
      'strength': [MuscleGroup.Chest, MuscleGroup.Back, MuscleGroup.Legs],
      'muscle': [MuscleGroup.Chest, MuscleGroup.Back, MuscleGroup.Arms],
      'cardio': [MuscleGroup.Legs, MuscleGroup.Core],
      'flexibility': [MuscleGroup.Core, MuscleGroup.Back],
      'endurance': [MuscleGroup.Legs, MuscleGroup.Core, MuscleGroup.Back]
    };
    
    const suggestedGroups = new Set<MuscleGroup>();
    profileData.goals.forEach((goal: any) => {
      const goalKey = goal.value || goal;
      if (goalToMuscleMap[goalKey]) {
        goalToMuscleMap[goalKey].forEach(group => suggestedGroups.add(group));
      }
    });
    
    return Array.from(suggestedGroups).slice(0, 3);
  }, [profileData?.goals, config.enableProfileSuggestions]);
  
  // Enhanced sync with API persistence integration
  const syncMuscleSelectionToForm = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(async () => {
      const muscleGroups = muscleSelection.selectionData.selectedGroups.map(group => group.toString());
      const currentFocusArea = workoutForm.formValues.sessionInputs?.focusArea || [];
      
      // Only sync if there's a meaningful change
      if (JSON.stringify(currentFocusArea.sort()) !== JSON.stringify(muscleGroups.sort())) {
        debugLog('Syncing muscle selection to form with API persistence', {
          muscleGroups,
          currentFocusArea,
          selectionData: muscleSelection.selectionData
        });
        
        // 1. Persist to API (unique to Target Muscles card)
        const hasMuscleSelection = muscleSelection.selectionData.selectedGroups.length > 0;
        if (hasMuscleSelection) {
          const apiSaveSuccess = await muscleSelectionAPI.save(muscleSelection.selectionData);
          debugLog('API persistence result', { success: apiSaveSuccess });
        }
        
        // 2. Sync to form state for PremiumPreviewStep
        const muscleApiData = formatMuscleSelectionForAPI(muscleSelection.selectionData);
        const selectionSummary = generateMuscleSelectionSummary(muscleSelection.selectionData);
        
        workoutForm.updateField('sessionInputs', {
          ...workoutForm.formValues.sessionInputs,
          focusArea: muscleGroups,
          muscleTargeting: {
            targetMuscleGroups: muscleApiData.targetMuscleGroups,
            specificMuscles: muscleApiData.specificMuscles,
            primaryFocus: muscleApiData.primaryFocus,
            selectionSummary: selectionSummary.displayText
          }
        });
        
        lastSyncTimestamp.current = Date.now();
      }
    }, config.syncDebounceMs);
  }, [muscleSelection.selectionData, workoutForm, config.syncDebounceMs, debugLog]);
  
  // Auto-sync effect
  useEffect(() => {
    if (config.autoSync) {
      syncMuscleSelectionToForm();
    }
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [config.autoSync, syncMuscleSelectionToForm]);
  
  // Initialize muscle integration from API and cached data on mount
  useEffect(() => {
    const initializeMuscleIntegration = async () => {
      // 1. Try loading from API first (unique to Target Muscles card)
      const apiData = await muscleSelectionAPI.load();
      
      // 2. Check local cached data
      const hasCachedMuscleData = muscleSelection.selectionData.selectedGroups.length > 0;
      const hasFormMuscleData = workoutForm.formValues.sessionInputs?.focusArea?.length > 0;
      
      debugLog('Initializing muscle integration', {
        apiData,
        cachedData: muscleSelection.selectionData,
        formData: workoutForm.formValues.sessionInputs?.focusArea
      });
      
      // 3. Determine data source priority: API > cached > none
      let dataToSync = null;
      
      if (apiData && apiData.selectedGroups.length > 0) {
        // API data takes priority - restore to muscle selection
        debugLog('Restoring from API data');
        // Convert string muscle groups to proper MuscleGroup enum values
        apiData.selectedGroups.forEach(groupString => {
          // Convert lowercase API string to proper MuscleGroup enum
          const muscleGroupKey = Object.keys(MuscleGroup).find(key => 
            MuscleGroup[key as keyof typeof MuscleGroup].toLowerCase() === groupString.toLowerCase()
          );
          if (muscleGroupKey) {
            const muscleGroup = MuscleGroup[muscleGroupKey as keyof typeof MuscleGroup];
            muscleSelection.addMuscleGroup(muscleGroup);
          }
        });
        dataToSync = apiData;
      } else if (hasCachedMuscleData && !hasFormMuscleData) {
        // Use cached data if no API data
        debugLog('Using cached muscle data');
        dataToSync = muscleSelection.selectionData;
      }
      
      // 4. Sync to form if we have data
      if (dataToSync) {
        syncMuscleSelectionToForm();
      }
    };
    
    initializeMuscleIntegration();
  }, []);  // Run only once on mount
  
  // Clear muscle selection
  const clearMuscleSelection = useCallback(() => {
    debugLog('Clearing muscle selection');
    muscleSelection.clearSelection();
    
    // Clear from form as well
    workoutForm.updateField('sessionInputs', {
      ...workoutForm.formValues.sessionInputs,
      focusArea: [],
      muscleTargeting: undefined
    });
    
    lastSyncTimestamp.current = Date.now();
  }, [muscleSelection, workoutForm, debugLog]);
  
  // Reset integration
  const resetIntegration = useCallback(() => {
    debugLog('Resetting muscle-form integration');
    clearMuscleSelection();
    lastSyncTimestamp.current = null;
  }, [clearMuscleSelection, debugLog]);
  
  // Get form data with muscle selection
  const getFormDataWithMuscleSelection = useCallback(() => {
    const muscleApiData = formatMuscleSelectionForAPI(muscleSelection.selectionData);
    const selectionSummary = generateMuscleSelectionSummary(muscleSelection.selectionData);
    
    // Use getMappedFormValues to ensure duration mapping works correctly
    const mappedFormValues = workoutForm.getMappedFormValues();
    
    debugLog('Preparing form data with muscle selection', {
      muscleApiData,
      selectionSummary,
      formValues: workoutForm.formValues,
      mappedFormValues
    });
    
    return {
      ...mappedFormValues,
      muscleSelection: muscleSelection.selectionData,
      muscleTargeting: {
        targetMuscleGroups: muscleApiData.targetMuscleGroups,
        specificMuscles: muscleApiData.specificMuscles,
        primaryFocus: muscleApiData.primaryFocus,
        selectionSummary: selectionSummary.displayText
      }
    };
  }, [muscleSelection.selectionData, workoutForm, debugLog]);
  
  // Validate integrated form
  const validateIntegratedForm = useCallback(() => {
    const baseValidation = workoutForm.validateForm();
    const hasMuscleSelection = muscleSelection.selectionData.selectedGroups.length > 0;
    
    if (config.requireMuscleSelection && !hasMuscleSelection) {
      debugLog('Validation failed: Muscle selection required but not provided');
      return false;
    }
    
    const muscleValidation = muscleSelection.validation;
    const isValid = baseValidation && muscleValidation.isValid;
    
    debugLog('Integrated form validation result', {
      baseValidation,
      hasMuscleSelection,
      muscleValidation,
      isValid
    });
    
    return isValid;
  }, [workoutForm, muscleSelection, config.requireMuscleSelection, debugLog]);
  
  // Apply suggested muscle groups
  const applySuggestedMuscleGroups = useCallback((groups: MuscleGroup[]) => {
    debugLog('Applying suggested muscle groups', { groups });
    
    // Clear current selection first
    muscleSelection.clearSelection();
    
    // Add suggested groups
    groups.slice(0, config.maxMuscleGroups).forEach(group => {
      muscleSelection.addMuscleGroup(group);
    });
  }, [muscleSelection, config.maxMuscleGroups, debugLog]);
  
  // Computed state
  const state = useMemo((): MuscleFormIntegrationState => {
    const hasMuscleSelection = muscleSelection.selectionData.selectedGroups.length > 0;
    const formFocusArea = workoutForm.formValues.sessionInputs?.focusArea || [];
    const muscleGroups = muscleSelection.selectionData.selectedGroups.map(g => g.toString());
    const isSynced = JSON.stringify(formFocusArea.sort()) === JSON.stringify(muscleGroups.sort());
    
    return {
      muscleSelection: muscleSelection.selectionData,
      hasMuscleSelection,
      isIntegrated: hasMuscleSelection && isSynced,
      isSynced,
      isValid: muscleSelection.validation.isValid,
      validationErrors: muscleSelection.validation.warnings,
      hasProfileSuggestions: profileSuggestedGroups.length > 0,
      profileSuggestedGroups
    };
  }, [muscleSelection.selectionData, muscleSelection.validation, workoutForm.formValues.sessionInputs, profileSuggestedGroups]);
  
  // Completion percentage calculation
  const completionPercentage = useMemo(() => {
    let completed = 0;
    const total = 7;
    
    if (workoutForm.formValues.duration > 0) completed++;
    if (workoutForm.formValues.difficulty) completed++;
    if (workoutForm.formValues.goals?.trim()) completed++;
    if (workoutForm.formValues.equipment?.length > 0) completed++;
    if (workoutForm.formValues.intensity > 0) completed++;
    if (state.hasMuscleSelection) completed++;
    if (workoutForm.formValues.sessionInputs && Object.keys(workoutForm.formValues.sessionInputs).length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  }, [workoutForm.formValues, state.hasMuscleSelection]);
  
  // Selection summary
  const selectionSummary = useMemo(() => {
    return generateMuscleSelectionSummary(muscleSelection.selectionData).displayText;
  }, [muscleSelection.selectionData]);
  
  // Actions object
  const actions = useMemo((): MuscleFormIntegrationActions => ({
    syncMuscleSelectionToForm,
    clearMuscleSelection,
    resetIntegration,
    getFormDataWithMuscleSelection,
    validateIntegratedForm,
    applySuggestedMuscleGroups
  }), [
    syncMuscleSelectionToForm,
    clearMuscleSelection,
    resetIntegration,
    getFormDataWithMuscleSelection,
    validateIntegratedForm,
    applySuggestedMuscleGroups
  ]);
  
  // Metadata
  const metadata = useMemo(() => ({
    lastSyncTimestamp: lastSyncTimestamp.current,
    integrationVersion: '1.0.0',
    isDebugging: config.enableDebugLogging
  }), [lastSyncTimestamp.current, config.enableDebugLogging]);
  
  return {
    state,
    actions,
    completionPercentage,
    selectionSummary,
    metadata
  };
}

/**
 * Hook factory for pre-configured integration instances
 */
export const createMuscleFormIntegration = (options: MuscleFormIntegrationOptions = {}) => {
  return () => useWorkoutFormMuscleIntegration(options);
};

/**
 * Debug-enabled integration hook for development
 */
export const useWorkoutFormMuscleIntegrationDebug = () => {
  return useWorkoutFormMuscleIntegration({
    enableDebugLogging: true,
    autoSync: true,
    syncDebounceMs: 100
  });
}; 