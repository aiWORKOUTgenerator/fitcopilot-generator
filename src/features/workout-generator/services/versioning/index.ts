/**
 * Versioning Module Exports
 * 
 * Centralized exports for all version management utilities.
 */
export { 
  extractVersionInfo, 
  checkVersionConflict, 
  incrementVersion, 
  prepareVersionForSave,
  type VersionInfo,
  type VersionConflict
} from './versionManager';

export { 
  isValidVersion, 
  isValidTimestamp, 
  isValidUserId, 
  validateVersionInfo 
} from './versionValidator'; 