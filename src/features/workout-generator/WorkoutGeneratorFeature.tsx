/**
 * Workout Generator Feature
 * 
 * Main entry point for the workout generator feature.
 * Wraps the form with necessary providers and imports styles.
 */
import React from 'react';
import { WorkoutGeneratorProvider } from './context/WorkoutGeneratorContext';
import { WorkoutRequestForm } from './components/Form/WorkoutRequestForm';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import styles
import './styles/workout-generator.css';

/**
 * Workout Generator feature component
 * 
 * This is the main entry point for the workout generator functionality
 * and serves as the container for the entire workout generation experience.
 * 
 * @returns {JSX.Element} The rendered feature component
 */
export const WorkoutGeneratorFeature: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="workout-generator-feature">
        <h2 className="workout-generator-feature__title">
          AI Workout Generator
        </h2>
        <p className="workout-generator-feature__description">
          Generate personalized workout plans based on your goals, experience level, and available equipment.
        </p>
        
        <WorkoutGeneratorProvider>
          <WorkoutRequestForm />
        </WorkoutGeneratorProvider>
      </div>
    </ErrorBoundary>
  );
};

export default WorkoutGeneratorFeature; 