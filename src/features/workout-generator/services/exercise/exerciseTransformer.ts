/**
 * Exercise Data Transformer
 * 
 * Handles transformation and normalization of exercise data.
 */
import { logger } from '../utils/logger';

export interface NormalizedExercise {
  id: string;
  name: string;
  description: string;
  type: 'strength' | 'cardio' | 'timed' | 'flexibility';
  sets?: number;
  reps?: number;
  duration?: string;
  section?: string;
  sectionIndex?: number;
  exerciseIndex?: number;
}

/**
 * Normalize exercise data to consistent format
 */
export function normalizeExercise(exercise: any, index: number): NormalizedExercise {
  logger.debug('Normalizing exercise', { 
    exerciseName: exercise.name, 
    index,
    hasId: !!exercise.id,
    hasDuration: !!exercise.duration,
    hasSets: !!exercise.sets,
    hasReps: !!exercise.reps
  });

  const normalized: NormalizedExercise = {
    id: exercise.id || `exercise-${index}`,
    name: exercise.name || 'Unnamed Exercise',
    description: exercise.description || exercise.instructions || '',
    type: determineExerciseType(exercise)
  };

  // Handle duration-based exercises (warm-up, cool-down, cardio)
  if (exercise.duration) {
    normalized.duration = exercise.duration;
    normalized.type = exercise.section?.toLowerCase() === 'warm-up' || 
                     exercise.section?.toLowerCase() === 'cool-down' ? 'timed' : 'cardio';
  }

  // Handle sets/reps-based exercises (strength training)
  if (exercise.sets || exercise.reps) {
    normalized.sets = exercise.sets || 1;
    normalized.reps = exercise.reps || 10;
    normalized.type = 'strength';
  }

  // Default to sets/reps if neither format is specified
  if (!exercise.duration && !exercise.sets && !exercise.reps) {
    normalized.sets = 1;
    normalized.reps = 10;
    normalized.type = 'strength';
  }

  // Preserve section information
  if (exercise.section) {
    normalized.section = exercise.section;
  }
  if (exercise.sectionIndex !== undefined) {
    normalized.sectionIndex = exercise.sectionIndex;
  }
  if (exercise.exerciseIndex !== undefined) {
    normalized.exerciseIndex = exercise.exerciseIndex;
  }

  logger.debug('Exercise normalized', {
    id: normalized.id,
    name: normalized.name,
    type: normalized.type,
    hasDuration: !!normalized.duration,
    hasSetsReps: !!(normalized.sets && normalized.reps)
  });

  return normalized;
}

/**
 * Determine exercise type based on available data
 */
function determineExerciseType(exercise: any): NormalizedExercise['type'] {
  // Check section-based type hints
  if (exercise.section) {
    const section = exercise.section.toLowerCase();
    if (section.includes('warm') || section.includes('cool')) {
      return 'timed';
    }
    if (section.includes('cardio') || section.includes('hiit')) {
      return 'cardio';
    }
    if (section.includes('stretch') || section.includes('flexibility')) {
      return 'flexibility';
    }
  }

  // Check exercise properties
  if (exercise.duration && !exercise.sets && !exercise.reps) {
    return 'timed';
  }
  
  if (exercise.sets || exercise.reps) {
    return 'strength';
  }

  // Check exercise name for hints
  if (exercise.name) {
    const name = exercise.name.toLowerCase();
    if (name.includes('stretch') || name.includes('hold')) {
      return 'flexibility';
    }
    if (name.includes('run') || name.includes('jump') || name.includes('cardio')) {
      return 'cardio';
    }
  }

  // Default to strength
  return 'strength';
}

/**
 * Transform exercises array to normalized format
 */
export function normalizeExercises(exercises: any[]): NormalizedExercise[] {
  if (!Array.isArray(exercises)) {
    logger.warn('Invalid exercises array provided for normalization', { exercises });
    return [];
  }

  const normalized = exercises.map((exercise, index) => normalizeExercise(exercise, index));
  
  logger.debug('Exercise normalization completed', {
    originalCount: exercises.length,
    normalizedCount: normalized.length,
    types: normalized.reduce((acc, ex) => {
      acc[ex.type] = (acc[ex.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });

  return normalized;
}

/**
 * Group exercises by section
 */
export function groupExercisesBySection(exercises: NormalizedExercise[]): Record<string, NormalizedExercise[]> {
  const grouped = exercises.reduce((acc, exercise) => {
    const section = exercise.section || 'Main Workout';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(exercise);
    return acc;
  }, {} as Record<string, NormalizedExercise[]>);

  logger.debug('Exercises grouped by section', {
    sectionCount: Object.keys(grouped).length,
    sections: Object.keys(grouped)
  });

  return grouped;
} 