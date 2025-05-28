/**
 * Enhanced Basic Information Step Component
 * 
 * This component demonstrates how to properly integrate the design system
 * into the registration form. It shows the transformation from the current
 * implementation to a design system-compliant version.
 */

import React from 'react';
import { PartialUserProfile } from '../../types/profile';
import { 
  FormFieldEnhanced, 
  RadioGroupEnhanced, 
  FormSectionEnhanced 
} from './FormFieldEnhanced';

interface BasicInfoStepEnhancedProps {
  formData: PartialUserProfile;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
  isLoading?: boolean;
}

/**
 * Enhanced Basic Information Step with Design System Integration
 */
const BasicInfoStepEnhanced: React.FC<BasicInfoStepEnhancedProps> = ({
  formData,
  errors,
  onChange,
  isLoading = false
}) => {
  // Fitness level options with enhanced descriptions
  const fitnessLevelOptions = [
    {
      value: 'beginner',
      title: 'Beginner',
      description: 'New to exercise or returning after a long break. Perfect for building foundational fitness habits.'
    },
    {
      value: 'intermediate',
      title: 'Intermediate',
      description: 'Exercise regularly and have a good fitness base. Ready for more challenging workouts.'
    },
    {
      value: 'advanced',
      title: 'Advanced',
      description: 'Very experienced with intense training routines. Seeking complex, high-intensity challenges.'
    }
  ];

  // Fitness goals options
  const fitnessGoals = [
    { id: 'weight_loss', label: 'Weight Loss', description: 'Burn calories and reduce body fat' },
    { id: 'muscle_building', label: 'Muscle Building', description: 'Increase muscle mass and strength' },
    { id: 'endurance', label: 'Endurance', description: 'Improve cardiovascular fitness' },
    { id: 'flexibility', label: 'Flexibility', description: 'Enhance mobility and range of motion' },
    { id: 'general_fitness', label: 'General Fitness', description: 'Overall health and wellness' },
    { id: 'strength', label: 'Strength', description: 'Build functional strength and power' }
  ];

  const handleFitnessLevelChange = (value: string) => {
    onChange('fitnessLevel', value);
  };

  const handleGoalChange = (goalId: string, checked: boolean) => {
    const currentGoals = formData.goals || [];
    if (checked) {
      onChange('goals', [...currentGoals, goalId]);
    } else {
      onChange('goals', currentGoals.filter(goal => goal !== goalId));
    }
  };

  return (
    <div className="form-step basic-info-step-enhanced">
      {/* Step Header */}
      <div className="form-step__header">
        <h2 className="form-step__title">Basic Information</h2>
        <p className="form-step__description">
          Let's start with your personal information and fitness details to create 
          a personalized workout experience just for you.
        </p>
      </div>

      {/* Personal Information Section */}
      <FormSectionEnhanced
        title="Personal Information"
        description="Basic details to personalize your experience"
      >
        <div className="form-row">
          <FormFieldEnhanced
            label="First Name"
            required
            error={errors.firstName}
            loading={isLoading}
            hint="Enter your preferred first name"
          >
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ''}
              onChange={(e) => onChange('firstName', e.target.value)}
              placeholder="Enter your first name"
            />
          </FormFieldEnhanced>

          <FormFieldEnhanced
            label="Last Name"
            required
            error={errors.lastName}
            loading={isLoading}
            hint="Enter your family name"
          >
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ''}
              onChange={(e) => onChange('lastName', e.target.value)}
              placeholder="Enter your last name"
            />
          </FormFieldEnhanced>
        </div>

        <FormFieldEnhanced
          label="Email Address"
          required
          error={errors.email}
          loading={isLoading}
          hint="We'll use this to send you workout updates and progress reports"
        >
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="Enter your email address"
          />
        </FormFieldEnhanced>
      </FormSectionEnhanced>

      {/* Fitness Level Section */}
      <FormSectionEnhanced
        title="Fitness Level"
        description="Help us understand your current fitness experience"
      >
        <RadioGroupEnhanced
          title="What is your current fitness level?"
          description="This helps us recommend appropriate workout intensity and progression"
          value={formData.fitnessLevel || ''}
          onChange={handleFitnessLevelChange}
          options={fitnessLevelOptions}
          name="fitnessLevel"
          error={errors.fitnessLevel}
          disabled={isLoading}
        />
      </FormSectionEnhanced>

      {/* Fitness Goals Section */}
      <FormSectionEnhanced
        title="Fitness Goals"
        description="Select all goals that apply to you"
      >
        <div className="checkbox-group-enhanced">
          <div className="checkbox-group-enhanced__title">
            What are your fitness goals?
          </div>
          <div className="checkbox-group-enhanced__description">
            Choose multiple goals to create a well-rounded fitness plan
          </div>
          
          <div className="checkbox-group-enhanced__options">
            {fitnessGoals.map((goal) => (
              <div key={goal.id} className="checkbox-option-enhanced">
                <input
                  type="checkbox"
                  id={goal.id}
                  name="goals"
                  value={goal.id}
                  checked={formData.goals?.includes(goal.id) || false}
                  onChange={(e) => handleGoalChange(goal.id, e.target.checked)}
                  disabled={isLoading}
                  className="checkbox-option-enhanced__input"
                />
                <label htmlFor={goal.id} className="checkbox-option-enhanced__label">
                  <div className="checkbox-option-enhanced__indicator" />
                  <div className="checkbox-option-enhanced__content">
                    <span className="checkbox-option-enhanced__title">{goal.label}</span>
                    <span className="checkbox-option-enhanced__description">{goal.description}</span>
                  </div>
                </label>
              </div>
            ))}
          </div>
          
          {errors.goals && (
            <div className="form-field-enhanced__error">
              {errors.goals}
            </div>
          )}
        </div>

        {/* Custom Goal Input */}
        {formData.goals?.includes('other') && (
          <FormFieldEnhanced
            label="Custom Goal"
            error={errors.customGoal}
            loading={isLoading}
            hint="Describe your specific fitness goal in detail"
          >
            <textarea
              name="customGoal"
              value={formData.customGoal || ''}
              onChange={(e) => onChange('customGoal', e.target.value)}
              placeholder="Describe your custom fitness goal..."
              rows={3}
            />
          </FormFieldEnhanced>
        )}
      </FormSectionEnhanced>

      {/* Progress Indicator */}
      {isLoading && (
        <div className="form-step__loading">
          <div className="loading-spinner" />
          <span>Saving your information...</span>
        </div>
      )}
    </div>
  );
};

export default BasicInfoStepEnhanced; 