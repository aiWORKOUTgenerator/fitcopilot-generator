/**
 * Simplified WorkoutDisplay Types
 * 
 * Clean, focused types for the unified workout display system.
 */

export type WorkoutDisplayVariant = 'default' | 'compact';

export interface BaseDisplayProps {
  /** The workout data to display */
  workout: import('../../types/workout').GeneratedWorkout;
  /** Display variant */
  variant?: WorkoutDisplayVariant;
  /** Optional CSS class name */
  className?: string;
  /** Whether to show actions (print, share, etc.) */
  showActions?: boolean;
  /** Callback for custom actions */
  onAction?: (action: string, data?: any) => void;
} 