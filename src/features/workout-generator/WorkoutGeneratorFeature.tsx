/**
 * Workout Generator Feature
 * 
 * Main component that brings together all parts of the workout generator
 */

import React from 'react';
import { WorkoutGeneratorProvider } from './context/WorkoutGeneratorContext';
import { WorkoutRequestForm } from './components/Form/WorkoutRequestForm';

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