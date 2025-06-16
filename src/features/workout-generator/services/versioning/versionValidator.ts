/**
 * Version Validation Utilities
 * 
 * Provides validation functions for version-related operations.
 */
import { logger } from '../utils/logger';

/**
 * Validate version number
 */
export function isValidVersion(version: any): boolean {
  const isValid = typeof version === 'number' && version > 0 && Number.isInteger(version);
  
  if (!isValid) {
    logger.warn('Invalid version detected', { version, type: typeof version });
  }
  
  return isValid;
}

/**
 * Validate timestamp format
 */
export function isValidTimestamp(timestamp: any): boolean {
  if (!timestamp) return false;
  
  const date = new Date(timestamp);
  const isValid = !isNaN(date.getTime());
  
  if (!isValid) {
    logger.warn('Invalid timestamp detected', { timestamp });
  }
  
  return isValid;
}

/**
 * Validate user ID
 */
export function isValidUserId(userId: any): boolean {
  const isValid = typeof userId === 'number' && userId > 0 && Number.isInteger(userId);
  
  if (!isValid) {
    logger.warn('Invalid user ID detected', { userId, type: typeof userId });
  }
  
  return isValid;
}

/**
 * Validate complete version info object
 */
export function validateVersionInfo(versionInfo: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isValidVersion(versionInfo.version)) {
    errors.push('Invalid version number');
  }
  
  if (!isValidTimestamp(versionInfo.lastModified)) {
    errors.push('Invalid lastModified timestamp');
  }
  
  if (!isValidUserId(versionInfo.modifiedBy)) {
    errors.push('Invalid modifiedBy user ID');
  }
  
  const isValid = errors.length === 0;
  
  if (!isValid) {
    logger.warn('Version info validation failed', { versionInfo, errors });
  }
  
  return { isValid, errors };
} 