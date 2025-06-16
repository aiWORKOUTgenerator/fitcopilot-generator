/**
 * Version Management Service
 * 
 * Handles workout versioning, conflict detection, and version updates.
 * Extracted from workoutService.ts for better separation of concerns.
 */
import { GeneratedWorkout } from '../../types/workout';
import { logger } from '../utils/logger';

export interface VersionInfo {
  version: number;
  lastModified: string;
  modifiedBy: number;
}

export interface VersionConflict {
  hasConflict: boolean;
  currentVersion: number;
  incomingVersion: number;
  message?: string;
}

/**
 * Extract version information from workout data
 */
export function extractVersionInfo(workoutData: any): VersionInfo {
  logger.debug('Extracting version information', {
    hasVersion: 'version' in workoutData,
    hasLastModified: 'lastModified' in workoutData || 'last_modified' in workoutData,
    hasModifiedBy: 'modifiedBy' in workoutData || 'modified_by' in workoutData
  });

  const versionInfo: VersionInfo = {
    version: workoutData.version || workoutData._workout_version || 1,
    lastModified: workoutData.lastModified || workoutData.last_modified || workoutData._workout_last_modified || new Date().toISOString(),
    modifiedBy: workoutData.modifiedBy || workoutData.modified_by || workoutData._workout_modified_by || 1
  };

  logger.debug('Version information extracted', versionInfo);

  return versionInfo;
}

/**
 * Check for version conflicts before saving
 */
export function checkVersionConflict(currentWorkout: GeneratedWorkout, incomingData: any): VersionConflict {
  logger.debug('Checking for version conflicts', {
    currentVersion: currentWorkout.version,
    incomingVersion: incomingData.version,
    currentLastModified: currentWorkout.lastModified,
    incomingLastModified: incomingData.lastModified || incomingData.last_modified
  });

  const currentVersion = currentWorkout.version || 1;
  const incomingVersion = incomingData.version || 1;

  const conflict: VersionConflict = {
    hasConflict: false,
    currentVersion,
    incomingVersion
  };

  // Check for version mismatch
  if (incomingVersion < currentVersion) {
    conflict.hasConflict = true;
    conflict.message = `Version conflict: Current version (${currentVersion}) is newer than incoming version (${incomingVersion})`;
  }

  // Check for concurrent modifications
  const currentLastModified = new Date(currentWorkout.lastModified || 0).getTime();
  const incomingLastModified = new Date(incomingData.lastModified || incomingData.last_modified || 0).getTime();

  if (incomingLastModified > 0 && currentLastModified > incomingLastModified) {
    conflict.hasConflict = true;
    conflict.message = `Concurrent modification detected: Current workout was modified more recently`;
  }

  if (conflict.hasConflict) {
    logger.warn('Version conflict detected', conflict);
  } else {
    logger.debug('No version conflicts found');
  }

  return conflict;
}

/**
 * Increment version for save operation
 */
export function incrementVersion(currentVersion: number | undefined): number {
  const newVersion = (currentVersion || 0) + 1;
  
  logger.debug('Incrementing version', {
    currentVersion: currentVersion || 0,
    newVersion
  });

  return newVersion;
}

/**
 * Prepare version data for save
 */
export function prepareVersionForSave(workout: GeneratedWorkout, userId?: number): any {
  const now = new Date().toISOString();
  const newVersion = incrementVersion(workout.version);

  const versionData = {
    version: newVersion,
    lastModified: now,
    modifiedBy: userId || 1,
    // Also include underscore versions for WordPress compatibility
    _workout_version: newVersion,
    _workout_last_modified: now,
    _workout_modified_by: userId || 1
  };

  logger.debug('Version data prepared for save', versionData);

  return versionData;
} 