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

import React, { useEffect, useState } from 'react';
import { useWorkoutForm } from '../../hooks/useWorkoutForm';
import { useWorkoutGeneration } from '../../hooks/useWorkoutGeneration';
import { useWorkoutGenerator } from '../GenerationProcess/useWorkoutGenerator';
import { useAnalytics } from '../../../analytics/hooks/useAnalytics';
import FormFeedback from './FormFeedback';
import { AdvancedOptionsPanel } from './AdvancedOptionsPanel';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import { WorkoutCard } from '../WorkoutDisplay/WorkoutCard';
import { WorkoutPreview } from '../WorkoutDisplay/WorkoutPreview';
import { WorkoutDifficulty } from '../../types/workout';

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

// Form steps
type FormStep = 'input' | 'preview' | 'generating' | 'completed';

/**
 * The main form component for requesting AI-generated workout plans.
 * 
 * State Management:
 * 1. Form State:
 *    - Managed by the useWorkoutForm hook
 *    - Includes form field values, validation state, and persistence
 *    - Form fields: goals, difficulty, duration, equipment, restrictions
 * 
 * 2. Generation State:
 *    - Managed by the useWorkoutGenerator hook
 *    - Tracks the status of the API request (idle, starting, success, error)
 *    - Stores the generated workout data and related metadata
 * 
 * 3. UI State:
 *    - Local state for status message rotation during generation
 *    - Computed states for loading/error conditions
 * 
 * 4. Analytics:
 *    - Tracks form view, submission, generation success/failure events
 *    - Captures form field values for analytics purposes
 * 
 * @returns {JSX.Element} The rendered form component
 */
