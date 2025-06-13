/**
 * WorkoutDisplay Components
 * 
 * Simplified workout display system with single, clean component.
 * 
 * @example
 * ```tsx
 * import { WorkoutDisplay } from '@/components/WorkoutDisplay';
 * 
 * <WorkoutDisplay 
 *   workout={workout} 
 *   variant="default" 
 *   showActions={true} 
 * />
 * ```
 */

// Main Display Component
export { default as WorkoutDisplay } from './WorkoutDisplay';

// Legacy Components (for backward compatibility only)
export { default as WorkoutCard } from './WorkoutCard';

// Types
export type {
  WorkoutDisplayVariant,
  BaseDisplayProps,
} from './types';

// Shared Utilities
export * from './shared/formatters/workoutFormatters'; 