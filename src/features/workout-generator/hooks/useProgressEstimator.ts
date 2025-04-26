/**
 * Hook for estimating progress during workout generation
 * 
 * This hook provides functionality to simulate progress during asynchronous operations
 * like workout generation, giving users a more responsive experience.
 */
import { useState, useEffect } from 'react';

/**
 * Configuration interface for progress estimation
 */
interface ProgressEstimatorConfig {
  /** Total estimated duration in milliseconds */
  totalDuration?: number;
  /** Initial progress value (0-100) */
  initialProgress?: number;
  /** Maximum progress to reach before completion (0-100) */
  maxProgress?: number;
  /** Interval between progress updates in milliseconds */
  updateInterval?: number;
  /** Whether to use non-linear (accelerated) progress calculation */
  useNonLinearProgress?: boolean;
}

/**
 * Hook for estimating progress based on elapsed time
 * 
 * Creates a simulated progress indicator that increments at a decreasing rate,
 * approaching but never reaching 100% until completion is signaled.
 * 
 * @param {ProgressEstimatorConfig} config - Configuration options
 * @returns {[number, (isComplete: boolean) => void]} Progress value and completion function
 */
export const useProgressEstimator = ({
  totalDuration = 15000,
  initialProgress = 0,
  maxProgress = 95,
  updateInterval = 200,
  useNonLinearProgress = true
}: ProgressEstimatorConfig = {}) => {
  const [progress, setProgress] = useState(initialProgress);
  const [startTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);

  // Update progress based on elapsed time
  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      return;
    }

    const intervalId = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const linearProgress = Math.min((elapsedTime / totalDuration) * 100, maxProgress);
      
      if (useNonLinearProgress) {
        // Non-linear progress: starts faster, slows down as it approaches maxProgress
        const factor = 1 - linearProgress / maxProgress;
        const adjustedProgress = maxProgress - maxProgress * Math.pow(factor, 2);
        setProgress(Math.min(adjustedProgress, maxProgress));
      } else {
        setProgress(linearProgress);
      }
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [startTime, totalDuration, maxProgress, updateInterval, useNonLinearProgress, isComplete]);

  // Function to set completion status
  const completeProgress = (completed = true) => {
    setIsComplete(completed);
  };

  return [progress, completeProgress] as const;
}; 