/**
 * Exercise Module Exports
 * 
 * Centralized exports for all exercise-related utilities.
 */
export { 
  extractExercises, 
  extractExercisesFromSections, 
  countExercises, 
  findExerciseById,
  type ExtractionResult
} from './exerciseExtractor';

export { 
  normalizeExercise, 
  normalizeExercises, 
  groupExercisesBySection,
  type NormalizedExercise
} from './exerciseTransformer'; 