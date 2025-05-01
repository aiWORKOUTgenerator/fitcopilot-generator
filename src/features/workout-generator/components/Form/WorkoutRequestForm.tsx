/**
 * Workout Request Form Component
 * 
 * This component provides the main interface for users to request AI-generated workout plans.
 * It serves as the primary entry point for the workout generation feature, handling the entire
 * workflow from collecting user preferences to displaying the generated workout.
 * 
 * Form flow follows these steps:
 * 1. Input Step: User enters workout preferences
 * 2. Preview Step: User reviews settings before submitting
 * 3. Generating Step: API request is processing with feedback
 * 4. Completed Step: Generated workout is displayed
 * 
 * The component uses FormFlowContext for centralized state management of the form flow,
 * eliminating race conditions and state conflicts between steps.
 * 
 * Features:
 * - Multi-step form flow with consistent transitions
 * - Form fields for selecting workout preferences (goal, difficulty, duration)
 * - Advanced options for equipment and physical restrictions
 * - Real-time validation of form inputs
 * - Loading state management with progressive status indicator
 * - Error and success state handling
 * - Analytics tracking for user interactions
 * - Form state persistence between sessions
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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWorkoutForm } from '../../hooks/useWorkoutForm';
import { useWorkoutGenerator } from '../../hooks/useWorkoutGenerator';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { FormFlowProvider, useFormFlow } from '../../context/FormFlowContext';
import { WorkoutFormParams, FormSteps } from '../../types/workout';
import { GenerationError } from '../../types/errors';

import { InputStep } from './steps/InputStep';
import PreviewStep from './steps/PreviewStep';
import GeneratingStep from './steps/GeneratingStep';
import { ResultStep } from './steps/ResultStep';
import ErrorBoundary from '../common/ErrorBoundary';
import { Button } from '../../../../components/ui';
import { ThemeToggle } from '../../../../components/ui';
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
 * WorkoutRequestForm Component with wrapped FormFlowProvider
 * 
 * This component is the main entry point for the workout generator form flow.
 * It wraps the actual form in a FormFlowProvider for centralized state management.
 * 
 * @param props - Component props
 * @returns React component
 */
export function WorkoutRequestForm({ className = '' }: WorkoutRequestFormProps) {
  return (
    <FormFlowProvider>
      <WorkoutRequestFormInner className={className} />
    </FormFlowProvider>
  );
}

/**
 * Inner WorkoutRequestForm Component that consumes FormFlowContext
 * 
 * This component implements the actual form UI and logic, using the
 * form flow state from FormFlowContext.
 * 
 * @param props - Component props
 * @returns React component
 */
