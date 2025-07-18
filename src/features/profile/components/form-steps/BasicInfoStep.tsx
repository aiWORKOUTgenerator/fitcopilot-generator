/**
 * Basic Info Step Component
 * 
 * Form step for basic fitness information - Enhanced with Design System
 */
import React from 'react';
import { FitnessGoal, FitnessLevel, PartialUserProfile } from '../../types';
import { 
  FormFieldEnhanced, 
  RadioGroupEnhanced, 
  FormSectionEnhanced 
} from '../enhanced';

interface BasicInfoStepProps {
  formData: PartialUserProfile;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

/**
 * Form step for basic fitness information with enhanced design system integration
 */
const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  errors,
  onChange
}) => {
  // Fitness level options with enhanced descriptions
  const fitnessLevelOptions = [
    {
      value: 'beginner',
      title: 'Beginner',
      description: 'New to exercise or returning after a long break'
    },
    {
      value: 'intermediate',
      title: 'Intermediate',
      description: 'Exercise regularly and have good fitness base'
    },
    {
      value: 'advanced',
      title: 'Advanced',
      description: 'Very experienced with intense training routines'
    }
  ];

  // Complete fitness goals list matching the original implementation
  const fitnessGoals = [
    { id: 'weight_loss', label: 'Weight Loss', description: 'Burn calories and reduce body fat' },
    { id: 'muscle_building', label: 'Muscle Building', description: 'Increase muscle mass and strength' },
    { id: 'endurance', label: 'Endurance', description: 'Improve cardiovascular fitness and stamina' },
    { id: 'flexibility', label: 'Flexibility', description: 'Enhance mobility and range of motion' },
    { id: 'general_fitness', label: 'General Fitness', description: 'Overall health and wellness improvement' },
    { id: 'strength', label: 'Strength', description: 'Build functional strength and power' },
    { id: 'rehabilitation', label: 'Rehabilitation', description: 'Recovery from injury or medical condition' },
    { id: 'sport_specific', label: 'Sport-Specific Training', description: 'Training for specific sports or activities' },
    { id: 'custom', label: 'Other/Custom', description: 'Specify your own unique fitness goal' }
  ];

  // Handle fitness level change
  const handleFitnessLevelChange = (value: string) => {
    onChange('fitnessLevel', value as FitnessLevel);
  };
  
  // Handle goal selection
  const handleGoalChange = (goalId: string, checked: boolean) => {
    const currentGoals = [...(formData.goals || [])];
    
    if (checked) {
      // Add goal if not already in the array
      if (!currentGoals.includes(goalId as FitnessGoal)) {
        currentGoals.push(goalId as FitnessGoal);
      }
    } else {
      // Remove goal if it exists
      const updatedGoals = currentGoals.filter(g => g !== goalId);
      onChange('goals', updatedGoals);
      return;
    }
    
    onChange('goals', currentGoals);
  };
  
  // Handle custom goal change
  const handleCustomGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange('customGoal', e.target.value);
  };
  
  return (
    <div className="form-step basic-info-step">
      <h2>Basic Information</h2>
      <p className="step-description">
        Let's start with some basic information about you to personalize your fitness experience.
      </p>
      
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
        <div className="form-field">
          <label className="form-field__label">
            What is your fitness level?
          </label>
          <p className="form-field__description">
            This helps us recommend appropriate workout intensity and progression
          </p>
          
          <div className="radio-group">
            {fitnessLevelOptions.map((option) => (
              <div key={option.value} className="radio-option">
                <input
                  type="radio"
                  id={option.value}
                  name="fitnessLevel"
                  value={option.value}
                  checked={formData.fitnessLevel === option.value}
                  onChange={(e) => handleFitnessLevelChange(e.target.value)}
                />
                <label htmlFor={option.value}>
                  <div className="option-content">
                    <span className="option-title">{option.title}</span>
                    <span className="option-description">{option.description}</span>
                  </div>
                </label>
              </div>
            ))}
          </div>
          
          {errors.fitnessLevel && (
            <div className="form-field__error">
              {errors.fitnessLevel}
            </div>
          )}
        </div>
      </FormSectionEnhanced>

      {/* Fitness Goals Section */}
      <FormSectionEnhanced
        title="Fitness Goals"
        description="Select all goals that apply to you"
      >
        <div className="form-field">
          <label className="form-field__label">
            What are your fitness goals?
          </label>
          <p className="form-field__description">
            Choose multiple goals to create a well-rounded fitness plan
          </p>
          
          <div className="checkbox-group">
            {fitnessGoals.map((goal) => (
              <div key={goal.id} className="checkbox-option">
                <input
                  type="checkbox"
                  id={goal.id}
                  name="goals"
                  value={goal.id}
                  checked={formData.goals?.includes(goal.id as FitnessGoal) || false}
                  onChange={(e) => handleGoalChange(goal.id, e.target.checked)}
                />
                <label htmlFor={goal.id}>
                  <div className="option-content">
                    <span className="option-title">{goal.label}</span>
                    <span className="option-description">{goal.description}</span>
                  </div>
                </label>
              </div>
            ))}
          </div>
          
          {errors.goals && (
            <div className="form-field__error">
              {errors.goals}
            </div>
          )}
        </div>

        {/* Custom Goal Input - Show when 'custom' goal is selected */}
        {formData.goals?.includes('custom') && (
          <FormFieldEnhanced
            label="Please specify your goal"
            error={errors.customGoal}
            hint="Tell us more about your specific fitness goal"
          >
            <textarea
              name="customGoal"
              value={formData.customGoal || ''}
              onChange={handleCustomGoalChange}
              placeholder="Tell us more about your specific fitness goal..."
              rows={3}
            />
          </FormFieldEnhanced>
        )}
      </FormSectionEnhanced>
    </div>
  );
};

export default BasicInfoStep; 