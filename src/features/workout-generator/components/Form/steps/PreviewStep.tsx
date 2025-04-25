/**
 * Preview Step Component
 * 
 * Displays a summary of the workout parameters before generation and allows the user
 * to confirm or edit their selections.
 */
import React from 'react';
import { WorkoutFormParams } from '../../../types/workout';

interface PreviewStepProps {
  /** Form values to preview */
  formValues: Partial<WorkoutFormParams>;
  /** Callback when the user wants to edit their selections */
  onEditRequest: () => void;
  /** Callback when the user confirms and wants to generate a workout */
  onGenerateWorkout: () => void;
  /** Loading state */
  isLoading?: boolean;
}

// Map goal keys to human-readable labels
const GOAL_LABELS: Record<string, string> = {
  'lose-weight': 'Lose Weight',
  'build-muscle': 'Build Muscle',
  'improve-endurance': 'Improve Endurance',
  'increase-strength': 'Increase Strength',
  'enhance-flexibility': 'Enhance Flexibility',
  'general-fitness': 'General Fitness',
  'sport-specific': 'Sport-Specific Training'
};

// Map difficulty keys to human-readable labels
const DIFFICULTY_LABELS: Record<string, string> = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced'
};

// Map equipment keys to human-readable labels
const EQUIPMENT_LABELS: Record<string, string> = {
  'dumbbells': 'Dumbbells',
  'kettlebells': 'Kettlebells',
  'resistance-bands': 'Resistance Bands',
  'pull-up-bar': 'Pull-up Bar',
  'yoga-mat': 'Yoga Mat',
  'bench': 'Bench',
  'barbell': 'Barbell',
  'trx': 'TRX/Suspension Trainer',
  'medicine-ball': 'Medicine Ball',
  'jump-rope': 'Jump Rope',
  'stability-ball': 'Stability Ball',
  'none': 'None/Bodyweight Only'
};

/**
 * Component for previewing workout parameters before generation
 */
export const PreviewStep: React.FC<PreviewStepProps> = ({
  formValues,
  onEditRequest,
  onGenerateWorkout,
  isLoading = false,
}) => {
  const { difficulty, duration, goals, equipment = [], restrictions } = formValues;

  // Get display values
  const goalLabel = goals ? GOAL_LABELS[goals] || goals : '';
  const difficultyLabel = difficulty ? DIFFICULTY_LABELS[difficulty] || difficulty : '';
  const durationValue = duration ? `${duration} min` : '';
  
  // Format equipment list for display
  const equipmentLabels = equipment.map(id => EQUIPMENT_LABELS[id] || id);

  return (
    <div className="preview-step">
      <h2 className="preview-step__title">Review Your Workout Request</h2>
      
      <div className="workout-preview">
        <h3 className="workout-preview__title">Workout Preview</h3>
        
        {/* Parameter Cards */}
        <div className="workout-preview__grid">
          <div className="workout-preview__card workout-preview__card--goal">
            <div className="workout-preview__card-label">Goal</div>
            <div className="workout-preview__card-value workout-preview__card-value--goal">
              {goalLabel}
            </div>
          </div>
          
          <div className="workout-preview__card workout-preview__card--level">
            <div className="workout-preview__card-label">Level</div>
            <div className="workout-preview__card-value workout-preview__card-value--level">
              {difficultyLabel}
            </div>
          </div>
          
          <div className="workout-preview__card workout-preview__card--duration">
            <div className="workout-preview__card-label">Duration</div>
            <div className="workout-preview__card-value workout-preview__card-value--duration">
              {durationValue}
            </div>
          </div>
        </div>
        
        {/* Equipment Section */}
        {equipment.length > 0 && (
          <div className="workout-preview__section">
            <div className="workout-preview__section-title">Equipment</div>
            <div className="workout-preview__equipment">
              {equipmentLabels.map((item, index) => (
                <span key={index} className="workout-preview__equipment-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Restrictions Section */}
        {restrictions && (
          <div className="workout-preview__section">
            <div className="workout-preview__section-title">Restrictions/Preferences</div>
            <div className="workout-preview__restrictions">{restrictions}</div>
          </div>
        )}
      </div>
      
      <div className="preview-step__message">
        Ready to generate your custom workout? Click "Generate Workout" to continue or go back to make changes.
      </div>
      
      <div className="preview-step__actions">
        <button
          type="button"
          className="preview-step__edit-button"
          onClick={onEditRequest}
          disabled={isLoading}
        >
          Edit Request
        </button>
        
        <button
          type="button"
          className="preview-step__generate-button"
          onClick={onGenerateWorkout}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Workout'}
        </button>
      </div>
    </div>
  );
}; 