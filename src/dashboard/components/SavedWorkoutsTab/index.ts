/**
 * Saved Workouts Tab Components
 * 
 * Export all components related to the saved workouts tab
 * including the enhanced grid, filters, and cards.
 */

// Enhanced Workout Grid Components
export { default as EnhancedWorkoutGrid } from './WorkoutGrid';
export { WorkoutGrid } from './WorkoutGrid'; // Backward compatibility
export { default as AdvancedWorkoutFilters } from './AdvancedWorkoutFilters';
export { default as EnhancedWorkoutCard } from './EnhancedWorkoutCard';

// Legacy Components (maintain compatibility)
export { default as WorkoutCard } from './WorkoutCard';
export { default as WorkoutSearch } from './WorkoutSearch';

// Types
export type {
  DisplayWorkout,
  WorkoutFilters,
  EnhancedWorkoutGridProps
} from './WorkoutGrid';

export type {
  FilterPreset,
  FilterPresetType,
  AdvancedWorkoutFiltersProps
} from './AdvancedWorkoutFilters';

export type {
  EnhancedWorkoutCardProps,
  ViewMode,
  CardAction
} from './EnhancedWorkoutCard'; 