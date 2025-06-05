/**
 * useVersionManagement Hook
 * 
 * Integrates VersionManager service following established patterns from WorkoutEditor hooks.
 * Provides version management and conflict detection for WorkoutEditor components.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  VersionManager,
  type WorkoutVersion,
  type VersionConflict,
  type VersionCheckResult,
  type VersionResolutionResult,
  type VersionManagerOptions,
  type VersionFetchOptions
} from '../services';
import type { WorkoutData } from '../services/versionManagement/VersionManager';

// ===== TYPE DEFINITIONS =====

export interface UseVersionManagementOptions extends VersionManagerOptions {
  workoutId: string | number;
  localData?: WorkoutData;
  localVersion?: number;
  onVersionConflict?: (conflicts: VersionConflict[]) => void;
  onVersionUpdated?: (newVersion: WorkoutVersion) => void;
  onVersionError?: (error: Error) => void;
}

export interface UseVersionManagementReturn {
  // Status
  isLoading: boolean;
  isLatest: boolean;
  hasConflicts: boolean;
  isMonitoring: boolean;
  staleness: 'fresh' | 'stale' | 'expired';
  
  // Data
  currentVersion: WorkoutVersion | null;
  latestVersion: WorkoutVersion | null;
  conflicts: VersionConflict[];
  checkResult: VersionCheckResult | null;
  resolutionResult: VersionResolutionResult | null;
  
  // Actions
  fetchLatest: (options?: VersionFetchOptions) => Promise<WorkoutVersion>;
  checkConflicts: () => Promise<VersionCheckResult>;
  resolveConflicts: (conflicts?: VersionConflict[]) => Promise<VersionResolutionResult>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  refreshStatus: () => Promise<void>;
  
  // Utils
  getVersionInfo: () => { isOutdated: boolean; shouldRefresh: boolean; };
}

// ===== MAIN HOOK =====

export const useVersionManagement = (
  options: UseVersionManagementOptions
): UseVersionManagementReturn => {
  const {
    workoutId,
    localData,
    localVersion = 1,
    onVersionConflict,
    onVersionUpdated,
    onVersionError,
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes
    debugMode = false,
    conflictResolution = 'auto',
    stalenessThreshold = 10,
    ...versionOptions
  } = options;

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<WorkoutVersion | null>(null);
  const [latestVersion, setLatestVersion] = useState<WorkoutVersion | null>(null);
  const [conflicts, setConflicts] = useState<VersionConflict[]>([]);
  const [checkResult, setCheckResult] = useState<VersionCheckResult | null>(null);
  const [resolutionResult, setResolutionResult] = useState<VersionResolutionResult | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Refs for stable references
  const versionOptionsRef = useRef<VersionManagerOptions>({
    autoRefresh,
    refreshInterval,
    debugMode,
    conflictResolution,
    stalenessThreshold,
    ...versionOptions
  });
  
  const callbacksRef = useRef({
    onVersionConflict,
    onVersionUpdated,
    onVersionError
  });

  // Update refs when options change
  useEffect(() => {
    versionOptionsRef.current = {
      autoRefresh,
      refreshInterval,
      debugMode,
      conflictResolution,
      stalenessThreshold,
      ...versionOptions
    };
    callbacksRef.current = { onVersionConflict, onVersionUpdated, onVersionError };
  }, [autoRefresh, refreshInterval, debugMode, conflictResolution, stalenessThreshold, versionOptions, onVersionConflict, onVersionUpdated, onVersionError]);

  // Initialize current version
  useEffect(() => {
    if (workoutId && !currentVersion) {
      setCurrentVersion({
        id: workoutId,
        version: localVersion,
        lastModified: new Date().toISOString(),
        metadata: {
          source: 'local',
          fetchedAt: new Date().toISOString(),
          staleness: 'fresh',
          size: localData ? JSON.stringify(localData).length : 0
        }
      });
    }
  }, [workoutId, localVersion, localData, currentVersion]);

  // Fetch latest version
  const fetchLatest = useCallback(async (fetchOptions: VersionFetchOptions = {}): Promise<WorkoutVersion> => {
    if (!workoutId) {
      throw new Error('Workout ID is required for version fetching');
    }

    // CRITICAL FIX: Skip version fetching for new workouts
    if (workoutId === 'new') {
      throw new Error('Cannot fetch version for new workouts');
    }

    try {
      setIsLoading(true);
      
      if (debugMode) {
        console.log('🔄 useVersionManagement: Fetching latest version', { workoutId, fetchOptions });
      }

      const latest = await VersionManager.fetchLatestVersion(workoutId, {
        debugMode,
        ...fetchOptions
      });

      setLatestVersion(latest);

      // Notify callback if version updated
      if (latest.version !== currentVersion?.version) {
        callbacksRef.current.onVersionUpdated?.(latest);
      }

      if (debugMode) {
        console.log('✅ Latest version fetched:', latest);
      }

      return latest;

    } catch (error) {
      const fetchError = error instanceof Error ? error : new Error('Unknown fetch error');
      
      if (debugMode) {
        console.error('❌ Failed to fetch latest version:', fetchError);
      }
      
      callbacksRef.current.onVersionError?.(fetchError);
      throw fetchError;
      
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, currentVersion?.version, debugMode]);

  // Check for conflicts
  const checkConflicts = useCallback(async (): Promise<VersionCheckResult> => {
    if (!workoutId || !currentVersion) {
      throw new Error('Workout ID and current version are required for conflict checking');
    }

    // CRITICAL FIX: Skip conflict checking for new workouts
    if (workoutId === 'new') {
      throw new Error('Cannot check conflicts for new workouts');
    }

    try {
      setIsLoading(true);
      
      if (debugMode) {
        console.log('🔍 useVersionManagement: Checking conflicts', { workoutId, localVersion });
      }

      const result = await VersionManager.checkVersionConflicts(
        workoutId,
        currentVersion.version,
        localData
      );

      setCheckResult(result);
      setConflicts(result.conflicts);
      
      if (result.latestVersion) {
        setLatestVersion(result.latestVersion);
      }

      // Notify callback if conflicts detected
      if (result.conflicts.length > 0) {
        callbacksRef.current.onVersionConflict?.(result.conflicts);
      }

      if (debugMode) {
        console.log('📊 Conflict check result:', result);
      }

      return result;

    } catch (error) {
      const checkError = error instanceof Error ? error : new Error('Unknown check error');
      
      if (debugMode) {
        console.error('❌ Failed to check conflicts:', checkError);
      }
      
      callbacksRef.current.onVersionError?.(checkError);
      throw checkError;
      
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, currentVersion, localData, debugMode]);

  // Resolve conflicts
  const resolveConflicts = useCallback(async (
    conflictsToResolve?: VersionConflict[]
  ): Promise<VersionResolutionResult> => {
    const targetConflicts = conflictsToResolve || conflicts;
    
    if (targetConflicts.length === 0) {
      throw new Error('No conflicts to resolve');
    }

    if (!workoutId) {
      throw new Error('Workout ID is required for conflict resolution');
    }

    try {
      setIsLoading(true);
      
      if (debugMode) {
        console.log('🔧 useVersionManagement: Resolving conflicts', targetConflicts);
      }

      const result = await VersionManager.resolveVersionConflicts(
        targetConflicts,
        workoutId,
        versionOptionsRef.current
      );

      setResolutionResult(result);
      
      // Update conflicts with remaining conflicts
      setConflicts(result.remainingConflicts);
      
      // Update version if resolution was successful
      if (result.success) {
        setCurrentVersion(result.resolvedVersion);
        setLatestVersion(result.resolvedVersion);
      }

      if (debugMode) {
        console.log('✅ Conflicts resolved:', result);
      }

      return result;

    } catch (error) {
      const resolutionError = error instanceof Error ? error : new Error('Unknown resolution error');
      
      if (debugMode) {
        console.error('❌ Failed to resolve conflicts:', resolutionError);
      }
      
      callbacksRef.current.onVersionError?.(resolutionError);
      throw resolutionError;
      
    } finally {
      setIsLoading(false);
    }
  }, [conflicts, workoutId, debugMode]);

  // Start monitoring
  const startMonitoring = useCallback((): void => {
    if (!workoutId || isMonitoring) return;

    // CRITICAL FIX: Skip monitoring for new workouts
    if (workoutId === 'new') {
      if (debugMode) {
        console.log('⏭️ useVersionManagement: Skipping monitoring for new workout');
      }
      return;
    }

    if (debugMode) {
      console.log('📡 useVersionManagement: Starting monitoring for workout', workoutId);
    }

    VersionManager.startVersionMonitoring(
      workoutId,
      (result: VersionCheckResult) => {
        if (debugMode) {
          console.log('📡 Version change detected:', result);
        }
        
        setCheckResult(result);
        setConflicts(result.conflicts);
        
        if (result.latestVersion) {
          setLatestVersion(result.latestVersion);
          callbacksRef.current.onVersionUpdated?.(result.latestVersion);
        }
        
        if (result.conflicts.length > 0) {
          callbacksRef.current.onVersionConflict?.(result.conflicts);
        }
      },
      versionOptionsRef.current
    );

    setIsMonitoring(true);
  }, [workoutId, isMonitoring, debugMode]);

  // Stop monitoring
  const stopMonitoring = useCallback((): void => {
    if (!workoutId || !isMonitoring) return;

    if (debugMode) {
      console.log('🛑 useVersionManagement: Stopping monitoring for workout', workoutId);
    }

    VersionManager.stopVersionMonitoring(workoutId);
    setIsMonitoring(false);
  }, [workoutId, isMonitoring, debugMode]);

  // Refresh status
  const refreshStatus = useCallback(async (): Promise<void> => {
    if (!workoutId) return;

    try {
      if (debugMode) {
        console.log('🔄 useVersionManagement: Refreshing status');
      }

      // Fetch latest and check conflicts in parallel
      const [latest, conflicts] = await Promise.all([
        fetchLatest({ force: true }),
        checkConflicts()
      ]);

      if (debugMode) {
        console.log('✅ Status refreshed', { latest, conflicts });
      }

    } catch (error) {
      if (debugMode) {
        console.error('❌ Failed to refresh status:', error);
      }
    }
  }, [workoutId, fetchLatest, checkConflicts, debugMode]);

  // Get version info utility
  const getVersionInfo = useCallback(() => {
    const isOutdated = latestVersion ? currentVersion ? currentVersion.version < latestVersion.version : true : false;
    const shouldRefresh = checkResult?.refreshRequired ?? isOutdated;
    
    return { isOutdated, shouldRefresh };
  }, [currentVersion, latestVersion, checkResult]);

  // Auto-start monitoring if enabled
  useEffect(() => {
    // CRITICAL FIX: Skip monitoring for new workouts
    if (autoRefresh && workoutId && workoutId !== 'new' && !isMonitoring) {
      startMonitoring();
    }

    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [autoRefresh, workoutId, isMonitoring, startMonitoring, stopMonitoring]);

  // Initial conflict check
  useEffect(() => {
    // CRITICAL FIX: Skip conflict checking for new workouts
    if (workoutId && workoutId !== 'new' && currentVersion && !checkResult) {
      checkConflicts().catch(error => {
        if (debugMode) {
          console.error('❌ Initial conflict check failed:', error);
        }
      });
    }
  }, [workoutId, currentVersion, checkResult, checkConflicts, debugMode]);

  // Determine staleness
  const staleness: 'fresh' | 'stale' | 'expired' = 
    checkResult?.staleness ?? 
    (latestVersion?.metadata.staleness || 'fresh');

  // Return hook interface
  return {
    // Status
    isLoading,
    isLatest: checkResult?.isLatest ?? true,
    hasConflicts: workoutId === 'new' ? false : conflicts.length > 0, // CRITICAL FIX: Never show conflicts for new workouts
    isMonitoring,
    staleness,
    
    // Data
    currentVersion,
    latestVersion,
    conflicts,
    checkResult,
    resolutionResult,
    
    // Actions
    fetchLatest,
    checkConflicts,
    resolveConflicts,
    startMonitoring,
    stopMonitoring,
    refreshStatus,
    
    // Utils
    getVersionInfo
  };
}; 