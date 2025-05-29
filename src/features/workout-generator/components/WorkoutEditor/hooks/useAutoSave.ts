/**
 * Auto-Save Hook
 * 
 * React hook that provides auto-save functionality using WorkoutAutoSaveService.
 * Handles state management, lifecycle, and provides a clean API for components.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  WorkoutAutoSaveService, 
  type SaveFunction, 
  type SaveStatus, 
  type AutoSaveOptions,
  type SaveResult
} from '../services';

export interface UseAutoSaveOptions extends Partial<AutoSaveOptions> {
  enabled?: boolean;
  immediate?: boolean;
}

export interface UseAutoSaveReturn {
  // Status information
  saveStatus: SaveStatus;
  isEnabled: boolean;
  
  // Actions
  queueSave: (workout: any, priority?: 'high' | 'normal' | 'low') => Promise<void>;
  forceSave: (workout?: any) => Promise<SaveResult>;
  clearQueue: () => void;
  enable: () => void;
  disable: () => void;
  
  // Configuration
  updateOptions: (options: Partial<AutoSaveOptions>) => void;
  
  // History and debugging
  getSaveHistory: () => SaveResult[];
  hasPendingSaves: () => boolean;
}

/**
 * Hook for managing auto-save functionality
 */
export function useAutoSave(
  saveFunction: SaveFunction,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const {
    enabled = true,
    immediate = false,
    debounceMs = 2000,
    maxRetries = 3,
    retryDelayMs = 1000,
    enabledWhenValid = true,
    conflictResolution = 'overwrite'
  } = options;

  // State management
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: 'idle',
    hasUnsavedChanges: false,
    queueLength: 0
  });
  const [isEnabled, setIsEnabled] = useState(enabled);

  // Service instance ref
  const serviceRef = useRef<WorkoutAutoSaveService | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Memoized service options
  const serviceOptions = useMemo(() => ({
    debounceMs,
    maxRetries,
    retryDelayMs,
    enabledWhenValid,
    conflictResolution
  }), [debounceMs, maxRetries, retryDelayMs, enabledWhenValid, conflictResolution]);

  // Initialize service
  useEffect(() => {
    // Create service instance
    serviceRef.current = new WorkoutAutoSaveService(saveFunction, serviceOptions);
    
    // Subscribe to status changes
    unsubscribeRef.current = serviceRef.current.subscribe(setSaveStatus);

    return () => {
      // Cleanup
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (serviceRef.current) {
        serviceRef.current.dispose();
      }
    };
  }, [saveFunction, serviceOptions]);

  // Update service options when they change
  useEffect(() => {
    if (serviceRef.current) {
      serviceRef.current.updateOptions(serviceOptions);
    }
  }, [serviceOptions]);

  // Actions
  const queueSave = useCallback(async (
    workout: any, 
    priority: 'high' | 'normal' | 'low' = 'normal'
  ) => {
    if (!serviceRef.current || !isEnabled) return;
    
    try {
      await serviceRef.current.queueSave(workout, priority);
    } catch (error) {
      console.error('Failed to queue save:', error);
    }
  }, [isEnabled]);

  const forceSave = useCallback(async (workout?: any): Promise<SaveResult> => {
    if (!serviceRef.current) {
      return {
        success: false,
        error: 'Auto-save service not initialized',
        timestamp: Date.now(),
        duration: 0
      };
    }

    try {
      return await serviceRef.current.forceSave(workout);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Force save failed',
        timestamp: Date.now(),
        duration: 0
      };
    }
  }, []);

  const clearQueue = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.clearQueue();
    }
  }, []);

  const enable = useCallback(() => {
    setIsEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
    clearQueue();
  }, [clearQueue]);

  const updateOptions = useCallback((newOptions: Partial<AutoSaveOptions>) => {
    if (serviceRef.current) {
      serviceRef.current.updateOptions(newOptions);
    }
  }, []);

  const getSaveHistory = useCallback((): SaveResult[] => {
    return serviceRef.current?.getSaveHistory() || [];
  }, []);

  const hasPendingSaves = useCallback((): boolean => {
    return serviceRef.current?.hasPendingSaves() || false;
  }, []);

  // Auto-enable/disable based on options
  useEffect(() => {
    setIsEnabled(enabled);
  }, [enabled]);

  return {
    saveStatus,
    isEnabled,
    queueSave,
    forceSave,
    clearQueue,
    enable,
    disable,
    updateOptions,
    getSaveHistory,
    hasPendingSaves
  };
}

/**
 * Hook for auto-saving workout data with change detection
 */
export function useWorkoutAutoSave(
  workout: any,
  saveFunction: SaveFunction,
  options: UseAutoSaveOptions & {
    dependencies?: any[];
    skipInitialSave?: boolean;
  } = {}
): UseAutoSaveReturn {
  const {
    dependencies = [],
    skipInitialSave = true,
    ...autoSaveOptions
  } = options;

  const autoSave = useAutoSave(saveFunction, autoSaveOptions);
  const initialRenderRef = useRef(true);

  // Auto-save when workout changes
  useEffect(() => {
    if (!autoSave.isEnabled || !workout) return;
    
    // Skip initial save if requested
    if (skipInitialSave && initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    autoSave.queueSave(workout, 'normal');
  }, [workout, autoSave, skipInitialSave, ...dependencies]);

  return autoSave;
}

/**
 * Hook for periodic auto-save
 */
export function usePeriodicAutoSave(
  getWorkout: () => any,
  saveFunction: SaveFunction,
  intervalMs: number = 30000,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const autoSave = useAutoSave(saveFunction, options);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!autoSave.isEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const workout = getWorkout();
      if (workout) {
        autoSave.queueSave(workout, 'low');
      }
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoSave.isEnabled, getWorkout, intervalMs, autoSave]);

  return autoSave;
} 