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

  // Handle height unit change - convert between formats
  const handleHeightUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    const currentHeight = formData.height;
    const currentUnit = formData.heightUnit || 'cm';
    
    // Convert height when switching units
    if (currentHeight && currentUnit !== newUnit) {
      let convertedHeight: number;
      
      if (currentUnit === 'cm' && newUnit === 'ft') {
        // Convert cm to total inches, then to feet (as decimal)
        const totalInches = currentHeight / 2.54;
        convertedHeight = Math.round(totalInches * 10) / 10; // Round to 1 decimal place
      } else if (currentUnit === 'ft' && newUnit === 'cm') {
        // Convert feet (as decimal) to cm
        const totalInches = currentHeight * 12;
        convertedHeight = Math.round(totalInches * 2.54);
      } else {
        convertedHeight = currentHeight;
      }
      
      onChange('height', convertedHeight);
    }
    
    onChange('heightUnit', newUnit);
  };

  // Handle feet and inches input for height
  const handleFeetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const feet = parseInt(e.target.value) || 0;
    const inches = getInchesFromHeight(formData.height || 0);
    const totalInches = (feet * 12) + inches;
    onChange('height', totalInches);
  };

  const handleInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inches = parseInt(e.target.value) || 0;
    const feet = getFeetFromHeight(formData.height || 0);
    const totalInches = (feet * 12) + inches;
    onChange('height', totalInches);
  };

  // Helper functions for feet/inches conversion
  const getFeetFromHeight = (totalInches: number): number => {
    return Math.floor(totalInches / 12);
  };

  const getInchesFromHeight = (totalInches: number): number => {
    return Math.round(totalInches % 12);
  };

  // Determine if we should show feet/inches inputs
  const showFeetInches = formData.heightUnit === 'ft';
  
  return (
    <div className="form-step body-metrics-step">
      <h2>Body Metrics</h2>
      <p className="step-description">
        Help us understand your physical characteristics for more accurate workout recommendations.
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
            {showFeetInches ? (
              <div className="height-feet-inches">
                <div className="feet-inches-inputs">
                  <div className="feet-input">
                    <input
                      type="number"
                      id="height-feet"
                      name="height-feet"
                      value={getFeetFromHeight(formData.height || 0)}
                      onChange={handleFeetChange}
                      placeholder="0"
                      min="0"
                      max="8"
                    />
                    <span className="input-label">ft</span>
                  </div>
                  <div className="inches-input">
                    <input
                      type="number"
                      id="height-inches"
                      name="height-inches"
                      value={getInchesFromHeight(formData.height || 0)}
                      onChange={handleInchesChange}
                      placeholder="0"
                      min="0"
                      max="11"
                    />
                    <span className="input-label">in</span>
                  </div>
                </div>
                <select
                  name="heightUnit"
                  value={formData.heightUnit || 'cm'}
                  onChange={handleHeightUnitChange}
                  className="height-unit-select"
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            ) : (
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
                  onChange={handleHeightUnitChange}
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            )}
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