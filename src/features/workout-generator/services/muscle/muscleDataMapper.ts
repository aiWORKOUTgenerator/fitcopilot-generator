/**
 * Muscle Data Mapper
 * 
 * Handles mapping between different muscle data formats and naming conventions.
 */
import { logger } from '../utils/logger';

// Standard muscle group mappings
export const MUSCLE_GROUP_MAPPINGS = {
  // Upper Body
  'chest': ['pectorals', 'pecs', 'chest'],
  'back': ['latissimus', 'lats', 'rhomboids', 'trapezius', 'back'],
  'shoulders': ['deltoids', 'delts', 'shoulders'],
  'arms': ['biceps', 'triceps', 'forearms', 'arms'],
  'biceps': ['biceps', 'bicep'],
  'triceps': ['triceps', 'tricep'],
  
  // Lower Body
  'legs': ['quadriceps', 'hamstrings', 'calves', 'legs'],
  'quadriceps': ['quads', 'quadriceps'],
  'hamstrings': ['hamstrings', 'hams'],
  'glutes': ['glutes', 'gluteus', 'butt'],
  'calves': ['calves', 'calf'],
  
  // Core
  'core': ['abs', 'abdominals', 'core', 'obliques'],
  'abs': ['abs', 'abdominals', 'rectus abdominis'],
  
  // Full Body
  'full-body': ['full body', 'total body', 'whole body']
} as const;

/**
 * Normalize muscle group name to standard format
 */
export function normalizeMuscleGroup(muscleGroup: string): string {
  if (!muscleGroup || typeof muscleGroup !== 'string') {
    logger.warn('Invalid muscle group provided for normalization', { muscleGroup });
    return 'full-body';
  }

  const normalized = muscleGroup.toLowerCase().trim();
  
  // Find matching standard group
  for (const [standardGroup, variations] of Object.entries(MUSCLE_GROUP_MAPPINGS)) {
    if (variations.some(variation => normalized.includes(variation))) {
      logger.debug('Muscle group normalized', { 
        original: muscleGroup, 
        normalized: standardGroup 
      });
      return standardGroup;
    }
  }
  
  // If no match found, return cleaned version
  const cleaned = normalized.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  logger.debug('Muscle group cleaned but not mapped', { 
    original: muscleGroup, 
    cleaned 
  });
  
  return cleaned || 'full-body';
}

/**
 * Map muscle groups array to normalized format
 */
export function normalizeMuscleGroups(muscleGroups: string[]): string[] {
  if (!Array.isArray(muscleGroups)) {
    logger.warn('Invalid muscle groups array provided', { muscleGroups });
    return [];
  }

  const normalized = muscleGroups
    .filter(group => group && typeof group === 'string')
    .map(group => normalizeMuscleGroup(group))
    .filter((group, index, array) => array.indexOf(group) === index); // Remove duplicates

  logger.debug('Muscle groups normalized', {
    originalCount: muscleGroups.length,
    normalizedCount: normalized.length,
    original: muscleGroups,
    normalized
  });

  return normalized;
}

/**
 * Get display name for muscle group
 */
export function getMuscleGroupDisplayName(muscleGroup: string): string {
  const normalized = normalizeMuscleGroup(muscleGroup);
  
  // Convert to display format
  const displayName = normalized
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return displayName;
}

/**
 * Check if muscle groups overlap
 */
export function muscleGroupsOverlap(group1: string, group2: string): boolean {
  const normalized1 = normalizeMuscleGroup(group1);
  const normalized2 = normalizeMuscleGroup(group2);
  
  if (normalized1 === normalized2) return true;
  
  // Check for parent-child relationships
  const overlaps = [
    ['arms', 'biceps'],
    ['arms', 'triceps'],
    ['legs', 'quadriceps'],
    ['legs', 'hamstrings'],
    ['legs', 'calves'],
    ['legs', 'glutes'],
    ['core', 'abs']
  ];
  
  return overlaps.some(([parent, child]) => 
    (normalized1 === parent && normalized2 === child) ||
    (normalized1 === child && normalized2 === parent)
  );
}

/**
 * Group muscle selections by body region
 */
export function groupMusclesByRegion(muscleGroups: string[]): Record<string, string[]> {
  const regions = {
    'Upper Body': ['chest', 'back', 'shoulders', 'arms', 'biceps', 'triceps'],
    'Lower Body': ['legs', 'quadriceps', 'hamstrings', 'glutes', 'calves'],
    'Core': ['core', 'abs'],
    'Full Body': ['full-body']
  };

  const normalized = normalizeMuscleGroups(muscleGroups);
  const grouped: Record<string, string[]> = {};

  for (const [region, regionMuscles] of Object.entries(regions)) {
    const matches = normalized.filter(muscle => regionMuscles.includes(muscle));
    if (matches.length > 0) {
      grouped[region] = matches;
    }
  }

  logger.debug('Muscles grouped by region', {
    totalMuscles: normalized.length,
    regions: Object.keys(grouped),
    grouped
  });

  return grouped;
} 