export const WorkoutRequestForm: React.FC = () => {
  // Form state management hook
  // Handles form values, validation, and persistence
  const { 
    formValues, 
    updateField, 
    validateForm, 
    isValid, 
    clearFormStorage 
  } = useWorkoutForm();
  
  // Legacy workout generation hook (to be deprecated)
  const { 
    generationStatus, 
    isError: isLegacyError, 
    isSuccess: isLegacySuccess, 
    errorMessage: legacyErrorMessage 
  } = useWorkoutGeneration();
  
  // Direct workout generation with OpenAI
  // Handles the API request and response processing
  const {
    status,
    error,
    postId,
    workout,
    startGeneration: startDirectGeneration,
    resetGenerator
  } = useWorkoutGenerator();
  
  // Form step state
  const [formStep, setFormStep] = useState<FormStep>('input');
  
  // Status message rotation during generation
  const [statusMessage, setStatusMessage] = useState(STATUS_MESSAGES[0]);
  
  // Analytics tracking hook
  const { trackEvent } = useAnalytics();

  // Computed states for UI rendering conditions
  const isGenerating = status === 'starting' || generationStatus === 'submitting' || generationStatus === 'generating';
  const isError = error || isLegacyError;
  const errorMessage = error || legacyErrorMessage;
  
  /**
   * Effect to rotate status messages during workout generation
   * Creates a rotating sequence of messages to show progress is happening
   */
  useEffect(() => {
    let messageIndex = 0;
    let interval: NodeJS.Timeout;
    
    if (status === 'starting') {
      setStatusMessage(STATUS_MESSAGES[0]);
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % STATUS_MESSAGES.length;
        setStatusMessage(STATUS_MESSAGES[messageIndex]);
      }, 4000);
    }
    
    // Clean up interval on component unmount or status change
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);
  
  /**
   * Effect to update form step based on generation status
   */
  useEffect(() => {
    if (status === 'starting') {
      setFormStep('generating');
    } else if (status === 'completed') {
      setFormStep('completed');
    }
  }, [status]);
  
  /**
   * Effect to track form view analytics event
   * Fires once when the component mounts
   */
  useEffect(() => {
    trackEvent('view_form');
  }, [trackEvent]);
  
  /**
   * Moves to the preview step after validating form data
   */
  const handleShowPreview = () => {
    if (!validateForm()) {
      trackEvent('form_error', {
        reason: 'validation_failed'
      });
      return;
    }
    
    setFormStep('preview');
    trackEvent('view_preview', {
      goal: formValues.goals,
      experience: formValues.difficulty,
      duration: formValues.duration
    });
  };
  
  /**
   * Returns from preview to form input
   */
  const handleEditForm = () => {
    setFormStep('input');
  };
  
  /**
   * Form submission handler
   * Validates form data and initiates workout generation
   * 
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formStep === 'input') {
      handleShowPreview();
      return;
    }
    
    // Track form submission analytics
    trackEvent('form_submit', {
      goal: formValues.goals,
      experience: formValues.difficulty,
      duration: formValues.duration,
      equipment_count: formValues.equipment?.length || 0
    });
    
    try {
      // Create a specific request string from the form values
      const specificRequest = `Create a ${formValues.difficulty} level workout for ${formValues.duration} minutes focusing on ${formValues.goals}.`;
      
      // Start direct generation with OpenAI
      await startDirectGeneration(specificRequest, {
        duration: formValues.duration,
        difficulty: formValues.difficulty,
        equipment: formValues.equipment,
        goals: formValues.goals,
        restrictions: formValues.restrictions
      });
      
      // Track successful generation and clear form storage
      if (postId) {
        trackEvent('workout_generated', {
          duration: formValues.duration,
          mode: 'direct'
        });
        clearFormStorage();
      }
    } catch (error) {
      // Track generation errors
      trackEvent('form_error', { 
        message: error instanceof Error ? error.message : 'Unknown error',
        mode: 'direct'
      });
      
      // Return to input step on error
      setFormStep('input');
    }
  };
  
  /**
   * Handles generating a new workout
   * Clears the current workout and resets the generator state
   * allowing the user to create a new workout
   */
  const handleGenerateNew = () => {
    resetGenerator();
    clearFormStorage();
    setFormStep('input');
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Workout Request Form">
        {/* Form status feedback */}
        {isError && (
          <FormFeedback 
            type="error" 
            message={errorMessage || 'Failed to generate workout. Please try again.'} 
          />
        )}
        
        {isLegacySuccess && (
          <FormFeedback 
            type="success" 
            message="Workout generated successfully!" 
          />
        )}
        
        {formStep === 'generating' && (
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex items-center">
              <div className="mr-3">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-blue-700">{statusMessage}</p>
            </div>
          </div>
        )}
        
        {/* Form Input Step */}
        {formStep === 'input' && (
          <>
            {/* Goal selection */}
            <div>
              <label htmlFor="goal" className="block text-gray-700 font-medium mb-2">
                What is your fitness goal?
              </label>
              <Select
                id="goal"
                options={GOAL_OPTIONS}
                value={formValues.goals || ''}
                onChange={(value) => updateField('goals', value)}
                aria-required="true"
              />
            </div>
            
            {/* Experience level */}
            <div>
              <fieldset>
                <legend className="block text-gray-700 font-medium mb-2">
                  What is your fitness experience level?
                </legend>
                <div className="space-y-2">
                  {EXPERIENCE_OPTIONS.map((level) => (
                    <div key={level.value} className="flex items-center">
                      <input
                        id={`experience-${level.value}`}
                        name="experienceLevel"
                        type="radio"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        value={level.value}
                        checked={formValues.difficulty === level.value}
                        onChange={(e) => updateField('difficulty', e.target.value as WorkoutDifficulty)}
                        required
                      />
                      <label htmlFor={`experience-${level.value}`} className="ml-3 text-gray-700">
                        {level.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            
            {/* Workout duration */}
            <div>
              <label htmlFor="duration" className="block text-gray-700 font-medium mb-2">
                How long do you want to workout?
              </label>
              <Select
                id="duration"
                options={DURATION_OPTIONS}
                value={String(formValues.duration || '')}
                onChange={(value) => updateField('duration', parseInt(value, 10))}
                aria-required="true"
              />
            </div>
            
            {/* Advanced options panel */}
            <AdvancedOptionsPanel
              equipmentOptions={EQUIPMENT_OPTIONS}
              selectedEquipment={formValues.equipment || []}
              onEquipmentChange={(equipment) => updateField('equipment', equipment)}
              restrictions={formValues.restrictions || ''}
              onRestrictionsChange={(restrictions) => updateField('restrictions', restrictions)}
            />
            
            {/* Continue button */}
            <div className="pt-4">
              <Button 
                type="button"
                onClick={handleShowPreview}
                disabled={!isValid}
                className="w-full"
                variant="primary"
                size="lg"
              >
                Continue
              </Button>
            </div>
          </>
        )}
        
        {/* Preview Step */}
        {formStep === 'preview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Review Your Workout Request</h2>
            
            <WorkoutPreview
              goal={formValues.goals || ''}
              difficulty={formValues.difficulty || 'beginner'}
              duration={formValues.duration || 30}
              equipment={formValues.equipment}
              restrictions={formValues.restrictions}
            />
            
            <p className="text-sm text-gray-600">
              Ready to generate your custom workout? Click "Generate Workout" to continue or go back to make changes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={handleEditForm}
                className="sm:flex-1"
                variant="secondary"
                size="lg"
              >
                Edit Request
              </Button>
              
              <Button 
                type="submit"
                disabled={isGenerating}
                className="sm:flex-1"
                variant="primary"
                size="lg"
              >
                Generate Workout
              </Button>
            </div>
          </div>
        )}
        
        {/* Display the generated workout */}
        {formStep === 'completed' && postId && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Custom Workout</h2>
            <WorkoutCard 
              postId={postId} 
              workout={workout || undefined}
            />
            <div className="mt-6">
              <Button
                onClick={handleGenerateNew}
                className="w-full"
                variant="secondary"
                size="lg"
              >
                Generate Another Workout
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}; 