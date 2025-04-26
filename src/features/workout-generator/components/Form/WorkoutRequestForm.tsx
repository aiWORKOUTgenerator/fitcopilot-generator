/**
 * Workout Request Form Component
 * 
 * This component provides the main interface for users to request AI-generated workout plans.
 * It serves as the primary entry point for the workout generation feature, handling the entire
 * workflow from collecting user preferences to displaying the generated workout.
 * 
 * Features:
 * - Form fields for selecting workout preferences (goal, difficulty, duration)
 * - Advanced options for equipment and physical restrictions
 * - Real-time validation of form inputs
 * - Loading state management with rotating status messages
 * - Error and success state handling
 * - Analytics tracking for user interactions
 * - Form state persistence between sessions
 * 
 * The component integrates several hooks for state management and API interactions:
 * - useWorkoutForm: Manages form values, validation, and persistence
 * - useWorkoutGenerator: Handles the OpenAI API interaction for generating workouts
 * - useAnalytics: Tracks user interactions for analytics
 * - useErrorHandler: Handles centralized error handling
 * 
 * @example
 * // Basic usage (usually rendered by the main feature component)
 * import { WorkoutRequestForm } from './components/Form/WorkoutRequestForm';
 * 
 * const WorkoutGeneratorFeature = () => {
 *   return (
 *     <div className="workout-generator">
 *       <h1>AI Workout Generator</h1>
 *       <WorkoutRequestForm />
 *     </div>
 *   );
 * };
 */

import React, { useState, useEffect } from 'react';
import { useWorkoutForm } from '../../hooks/useWorkoutForm';
import { useWorkoutGenerator } from '../../hooks/useWorkoutGenerator';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { WorkoutFormParams, FormSteps } from '../../types/workout';

import { InputStep } from './steps/InputStep';
import PreviewStep from './steps/PreviewStep';
import { GeneratingStep } from './steps/GeneratingStep';
import { ResultStep } from './steps/ResultStep';
import ErrorBoundary from '../common/ErrorBoundary';
import { Button } from '../../../../components/ui';
import ThemeToggle from '../../../../components/ui/ThemeToggle';
import './form.scss';

/**
 * Equipment options available for workout generation
 * Each option has a unique ID and display label
 */
const EQUIPMENT_OPTIONS = [
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'kettlebells', label: 'Kettlebells' },
  { id: 'resistance-bands', label: 'Resistance Bands' },
  { id: 'pull-up-bar', label: 'Pull-up Bar' },
  { id: 'yoga-mat', label: 'Yoga Mat' },
  { id: 'bench', label: 'Bench' },
  { id: 'barbell', label: 'Barbell' },
  { id: 'trx', label: 'TRX/Suspension Trainer' },
  { id: 'medicine-ball', label: 'Medicine Ball' },
  { id: 'jump-rope', label: 'Jump Rope' },
  { id: 'stability-ball', label: 'Stability Ball' },
  { id: 'none', label: 'None/Bodyweight Only' }
];

/**
 * Workout goal options that determine the focus of the generated workout
 */
const GOAL_OPTIONS = [
  { value: 'lose-weight', label: 'Lose Weight' },
  { value: 'build-muscle', label: 'Build Muscle' },
  { value: 'improve-endurance', label: 'Improve Endurance' },
  { value: 'increase-strength', label: 'Increase Strength' },
  { value: 'enhance-flexibility', label: 'Enhance Flexibility' },
  { value: 'general-fitness', label: 'General Fitness' },
  { value: 'sport-specific', label: 'Sport-Specific Training' }
];

/**
 * Experience level options that adjust the difficulty of the generated workout
 */
const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

/**
 * Workout duration options in minutes
 */
const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' }
];

/**
 * WorkoutRequestForm Component Props
 */
interface WorkoutRequestFormProps {
  className?: string;
}

/**
 * Map context status to form step
 * 
 * @param status - The generation status from context
 * @returns The corresponding form step
 */
function mapStatusToStep(status: string): FormSteps {
  switch (status) {
    case 'idle':
      return 'input';
    case 'submitting':
    case 'generating':
      return 'generating';
    case 'completed':
      return 'completed';
    case 'error':
      return 'generating'; // Error is shown in GeneratingStep
    default:
      return 'input';
  }
}

/**
 * WorkoutRequestForm Component
 * 
 * @param props - Component props
 * @returns React component
 */
