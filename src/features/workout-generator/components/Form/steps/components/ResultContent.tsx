/**
 * ResultContent Component
 * 
 * SIMPLIFIED - Displays workout content directly using the clean WorkoutDisplay component.
 * No more complex tabbed system or container hierarchy.
 * 
 * @component
 */
import React from 'react';
import { GeneratedWorkout } from '../../../../types/workout';
import { WorkoutDisplay } from '../../../WorkoutDisplay';

interface ResultContentProps {
  /** The current state of the result */
  state: 'success' | 'error' | 'empty';
  /** The generated workout to display (for success state) */
  workout?: GeneratedWorkout | null;
  /** Error message to display (for error state) */
  errorMessage?: string | null;
  /** Custom message for empty state */
  emptyMessage?: string;
  /** Callback for workout display actions */
  onWorkoutAction?: (action: string, data?: any) => void;
}

/**
 * ResultContent Component
 * 
 * CLEAN, SIMPLE implementation using the unified WorkoutDisplay
 */
export const ResultContent: React.FC<ResultContentProps> = ({
  state,
  workout,
  errorMessage,
  emptyMessage = "There was a problem generating your workout. Please try again.",
  onWorkoutAction,
}) => {
    
  // SUCCESS: Clean, direct workout display
  if (state === 'success' && workout) {
    return (
      <WorkoutDisplay
        workout={workout}
        variant="default"
        showActions={true}
        onAction={onWorkoutAction}
        className="result-workout-display"
      />
    );
  }

  // ERROR: Simple error message
  if (state === 'error') {
    return (
      <div className="simple-error-message">
        <p>{errorMessage}</p>
        <p>Please try again or adjust your workout parameters.</p>
      </div>
    );
  }

  // EMPTY: Simple empty message
  return (
    <div className="simple-empty-message">
      <p>{emptyMessage}</p>
      </div>
  );
}; 