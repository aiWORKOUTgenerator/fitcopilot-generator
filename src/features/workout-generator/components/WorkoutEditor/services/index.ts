/**
 * Services Export
 * 
 * Central export point for all service classes used in the workout editor.
 */

// Auto-save service
export {
  WorkoutAutoSaveService,
  type SaveQueueItem,
  type SaveResult,
  type AutoSaveOptions,
  type SaveStatus,
  type SaveFunction,
  type ConflictResolver
} from './WorkoutAutoSaveService';

// Validation service
export {
  WorkoutValidationService,
  type FieldSuggestion,
  type EnhancedValidationResult,
  type ValidationCache,
  type ValidationServiceOptions
} from './WorkoutValidationService'; 