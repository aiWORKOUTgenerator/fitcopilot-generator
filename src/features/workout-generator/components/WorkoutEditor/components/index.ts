/**
 * Step 4: UI Components - Export Index
 * 
 * Central export point for all Step 4 UI components that provide visual feedback
 * for the workout editor functionality. These components integrate with the 
 * Step 3 hooks to deliver a polished user experience.
 */

// Import components first
import SaveStatusIndicator from './SaveStatusIndicator';
import ValidationFeedback from './ValidationFeedback';
import UnsavedChangesWarning from './UnsavedChangesWarning';
import SuggestionTooltip from './SuggestionTooltip';

// Re-export individual components and types
export { 
  SaveStatusIndicator,
  default as SaveStatusIndicatorDefault,
  type SaveStatusIndicatorProps 
} from './SaveStatusIndicator';

export { 
  ValidationFeedback,
  default as ValidationFeedbackDefault,
  type ValidationFeedbackProps,
  type ValidationMessage 
} from './ValidationFeedback';

export { 
  UnsavedChangesWarning,
  default as UnsavedChangesWarningDefault,
  type UnsavedChangesWarningProps 
} from './UnsavedChangesWarning';

export { 
  SuggestionTooltip,
  default as SuggestionTooltipDefault,
  type SuggestionTooltipProps,
  type SuggestionItem 
} from './SuggestionTooltip';

// Re-export all components as a collection for easier import
export const WorkoutEditorUIComponents = {
  SaveStatusIndicator,
  ValidationFeedback,
  UnsavedChangesWarning,
  SuggestionTooltip
} as const;

// Re-export all types as a collection
export type WorkoutEditorUITypes = {
  SaveStatusIndicatorProps: SaveStatusIndicatorProps;
  ValidationFeedbackProps: ValidationFeedbackProps;
  ValidationMessage: ValidationMessage;
  UnsavedChangesWarningProps: UnsavedChangesWarningProps;
  SuggestionTooltipProps: SuggestionTooltipProps;
  SuggestionItem: SuggestionItem;
}; 