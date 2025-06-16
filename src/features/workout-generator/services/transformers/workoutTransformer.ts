/**
 * Workout Data Transformer
 * 
 * Handles transformation between API response format and frontend GeneratedWorkout format.
 * Extracted from workoutService.ts for better separation of concerns.
 */
import { GeneratedWorkout } from '../../types/workout';
import { extractExercises, extractSections } from '../exercise/exerciseExtractor';
import { logger } from '../utils/logger';

/**
 * Transform API response data to GeneratedWorkout format
 */
export function transformWorkoutResponse(apiData: any): GeneratedWorkout {
  logger.debug('Transforming API response to GeneratedWorkout format', {
    hasData: !!apiData,
    dataKeys: apiData ? Object.keys(apiData) : []
  });

  if (!apiData) {
    throw new Error('No API data provided for transformation');
  }

  // Extract exercises and sections using dedicated extractor
  const { exercises, sections } = extractExercises(apiData);

  // Transform exercises to ensure proper structure
  const transformedExercises = exercises.map((exercise: any, index: number) => {
    const transformed: any = {
      id: exercise.id || `exercise-${index}`,
      name: exercise.name || 'Unnamed Exercise',
      description: exercise.description || exercise.instructions || ''
    };

    // Handle duration-based exercises (warm-up, cool-down)
    if (exercise.duration) {
      transformed.duration = exercise.duration;
      transformed.type = exercise.section?.toLowerCase() || 'timed';
    }

    // Handle sets/reps-based exercises
    if (exercise.sets || exercise.reps) {
      transformed.sets = exercise.sets || 1;
      transformed.reps = exercise.reps || 10;
      transformed.type = 'strength';
    }

    // Default to sets/reps if neither format is specified
    if (!exercise.duration && !exercise.sets && !exercise.reps) {
      transformed.sets = 1;
      transformed.reps = 10;
      transformed.type = 'strength';
    }

    // Preserve section information
    if (exercise.section) {
      transformed.section = exercise.section;
    }

    return transformed;
  });

  // Build the GeneratedWorkout object
  const workout: GeneratedWorkout = {
    // Core identification
    id: apiData.id || apiData.post_id,
    post_id: apiData.post_id || apiData.id,
    title: apiData.title || 'Untitled Workout',
    description: apiData.description || apiData.content || apiData.notes || '',
    
    // Workout parameters
    duration: Number(apiData.duration) || 0,
    difficulty: apiData.difficulty || 'intermediate',
    
    // Fitness-specific fields (preserved from API)
    fitness_level: apiData.fitness_level,
    exercise_complexity: apiData.exercise_complexity,
    intensity_level: apiData.intensity_level,
    
    // WorkoutGeneratorGrid fields (preserved from API)
    stress_level: apiData.stress_level,
    energy_level: apiData.energy_level,
    sleep_quality: apiData.sleep_quality,
    location: apiData.location,
    custom_notes: apiData.custom_notes,
    primary_muscle_focus: apiData.primary_muscle_focus,
    goals: apiData.goals,
    equipment: apiData.equipment,
    
    // Exercise data
    exercises: transformedExercises,
    sections: sections,
    
    // Timestamps
    created_at: apiData.date || apiData.created_at || new Date().toISOString(),
    updated_at: apiData.modified || apiData.updated_at || new Date().toISOString(),
    
    // Version information
    version: apiData.version || apiData._workout_version || 1,
    lastModified: apiData.last_modified || apiData._workout_last_modified,
    modifiedBy: apiData.modified_by || apiData._workout_modified_by,
    
    // Session data (preserved from API)
    sessionInputs: apiData.sessionInputs || {}
  };

  logger.debug('Workout transformation completed', {
    id: workout.id,
    title: workout.title,
    exerciseCount: workout.exercises.length,
    sectionCount: workout.sections?.length || 0,
    hasSessionInputs: !!workout.sessionInputs && Object.keys(workout.sessionInputs).length > 0
  });

  return workout;
}

/**
 * Transform GeneratedWorkout to API save format
 */
export function transformWorkoutForSave(workout: GeneratedWorkout): any {
  logger.debug('Transforming GeneratedWorkout for API save', {
    id: workout.id,
    title: workout.title,
    hasVersion: workout.version !== undefined && workout.version !== null
  });

  const saveData: any = {
    title: workout.title,
    description: workout.description,
    difficulty: workout.difficulty,
    duration: workout.duration,
    exercises: workout.exercises
  };

  // Preserve sections if they exist
  if (workout.sections && Array.isArray(workout.sections) && workout.sections.length > 0) {
    saveData.sections = workout.sections;
  }

  // Preserve version if it exists
  if (workout.version !== undefined && workout.version !== null) {
    saveData.version = workout.version;
  }

  logger.debug('Workout save transformation completed', {
    hasVersion: 'version' in saveData,
    exerciseCount: saveData.exercises?.length || 0,
    sectionCount: saveData.sections?.length || 0
  });

  return saveData;
} 