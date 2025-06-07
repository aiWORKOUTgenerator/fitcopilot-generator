/**
 * Preview Step Component
 * 
 * Displays a summary of the workout parameters before generation and allows the user
 * to confirm or edit their selections.
 */
import React from 'react';
import { Card } from '../../../../../components/ui';
import { Button } from '../../../../../components/ui';
import { WorkoutFormParams, SessionSpecificInputs } from '../../../types/workout';
import { ArrowLeft, Plus } from 'lucide-react';
import { EquipmentIcon } from '../../../utils/EquipmentIcons';
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

// Map goal keys to human-readable labels for daily focus
const GOAL_LABELS: Record<string, string> = {
  'lose-weight': 'Fat Burning & Cardio',
  'build-muscle': 'Muscle Building',
  'improve-endurance': 'Endurance & Stamina',
  'increase-strength': 'Strength Training',
  'enhance-flexibility': 'Flexibility & Mobility',
  'general-fitness': 'General Fitness',
  'sport-specific': 'Sport-Specific Training'
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
  'trx': 'TRX',
  'jump-rope': 'Jump Rope',
};

// Map environment keys to human-readable labels
const ENVIRONMENT_LABELS: Record<string, string> = {
  'gym': 'Gym',
  'home': 'Home',
  'outdoors': 'Outdoors',
  'travel': 'Travel',
  'limited-space': 'Limited Space',
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
  const goalDisplay = formValues.goals ? GOAL_LABELS[formValues.goals] || formValues.goals : '';
  const difficultyDisplay = formValues.difficulty ? DIFFICULTY_LABELS[formValues.difficulty] : '';
  const durationDisplay = formValues.duration ? `${formValues.duration} minutes` : '';
  const environmentDisplay = formValues.sessionInputs?.environment ? ENVIRONMENT_LABELS[formValues.sessionInputs.environment] : '';
  const intensityDisplay = formValues.intensity ? getIntensityLabel(formValues.intensity) : '';
  const equipment = formValues.equipment || [];
  const sessionInputs = formValues.sessionInputs || {};
  
  // Helper function to get intensity label
  function getIntensityLabel(intensity: number): string {
    switch (intensity) {
      case 1: return 'Very Low';
      case 2: return 'Low';  
      case 3: return 'Moderate';
      case 4: return 'High';
      case 5: return 'Very High';
      default: return 'Moderate';
    }
  }
  
  // Format any restrictions or preferences
  const restrictionsPreferences = [
    ...(formValues.restrictions ? [`Restrictions: ${formValues.restrictions}`] : []),
    ...(formValues.preferences ? [`Preferences: ${formValues.preferences}`] : []),
  ];

  return (
    <div className="preview-step">
      <div className="preview-step__header">
        <h2 className="preview-step__title">Workout Summary</h2>
      </div>
      
      <div className="workout-preview">
        <h3 className="workout-preview__title">Your Workout Request</h3>
        
        <div className="workout-preview__grid">
          <Card className="workout-preview__card workout-preview__card--goal">
            <div className="workout-preview__card-label">FOCUS</div>
            <div className="workout-preview__card-value">
              {goalDisplay}
            </div>
          </Card>
          
          <Card className="workout-preview__card workout-preview__card--level">
            <div className="workout-preview__card-label">DIFFICULTY</div>
            <div className="workout-preview__card-value">
              {difficultyDisplay}
            </div>
          </Card>
          
          <Card className="workout-preview__card workout-preview__card--duration">
            <div className="workout-preview__card-label">DURATION</div>
            <div className="workout-preview__card-value">
              {durationDisplay}
            </div>
          </Card>
          
          {environmentDisplay && (
            <Card className="workout-preview__card workout-preview__card--environment">
              <div className="workout-preview__card-label">ENVIRONMENT</div>
              <div className="workout-preview__card-value">
                {environmentDisplay}
              </div>
            </Card>
          )}
          
          {intensityDisplay && (
            <Card className="workout-preview__card workout-preview__card--intensity">
              <div className="workout-preview__card-label">INTENSITY</div>
              <div className="workout-preview__card-value">
                {intensityDisplay}
              </div>
            </Card>
          )}
        </div>
        
        {equipment.length > 0 && (
          <div className="workout-preview__section">
            <h4 className="workout-preview__section-title">Equipment</h4>
            <div className="workout-preview__equipment">
              {equipment.map((item: string, index: number) => (
                <span key={index} className="equipment-tag">
                  <EquipmentIcon type={item} size={20} />
                  {EQUIPMENT_LABELS[item] || item}
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
        
        {/* Session-specific inputs - exclude environment since it's now in the main cards */}
        {(sessionInputs.availableTime || sessionInputs.energyLevel || sessionInputs.moodLevel || 
          sessionInputs.sleepQuality || (sessionInputs.focusArea && sessionInputs.focusArea.length > 0) || 
          (sessionInputs.currentSoreness && sessionInputs.currentSoreness.length > 0)) && (
          <div className="workout-preview__section">
            <h4 className="workout-preview__section-title">
              Today's Workout Factors
            </h4>
            <div className="workout-preview__session-inputs">
              {sessionInputs.availableTime && (
                <div className="workout-preview__session-item">
                  <span className="workout-preview__session-label">Available Time:</span> 
                  <span className="workout-preview__session-value">{sessionInputs.availableTime} minutes</span>
                </div>
              )}
              
              {sessionInputs.energyLevel && (
                <div className="workout-preview__session-item">
                  <span className="workout-preview__session-label">Energy Level:</span> 
                  <span className="workout-preview__session-value">{sessionInputs.energyLevel}/5</span>
                </div>
              )}
              
              {sessionInputs.moodLevel && (
                <div className="workout-preview__session-item">
                  <span className="workout-preview__session-label">Stress Level:</span> 
                  <span className="workout-preview__session-value">{sessionInputs.moodLevel}/5</span>
                </div>
              )}
              
              {sessionInputs.sleepQuality && (
                <div className="workout-preview__session-item">
                  <span className="workout-preview__session-label">Sleep Quality:</span> 
                  <span className="workout-preview__session-value">{sessionInputs.sleepQuality}/5</span>
                </div>
              )}
              

              
              {sessionInputs.focusArea && sessionInputs.focusArea.length > 0 && (
                <div className="workout-preview__session-item">
                  <span className="workout-preview__session-label">Focus Areas:</span> 
                  <span className="workout-preview__session-value">
                    {sessionInputs.focusArea.join(', ')}
                  </span>
                </div>
              )}
              
              {sessionInputs.currentSoreness && sessionInputs.currentSoreness.length > 0 && (
                <div className="workout-preview__session-item">
                  <span className="workout-preview__session-label">Current Soreness:</span> 
                  <span className="workout-preview__session-value">
                    {sessionInputs.currentSoreness.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="preview-step__notice">
        Please review your workout request details before generating your personalized workout.
      </div>
      
      <div className="preview-step__actions">
        <Button 
          onClick={onEditRequest}
          variant="secondary"
          size="lg"
          disabled={isLoading}
          aria-label="Edit workout request"
          className="preview-step__edit-button"
          startIcon={<ArrowLeft size={20} />}
        >
          Edit Request
        </Button>
        
        <Button 
          onClick={onGenerateWorkout}
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          aria-label="Generate personalized workout"
          className="preview-step__generate-button"
          endIcon={<Plus size={20} className="generate-icon" />}
        >
          Generate Workout
        </Button>
      </div>
    </div>
  );
};

export default PreviewStep; 