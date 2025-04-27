/**
 * GeneratingStep Component
 * 
 * Displays a loading state during workout generation with progress feedback and error handling.
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

  // Internal progress state
  const [currentProgress, setCurrentProgress] = useState(progress > 0 ? progress : 0);
  const [startTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Randomly select a fitness tip
  const [tipIndex] = useState(() => Math.floor(Math.random() * fitnessTips.length));
  
  // Handle external progress updates
  useEffect(() => {
    if (progress >= 100) {
      completeProgress();
    }
  }, [progress]);
  
  // Function to complete progress and clean up
  const completeProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setCurrentProgress(100);
    setIsComplete(true);
    onComplete();
  };
  
  // Update progress based on elapsed time
  useEffect(() => {
    if (isComplete) {
      return;
    }
    
    const totalDuration = 20000; // 20 seconds total estimation
    const maxProgress = 95; // Max progress before completion signal
    const updateInterval = 200; // Update every 200ms
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const linearProgress = Math.min((elapsedTime / totalDuration) * 100, maxProgress);
      
      // Non-linear progress: starts faster, slows down as it approaches maxProgress
      const factor = 1 - linearProgress / maxProgress;
      const adjustedProgress = maxProgress - maxProgress * Math.pow(factor, 2);
      setCurrentProgress(Math.min(adjustedProgress, maxProgress));
    }, updateInterval);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startTime, isComplete]);

  // Determine which status message to show based on progress
  const statusIndex = Math.min(
    Math.floor((currentProgress / 100) * statusMessages.length),
    statusMessages.length - 1
  );

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