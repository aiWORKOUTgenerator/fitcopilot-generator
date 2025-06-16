/**
 * ID Resolution Utility
 * 
 * Handles resolution of different ID formats used throughout the workout system.
 */
import { logger } from './logger';

export interface IdResolution {
  id: string;
  post_id: string;
  source: 'id' | 'post_id' | 'generated';
}

/**
 * Resolve workout ID from various possible sources
 */
export function resolveWorkoutId(data: any): IdResolution {
  logger.debug('Resolving workout ID', {
    hasId: !!data.id,
    hasPostId: !!data.post_id,
    dataKeys: data ? Object.keys(data) : []
  });

  let id: string;
  let post_id: string;
  let source: IdResolution['source'];

  // Priority order: id -> post_id -> generated
  if (data.id) {
    id = String(data.id);
    post_id = data.post_id ? String(data.post_id) : id;
    source = 'id';
  } else if (data.post_id) {
    post_id = String(data.post_id);
    id = post_id;
    source = 'post_id';
  } else {
    // Generate a temporary ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    id = `workout-${timestamp}-${random}`;
    post_id = id;
    source = 'generated';
    
    logger.warn('No ID found in data, generated temporary ID', { 
      generatedId: id,
      dataKeys: data ? Object.keys(data) : []
    });
  }

  const resolution: IdResolution = { id, post_id, source };

  logger.debug('Workout ID resolved', resolution);

  return resolution;
}

/**
 * Validate workout ID format
 */
export function isValidWorkoutId(id: any): boolean {
  if (!id) return false;
  
  const stringId = String(id);
  
  // Check for valid formats:
  // - Numeric: "123", "456"
  // - Generated: "workout-1234567890-abc123def"
  // - UUID-like: "abc123def-456-789"
  const isValid = /^(\d+|workout-\d+-[a-z0-9]+|[a-z0-9-]+)$/i.test(stringId);
  
  if (!isValid) {
    logger.warn('Invalid workout ID format detected', { id, stringId });
  }
  
  return isValid;
}

/**
 * Normalize workout ID to string format
 */
export function normalizeWorkoutId(id: any): string {
  if (!id) {
    logger.warn('Empty ID provided for normalization');
    return '';
  }
  
  const stringId = String(id).trim();
  
  if (!isValidWorkoutId(stringId)) {
    logger.warn('Invalid ID normalized to empty string', { originalId: id });
    return '';
  }
  
  return stringId;
}

/**
 * Extract numeric ID from various formats
 */
export function extractNumericId(id: any): number | null {
  if (!id) return null;
  
  const stringId = String(id);
  
  // If already numeric
  if (/^\d+$/.test(stringId)) {
    return parseInt(stringId, 10);
  }
  
  // Extract from generated format: "workout-1234567890-abc123def"
  const generatedMatch = stringId.match(/^workout-(\d+)-[a-z0-9]+$/i);
  if (generatedMatch) {
    return parseInt(generatedMatch[1], 10);
  }
  
  // Extract first number found
  const numberMatch = stringId.match(/\d+/);
  if (numberMatch) {
    return parseInt(numberMatch[0], 10);
  }
  
  logger.debug('No numeric ID could be extracted', { id: stringId });
  return null;
}

/**
 * Compare two IDs for equality
 */
export function idsEqual(id1: any, id2: any): boolean {
  if (!id1 || !id2) return false;
  
  const normalized1 = normalizeWorkoutId(id1);
  const normalized2 = normalizeWorkoutId(id2);
  
  if (!normalized1 || !normalized2) return false;
  
  // Direct comparison
  if (normalized1 === normalized2) return true;
  
  // Compare numeric parts if available
  const numeric1 = extractNumericId(normalized1);
  const numeric2 = extractNumericId(normalized2);
  
  if (numeric1 && numeric2) {
    return numeric1 === numeric2;
  }
  
  return false;
} 