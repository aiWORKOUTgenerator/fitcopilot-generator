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

import React from 'react';
import { useWorkoutForm } from '../../hooks/useWorkoutForm';
import { useWorkoutGenerator } from '../../hooks/useWorkoutGenerator';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { WorkoutFormParams, FormSteps } from '../../types/workout';

import { InputStep } from './steps/InputStep';
import { PreviewStep } from './steps/PreviewStep';
import { GeneratingStep } from './steps/GeneratingStep';
import { ResultStep } from './steps/ResultStep';
import ErrorBoundary from '../common/ErrorBoundary';

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
 * Status messages displayed during workout generation
 * These rotate to indicate progress to the user
 */
const STATUS_MESSAGES = [
  'Connecting to OpenAI...',
  'Building your personalized workout plan...',
  'Analyzing your fitness goals...',
  'Selecting the perfect exercises...',
  'Putting the finishing touches on your plan...'
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
  
  // Determine the current step to display
  const currentStep: FormSteps = isPreviewMode ? 'preview' : mapStatusToStep(status);
  
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
  };
  
  /**
   * Handle restart to generate a new workout
   */
  const handleRestart = () => {
    resetGenerator();
    workoutForm.resetFormErrors();
  };

  // Render the appropriate step based on current state
  return (
    <ErrorBoundary>
      <div className={`workout-generator-form ${className}`}>
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
            formValues={workoutForm.formValues} 
            onEditRequest={handleEditForm}
            onGenerateWorkout={handleSubmitForm}
            isLoading={isGenerating}
          />
        )}
        
        {currentStep === 'generating' && (
          <GeneratingStep 
            error={errorMessage}
            onCancel={handleCancelGeneration}
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
    </ErrorBoundary>
  );
}

export default WorkoutRequestForm; 