export function WorkoutRequestForm({ className = '' }: WorkoutRequestFormProps) {
  // Get the form management and workout generation hooks
  const workoutForm = useWorkoutForm();
  const { 
    status, 
    loading, 
    error: errorMessage, 
    workout: generatedWorkout,
    startGeneration, 
    resetGenerator,
    isGenerating
  } = useWorkoutGenerator();
  const { handleError } = useErrorHandler();
  
  // Track the preview state separately as it's not in the generation status
  const [isPreviewMode, setIsPreviewMode] = React.useState(false);
  
  // Track generation progress for better UX
  const [progress, setProgress] = useState(0);
  
  // Determine the current step to display
  const currentStep: FormSteps = isPreviewMode ? 'preview' : mapStatusToStep(status);
  
  // Update progress during generation
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (status === 'generating' || status === 'submitting') {
      // Reset progress when generation starts
      setProgress(0);
      
      // Simulate progress over time
      progressInterval = setInterval(() => {
        setProgress(prev => {
          // Cap at 95% until complete, so users know it's not done
          if (prev < 95) {
            return prev + (Math.random() * 2 + 0.5); // Increments between 0.5 and 2.5
          }
          return prev;
        });
      }, 1000);
    } else if (status === 'completed') {
      // Set to 100% when complete
      setProgress(100);
    } else if (status === 'idle') {
      // Reset when idle
      setProgress(0);
    }
    
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [status]);
  
  /**
   * Handle form submission to preview step
   */
  const handlePreviewStep = async () => {
    try {
      // Validate form before previewing
      const isValid = workoutForm.validateForm();
      
      if (isValid) {
        // No errors, proceed to preview
        setIsPreviewMode(true);
      } else {
        // Handle validation errors
        handleError(new Error('Please fill in all required fields'), {
          componentName: 'WorkoutRequestForm',
          action: 'handlePreviewStep'
        });
      }
    } catch (error) {
      handleError(error, {
        componentName: 'WorkoutRequestForm',
        action: 'handlePreviewStep'
      });
    }
  };
  
  /**
   * Handle final form submission to generate workout
   */
  const handleSubmitForm = async () => {
    try {
      const formValues = workoutForm.formValues;
      // Exit preview mode
      setIsPreviewMode(false);
      // Reset progress for new generation
      setProgress(0);
      // Generation status transition is handled by startGeneration
      await startGeneration(formValues);
    } catch (error) {
      handleError(error, {
        componentName: 'WorkoutRequestForm',
        action: 'handleSubmitForm',
        additionalData: { formValues: workoutForm.formValues }
      });
      // Error UI is handled by GeneratingStep component
    }
  };
  
  /**
   * Handle editing form from preview
   */
  const handleEditForm = () => {
    setIsPreviewMode(false);
  };
  
  /**
   * Handle cancelling workout generation
   */
  const handleCancelGeneration = () => {
    resetGenerator();
    setProgress(0);
  };
  
  /**
   * Handle restart to generate a new workout
   */
  const handleRestart = () => {
    resetGenerator();
    workoutForm.resetFormErrors();
    setProgress(0);
  };

  /**
   * Handle workout completion (when progress reaches 100%)
   */
  const handleGenerationComplete = () => {
    // If we're at 100% progress but status hasn't updated yet,
    // this smooths the transition between steps
    if (progress >= 100 && status === 'generating') {
      // The status will be updated by the generator hook
    }
  };

  // Render the appropriate step based on current state
  return (
    <ErrorBoundary>
      <div className={`workout-form-container ${className}`}>
        <div className="theme-toggle-container">
          <ThemeToggle className="workout-form__theme-toggle" />
        </div>
        
        <div className="workout-generator-form">
          {currentStep === 'input' && (
            <InputStep 
              formValues={workoutForm.formValues}
              formErrors={workoutForm.formErrors || {}}
              isValid={workoutForm.isValid}
              hasFieldError={(field) => Boolean(workoutForm.formErrors?.[field])}
              getFieldError={(field) => workoutForm.formErrors?.[field]}
              setGoals={(goals) => workoutForm.updateField('goals', goals)}
              setDifficulty={(difficulty) => workoutForm.updateField('difficulty', difficulty)}
              setDuration={(duration) => workoutForm.updateField('duration', duration)}
              setEquipment={(equipment) => workoutForm.updateField('equipment', equipment)}
              setRestrictions={(restrictions) => workoutForm.updateField('restrictions', restrictions)}
              validateForm={workoutForm.validateForm}
              onContinue={handlePreviewStep}
            />
          )}
          
          {currentStep === 'preview' && (
            <PreviewStep 
              formValues={{
                duration: Number(workoutForm.formValues.duration || 0),
                difficulty: workoutForm.formValues.difficulty || 'beginner',
                equipment: workoutForm.formValues.equipment || [],
                goals: workoutForm.formValues.goals || '',
                restrictions: workoutForm.formValues.restrictions
              }} 
              onEditRequest={handleEditForm}
              onGenerateWorkout={handleSubmitForm}
              isLoading={isGenerating}
            />
          )}
          
          {currentStep === 'generating' && (
            <GeneratingStep 
              error={errorMessage}
              onCancel={handleCancelGeneration}
              progress={progress}
              onComplete={handleGenerationComplete}
            />
          )}
          
          {currentStep === 'completed' && generatedWorkout && (
            <ResultStep 
              workout={generatedWorkout} 
              error={errorMessage}
              onGenerateNew={handleRestart}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default WorkoutRequestForm; 