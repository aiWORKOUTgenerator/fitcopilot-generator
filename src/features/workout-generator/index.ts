/**
 * Workout Generator Feature
 * 
 * Main export file for the Workout Generator feature. Provides:
 * 1. The main feature component
 * 2. Core contexts and hooks for extensibility and testing
 * 
 * The feature implements a multi-step form pattern for workout generation:
 * ┌─────────────┐     ┌──────────────┐     ┌────────────────┐     ┌─────────────────┐
 * │  Input Form  │───▶│  Form Preview │───▶│  AI Generation  │───▶│  Display Result  │
 * └─────────────┘     └──────────────┘     └────────────────┘     └─────────────────┘
 *        ▲                   │                                            │
 *        └───────────────────┘                                            │
 *              Edit                                                       │
 *              Request                                                    │
 *                                    ┌───────────────────────┐            │
 *                                    │  Generate New Workout  │◀───────────
 *                                    └───────────────────────┘
 * 
 * This file exports specific components, hooks, and types to avoid naming collisions
 */

// Import the UI component styles
import '../../components/ui/AutoResizeTextarea.scss';
import '../../components/ui/ExpandableInput.scss';
import '../../components/ui/CharacterCounter.scss';
import '../../components/ui/AutoResizeTextareaWithCounter.scss';
import '../../components/ui/DynamicTextContainer.scss';

// Import the smart parsing styles
import './components/WorkoutEditor/SmartFieldSuggestions.scss';

// Export the main feature component
export { default } from './WorkoutGeneratorFeature';

// Export components selectively
export { 
  WorkoutRequestForm,
  InputStep
} from './components/Form';

// We can't export PreviewStep, GeneratingStep directly since they're default exports
// Import specific step components if needed in consuming code

// Export hooks selectively - avoid useWorkoutGenerator conflict
export {
  useWorkoutForm,
  useErrorHandler,
  useFormPersistence,
  usePerformanceCache
} from './hooks';

// Export context providers - be specific to avoid naming conflicts
export {
  WorkoutGeneratorProvider,
  FormFlowProvider,
  useFormFlow
} from './context';

// Export specific types from the types directory
export type {
  WorkoutFormParams,
  GeneratedWorkout,
  WorkoutSection,
  FormSteps,
  Exercise,
  TimedExercise,
  SetsExercise
} from './types/workout';

export type {
  GenerationError
} from './types/errors'; 