/**
 * ResultStep Component
 * 
 * Displays the final generated workout and provides options for saving, sharing,
 * or generating a new workout.
 */
import React from 'react';
import { GeneratedWorkout } from '../../../types/workout';
import WorkoutCard from '../../WorkoutDisplay/WorkoutCard';
import ErrorBoundary from '../../common/ErrorBoundary';

interface ResultStepProps {
  /** The generated workout to display */
  workout: GeneratedWorkout | null;
  /** Optional post ID if the workout has been saved */
  postId?: number;
  /** Optional error message to display */
  error: string | null;
  /** Callback when the user wants to generate a new workout */
  onGenerateNew: () => void;
}

/**
 * Component for displaying the generated workout result
 */
export const ResultStep: React.FC<ResultStepProps> = ({
  workout,
  postId,
  error,
  onGenerateNew,
}) => {
  /**
   * Handle viewing the full workout details
   */
  const handleViewFullWorkout = () => {
    // This could open a modal, expand the card, or navigate to a detailed view
    console.log('View full workout', workout);
  };

  /**
   * Handle saving the workout
   */
  const handleSaveWorkout = () => {
    if (!workout) return;
    
    // Implement save functionality here
    // This would typically call an API to save the workout to the user's account
    alert('Workout saved successfully!');
  };

  /**
   * Handle printing the workout
   */
  const handlePrintWorkout = () => {
    if (!workout) return;
    
    window.print();
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="result-step result-step--error">
        <h3 className="result-step__title">Error Generating Workout</h3>
        
        <div className="result-step__error-container">
          <p className="result-step__error-message">{error}</p>
          <p className="result-step__error-help">
            Please try again or adjust your workout parameters.
          </p>
        </div>
        
        <div className="result-step__actions">
          <button 
            type="button"
            className="result-step__retry-button"
            onClick={onGenerateNew}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show placeholder if no workout is available
  if (!workout) {
    return (
      <div className="result-step result-step--empty">
        <h3 className="result-step__title">No Workout Generated</h3>
        
        <p className="result-step__message">
          There was a problem generating your workout. Please try again.
        </p>
        
        <div className="result-step__actions">
          <button 
            type="button"
            className="result-step__retry-button"
            onClick={onGenerateNew}
          >
            Generate New Workout
          </button>
        </div>
      </div>
    );
  }

  // Show the successful result with the workout
  return (
    <ErrorBoundary>
      <div className="result-step">
        <h2 className="result-step__title">Your Custom Workout</h2>
        
        <div className="result-step__content">
          <WorkoutCard workout={workout} />
        </div>
        
        <button 
          className="view-full-workout-button"
          onClick={handleViewFullWorkout}
        >
          View Full Workout
        </button>
        
        <button
          className="generate-another-button"
          onClick={onGenerateNew}
        >
          Generate Another Workout
        </button>
      </div>
    </ErrorBoundary>
  );
}; 