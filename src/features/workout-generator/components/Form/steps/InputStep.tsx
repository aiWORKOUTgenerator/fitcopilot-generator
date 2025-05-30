/**
 * InputStep Component
 * 
 * First step in the workout generation process where users input their preferences.
 */
import React, { useState } from 'react';
import { Card } from '../../../../../components/ui';
import { Button } from '../../../../../components/ui';
import { Textarea } from '../../../../../components/ui/Textarea';
import { AdvancedOptionsPanel } from '../../../../../components/ui';
import { WorkoutFormParams, WorkoutDifficulty, SessionSpecificInputs } from '../../../types/workout';
import { ValidationErrors } from '../../../domain/validators';
import { ChevronDown, ChevronRight } from 'lucide-react';
import SessionInputsPanel from '../SessionInputsPanel';
import './InputStep.scss';

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
  /** Update preferences field */
  setPreferences: (preferences: string) => void;
  /** Update session inputs */
  setSessionInputs?: (sessionInputs: SessionSpecificInputs) => void;
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
  setPreferences,
  setSessionInputs,
  validateForm,
  onContinue,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSessionInputsExpanded, setIsSessionInputsExpanded] = useState(true);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Simulate a delay for demonstration purposes
        await new Promise(resolve => setTimeout(resolve, 800));
        onContinue();
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * Handle dropdown focus
   */
  const handleDropdownFocus = (id: string) => {
    setActiveDropdown(id);
  };

  /**
   * Handle dropdown blur
   */
  const handleDropdownBlur = () => {
    setActiveDropdown(null);
  };

  return (
    <div className="input-step">
      <Card padding="large" primary elevated>
        <h2 className="input-step__title gradient-text">Create Your Custom Workout</h2>
        <form onSubmit={handleSubmit} className="input-step__form">
          {/* Goals Selection */}
          <div className="input-step__form-group">
            <label htmlFor="goals" className="input-step__label">
              What is your fitness goal?
              {hasFieldError('goals') && (
                <span className="input-step__error">{getFieldError('goals')}</span>
              )}
            </label>
            <div className="input-step__select-container">
              <select
                id="goals"
                className={`input-step__select ${activeDropdown === 'goals' ? 'input-step__select--focused' : ''}`}
                value={formValues.goals || ''}
                onChange={e => setGoals(e.target.value)}
                onFocus={() => handleDropdownFocus('goals')}
                onBlur={handleDropdownBlur}
              >
                <option value="">Select your goal</option>
                {GOAL_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="input-step__select-icon" />
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="input-step__form-group">
            <label className="input-step__label">
              What is your fitness experience level?
              {hasFieldError('difficulty') && (
                <span className="input-step__error">{getFieldError('difficulty')}</span>
              )}
            </label>
            <div className="input-step__radio-group">
              {DIFFICULTY_OPTIONS.map(option => (
                <label key={option.value} className="input-step__radio-label">
                  <input
                    type="radio"
                    className="input-step__radio-input"
                    name="difficulty"
                    value={option.value}
                    checked={formValues.difficulty === option.value}
                    onChange={e => setDifficulty(e.target.value as WorkoutDifficulty)}
                  />
                  <div className="input-step__radio-button">
                    <div className="input-step__radio-dot"></div>
                  </div>
                  <span className="input-step__radio-text">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="input-step__form-group">
            <label htmlFor="duration" className="input-step__label">
              How long do you want to workout?
              {hasFieldError('duration') && (
                <span className="input-step__error">{getFieldError('duration')}</span>
              )}
            </label>
            <div className="input-step__select-container">
              <select
                id="duration"
                className={`input-step__select ${activeDropdown === 'duration' ? 'input-step__select--focused' : ''}`}
                value={formValues.duration || ''}
                onChange={e => setDuration(Number(e.target.value))}
                onFocus={() => handleDropdownFocus('duration')}
                onBlur={handleDropdownBlur}
              >
                <option value="">Select duration</option>
                {DURATION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="input-step__select-icon" />
            </div>
                    </div>
          
          {/* Session-Specific Inputs */}
          <SessionInputsPanel
            sessionInputs={formValues.sessionInputs || {}}
            onSessionInputsChange={inputs => {
              if (setSessionInputs) {
                setSessionInputs(inputs);
              }
            }}
            isExpanded={isSessionInputsExpanded}
            onToggleExpand={() => setIsSessionInputsExpanded(!isSessionInputsExpanded)}
          />
          
          {/* Advanced Options */}
          <AdvancedOptionsPanel 
            equipmentOptions={EQUIPMENT_OPTIONS}
            selectedEquipment={formValues.equipment || []}
            onEquipmentChange={setEquipment}
            intensity={intensity}
            onIntensityChange={setIntensity}
            preferences={formValues.preferences || ''}
            onPreferencesChange={setPreferences}
            restrictions={formValues.restrictions || ''}
            onRestrictionsChange={setRestrictions}
            className="input-step__advanced-options"
          />

          {/* Submit Button */}
          <div className="input-step__actions">
            <Button 
              type="submit" 
              variant="gradient"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              className="input-step__submit-button"
              aria-label="Continue to next step"
              disabled={!isValid || isSubmitting}
              endIcon={<ChevronRight size={18} />}
            >
              Continue
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}; 