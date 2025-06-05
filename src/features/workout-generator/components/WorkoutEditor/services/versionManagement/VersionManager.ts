/**
 * VersionManager Service
 * 
 * Handles version management and conflict detection for WorkoutEditor.
 * Follows the established service patterns from SavedWorkoutsTab modular architecture.
 * 
 * Purpose: Ensures WorkoutEditor always works with the latest workout data
 * and detects/resolves version conflicts when multiple edits occur.
 */

// ===== WORKOUT DATA TYPE =====
// Simple interface for workout data - can be expanded as needed
export interface WorkoutData {
  id?: string | number;
  title?: string;
  description?: string;
  duration?: number;
  difficulty?: string;
  exercises?: any[];
  [key: string]: any; // Allow additional properties
}

// ===== TYPE DEFINITIONS =====

export interface WorkoutVersion {
  id: string | number;
  version: number;
  lastModified: string;
  lastModifiedBy?: string;
  contentHash?: string;
  metadata: {
    source: 'api' | 'cache' | 'local';
    fetchedAt: string;
    staleness: 'fresh' | 'stale' | 'expired';
    size: number;
  };
}

export interface VersionConflict {
  type: 'version_mismatch' | 'concurrent_edit' | 'data_corruption' | 'network_sync';
  severity: 'low' | 'medium' | 'high' | 'critical';
  localVersion: number;
  serverVersion: number;
  conflictDetectedAt: string;
  affectedFields: string[];
  resolutionStrategy: 'server_wins' | 'local_wins' | 'merge' | 'manual';
  autoResolvable: boolean;
}

export interface VersionFetchOptions {
  force?: boolean;
  includeContent?: boolean;
  timeout?: number;
  retryAttempts?: number;
  debugMode?: boolean;
}

export interface VersionCheckResult {
  isLatest: boolean;
  hasConflicts: boolean;
  currentVersion: WorkoutVersion;
  latestVersion: WorkoutVersion | null;
  conflicts: VersionConflict[];
  staleness: 'fresh' | 'stale' | 'expired';
  refreshRequired: boolean;
}

export interface VersionResolutionResult {
  success: boolean;
  resolvedVersion: WorkoutVersion;
  strategy: string;
  conflictsResolved: VersionConflict[];
  remainingConflicts: VersionConflict[];
  dataLoss: boolean;
  debugInfo: Record<string, any>;
}

export interface VersionManagerOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  debugMode?: boolean;
  conflictResolution?: 'auto' | 'manual';
  stalenessThreshold?: number; // minutes
}

// ===== MAIN SERVICE CLASS =====

export class VersionManager {
  private static debugMode: boolean = false;
  private static cache: Map<string, WorkoutVersion> = new Map();
  private static refreshIntervals: Map<string, NodeJS.Timeout> = new Map();
  private static defaultOptions: VersionManagerOptions = {
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    debugMode: false,
    conflictResolution: 'auto',
    stalenessThreshold: 10 // 10 minutes
  };

