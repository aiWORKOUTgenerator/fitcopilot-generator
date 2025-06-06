/**
 * InputStep Component
 * 
 * First step in the workout generation process where users input their preferences.
 * Enhanced with profile integration to show user's fitness profile as badges.
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
import { useProfile } from '../../../../profile/context';
import { 
  mapProfileToWorkoutContext, 
  isProfileSufficientForWorkout 
} from '../../../utils/profileMapping';
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

  // 🚀 STORY 1.1: Profile context integration
  const { state: profileState } = useProfile();
  const { profile, loading: profileLoading, error: profileError } = profileState;
  
  // Map profile data to workout context
  const profileMapping = profile ? mapProfileToWorkoutContext(profile) : null;
  const isProfileSufficient = isProfileSufficientForWorkout(profile);

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

  /**
   * 🚀 STORY 1.1: Handle badge click to focus on corresponding form field
   */
  const handleBadgeFieldFocus = (fieldName: string) => {
    const element = document.getElementById(fieldName);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
      
      // Add temporary highlight
      element.classList.add('field-highlighted');
      setTimeout(() => element.classList.remove('field-highlighted'), 2000);
    }
  };

  /**
   * 🚀 STORY 1.1: Handle auto-fill from profile data
   */
  const handleAutoFillFromProfile = (fieldName: string) => {
    if (!profileMapping) return;

    switch (fieldName) {
      case 'difficulty':
        setDifficulty(profileMapping.fitnessLevel);
        break;
      case 'goals':
        if (profileMapping.goals.length > 0) {
          setGoals(profileMapping.goals[0]); // Use first goal
        }
        break;
      case 'equipment':
        setEquipment(profileMapping.availableEquipment);
        break;
      case 'environment':
        // Map profile location to session environment
        const profileLocation = profileMapping.preferredLocation;
        let sessionEnvironment: 'gym' | 'home' | 'outdoors' | 'travel' | 'limited-space';
        
        switch (profileLocation) {
          case 'gym':
            sessionEnvironment = 'gym';
            break;
          case 'outdoors':
            sessionEnvironment = 'outdoors';
            break;
          case 'anywhere':
            sessionEnvironment = 'home'; // Default to home for flexible
            break;
          case 'home':
          default:
            sessionEnvironment = 'home';
            break;
        }
        
        const currentSessionInputs = formValues.sessionInputs || {};
        const newSessionInputs = {
          ...currentSessionInputs,
          environment: sessionEnvironment
        };
        if (setSessionInputs) {
          setSessionInputs(newSessionInputs);
        }
        break;
      case 'auto-fill-all':
        // Auto-fill all available fields
        setDifficulty(profileMapping.fitnessLevel);
        if (profileMapping.goals.length > 0) {
          setGoals(profileMapping.goals[0]);
        }
        setEquipment(profileMapping.availableEquipment);
        break;
    }
    
    // Focus on the field after auto-fill
    if (fieldName !== 'auto-fill-all') {
      handleBadgeFieldFocus(fieldName);
    }
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
            
            {/* Profile Fitness Goals Badge - Show user's current goals if available */}
            {!profileLoading && !profileError && isProfileSufficient && profileMapping && profileMapping.displayData.goals.length > 0 && (
              <div className="input-step__profile-context">
                <div className="input-step__profile-label">Your Profile Goals:</div>
                <div className="meta-badges">
                  {profileMapping.displayData.goals.slice(0, 2).map((goal, index) => (
                    <span 
                      key={goal.value}
                      className="workout-type-badge"
                      style={{ 
                        cursor: 'pointer'
                      }}
                      onClick={() => handleAutoFillFromProfile('goals')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleAutoFillFromProfile('goals')}
                      title="Click to use your profile fitness goals"
                    >
                      <span className="workout-type-icon">{goal.icon}</span>
                      {goal.display}
                    </span>
                  ))}
                  {profileMapping.displayData.goals.length > 2 && (
                    <span className="goals-more-indicator">
                      +{profileMapping.displayData.goals.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
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
            
            {/* Profile Fitness Level Badge - Show user's current level if available */}
            {!profileLoading && !profileError && isProfileSufficient && profileMapping && (
              <div className="input-step__profile-context">
                <div className="input-step__profile-label">Your Profile Level:</div>
                <div className="meta-badges">
                  <span 
                    className="difficulty-badge"
                    style={{ 
                      backgroundColor: profileMapping.displayData.fitnessLevel.bgColor,
                      color: profileMapping.displayData.fitnessLevel.color,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleAutoFillFromProfile('difficulty')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleAutoFillFromProfile('difficulty')}
                    title="Click to use your profile fitness level"
                  >
                    <span className="difficulty-icon">{profileMapping.displayData.fitnessLevel.icon}</span>
                    {profileMapping.displayData.fitnessLevel.display}
                  </span>
                </div>
              </div>
            )}
            
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

          {/* Environment Selection */}
          <div className="input-step__form-group">
            <label htmlFor="environment" className="input-step__label">
              Where will you be working out?
            </label>
            
            {/* Profile Preferred Location Badge - Show user's current location preference if available */}
            {!profileLoading && !profileError && isProfileSufficient && profileMapping && profileMapping.displayData.location && (
              <div className="input-step__profile-context">
                <div className="input-step__profile-label">Your Profile Location:</div>
                <div className="meta-badges">
                  <span 
                    className="workout-type-badge"
                    style={{ 
                      cursor: 'pointer'
                    }}
                    onClick={() => handleAutoFillFromProfile('environment')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleAutoFillFromProfile('environment')}
                    title="Click to use your profile location preference"
                  >
                    <span className="workout-type-icon">
                      {profileMapping.displayData.location.value === 'home' && '🏠'}
                      {profileMapping.displayData.location.value === 'gym' && '🏋️'}
                      {profileMapping.displayData.location.value === 'outdoors' && '🌳'}
                      {profileMapping.displayData.location.value === 'anywhere' && '📍'}
                    </span>
                    {profileMapping.displayData.location.display}
                  </span>
                </div>
                <div className="input-step__profile-context-hint">
                  {profileMapping.displayData.location.context}
                </div>
              </div>
            )}
            
            <div className="input-step__select-container">
              <select
                id="environment"
                className={`input-step__select ${activeDropdown === 'environment' ? 'input-step__select--focused' : ''}`}
                value={formValues.sessionInputs?.environment || ''}
                onChange={e => {
                  const currentSessionInputs = formValues.sessionInputs || {};
                  const newSessionInputs = {
                    ...currentSessionInputs,
                    environment: e.target.value as 'gym' | 'home' | 'outdoors' | 'travel' | 'limited-space'
                  };
                  if (setSessionInputs) {
                    setSessionInputs(newSessionInputs);
                  }
                }}
                onFocus={() => handleDropdownFocus('environment')}
                onBlur={handleDropdownBlur}
              >
                <option value="">Select environment</option>
                <option value="home">Home</option>
                <option value="gym">Gym</option>
                <option value="outdoors">Outdoors</option>
                <option value="travel">Travel/Hotel</option>
                <option value="limited-space">Limited Space</option>
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
            onAutoFillEquipment={setEquipment}
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