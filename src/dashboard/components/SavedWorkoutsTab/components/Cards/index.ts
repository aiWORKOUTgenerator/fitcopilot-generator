/**
 * Cards Component Exports
 * 
 * Centralized exports for all card-related components.
 * Created during Week 2 Component Migration.
 */

// Modular WorkoutCard (new)
export { WorkoutCard } from './WorkoutCard';
export { default as WorkoutCard } from './WorkoutCard';
export type { WorkoutCardProps } from './WorkoutCard';

// Sub-components (for advanced usage)
export { WorkoutCardHeader } from './WorkoutCard';
export { WorkoutCardContent } from './WorkoutCard';
export { WorkoutCardActions } from './WorkoutCard';

// Enhanced WorkoutCard (Phase 2, Day 4)
export { EnhancedWorkoutCard } from './EnhancedWorkoutCard';
export type { EnhancedWorkoutCardProps } from './EnhancedWorkoutCard';

// Enhanced sub-components (for advanced usage)
export { CardStatusIndicator, CardActionsMenu, CardErrorDisplay } from './EnhancedWorkoutCard';
export type { 
  CardStatusIndicatorProps, 
  CardActionsMenuProps, 
  CardErrorDisplayProps 
} from './EnhancedWorkoutCard';

// Shared components
export * from './shared'; 