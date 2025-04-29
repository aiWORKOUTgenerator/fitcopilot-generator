/**
 * GeneratingStep Component
 * 
 * Displays an enhanced visualization of the workout generation process with realistic progress feedback.
 */
import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../../../../../common/components/UI';
import LoadingIndicator from '../../GenerationProcess/LoadingIndicator';
import ErrorBoundary from '../../common/ErrorBoundary';
import { GenerationError } from '../../../types/errors';
import './styles/generating-step.scss';

export interface GeneratingStepProps {
  onCancel: () => void;
  onComplete: () => void;
  progress?: number;
  error?: GenerationError | null;
}

/**
 * Status messages to display during different phases of generation
 */
const STATUS_MESSAGES = [
  // Initial phase (0-25%)
  'Analyzing your workout preferences...',
  'Evaluating your fitness goals...',
  'Planning exercise combinations...',
  // Middle phase (25-60%)
  'Designing optimal workout structure...',
  'Selecting appropriate exercise intensity...',
  'Optimizing for your available equipment...',
  // Late phase (60-90%)
  'Creating detailed exercise instructions...',
  'Balancing muscle groups and movements...',
  'Finalizing workout structure...',
  // Completion phase (90-100%)
  'Adding finishing touches to your workout...',
  'Preparing to display your custom plan...',
];

/**
 * Fitness tips to display during generation
 */
const FITNESS_TIPS = [
  'Hydration is key! Aim to drink water before, during, and after your workout.',
  'Rest days are just as important as workout days for muscle recovery.',
  'Proper form is more important than lifting heavy weights.',
  'Consistency matters more than intensity when starting a fitness journey.',
  'Mix cardio and strength training for optimal results.',
  'Dynamic stretching before and static stretching after workouts is ideal.',
  'Small, consistent progress leads to long-term success.',
  'Listen to your body - pain is different from discomfort.',
];

/**
 * GeneratingStep displays enhanced progress visualization during workout generation
 *
 * @param {GeneratingStepProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export const GeneratingStep: React.FC<GeneratingStepProps> = ({
  onCancel,
  onComplete,
  progress = 0,
  error = null,
}) => {
  // Internal progress state
  const [currentProgress, setCurrentProgress] = useState(progress > 0 ? progress : 0);
  const [isComplete, setIsComplete] = useState(false);
  
  // Randomly select a fitness tip
  const [tipIndex] = useState(() => Math.floor(Math.random() * FITNESS_TIPS.length));
  
  // Handle external progress updates
  useEffect(() => {
    if (progress >= 100) {
      completeProgress();
    } else if (progress > 0) {
      setCurrentProgress(progress);
    }
  }, [progress]);
  
  // Function to complete progress and clean up
  const completeProgress = () => {
    setCurrentProgress(100);
    setIsComplete(true);
    onComplete();
  };
  
  // Determine which status message to show based on progress
  const getStatusMessage = () => {
    // Map progress to appropriate message index
    const index = Math.min(
      Math.floor((currentProgress / 100) * STATUS_MESSAGES.length),
      STATUS_MESSAGES.length - 1
    );
    
    return STATUS_MESSAGES[index];
  };

  // Handle error state
  if (error) {
    return (
      <div className="generating-step">
        <div className="generation-error">
          <h3>Oops! Something went wrong</h3>
          <p>{error.message}</p>
          <Button onClick={onCancel}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="generating-step">
        <h2 className="generating-step__title">Creating Your Personalized Workout</h2>
        
        <LoadingIndicator 
          message={getStatusMessage()} 
          progress={currentProgress} 
        />
        
        <div className="generating-step__tip-container">
          <p className="generating-step__tip">
            <span className="generating-step__tip-label">Fitness Tip:</span> {FITNESS_TIPS[tipIndex]}
          </p>
        </div>
        
        <Button 
          variant="secondary" 
          onClick={onCancel} 
          className="generating-step__cancel-button"
        >
          Cancel
        </Button>
      </div>
    </ErrorBoundary>
  );
};

export default GeneratingStep; 