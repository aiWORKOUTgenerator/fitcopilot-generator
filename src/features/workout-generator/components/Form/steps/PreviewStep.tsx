/**
 * Preview Step Component
 * 
 * Displays a summary of the workout parameters before generation and allows the user
 * to confirm or edit their selections.
 */
import React from 'react';
import { Card } from '../../../../../components/ui';
import { Button } from '../../../../../common/components/UI';
import { WorkoutFormParams } from '../../../types/workout';
import './PreviewStep.scss';

interface PreviewStepProps {
  /** Form values to preview */
  formValues: WorkoutFormParams;
  /** Callback when the user wants to edit their selections */
  onEditRequest: () => void;
  /** Callback when the user confirms and wants to generate a workout */
  onGenerateWorkout: () => void;
  /** Loading state */
  isLoading?: boolean;
}

// Map goal keys to human-readable labels
const GOAL_LABELS: Record<string, string> = {
  'weight-loss': 'Weight Loss',
  'muscle-gain': 'Muscle Gain',
  'endurance': 'Endurance',
  'strength': 'Strength',
  'flexibility': 'Flexibility',
  'general-fitness': 'General Fitness',
};

// Map difficulty keys to human-readable labels
const DIFFICULTY_LABELS: Record<string, string> = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced',
};

// Map equipment keys to human-readable labels
const EQUIPMENT_LABELS: Record<string, string> = {
  'none': 'No Equipment',
  'dumbbells': 'Dumbbells',
  'resistance-bands': 'Resistance Bands',
  'kettlebells': 'Kettlebells',
  'barbell': 'Barbell',
  'pull-up-bar': 'Pull-up Bar',
  'bench': 'Bench',
  'yoga-mat': 'Yoga Mat',
  'medicine-ball': 'Medicine Ball',
  'stability-ball': 'Stability Ball',
  'cable-machine': 'Cable Machine',
  'squat-rack': 'Squat Rack',
  'leg-press': 'Leg Press',
  'treadmill': 'Treadmill',
  'stationary-bike': 'Stationary Bike',
  'elliptical': 'Elliptical',
  'rowing-machine': 'Rowing Machine',
};

/**
 * Component for previewing workout parameters before generation
 */
const PreviewStep: React.FC<PreviewStepProps> = ({
  formValues,
  onEditRequest,
  onGenerateWorkout,
  isLoading = false,
}) => {
  // Format the display values for the workout preview
  const goalDisplay = formValues.goals ? GOAL_LABELS[formValues.goals] : '';
  const difficultyDisplay = formValues.difficulty ? DIFFICULTY_LABELS[formValues.difficulty] : '';
  const durationDisplay = formValues.duration ? `${formValues.duration} minutes` : '';
  
  const equipmentDisplay = formValues.equipment?.map((item: string) => EQUIPMENT_LABELS[item] || item) || [];
  
  // Format any restrictions or preferences
  const restrictionsPreferences = [
    ...(formValues.restrictions ? [`Restrictions: ${formValues.restrictions}`] : []),
  ];

  return (
    <div className="preview-step">
      <h2 className="preview-step__title">Workout Summary</h2>
      
      <div className="workout-preview">
        <h3 className="workout-preview__title">Your Workout Request</h3>
        
        <div className="workout-preview__grid">
          <div className="workout-preview__card">
            <div className="workout-preview__card-label">Goal</div>
            <div className="workout-preview__card-value workout-preview__card-value--goal">
              {goalDisplay}
            </div>
          </div>
          
          <div className="workout-preview__card">
            <div className="workout-preview__card-label">Difficulty</div>
            <div className="workout-preview__card-value workout-preview__card-value--level">
              {difficultyDisplay}
            </div>
          </div>
          
          <div className="workout-preview__card">
            <div className="workout-preview__card-label">Duration</div>
            <div className="workout-preview__card-value workout-preview__card-value--duration">
              {durationDisplay}
            </div>
          </div>
        </div>
        
        {equipmentDisplay.length > 0 && (
          <div className="workout-preview__section">
            <h4 className="workout-preview__section-title">Equipment</h4>
            <div className="workout-preview__equipment">
              {equipmentDisplay.map((item: string, index: number) => (
                <span key={index} className="workout-preview__equipment-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {restrictionsPreferences.length > 0 && (
          <div className="workout-preview__section">
            <h4 className="workout-preview__section-title">
              Restrictions & Preferences
            </h4>
            <div className="workout-preview__restrictions">
              {restrictionsPreferences.map((item: string, index: number) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="preview-step__message">
        Please review your workout request details before generating your personalized workout.
      </div>
      
      <div className="preview-step__actions">
        <Button 
          onClick={onEditRequest}
          variant="outline"
          className="preview-step__edit-button"
          disabled={isLoading}
        >
          Edit Request
        </Button>
        
        <Button 
          onClick={onGenerateWorkout}
          variant="primary"
          className="preview-step__generate-button"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Generate Workout
        </Button>
      </div>
    </div>
  );
};

export default PreviewStep; 