/**
 * Muscle Form Integration Bridge Hook
 * 
 * Production-ready bridge that connects muscle selection state to workout form state.
 * Implements clean architecture patterns with proper error handling and type safety.
 * 
 * @module useMuscleFormBridge
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMuscleSelection } from './useMuscleSelection';
import { useWorkoutForm } from './useWorkoutForm';
import { formatMuscleSelectionForAPI, generateMuscleSelectionSummary } from '../utils/muscle-helpers';
import { MuscleSelectionData, MuscleGroup } from '../types/muscle-types';

/**
 * Integration state interface for type safety
 */
interface MuscleFormBridgeState {
  isConnected: boolean;
  lastSyncTimestamp: number | null;
  syncCount: number;
  hasValidSelection: boolean;
  selectionSummary: string;
}

/**
 * Integration configuration options
 */
interface MuscleFormBridgeConfig {
  autoSync: boolean;
  syncDelay: number;
  enableDebugLogging: boolean;
  validateBeforeSync: boolean;
}

/**
 * Integration bridge return interface
 */
export interface MuscleFormBridgeReturn {
  // Core muscle selection
  muscleSelection: ReturnType<typeof useMuscleSelection>;
  
  // Integration state
  state: MuscleFormBridgeState;
  
  // Integration actions
  syncMuscleData: () => void;
  forceSyncToForm: () => void;
  clearMuscleData: () => void;
  
  // Validation
  isFormReady: boolean;
  integrationErrors: string[];
  
  // Debug information
  debugInfo: {
    lastFormUpdate: any;
    lastMuscleUpdate: any;
    syncHistory: Array<{ timestamp: number; action: string; success: boolean; }>;
  };
}

/**
 * Default configuration for production use
 */
const DEFAULT_CONFIG: MuscleFormBridgeConfig = {
  autoSync: true,
  syncDelay: 150, // Debounce delay in milliseconds
  enableDebugLogging: process.env.NODE_ENV === 'development',
  validateBeforeSync: true
};

/**
 * Production-quality muscle form integration bridge
 * 
 * Connects muscle selection state to workout form state with proper
 * error handling, validation, and debugging capabilities.
 * 
 * @param config - Optional configuration overrides
 * @returns Integration bridge interface
 */