  /**
   * Fetch the latest version of a workout from the server
   * 
   * @param workoutId - ID of the workout to fetch
   * @param options - Fetch configuration options
   * @returns Promise resolving to latest workout version
   */
  static async fetchLatestVersion(
    workoutId: string | number, 
    options: VersionFetchOptions = {}
  ): Promise<WorkoutVersion> {
    const {
      force = false,
      includeContent = false,
      timeout = 10000,
      retryAttempts = 3,
      debugMode = this.debugMode
    } = options;

    if (debugMode) {
      console.group(`🔄 VersionManager: Fetching latest version for workout ${workoutId}`);
      console.log('📋 Fetch options:', options);
    }

    try {
      // Check cache first (unless force refresh)
      if (!force && this.cache.has(String(workoutId))) {
        const cachedVersion = this.cache.get(String(workoutId))!;
        const age = Date.now() - new Date(cachedVersion.metadata.fetchedAt).getTime();
        const stalenessMinutes = age / (1000 * 60);
        
        if (stalenessMinutes < this.defaultOptions.stalenessThreshold!) {
          if (debugMode) {
            console.log('✅ Returning cached version (still fresh)', cachedVersion);
            console.groupEnd();
          }
          return cachedVersion;
        }
      }

      // Fetch from server with retry logic
      let lastError: Error | null = null;
      for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {
          if (debugMode) {
            console.log(`📡 Attempt ${attempt}/${retryAttempts}: Fetching from server`);
          }

          const version = await this.fetchVersionFromServer(workoutId, includeContent, timeout);
          
          // Cache the result
          this.cache.set(String(workoutId), version);
          
          if (debugMode) {
            console.log('✅ Successfully fetched latest version:', version);
            console.groupEnd();
          }
          
          return version;

        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown fetch error');
          if (debugMode) {
            console.warn(`⚠️ Attempt ${attempt} failed:`, lastError.message);
          }
          
          // Wait before retry (exponential backoff)
          if (attempt < retryAttempts) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      // All retries failed
      throw new Error(`Failed to fetch workout version after ${retryAttempts} attempts: ${lastError?.message}`);

    } catch (error) {
      if (debugMode) {
        console.error('❌ Error fetching latest version:', error);
        console.groupEnd();
      }
      throw error;
    }
  }

  /**
   * Check if local workout version conflicts with server version
   * 
   * @param workoutId - ID of the workout to check
   * @param localVersion - Current local version number
   * @param localData - Local workout data for comparison
   * @returns Promise resolving to version check result
   */
  static async checkVersionConflicts(
    workoutId: string | number,
    localVersion: number,
    localData?: WorkoutData
  ): Promise<VersionCheckResult> {
    if (this.debugMode) {
      console.group(`🔍 VersionManager: Checking conflicts for workout ${workoutId}`);
      console.log('📋 Local version:', localVersion);
    }

    try {
      // Fetch latest version from server
      const latestVersion = await this.fetchLatestVersion(workoutId, { 
        includeContent: !!localData,
        debugMode: this.debugMode 
      });

      const conflicts: VersionConflict[] = [];
      const isLatest = localVersion >= latestVersion.version;
      
      // Check for version mismatch
      if (!isLatest) {
        conflicts.push({
          type: 'version_mismatch',
          severity: 'medium',
          localVersion,
          serverVersion: latestVersion.version,
          conflictDetectedAt: new Date().toISOString(),
          affectedFields: localData ? this.compareWorkoutData(localData, latestVersion) : [],
          resolutionStrategy: 'server_wins',
          autoResolvable: true
        });
      }

      // Check for concurrent edits
      if (localData && this.detectConcurrentEdit(localData, latestVersion)) {
        conflicts.push({
          type: 'concurrent_edit',
          severity: 'high',
          localVersion,
          serverVersion: latestVersion.version,
          conflictDetectedAt: new Date().toISOString(),
          affectedFields: this.compareWorkoutData(localData, latestVersion),
          resolutionStrategy: 'manual',
          autoResolvable: false
        });
      }

      // Determine staleness
      const age = Date.now() - new Date(latestVersion.metadata.fetchedAt).getTime();
      const stalenessMinutes = age / (1000 * 60);
      const staleness: 'fresh' | 'stale' | 'expired' = 
        stalenessMinutes < 5 ? 'fresh' :
        stalenessMinutes < this.defaultOptions.stalenessThreshold! ? 'stale' : 'expired';

      const result: VersionCheckResult = {
        isLatest,
        hasConflicts: conflicts.length > 0,
        currentVersion: {
          id: workoutId,
          version: localVersion,
          lastModified: new Date().toISOString(),
          metadata: {
            source: 'local',
            fetchedAt: new Date().toISOString(),
            staleness: 'fresh',
            size: 0
          }
        },
        latestVersion,
        conflicts,
        staleness,
        refreshRequired: staleness === 'expired' || conflicts.length > 0
      };

      if (this.debugMode) {
        console.log('📊 Version check result:', result);
        console.groupEnd();
      }

      return result;

    } catch (error) {
      if (this.debugMode) {
        console.error('❌ Error checking version conflicts:', error);
        console.groupEnd();
      }
      throw error;
    }
  }

  /**
   * Resolve version conflicts automatically or provide resolution strategy
   * 
   * @param conflicts - Array of conflicts to resolve
   * @param workoutId - ID of the workout
   * @param options - Resolution options
   * @returns Promise resolving to resolution result
   */
  static async resolveVersionConflicts(
    conflicts: VersionConflict[],
    workoutId: string | number,
    options: VersionManagerOptions = {}
  ): Promise<VersionResolutionResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    if (mergedOptions.debugMode) {
      console.group(`🔧 VersionManager: Resolving conflicts for workout ${workoutId}`);
      console.log('📋 Conflicts to resolve:', conflicts);
    }

    try {
      const resolvedConflicts: VersionConflict[] = [];
      const remainingConflicts: VersionConflict[] = [];
      let dataLoss = false;

      // Get latest version for resolution
      const latestVersion = await this.fetchLatestVersion(workoutId, {
        includeContent: true,
        debugMode: mergedOptions.debugMode
      });

      for (const conflict of conflicts) {
        if (conflict.autoResolvable && mergedOptions.conflictResolution === 'auto') {
          // Auto-resolve the conflict
          const resolved = await this.resolveIndividualConflict(conflict, latestVersion, mergedOptions);
          if (resolved.success) {
            resolvedConflicts.push(conflict);
            dataLoss = dataLoss || resolved.dataLoss;
          } else {
            remainingConflicts.push(conflict);
          }
        } else {
          // Manual resolution required
          remainingConflicts.push(conflict);
        }
      }

      const result: VersionResolutionResult = {
        success: remainingConflicts.length === 0,
        resolvedVersion: latestVersion,
        strategy: mergedOptions.conflictResolution || 'auto',
        conflictsResolved: resolvedConflicts,
        remainingConflicts,
        dataLoss,
        debugInfo: {
          totalConflicts: conflicts.length,
          autoResolved: resolvedConflicts.length,
          manualRequired: remainingConflicts.length,
          resolvedAt: new Date().toISOString()
        }
      };

      if (mergedOptions.debugMode) {
        console.log('✅ Conflict resolution complete:', result);
        console.groupEnd();
      }

      return result;

    } catch (error) {
      if (mergedOptions.debugMode) {
        console.error('❌ Error resolving conflicts:', error);
        console.groupEnd();
      }

      return {
        success: false,
        resolvedVersion: {
          id: workoutId,
          version: 0,
          lastModified: new Date().toISOString(),
          metadata: {
            source: 'local',
            fetchedAt: new Date().toISOString(),
            staleness: 'expired',
            size: 0
          }
        },
        strategy: 'failed',
        conflictsResolved: [],
        remainingConflicts: conflicts,
        dataLoss: false,
        debugInfo: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Enable automatic version monitoring for a workout
   * 
   * @param workoutId - ID of the workout to monitor
   * @param callback - Callback function called when version changes detected
   * @param options - Monitoring options
   */
  static startVersionMonitoring(
    workoutId: string | number,
    callback: (result: VersionCheckResult) => void,
    options: VersionManagerOptions = {}
  ): void {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    if (mergedOptions.debugMode) {
      console.log(`📡 VersionManager: Starting monitoring for workout ${workoutId}`);
    }

    // Clear existing interval if any
    this.stopVersionMonitoring(workoutId);

    if (mergedOptions.autoRefresh) {
      const interval = setInterval(async () => {
        try {
          const latestVersion = await this.fetchLatestVersion(workoutId, {
            debugMode: mergedOptions.debugMode
          });
          
          const cached = this.cache.get(String(workoutId));
          if (cached && cached.version < latestVersion.version) {
            // Version change detected
            const result = await this.checkVersionConflicts(
              workoutId, 
              cached.version
            );
            callback(result);
          }
        } catch (error) {
          if (mergedOptions.debugMode) {
            console.warn(`⚠️ Version monitoring error for workout ${workoutId}:`, error);
          }
        }
      }, mergedOptions.refreshInterval);

      this.refreshIntervals.set(String(workoutId), interval);
    }
  }

  /**
   * Stop automatic version monitoring for a workout
   * 
   * @param workoutId - ID of the workout to stop monitoring
   */
  static stopVersionMonitoring(workoutId: string | number): void {
    const interval = this.refreshIntervals.get(String(workoutId));
    if (interval) {
      clearInterval(interval);
      this.refreshIntervals.delete(String(workoutId));
      
      if (this.debugMode) {
        console.log(`🛑 VersionManager: Stopped monitoring for workout ${workoutId}`);
      }
    }
  }

  /**
   * Clear all cached versions and stop monitoring
   */
  static clearCache(): void {
    this.cache.clear();
    this.refreshIntervals.forEach(interval => clearInterval(interval));
    this.refreshIntervals.clear();
    
    if (this.debugMode) {
      console.log('🧹 VersionManager: Cache cleared and monitoring stopped');
    }
  }

  /**
   * Set debug mode for version manager
   * 
   * @param enabled - Whether to enable debug mode
   */
  static setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    console.log(`🔧 VersionManager: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // ===== PRIVATE HELPER METHODS =====

  private static async fetchVersionFromServer(
    workoutId: string | number,
    includeContent: boolean,
    timeout: number
  ): Promise<WorkoutVersion> {
    // CRITICAL FIX: Use real API instead of mock implementation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Import the real workout service dynamically to avoid circular dependencies
      const { getWorkout } = await import('../../../../services/workoutService');
      
      if (this.debugMode) {
        console.log(`🌐 VersionManager: Fetching real workout data for ID ${workoutId}`);
      }

      // Get the actual workout data from the real API
      const workoutData = await getWorkout(String(workoutId));
      
      if (this.debugMode) {
        console.log(`📊 VersionManager: Real API response:`, {
          id: workoutData.id,
          version: workoutData.version,
          lastModified: workoutData.lastModified,
          title: workoutData.title
        });
      }

      clearTimeout(timeoutId);

      // Extract version information from real workout data
      const version = workoutData.version || 1; // Default to version 1 if not specified
      const lastModified = workoutData.lastModified || workoutData.created_at || new Date().toISOString();
      
      const versionData: WorkoutVersion = {
        id: workoutId,
        version: version,
        lastModified: lastModified,
        lastModifiedBy: workoutData.modifiedBy ? String(workoutData.modifiedBy) : undefined,
        contentHash: undefined, // Could be computed if needed
        metadata: {
          source: 'api',
          fetchedAt: new Date().toISOString(),
          staleness: 'fresh',
          size: includeContent ? JSON.stringify(workoutData).length : 0
        }
      };

      if (this.debugMode) {
        console.log(`✅ VersionManager: Processed version data:`, versionData);
      }

      return versionData;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (this.debugMode) {
        console.error(`❌ VersionManager: Failed to fetch real workout data:`, error);
      }
      
      throw new Error(`Failed to fetch workout version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static compareWorkoutData(localData: WorkoutData, latestVersion: WorkoutVersion): string[] {
    // Simplified comparison - would be more sophisticated in practice
    const affectedFields: string[] = [];
    
    // This is a mock implementation
    // In practice, we'd do deep comparison of workout data fields
    if (localData.title !== latestVersion.lastModified) {
      affectedFields.push('title');
    }
    
    return affectedFields;
  }

  private static detectConcurrentEdit(localData: WorkoutData, latestVersion: WorkoutVersion): boolean {
    // Simplified concurrent edit detection
    // In practice, we'd check for overlapping edit timeframes and changed fields
    const timeDiff = Date.now() - new Date(latestVersion.lastModified).getTime();
    return timeDiff < 300000; // 5 minutes
  }

  private static async resolveIndividualConflict(
    conflict: VersionConflict,
    latestVersion: WorkoutVersion,
    options: VersionManagerOptions
  ): Promise<{ success: boolean; dataLoss: boolean }> {
    try {
      switch (conflict.resolutionStrategy) {
        case 'server_wins':
          // Server version takes precedence
          return { success: true, dataLoss: true };
          
        case 'local_wins':
          // Local version takes precedence (rare)
          return { success: true, dataLoss: false };
          
        case 'merge':
          // Attempt to merge changes (complex)
          return { success: true, dataLoss: false };
          
        default:
          return { success: false, dataLoss: false };
      }
    } catch (error) {
      return { success: false, dataLoss: false };
    }
  }
} 