function WorkoutRequestFormInner({ className = '' }: WorkoutRequestFormProps) {
  // Get the form management and workout generation hooks
  const workoutForm = useWorkoutForm();
  const { 
    status, 
    error: generatorErrorMessage,
    workout: generatedWorkout,
    startGeneration, 
    resetGenerator,
    cancelGeneration,
    isGenerating: isGeneratorRunning
  } = useWorkoutGenerator();
  
  // Get form flow context
  const { 
    state: { 
      currentStep, 
      progress,
      isPreviewMode,
      errorMessage: flowErrorMessage
    },
    derivedStep,
    setProgress,
    setGenerationStatus,
    setPreviewMode,
    setError,
    resetFlow,
    goToInputStep,
    goToPreviewStep,
    goToGeneratingStep
  } = useFormFlow();
  
  const { handleError } = useErrorHandler();
  
  // Progress interval reference
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Sync generator status with form flow
  useEffect(() => {
    // Update generation status in form flow when it changes
    setGenerationStatus(status);
    
    // Sync error messages
    if (generatorErrorMessage) {
      setError(generatorErrorMessage);
    }
  }, [status, generatorErrorMessage, setGenerationStatus, setError]);
  
  // Handle progress simulation during generation
  useEffect(() => {
    // Clean up any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    
    // Manage progress based on generation status
    if (status === 'starting') {
      // Initial progress when starting
      setProgress(5);
    } else if (status === 'submitting') {
      // Progress when submitting the request
      setProgress(15);
    } else if (status === 'generating') {
      // Start at 25% for generation phase
      if (progress < 25) {
        setProgress(25);
      }
      
      // Simulate progress during generation
      progressInterval.current = setInterval(() => {
        setProgress((prevProgress: number) => {
          // Cap progress at 95% until complete
          if (prevProgress < 95) {
            // Progressively slower increments as we approach 95%
            const increment = Math.max(0.5, (90 - prevProgress) / 15);
            return prevProgress + increment;
          }
          return prevProgress;
        });
      }, 1000);
    } else if (status === 'completed') {
      // Ensure 100% progress on completion
      setProgress(100);
    } else if (status === 'idle') {
      // Reset progress when idle
      setProgress(0);
    }
    
    // Clean up on unmount or status change
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [status, progress, setProgress]);
  
  /**
   * Handle form submission to preview step
   * 
   * Validates the form and transitions to preview step if valid.
   */
  const handlePreviewStep = useCallback(async () => {
    try {
      // Validate form before previewing
      const isValid = workoutForm.validateForm();
      
      if (isValid) {
        // No errors, proceed to preview
        goToPreviewStep();
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
  }, [workoutForm, goToPreviewStep, handleError]);
  
  /**
   * Handle final form submission to generate workout
   * 
   * Exits preview mode and initiates the workout generation process.
   */
  const handleSubmitForm = useCallback(async () => {
    try {
      const formValues = workoutForm.formValues;
      
      // First reset any existing error state
      setError(null);
      
      // Reset the generator to clean state
      resetGenerator();
      
      // First explicitly transition to generating step to avoid reverting to input
      setPreviewMode(false);
      
      // Force transition to generating step before API call
      goToGeneratingStep();
      
      // Start generation process with fresh state
      await startGeneration(formValues);
    } catch (error) {
      // Even if there's an error, stay on generating step to show error state
      // rather than going back to input step
      handleError(error, {
        componentName: 'WorkoutRequestForm',
        action: 'handleSubmitForm',
        additionalData: { formValues: workoutForm.formValues }
      });
      // Error UI is handled by GeneratingStep component
    }
  }, [workoutForm.formValues, setPreviewMode, goToGeneratingStep, startGeneration, handleError, resetGenerator, setError]);
  
  /**
   * Handle editing form from preview
   * 
   * Returns to the input step from preview mode.
   */
  const handleEditForm = useCallback(() => {
    setPreviewMode(false);
  }, [setPreviewMode]);
  
  /**
   * Handle cancelling workout generation
   * 
   * Cancels any ongoing generation and resets the form flow.
   */
  const handleCancelGeneration = useCallback(() => {
    // Cancel generation API request
    cancelGeneration();
    
    // Reset form flow state
    resetFlow();
  }, [cancelGeneration, resetFlow]);
  
  /**
   * Handle restart to generate a new workout
   * 
   * Resets the generator and form flow to start over.
   */
  const handleRestart = useCallback(() => {
    // Reset the generator
    resetGenerator();
    
    // Reset form errors
    workoutForm.resetFormErrors();
    
    // Reset form flow
    resetFlow();
    
    // Go to input step
    goToInputStep();
  }, [resetGenerator, workoutForm, resetFlow, goToInputStep]);

  /**
   * Handle workout completion (when progress reaches 100%)
   */
  const handleGenerationComplete = useCallback(() => {
    // If progress is 100% but status isn't updated yet,
    // this helps smooth the transition between steps
    if (progress >= 100 && status === 'generating') {
      // Status will be updated by the generator hook
    }
  }, [progress, status]);

  return (
    <ErrorBoundary>
      <div className={`workout-form-container ${className}`}>
        <div className="theme-toggle-container">
          <ThemeToggle className="workout-form__theme-toggle" />
        </div>
        
        <div className="workout-generator-form">
          {/* Use derivedStep to determine which component to render */}
          {derivedStep === 'input' && (
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
              setPreferences={(preferences) => workoutForm.updateField('preferences', preferences)}
              validateForm={workoutForm.validateForm}
              onContinue={handlePreviewStep}
            />
          )}
          
          {derivedStep === 'preview' && (
            <PreviewStep 
              formValues={{
                duration: Number(workoutForm.formValues.duration || 0),
                difficulty: workoutForm.formValues.difficulty || 'beginner',
                equipment: workoutForm.formValues.equipment || [],
                goals: workoutForm.formValues.goals || '',
                restrictions: workoutForm.formValues.restrictions,
                preferences: workoutForm.formValues.preferences
              }} 
              onEditRequest={handleEditForm}
              onGenerateWorkout={handleSubmitForm}
              isLoading={isGeneratorRunning}
            />
          )}
          
          {derivedStep === 'generating' && (
            <GeneratingStep
              onCancel={handleCancelGeneration}
              onComplete={handleGenerationComplete}
              progress={progress} 
              error={flowErrorMessage || generatorErrorMessage ? {
                message: flowErrorMessage || generatorErrorMessage || 'An error occurred during generation'
              } : null}
            />
          )}
          
          {derivedStep === 'completed' && generatedWorkout && (
            <ResultStep 
              workout={generatedWorkout} 
              error={flowErrorMessage}
              onGenerateNew={handleRestart}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default WorkoutRequestForm; 