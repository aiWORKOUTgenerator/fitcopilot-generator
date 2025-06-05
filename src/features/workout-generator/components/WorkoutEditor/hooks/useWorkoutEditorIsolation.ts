/**
 * useWorkoutEditorIsolation Hook
 * 
 * Integrates ContextIsolationService following established patterns from WorkoutEditor hooks.
 * Provides context isolation management for WorkoutEditor components.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ContextIsolationService, 
  useIsolationStatus,
  type ContextIsolationOptions,
  type ContextConflict,
  type IsolationResult
} from '../services';

// ===== TYPE DEFINITIONS =====

export interface UseWorkoutEditorIsolationOptions extends ContextIsolationOptions {
  workoutId?: string | number;
  autoResolveConflicts?: boolean;
  onConflictDetected?: (conflicts: ContextConflict[]) => void;
  onIsolationError?: (error: Error) => void;
}

export interface UseWorkoutEditorIsolationReturn {
  // Status
  isIsolated: boolean;
  isolationLevel: 'full' | 'partial' | 'none';
  hasConflicts: boolean;
  isLoading: boolean;
  
  // Data
  conflicts: ContextConflict[];
  isolationResult: IsolationResult | null;
  debugInfo: Record<string, any> | undefined;
  
  // Actions
  enableIsolation: () => Promise<void>;
  disableIsolation: () => void;
  resolveConflicts: () => Promise<IsolationResult>;
  refreshIsolationStatus: () => Promise<void>;
  
  // Utils
  isolateComponent: <T extends React.ComponentType<any>>(component: T) => T;
}

// ===== MAIN HOOK =====

export const useWorkoutEditorIsolation = (
  options: UseWorkoutEditorIsolationOptions = {}
): UseWorkoutEditorIsolationReturn => {
  const {
    workoutId,
    autoResolveConflicts = true,
    onConflictDetected,
    onIsolationError,
    debugMode = false,
    isolationLevel = 'full',
    ...isolationOptions
  } = options;

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [conflicts, setConflicts] = useState<ContextConflict[]>([]);
  const [isolationResult, setIsolationResult] = useState<IsolationResult | null>(null);
  const [isolationEnabled, setIsolationEnabled] = useState(false);

  // Refs for stable references
  const isolationOptionsRef = useRef<ContextIsolationOptions>({
    isolationLevel,
    debugMode,
    ...isolationOptions
  });
  
  const conflictDetectedCallbackRef = useRef(onConflictDetected);
  const isolationErrorCallbackRef = useRef(onIsolationError);

  // Update refs when options change
  useEffect(() => {
    isolationOptionsRef.current = {
      isolationLevel,
      debugMode,
      ...isolationOptions
    };
    conflictDetectedCallbackRef.current = onConflictDetected;
    isolationErrorCallbackRef.current = onIsolationError;
  }, [isolationLevel, debugMode, isolationOptions, onConflictDetected, onIsolationError]);

  // Get isolation status from service
  const isolationStatus = useIsolationStatus();

  // Enable isolation
  const enableIsolation = useCallback(async (): Promise<void> => {
    if (isLoading || isolationEnabled) return;

    try {
      setIsLoading(true);
      
      if (debugMode) {
        console.log('🔒 useWorkoutEditorIsolation: Enabling isolation', { workoutId, options });
      }

      // Detect conflicts first
      const detectedConflicts = await ContextIsolationService.detectContextConflicts();
      setConflicts(detectedConflicts);

      if (detectedConflicts.length > 0) {
        if (debugMode) {
          console.warn('⚠️ Conflicts detected during isolation setup:', detectedConflicts);
        }
        
        // Notify callback
        conflictDetectedCallbackRef.current?.(detectedConflicts);

        // Auto-resolve if enabled
        if (autoResolveConflicts) {
          const resolution = await ContextIsolationService.resolveContextConflicts(
            detectedConflicts,
            isolationOptionsRef.current
          );
          setIsolationResult(resolution);
        }
      }

      setIsolationEnabled(true);

      if (debugMode) {
        console.log('✅ Isolation enabled successfully');
      }

    } catch (error) {
      const isolationError = error instanceof Error ? error : new Error('Unknown isolation error');
      
      if (debugMode) {
        console.error('❌ Failed to enable isolation:', isolationError);
      }
      
      isolationErrorCallbackRef.current?.(isolationError);
      throw isolationError;
      
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isolationEnabled, autoResolveConflicts, workoutId, debugMode]);

  // Disable isolation
  const disableIsolation = useCallback((): void => {
    if (debugMode) {
      console.log('🔓 useWorkoutEditorIsolation: Disabling isolation');
    }

    setIsolationEnabled(false);
    setConflicts([]);
    setIsolationResult(null);
  }, [debugMode]);

  // Resolve conflicts manually
  const resolveConflicts = useCallback(async (): Promise<IsolationResult> => {
    if (conflicts.length === 0) {
      throw new Error('No conflicts to resolve');
    }

    try {
      setIsLoading(true);
      
      if (debugMode) {
        console.log('🔧 useWorkoutEditorIsolation: Resolving conflicts', conflicts);
      }

      const resolution = await ContextIsolationService.resolveContextConflicts(
        conflicts,
        isolationOptionsRef.current
      );

      setIsolationResult(resolution);
      
      // Update conflicts list with remaining conflicts
      setConflicts(resolution.conflictsRemaining);

      if (debugMode) {
        console.log('✅ Conflicts resolved:', resolution);
      }

      return resolution;

    } catch (error) {
      const resolutionError = error instanceof Error ? error : new Error('Unknown resolution error');
      
      if (debugMode) {
        console.error('❌ Failed to resolve conflicts:', resolutionError);
      }
      
      isolationErrorCallbackRef.current?.(resolutionError);
      throw resolutionError;
      
    } finally {
      setIsLoading(false);
    }
  }, [conflicts, debugMode]);

  // Refresh isolation status
  const refreshIsolationStatus = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (debugMode) {
        console.log('🔄 useWorkoutEditorIsolation: Refreshing isolation status');
      }

      const detectedConflicts = await ContextIsolationService.detectContextConflicts();
      setConflicts(detectedConflicts);

      if (detectedConflicts.length > 0 && autoResolveConflicts) {
        const resolution = await ContextIsolationService.resolveContextConflicts(
          detectedConflicts,
          isolationOptionsRef.current
        );
        setIsolationResult(resolution);
      }

    } catch (error) {
      if (debugMode) {
        console.error('❌ Failed to refresh isolation status:', error);
      }
      
      const refreshError = error instanceof Error ? error : new Error('Unknown refresh error');
      isolationErrorCallbackRef.current?.(refreshError);
      
    } finally {
      setIsLoading(false);
    }
  }, [autoResolveConflicts, debugMode]);

  // Component isolation utility
  const isolateComponent = useCallback(<T extends React.ComponentType<any>>(
    component: T
  ): T => {
    return ContextIsolationService.isolateComponent(component, isolationOptionsRef.current);
  }, []);

  // Auto-enable isolation on mount if workoutId provided
  useEffect(() => {
    if (workoutId && !isolationEnabled && !isLoading) {
      enableIsolation().catch(error => {
        if (debugMode) {
          console.error('❌ Auto-isolation failed:', error);
        }
      });
    }
  }, [workoutId, isolationEnabled, isLoading, enableIsolation, debugMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isolationEnabled) {
        disableIsolation();
      }
    };
  }, [isolationEnabled, disableIsolation]);

  // Return hook interface
  return {
    // Status
    isIsolated: isolationStatus.isIsolated || isolationEnabled,
    isolationLevel: isolationStatus.isolationLevel,
    hasConflicts: conflicts.length > 0,
    isLoading,
    
    // Data
    conflicts,
    isolationResult,
    debugInfo: isolationStatus.debugInfo,
    
    // Actions
    enableIsolation,
    disableIsolation,
    resolveConflicts,
    refreshIsolationStatus,
    
    // Utils
    isolateComponent
  };
}; 