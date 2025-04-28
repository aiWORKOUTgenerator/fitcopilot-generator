/**
 * Workout Generator Feature
 * 
 * Main entry point for the workout generator feature.
 * Wraps the form with necessary providers and imports styles.
 */
import React, { useState } from 'react';
import { WorkoutGeneratorProvider, FormFlowProvider } from './context';
import { WorkoutRequestForm } from './components/Form';
import { ErrorBoundary, DebugControls, TipsCard } from './components/common';
import { SubscriptionModalWrapper, ProfileSetupPrompt } from './components/Modals';

// Import styles
import './styles/workout-generator.scss';

/**
 * Workout Generator feature component
 * 
 * This is the main entry point for the workout generator functionality
 * and serves as the container for the entire workout generation experience.
 * 
 * Provider hierarchy:
 * - ErrorBoundary: Catches any uncaught errors in the feature
 * - WorkoutGeneratorProvider: Manages core workout state and API integration
 * - WorkoutRequestForm: Contains its own FormFlowProvider for form flow management
 * 
 * @returns {JSX.Element} The rendered feature component
 */
export const WorkoutGeneratorFeature: React.FC = () => {
  const [isSubscriptionOpen, setSubscriptionOpen] = useState(false);
  const [isProfilePromptOpen, setProfilePromptOpen] = useState(false);

  return (
    <ErrorBoundary>
      <WorkoutGeneratorProvider>
        <div className="workout-generator-feature">
          <h2 className="workout-generator-feature__title">
            AI Workout Generator
          </h2>
          <p className="workout-generator-feature__description">
            Generate personalized workout plans based on your goals, experience level, and available equipment.
          </p>
          
          <DebugControls />
          <WorkoutRequestForm />
          <TipsCard />

          <SubscriptionModalWrapper
            isOpen={isSubscriptionOpen}
            onClose={() => setSubscriptionOpen(false)}
            onSuccess={() => {/* retry generation logic */}}
          />

          <ProfileSetupPrompt
            isOpen={isProfilePromptOpen}
            onClose={() => setProfilePromptOpen(false)}
            onComplete={() => {/* re-check profile & proceed */}}
          />
        </div>
      </WorkoutGeneratorProvider>
    </ErrorBoundary>
  );
};

export default WorkoutGeneratorFeature; 