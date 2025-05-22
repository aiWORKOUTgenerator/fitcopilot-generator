/**
 * ResultStep Component
 * 
 * Displays the final generated workout and provides options for saving, sharing,
 * or generating a new workout.
 */
import React, { useState } from 'react';
import { Card } from '../../../../../components/ui';
import { Button } from '../../../../../components/ui';
import { GeneratedWorkout } from '../../../types/workout';
import WorkoutCard from '../../WorkoutDisplay/WorkoutCard';
import ErrorBoundary from '../../common/ErrorBoundary';
import { saveWorkout } from '../../../services/workoutEditorService';
import { convertToEditorFormat } from '../../../types/editor';
import { RefreshCw, Eye, PlusCircle } from 'lucide-react';
import { useNavigation } from '../../../navigation/NavigationContext';
import '../form.scss';

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
  // Use navigation context to control the editor
  const { openEditor } = useNavigation();
  
  // State to track saving process
  const [isSaving, setIsSaving] = useState(false);
  // State to store any error that occurs during saving
  const [saveError, setSaveError] = useState<string | null>(null);

  /**
   * Handle viewing the full workout details
   */
  const handleViewFullWorkout = () => {
    if (!workout) return;
    
    // Reset any previous errors
    setSaveError(null);
    
    // Open the workout editor using navigation context
    const workoutId = postId ? String(postId) : 'new';
    openEditor(workoutId, { referrer: 'generator' });
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
        <Card elevated padding="large">
          <h3 className="result-step__title">Error Generating Workout</h3>
          
          <div className="result-step__error-container">
            <p className="result-step__error-message">{error}</p>
            <p className="result-step__error-help">
              Please try again or adjust your workout parameters.
            </p>
          </div>
          
          <div className="result-step__actions">
            <Button 
              variant="gradient"
              size="lg"
              onClick={onGenerateNew}
              aria-label="Try generating a workout again"
              startIcon={<RefreshCw size={18} />}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show placeholder if no workout is available
  if (!workout) {
    return (
      <div className="result-step result-step--empty">
        <Card elevated padding="large">
          <h3 className="result-step__title">No Workout Generated</h3>
          
          <p className="result-step__message">
            There was a problem generating your workout. Please try again.
          </p>
          
          <div className="result-step__actions">
            <Button 
              variant="gradient"
              size="lg"
              onClick={onGenerateNew}
              aria-label="Generate a new workout"
              startIcon={<RefreshCw size={18} />}
            >
              Generate New Workout
            </Button>
          </div>
        </Card>
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
        
        {saveError && (
          <div className="result-step__save-error">
            <p>{saveError}</p>
          </div>
        )}
        
        <div className="result-step__actions">
          <Button 
            variant="gradient"
            size="lg"
            onClick={handleViewFullWorkout}
            aria-label="View full workout details"
            startIcon={<Eye size={18} />}
            disabled={isSaving}
          >
            View Full Workout
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={onGenerateNew}
            aria-label="Generate another workout"
            startIcon={<PlusCircle size={18} />}
            disabled={isSaving}
          >
            Generate Another Workout
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
}; 