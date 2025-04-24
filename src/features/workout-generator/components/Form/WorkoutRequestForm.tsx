/**
 * Workout Request Form Component
 * 
 * This component provides the main interface for users to request AI-generated workout plans.
 * It integrates with the form state, workout generation API, and analytics tracking.
 */

import React, { useEffect, useState } from 'react';
import { useWorkoutForm } from '../../hooks/useWorkoutForm';
import { useWorkoutGeneration } from '../../hooks/useWorkoutGeneration';
import { useWorkoutGenerator } from '../GenerationProcess/useWorkoutGenerator';
import { useAnalytics } from '../../../analytics/hooks/useAnalytics';
import { clearAllCachedWorkouts } from '../../utils/workoutCache';
import FormFeedback from './FormFeedback';
import { AdvancedOptionsPanel } from './AdvancedOptionsPanel';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import { WorkoutCard } from '../WorkoutDisplay/WorkoutCard';

// Equipment options available for workouts
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

// Goal options for workouts
const GOAL_OPTIONS = [
  { value: 'lose-weight', label: 'Lose Weight' },
  { value: 'build-muscle', label: 'Build Muscle' },
  { value: 'improve-endurance', label: 'Improve Endurance' },
  { value: 'increase-strength', label: 'Increase Strength' },
  { value: 'enhance-flexibility', label: 'Enhance Flexibility' },
  { value: 'general-fitness', label: 'General Fitness' },
  { value: 'sport-specific', label: 'Sport-Specific Training' }
];

// Experience level options
const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

// Duration options in minutes
const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' }
];

// Generation status messages
const STATUS_MESSAGES = [
  'Connecting to OpenAI...',
  'Building your personalized workout plan...',
  'Analyzing your fitness goals...',
  'Selecting the perfect exercises...',
  'Putting the finishing touches on your plan...'
];

/**
 * Form for requesting AI-generated workout plans
 */
export const WorkoutRequestForm: React.FC = () => {
  const { 
    formValues, 
    updateField, 
    validateForm, 
    isValid, 
    clearFormStorage 
  } = useWorkoutForm();
  
  // Legacy workout generation 
  const { 
    startGeneration: startLegacyGeneration, 
    generationStatus, 
    isError: isLegacyError, 
    isSuccess: isLegacySuccess, 
    errorMessage: legacyErrorMessage 
  } = useWorkoutGeneration();
  
  // Direct workout generation with OpenAI
  const {
    status,
    error,
    postId,
    workout,
    startGeneration: startDirectGeneration,
    resetGenerator
  } = useWorkoutGenerator();
  
  // Status message rotation
  const [statusMessage, setStatusMessage] = useState(STATUS_MESSAGES[0]);
  
  const { trackEvent } = useAnalytics();

  const isGenerating = status === 'starting' || generationStatus === 'submitting' || generationStatus === 'generating';
  const isError = error || isLegacyError;
  const errorMessage = error || legacyErrorMessage;
  
  // Rotate status messages during generation
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
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);
  
  // Track when form is viewed
  useEffect(() => {
    trackEvent('view_form');
  }, [trackEvent]);
  
  // Handle submit action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      trackEvent('form_error', {
        reason: 'validation_failed'
      });
      return;
    }
    
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
      
      if (postId) {
        trackEvent('workout_generated', {
          duration: formValues.duration,
          mode: 'direct'
        });
        clearFormStorage();
      }
    } catch (error) {
      trackEvent('form_error', { 
        message: error instanceof Error ? error.message : 'Unknown error',
        mode: 'direct'
      });
    }
  };
  
  /**
   * Handle generating a new workout
   * Clears the current workout and resets the generator state
   */
  const handleGenerateNew = () => {
    resetGenerator();
    clearFormStorage();
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
        
        {status === 'starting' && (
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex items-center">
              <div className="mr-3">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-blue-700">{statusMessage}</p>
            </div>
          </div>
        )}
        
        {status !== 'completed' && (
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
                        onChange={(e) => updateField('difficulty', e.target.value)}
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
            
            {/* Submit button */}
            <div className="pt-4">
              <Button 
                type="submit"
                disabled={isGenerating || !isValid}
                className="w-full"
                variant="primary"
                size="lg"
              >
                {isGenerating ? 'Generating Workout...' : 'Generate Workout'}
              </Button>
            </div>
          </>
        )}
        
        {/* Display the generated workout */}
        {status === 'completed' && postId && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Custom Workout</h2>
            <WorkoutCard 
              postId={postId} 
              workout={workout}
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