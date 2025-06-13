/**
 * Workout Data Formatters
 * 
 * Common utilities for formatting workout data across different display formats.
 */

import { GeneratedWorkout, WorkoutSection, Exercise } from '../../../types/workout';

/**
 * Format duration from minutes to human-readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return '< 1 min';
  if (minutes === 1) return '1 minute';
  return `${minutes} minutes`;
};

/**
 * Format exercise sets and reps for display
 */
export const formatExerciseDetails = (exercise: Exercise): string => {
  if ('sets' in exercise) {
    return `${exercise.sets} reps`;
  }
  return exercise.duration || '';
};

/**
 * Calculate total workout duration
 */
export const calculateTotalDuration = (workout: GeneratedWorkout): number => {
  if (!workout.sections) return 0;
  return workout.sections.reduce((total, section) => {
    return total + (section.duration || 0);
  }, 0);
};

/**
 * Get exercise count for a workout
 */
export const getExerciseCount = (workout: GeneratedWorkout): number => {
  if (!workout.sections) return 0;
  return workout.sections.reduce((total, section) => {
    return total + (section.exercises?.length || 0);
  }, 0);
};

/**
 * Extract unique equipment from workout
 */
export const getWorkoutEquipment = (workout: GeneratedWorkout): string[] => {
  if (!workout.sections) return [];
  
  const equipment = new Set<string>();
  workout.sections.forEach(section => {
    section.exercises?.forEach(exercise => {
      if (exercise.equipment) {
        exercise.equipment.forEach(item => equipment.add(item));
      }
    });
  });
  
  return Array.from(equipment);
};

/**
 * Generate workout metadata
 */
export const generateWorkoutMetadata = (workout: GeneratedWorkout) => {
  return {
    title: workout.title || 'Untitled Workout',
    totalDuration: calculateTotalDuration(workout),
    exerciseCount: getExerciseCount(workout),
    sectionCount: workout.sections?.length || 0,
    equipment: getWorkoutEquipment(workout),
    difficulty: workout.difficulty || 'Not specified',
    focus: workout.focus || 'General fitness',
  };
};

/**
 * Clean text for plain text formats
 */
export const cleanTextForPlainFormat = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();                 // Remove leading/trailing whitespace
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Format section name for display
 */
export const formatSectionName = (sectionName: string): string => {
  return sectionName
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Generate section summary
 */
export const generateSectionSummary = (section: WorkoutSection): string => {
  const exerciseCount = section.exercises?.length || 0;
  const duration = section.duration || 0;
  
  return `${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''} • ${formatDuration(duration)}`;
}; 