/**
 * Workout Generator Feature
 * 
 * Main entry point for the workout generator feature.
 * Wraps the form with necessary providers and imports styles.
 */
import React, { useState, useEffect } from 'react';
import { WorkoutGeneratorProvider, FormFlowProvider } from './context';
import { WorkoutRequestForm } from './components/Form';
import { ErrorBoundary, DebugControls, TipsCard } from './components/common';
import { SubscriptionModalWrapper, ProfileSetupPrompt } from './components/Modals';
import { NavigationProvider } from './navigation/NavigationContext';
import WorkoutEditorModal from './components/WorkoutEditor/WorkoutEditorModal';

// Import theme initialization
import './utils/themeInit';

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
 * - NavigationProvider: Manages navigation state and URL handling
 * - WorkoutGeneratorProvider: Manages core workout state and API integration
 * - WorkoutRequestForm: Contains its own FormFlowProvider for form flow management
 * 
 * @returns {JSX.Element} The rendered feature component
 */
export const WorkoutGeneratorFeature: React.FC = () => {
  const [isSubscriptionOpen, setSubscriptionOpen] = useState(false);
  const [isProfilePromptOpen, setProfilePromptOpen] = useState(false);

  // Apply dark theme class to body for full background coverage
  useEffect(() => {
    // Apply the theme class to the body for better coverage
    document.body.classList.add('dark-theme');
    
    return () => {
      // Clean up when component unmounts
      document.body.classList.remove('dark-theme');
    };
  }, []);

  return (
    <ErrorBoundary>
      <NavigationProvider>
        <WorkoutGeneratorProvider>
          <div className="workout-generator-feature">
            <h3 className="workout-generator-feature__subtitle">
              Generate personalized workout plans based on your goals, experience level, and available equipment.
            </h3>
            
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
            
            {/* Integrated Workout Editor Modal - handles both view and edit modes */}
            <WorkoutEditorModal />
          </div>
        </WorkoutGeneratorProvider>
      </NavigationProvider>
    </ErrorBoundary>
  );
};

export default WorkoutGeneratorFeature; 