/**
 * InputStep Component
 * 
 * First step in the workout generation process where users input their preferences.
 */
import React, { useState } from 'react';
import { Card } from '../../../../../components/ui';
import { Button } from '../../../../../common/components/UI';
import { WorkoutFormParams, WorkoutDifficulty } from '../../../types/workout';
import { ValidationErrors } from '../../../domain/validators';
import '../form.scss';

/**
 * Equipment options available for selection
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
 * Workout goal options
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
 * Difficulty level options
 */
const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

/**
 * Duration options in minutes
 */
const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' },
  { value: 90, label: '90 minutes' }
];

interface InputStepProps {
  /** Current form values */
  formValues: Partial<WorkoutFormParams>;
  /** Form validation errors */
  formErrors: ValidationErrors | null;
  /** Whether the form is valid */
  isValid: boolean;
  /** Function to check if a field has an error */
  hasFieldError: (field: keyof WorkoutFormParams) => boolean;
  /** Function to get error message for a field */
  getFieldError: (field: keyof WorkoutFormParams) => string | undefined;
  /** Update goals field */
  setGoals: (goals: string) => void;
  /** Update difficulty field */
  setDifficulty: (difficulty: WorkoutDifficulty) => void;
  /** Update duration field */
  setDuration: (duration: number) => void;
  /** Update equipment field */
  setEquipment: (equipment: string[]) => void;
  /** Update restrictions field */
  setRestrictions: (restrictions: string) => void;
  /** Validate the form */
  validateForm: () => boolean;
  /** Continue to next step */
  onContinue: () => void;
}

/**
 * First step of the workout generator form for collecting user preferences
 */
export const InputStep: React.FC<InputStepProps> = ({
  formValues,
  formErrors,
  isValid,
  hasFieldError,
  getFieldError,
  setGoals,
  setDifficulty,
  setDuration,
  setEquipment,
  setRestrictions,
  validateForm,
  onContinue,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onContinue();
    }
  };

  /**
   * Handle equipment selection
   */
  const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    const currentEquipment = formValues.equipment || [];
    
    if (checked) {
      // Add to selection
      setEquipment([...currentEquipment, value]);
    } else {
      // Remove from selection
      setEquipment(currentEquipment.filter(item => item !== value));
    }
  };

  /**
   * Toggle advanced options
   */
  const toggleAdvancedOptions = () => {
    setShowAdvanced(!showAdvanced);
  };

  return (
    <div className="workout-generator-form">
      <Card padding="large">
        <h2 className="form-title">Create Your Custom Workout</h2>
        <form onSubmit={handleSubmit}>
          {/* Goals Selection */}
          <div className="form-group">
            <label htmlFor="goals" className="form-label">
              What is your fitness goal?
              {hasFieldError('goals') && (
                <span className="form-error">{getFieldError('goals')}</span>
              )}
            </label>
            <select
              id="goals"
              className={`form-select ${hasFieldError('goals') ? 'form-select--error' : ''}`}
              value={formValues.goals || ''}
              onChange={e => setGoals(e.target.value)}
            >
              <option value="">Select your goal</option>
              {GOAL_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div className="form-group">
            <label className="form-label">
              What is your fitness experience level?
              {hasFieldError('difficulty') && (
                <span className="form-error">{getFieldError('difficulty')}</span>
              )}
            </label>
            <div className="difficulty-options">
              {DIFFICULTY_OPTIONS.map(option => (
                <div key={option.value} className="difficulty-option">
                  <input
                    type="radio"
                    id={`difficulty-${option.value}`}
                    name="difficulty"
                    value={option.value}
                    checked={formValues.difficulty === option.value}
                    onChange={e => setDifficulty(e.target.value as WorkoutDifficulty)}
                  />
                  <label htmlFor={`difficulty-${option.value}`}>{option.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="form-group">
            <label htmlFor="duration" className="form-label">
              How long do you want to workout?
              {hasFieldError('duration') && (
                <span className="form-error">{getFieldError('duration')}</span>
              )}
            </label>
            <select
              id="duration"
              className={`form-select ${hasFieldError('duration') ? 'form-select--error' : ''}`}
              value={formValues.duration || ''}
              onChange={e => setDuration(Number(e.target.value))}
            >
              <option value="">Select duration</option>
              {DURATION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Options Toggle */}
          <div className="form-group">
            <button 
              type="button" 
              className="advanced-options-toggle"
              onClick={toggleAdvancedOptions}
            >
              Advanced Options
              <span className={`advanced-options-icon ${showAdvanced ? 'advanced-options-icon--open' : ''}`}>
                {showAdvanced ? '▲' : '▼'}
              </span>
            </button>
          </div>

          {/* Advanced Options Section */}
          {showAdvanced && (
            <div className="advanced-options">
              {/* Equipment Selection */}
              <div className="form-group">
                <label className="form-label">Available Equipment</label>
                <div className="equipment-options">
                  {EQUIPMENT_OPTIONS.map(option => (
                    <div key={option.id} className="equipment-option">
                      <input
                        type="checkbox"
                        id={`equipment-${option.id}`}
                        value={option.id}
                        checked={(formValues.equipment || []).includes(option.id)}
                        onChange={handleEquipmentChange}
                      />
                      <label htmlFor={`equipment-${option.id}`}>{option.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restrictions Input */}
              <div className="form-group">
                <label htmlFor="restrictions" className="form-label">
                  Restrictions or Preferences
                  {hasFieldError('restrictions') && (
                    <span className="form-error">{getFieldError('restrictions')}</span>
                  )}
                </label>
                <textarea
                  id="restrictions"
                  className={`form-textarea ${hasFieldError('restrictions') ? 'form-textarea--error' : ''}`}
                  value={formValues.restrictions || ''}
                  onChange={e => setRestrictions(e.target.value)}
                  placeholder="E.g., knee injury, lower back pain, etc."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-group">
            <Button 
              type="submit" 
              variant="primary"
              className="continue-button"
            >
              Continue
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}; 