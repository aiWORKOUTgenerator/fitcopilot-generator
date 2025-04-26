/**
 * GeneratingStep Component
 * 
 * Displays a loading state during workout generation with progress feedback and error handling.
 */
import React, { useEffect, useState } from 'react';
import Button from '../../../../../components/ui/Button';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import ErrorBoundary from '../../../components/common/ErrorBoundary';
import { useProgressEstimator } from '../../../hooks/useProgressEstimator';
import { GenerationError } from '../../../types/errors';
import './styles/generating-step.scss';

export interface GeneratingStepProps {
  onCancel: () => void;
  onComplete: () => void;
  progress?: number;
  error?: GenerationError | null;
}

/**
 * GeneratingStep displays a loading state during workout generation
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
  // Status messages to display during generation
  const statusMessages = [
    'Analyzing your workout preferences...',
    'Creating a personalized workout for you...',
    'Designing exercise combinations...',
    'Finalizing your custom workout plan...',
  ];

  // Fitness tips to display during generation
  const fitnessTips = [
    'Hydration is key! Aim to drink water before, during, and after your workout.',
    'Rest days are just as important as workout days for muscle recovery.',
    'Proper form is more important than lifting heavy weights.',
    'Consistency matters more than intensity when starting a fitness journey.',
    'Mix cardio and strength training for optimal results.',
    'Dynamic stretching before and static stretching after workouts is ideal.',
    'Small, consistent progress leads to long-term success.',
    'Listen to your body - pain is different from discomfort.',
  ];

  // Use the progress estimator to track generation progress
  const [currentProgress, completeProgress] = useProgressEstimator({
    initialProgress: progress,
    totalDuration: 20000,
    maxProgress: 95
  });
  
  // Randomly select a fitness tip
  const [tipIndex] = useState(() => Math.floor(Math.random() * fitnessTips.length));
  
  // Determine which status message to show based on progress
  const statusIndex = Math.min(
    Math.floor((currentProgress / 100) * statusMessages.length),
    statusMessages.length - 1
  );

  // Check for completion
  useEffect(() => {
    if (progress >= 100) {
      completeProgress(true);
      onComplete();
    }
  }, [progress, completeProgress, onComplete]);

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
        <LoadingIndicator message={statusMessages[statusIndex]} progress={currentProgress} />
        <div className="status-container">
          <h3 className="status-message">{statusMessages[statusIndex]}</h3>
          <p className="fitness-tip">
            <strong>Fitness Tip:</strong> {fitnessTips[tipIndex]}
          </p>
        </div>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </ErrorBoundary>
  );
};

export default GeneratingStep; 