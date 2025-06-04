/**
 * WorkoutCard Component Exports
 * 
 * Centralized exports for the modular WorkoutCard component and its sub-components.
 * Created during Week 2 Component Migration.
 */

// Main component
export { default } from './WorkoutCard';
export { WorkoutCard } from './WorkoutCard';
export type { WorkoutCardProps } from './WorkoutCard';

// Sub-components (for advanced usage)
export { WorkoutCardHeader } from './WorkoutCardHeader';
export { WorkoutCardContent } from './WorkoutCardContent';
export { WorkoutCardActions } from './WorkoutCardActions';

// Re-export types for convenience
export type { DisplayWorkout } from '../../../types/workout'; 