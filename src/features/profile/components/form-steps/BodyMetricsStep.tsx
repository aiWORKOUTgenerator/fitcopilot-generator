/**
 * Body Metrics Step Component
 * 
 * Form step for body measurements and demographics
 */
import React from 'react';
import { PartialUserProfile } from '../../types';

interface BodyMetricsStepProps {
  formData: PartialUserProfile;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

/**
 * Form step for body measurements and demographics
 */
const BodyMetricsStep: React.FC<BodyMetricsStepProps> = ({
  formData,
  errors,
  onChange
}) => {
  // Handle text/number input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name;
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    onChange(field, value);
  };
  
  // Handle select changes
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.name, e.target.value);
  };
  
  return (
    <div className="form-step body-metrics-step">
      <h2>Body Metrics</h2>
      <p className="step-description">
        These details are optional but help us customize your workout plans more effectively.
      </p>
      
      <div className="form-section">
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="weight">Weight</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight || ''}
                onChange={handleInputChange}
                placeholder="Enter your weight"
                min="0"
                step="0.1"
              />
              <select
                name="weightUnit"
                value={formData.weightUnit || 'kg'}
                onChange={handleSelectChange}
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
            {errors.weight && (
              <div className="error-message">{errors.weight}</div>
            )}
            {errors.weightUnit && (
              <div className="error-message">{errors.weightUnit}</div>
            )}
          </div>
          
          <div className="form-field">
            <label htmlFor="height">Height</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height || ''}
                onChange={handleInputChange}
                placeholder="Enter your height"
                min="0"
                step="0.1"
              />
              <select
                name="heightUnit"
                value={formData.heightUnit || 'cm'}
                onChange={handleSelectChange}
              >
                <option value="cm">cm</option>
                <option value="ft">ft</option>
              </select>
            </div>
            {errors.height && (
              <div className="error-message">{errors.height}</div>
            )}
            {errors.heightUnit && (
              <div className="error-message">{errors.heightUnit}</div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age || ''}
              onChange={handleInputChange}
              placeholder="Enter your age"
              min="0"
              max="120"
            />
            {errors.age && (
              <div className="error-message">{errors.age}</div>
            )}
          </div>
          
          <div className="form-field">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleSelectChange}
            >
              <option value="">Select gender (optional)</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <div className="error-message">{errors.gender}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="form-note">
        <p>
          <strong>Note:</strong> This information is used only to provide personalized workout 
          recommendations. You can skip this step if you prefer.
        </p>
      </div>
    </div>
  );
};

export default BodyMetricsStep; 