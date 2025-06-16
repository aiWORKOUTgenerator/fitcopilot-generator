/**
 * Exercise Extraction Service
 * 
 * Handles extraction and processing of exercises from API responses.
 * Extracted from workoutService.ts for better separation of concerns.
 */
import { logger } from '../utils/logger';

export interface ExtractionResult {
  exercises: any[];
  sections: any[];
}

/**
 * Extract exercises and sections from API data
 */
export function extractExercises(apiData: any): ExtractionResult {
  logger.debug('Extracting exercises from API data', {
    hasWorkoutData: !!apiData.workout_data,
    hasDirectExercises: !!apiData.exercises,
    hasSections: !!apiData.sections
  });

  let exercises: any[] = [];
  let sections: any[] = [];

  // Try to extract from workout_data field first (most common)
  if (apiData.workout_data && typeof apiData.workout_data === 'object') {
    const workoutData = apiData.workout_data;
    
    // Extract sections if they exist
    if (workoutData.sections && Array.isArray(workoutData.sections)) {
      sections = workoutData.sections;
      logger.debug(`Found ${sections.length} sections in workout_data field`);
      
      // Extract exercises from sections
      exercises = extractExercisesFromSections(sections);
      logger.debug(`Found ${exercises.length} exercises in workout_data sections`);
    }
    
    // Also check for direct exercises array in workout_data
    if (workoutData.exercises && Array.isArray(workoutData.exercises)) {
      const directExercises = workoutData.exercises;
      logger.debug(`Found ${directExercises.length} exercises in workout_data exercises field`);
      
      // If we have both sections and direct exercises, prefer sections
      if (exercises.length === 0) {
        exercises = directExercises;
      }
    }
  }

  // Fallback to direct exercises field
  if (exercises.length === 0 && apiData.exercises && Array.isArray(apiData.exercises)) {
    exercises = apiData.exercises;
    logger.debug(`Found ${exercises.length} exercises in direct exercises field`);
  }

  // Fallback to direct sections field
  if (sections.length === 0 && apiData.sections && Array.isArray(apiData.sections)) {
    sections = apiData.sections;
    logger.debug(`Found ${sections.length} sections in direct sections field`);
    
    // Extract exercises from sections if we don't have any yet
    if (exercises.length === 0) {
      exercises = extractExercisesFromSections(sections);
      logger.debug(`Extracted ${exercises.length} exercises from direct sections`);
    }
  }

  // Final validation
  if (exercises.length === 0) {
    logger.warn('No exercises found in API data', {
      apiDataKeys: Object.keys(apiData),
      hasWorkoutData: !!apiData.workout_data,
      workoutDataKeys: apiData.workout_data ? Object.keys(apiData.workout_data) : []
    });
  }

  logger.debug('Exercise extraction completed', {
    exerciseCount: exercises.length,
    sectionCount: sections.length
  });

  return { exercises, sections };
}

/**
 * Extract exercises from sections array
 */
export function extractExercisesFromSections(sections: any[]): any[] {
  if (!Array.isArray(sections)) {
    logger.warn('Invalid sections data provided', { sections });
    return [];
  }

  const exercises: any[] = [];

  sections.forEach((section, sectionIndex) => {
    if (section.exercises && Array.isArray(section.exercises)) {
      section.exercises.forEach((exercise: any, exerciseIndex: number) => {
        // Add section context to exercise
        const exerciseWithContext = {
          ...exercise,
          section: section.name || section.title || `Section ${sectionIndex + 1}`,
          sectionIndex,
          exerciseIndex
        };
        exercises.push(exerciseWithContext);
      });
    }
  });

  logger.debug(`Extracted ${exercises.length} exercises from ${sections.length} sections`);

  return exercises;
}

/**
 * Count total exercises across all sections
 */
export function countExercises(apiData: any): number {
  const { exercises } = extractExercises(apiData);
  return exercises.length;
}

/**
 * Get exercise by ID from extracted data
 */
export function findExerciseById(apiData: any, exerciseId: string): any | null {
  const { exercises } = extractExercises(apiData);
  
  const exercise = exercises.find(ex => 
    ex.id === exerciseId || 
    ex.name === exerciseId ||
    `exercise-${ex.exerciseIndex}` === exerciseId
  );

  if (exercise) {
    logger.debug('Exercise found by ID', { exerciseId, exerciseName: exercise.name });
  } else {
    logger.warn('Exercise not found by ID', { exerciseId, availableExercises: exercises.length });
  }

  return exercise || null;
} 