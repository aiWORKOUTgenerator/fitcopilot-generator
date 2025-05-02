/**
 * Basic Info Step Component
 * 
 * Form step for basic fitness information
 */
import React from 'react';
import { FitnessGoal, FitnessLevel, PartialUserProfile } from '../../types';

interface BasicInfoStepProps {
  formData: PartialUserProfile;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

/**
 * Form step for basic fitness information
 */
const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  errors,
  onChange
}) => {
  // Handle fitness level change
  const handleFitnessLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('fitnessLevel', e.target.value as FitnessLevel);
  };
  
  // Handle goal selection
  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const goal = e.target.value as FitnessGoal;
    const isChecked = e.target.checked;
    
    let updatedGoals = [...(formData.goals || [])];
    
    if (isChecked) {
      // Add goal if not already in the array
      if (!updatedGoals.includes(goal)) {
        updatedGoals.push(goal);
      }
    } else {
      // Remove goal if it exists
      updatedGoals = updatedGoals.filter(g => g !== goal);
    }
    
    onChange('goals', updatedGoals);
  };
  
  // Handle custom goal change
  const handleCustomGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange('customGoal', e.target.value);
  };
  
  return (
    <div className="form-step basic-info-step">
      <h2>Basic Fitness Information</h2>
      <p className="step-description">
        Let's start with some basic information about your fitness level and goals.
      </p>
      
      <div className="form-section">
        <h3>What is your fitness level?</h3>
        
        <div className="radio-group">
          <div className="radio-option">
            <input
              type="radio"
              id="beginner"
              name="fitnessLevel"
              value="beginner"
              checked={formData.fitnessLevel === 'beginner'}
              onChange={handleFitnessLevelChange}
            />
            <label htmlFor="beginner">
              <strong>Beginner</strong>
              <span className="option-description">New to exercise or returning after a long break</span>
            </label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="intermediate"
              name="fitnessLevel"
              value="intermediate"
              checked={formData.fitnessLevel === 'intermediate'}
              onChange={handleFitnessLevelChange}
            />
            <label htmlFor="intermediate">
              <strong>Intermediate</strong>
              <span className="option-description">Exercise regularly and have good fitness base</span>
            </label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="advanced"
              name="fitnessLevel"
              value="advanced"
              checked={formData.fitnessLevel === 'advanced'}
              onChange={handleFitnessLevelChange}
            />
            <label htmlFor="advanced">
              <strong>Advanced</strong>
              <span className="option-description">Very experienced with intense training routines</span>
            </label>
          </div>
        </div>
        
        {errors.fitnessLevel && (
          <div className="error-message">{errors.fitnessLevel}</div>
        )}
      </div>
      
      <div className="form-section">
        <h3>What are your fitness goals?</h3>
        <p>Select all that apply</p>
        
        <div className="checkbox-group">
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="weight_loss"
              name="goals"
              value="weight_loss"
              checked={formData.goals?.includes('weight_loss')}
              onChange={handleGoalChange}
            />
            <label htmlFor="weight_loss">Weight Loss</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="muscle_building"
              name="goals"
              value="muscle_building"
              checked={formData.goals?.includes('muscle_building')}
              onChange={handleGoalChange}
            />
            <label htmlFor="muscle_building">Muscle Building</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="endurance"
              name="goals"
              value="endurance"
              checked={formData.goals?.includes('endurance')}
              onChange={handleGoalChange}
            />
            <label htmlFor="endurance">Endurance</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="flexibility"
              name="goals"
              value="flexibility"
              checked={formData.goals?.includes('flexibility')}
              onChange={handleGoalChange}
            />
            <label htmlFor="flexibility">Flexibility</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="general_fitness"
              name="goals"
              value="general_fitness"
              checked={formData.goals?.includes('general_fitness')}
              onChange={handleGoalChange}
            />
            <label htmlFor="general_fitness">General Fitness</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="strength"
              name="goals"
              value="strength"
              checked={formData.goals?.includes('strength')}
              onChange={handleGoalChange}
            />
            <label htmlFor="strength">Strength</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="rehabilitation"
              name="goals"
              value="rehabilitation"
              checked={formData.goals?.includes('rehabilitation')}
              onChange={handleGoalChange}
            />
            <label htmlFor="rehabilitation">Rehabilitation</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="sport_specific"
              name="goals"
              value="sport_specific"
              checked={formData.goals?.includes('sport_specific')}
              onChange={handleGoalChange}
            />
            <label htmlFor="sport_specific">Sport-Specific Training</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="custom"
              name="goals"
              value="custom"
              checked={formData.goals?.includes('custom')}
              onChange={handleGoalChange}
            />
            <label htmlFor="custom">Other/Custom</label>
          </div>
        </div>
        
        {errors.goals && (
          <div className="error-message">{errors.goals}</div>
        )}
        
        {formData.goals?.includes('custom') && (
          <div className="form-field">
            <label htmlFor="customGoal">Please specify your goal:</label>
            <textarea
              id="customGoal"
              name="customGoal"
              value={formData.customGoal || ''}
              onChange={handleCustomGoalChange}
              placeholder="Tell us more about your specific fitness goal..."
              rows={3}
            />
            
            {errors.customGoal && (
              <div className="error-message">{errors.customGoal}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoStep; 