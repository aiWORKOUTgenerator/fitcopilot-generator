/**
 * Custom Hooks Export
 * 
 * Central export point for all custom hooks used in the workout editor.
 * Updated with Day 1 architectural fix hooks following established patterns.
 */

// Auto-save hooks
export {
  useAutoSave,
  useWorkoutAutoSave,
  usePeriodicAutoSave,
  type UseAutoSaveOptions,
  type UseAutoSaveReturn
} from './useAutoSave';

// Validation hooks
export {
  useWorkoutValidation,
  useFieldValidation,
  type UseWorkoutValidationOptions,
  type UseWorkoutValidationReturn
} from './useWorkoutValidation';

// Unsaved changes hooks
export {
  useUnsavedChanges,
  useFormUnsavedChanges,
  useNavigationBlock,
  type UnsavedChangesOptions,
  type UnsavedChangesState,
  type UnsavedChangesActions,
  type UseUnsavedChangesReturn
} from './useUnsavedChanges';

// ===========================================
// DAY 1: ARCHITECTURAL FIX HOOKS
// ===========================================
// ✅ Context isolation and version management hooks

// Context isolation hooks
export {
  useWorkoutEditorIsolation,
  type UseWorkoutEditorIsolationOptions,
  type UseWorkoutEditorIsolationReturn
} from './useWorkoutEditorIsolation';

// Version management hooks
export {
  useVersionManagement,
  type UseVersionManagementOptions,
  type UseVersionManagementReturn
} from './useVersionManagement'; 