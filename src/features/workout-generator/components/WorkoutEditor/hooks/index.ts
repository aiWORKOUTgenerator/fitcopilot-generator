/**
 * Custom Hooks Export
 * 
 * Central export point for all custom hooks used in the workout editor.
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