export const useMuscleFormBridge = (
  config: Partial<MuscleFormBridgeConfig> = {}
): MuscleFormBridgeReturn => {
  
  // Merge configuration with defaults
  const bridgeConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  // Core hooks
  const muscleSelection = useMuscleSelection(3, true);
  const workoutForm = useWorkoutForm();
  
  // Integration state tracking
  const stateRef = useRef<MuscleFormBridgeState>({
    isConnected: false,
    lastSyncTimestamp: null,
    syncCount: 0,
    hasValidSelection: false,
    selectionSummary: ''
  });
  
  // Debug tracking
  const debugRef = useRef<{
    lastFormUpdate: any;
    lastMuscleUpdate: any;
    syncHistory: Array<{ timestamp: number; action: string; success: boolean; }>;
  }>({
    lastFormUpdate: null,
    lastMuscleUpdate: null,
    syncHistory: []
  });
  
  // Sync debounce timer
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Integration errors tracking
  const errorsRef = useRef<string[]>([]);
  
  /**
   * Debug logging utility
   */
  const debugLog = useCallback((message: string, data?: any) => {
    if (bridgeConfig.enableDebugLogging) {
      console.log(`[MuscleFormBridge] ${message}`, data);
    }
  }, [bridgeConfig.enableDebugLogging]);
  
  /**
   * Add debug history entry
   */
  const addDebugEntry = useCallback((action: string, success: boolean) => {
    debugRef.current.syncHistory.push({
      timestamp: Date.now(),
      action,
      success
    });
    
    // Keep only last 20 entries
    if (debugRef.current.syncHistory.length > 20) {
      debugRef.current.syncHistory = debugRef.current.syncHistory.slice(-20);
    }
  }, []);
  
  /**
   * Validate muscle selection before sync
   */
  const validateMuscleSelection = useCallback((selectionData: MuscleSelectionData): boolean => {
    if (!bridgeConfig.validateBeforeSync) return true;
    
    // Clear previous errors
    errorsRef.current = [];
    
    // Basic validation
    if (!selectionData.selectedGroups || selectionData.selectedGroups.length === 0) {
      errorsRef.current.push('No muscle groups selected');
      return false;
    }
    
    // Validate muscle group limits
    if (selectionData.selectedGroups.length > 3) {
      errorsRef.current.push('Too many muscle groups selected (max 3)');
      return false;
    }
    
    // Validate enum values
    const validGroups = Object.values(MuscleGroup);
    const invalidGroups = selectionData.selectedGroups.filter(
      group => !validGroups.includes(group)
    );
    
    if (invalidGroups.length > 0) {
      errorsRef.current.push(`Invalid muscle groups: ${invalidGroups.join(', ')}`);
      return false;
    }
    
    return true;
  }, [bridgeConfig.validateBeforeSync]);
  
  /**
   * Core synchronization function
   */
  const syncMuscleData = useCallback(() => {
    try {
      const selectionData = muscleSelection.selectionData;
      
      debugLog('Starting muscle data sync', { selectionData });
      
      // Validate selection
      if (!validateMuscleSelection(selectionData)) {
        debugLog('Validation failed', { errors: errorsRef.current });
        addDebugEntry('sync_validation_failed', false);
        return;
      }
      
      // Format muscle data for API
      const muscleApiData = formatMuscleSelectionForAPI(selectionData);
      const selectionSummary = generateMuscleSelectionSummary(selectionData);
      
      // Update workout form with muscle targeting data
      const updatedSessionInputs = {
        ...workoutForm.formValues.sessionInputs,
        focusArea: muscleApiData.targetMuscleGroups.map(group => group.toString()),
        muscleTargeting: {
          targetMuscleGroups: muscleApiData.targetMuscleGroups,
          specificMuscles: muscleApiData.specificMuscles,
          primaryFocus: muscleApiData.primaryFocus,
          selectionSummary: selectionSummary.displayText
        }
      };
      
      workoutForm.updateField('sessionInputs', updatedSessionInputs);
      
      // Update integration state
      stateRef.current = {
        isConnected: true,
        lastSyncTimestamp: Date.now(),
        syncCount: stateRef.current.syncCount + 1,
        hasValidSelection: selectionData.selectedGroups.length > 0,
        selectionSummary: selectionSummary.displayText
      };
      
      // Update debug info
      debugRef.current.lastFormUpdate = updatedSessionInputs;
      debugRef.current.lastMuscleUpdate = selectionData;
      
      addDebugEntry('sync_success', true);
      debugLog('Muscle data sync completed', {
        muscleGroups: muscleApiData.targetMuscleGroups,
        summary: selectionSummary.displayText,
        syncCount: stateRef.current.syncCount
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      errorsRef.current.push(`Sync failed: ${errorMessage}`);
      
      addDebugEntry('sync_error', false);
      debugLog('Muscle data sync failed', { error: errorMessage });
    }
  }, [
    muscleSelection.selectionData,
    workoutForm,
    validateMuscleSelection,
    debugLog,
    addDebugEntry
  ]);
  
  /**
   * Debounced sync function
   */
  const debouncedSync = useCallback(() => {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }
    
    syncTimerRef.current = setTimeout(() => {
      syncMuscleData();
    }, bridgeConfig.syncDelay);
  }, [syncMuscleData, bridgeConfig.syncDelay]);
  
  /**
   * Force immediate sync (bypasses debouncing)
   */
  const forceSyncToForm = useCallback(() => {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }
    syncMuscleData();
  }, [syncMuscleData]);
  
  /**
   * Clear muscle data from form
   */
  const clearMuscleData = useCallback(() => {
    const clearedSessionInputs = {
      ...workoutForm.formValues.sessionInputs,
      focusArea: [],
      muscleTargeting: undefined
    };
    
    workoutForm.updateField('sessionInputs', clearedSessionInputs);
    muscleSelection.clearSelection();
    
    stateRef.current = {
      isConnected: false,
      lastSyncTimestamp: Date.now(),
      syncCount: stateRef.current.syncCount + 1,
      hasValidSelection: false,
      selectionSummary: ''
    };
    
    addDebugEntry('clear_muscle_data', true);
    debugLog('Muscle data cleared');
  }, [workoutForm, muscleSelection, addDebugEntry, debugLog]);
  
  /**
   * Auto-sync effect
   */
  useEffect(() => {
    if (!bridgeConfig.autoSync) return;
    
    const hasSelection = muscleSelection.selectionData.selectedGroups.length > 0;
    
    if (hasSelection) {
      debouncedSync();
    }
    
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [
    muscleSelection.selectionData.selectedGroups,
    muscleSelection.selectionData.selectedMuscles,
    bridgeConfig.autoSync,
    debouncedSync
  ]);
  
  /**
   * Initialize connection state
   */
  useEffect(() => {
    stateRef.current.isConnected = true;
    addDebugEntry('bridge_initialized', true);
    debugLog('Muscle form bridge initialized', { config: bridgeConfig });
    
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, []);
  
  /**
   * Form readiness check
   */
  const isFormReady = useMemo(() => {
    return (
      stateRef.current.hasValidSelection &&
      workoutForm.formValues.duration > 0 &&
      workoutForm.formValues.difficulty &&
      workoutForm.formValues.goals?.trim()
    );
  }, [
    stateRef.current.hasValidSelection,
    workoutForm.formValues.duration,
    workoutForm.formValues.difficulty,
    workoutForm.formValues.goals
  ]);
  
  return {
    muscleSelection,
    state: stateRef.current,
    syncMuscleData: debouncedSync,
    forceSyncToForm,
    clearMuscleData,
    isFormReady,
    integrationErrors: errorsRef.current,
    debugInfo: debugRef.current
  };
};

/**
 * Hook factory for creating pre-configured bridge instances
 */
export const createMuscleFormBridge = (config: Partial<MuscleFormBridgeConfig>) => {
  return () => useMuscleFormBridge(config);
};

/**
 * Debug-enabled bridge for development
 */
export const useMuscleFormBridgeDebug = () => {
  return useMuscleFormBridge({
    enableDebugLogging: true,
    syncDelay: 50,
    validateBeforeSync: true
  });
}; 