/**
 * Workout Generator Feature
 * 
 * Main component that brings together all parts of the workout generator
 */

import React from 'react';
import { WorkoutGeneratorProvider } from './context/WorkoutGeneratorContext';
import { WorkoutRequestForm } from './components/Form/WorkoutRequestForm';

/**
 * Temporary placeholder component - will be replaced with actual feature components
 */
const FeaturePlaceholder: React.FC = () => {
  return (
    <div className="fitcopilot-card">
      <h2 className="fitcopilot-card-title">Workout Generator</h2>
      <p className="mb-4">
        Welcome to the FitCopilot Workout Generator! The feature is being scaffolded and will be
        fully implemented soon.
      </p>
      <button className="fitcopilot-button">Generate Workout</button>
    </div>
  );
};

/**
 * Main feature component that wraps everything in the provider
 */
export const WorkoutGeneratorFeature: React.FC = () => {
  return (
    <WorkoutGeneratorProvider>
      <div className="workout-generator">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Workout Generator</h1>
        <WorkoutRequestForm />
      </div>
    </WorkoutGeneratorProvider>
  );
}; 