/**
 * Services Export
 * 
 * Central export point for all service classes used in the workout editor.
 * Updated with Day 1 architectural fix services following SavedWorkoutsTab patterns.
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

// ===========================================
// DAY 1: ARCHITECTURAL FIX SERVICES
// ===========================================
// ✅ Context isolation and version management services

// Context isolation service
export {
  ContextIsolationService,
  useIsolatedWorkoutEditor,
  useIsolationStatus,
  type IsolatedWorkoutEditorContextValue,
  type ContextIsolationOptions,
  type ContextConflict,
  type IsolationResult
} from './contextIsolation/ContextIsolationService';

// Version management service
export {
  VersionManager,
  type WorkoutVersion,
  type VersionConflict,
  type VersionFetchOptions,
  type VersionCheckResult,
  type VersionResolutionResult,
  type VersionManagerOptions
} from './versionManagement/VersionManager'; 