/**
 * Health Step Component
 * 
 * Form step for health considerations and physical limitations
 */
import React from 'react';
import { LimitationType, PartialUserProfile } from '../../types';

interface HealthStepProps {
  formData: PartialUserProfile;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

/**
 * Form step for health considerations and physical limitations
 */
const HealthStep: React.FC<HealthStepProps> = ({
  formData,
  errors,
  onChange
}) => {
  // Handle limitation selection change
  const handleLimitationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limitation = e.target.value as LimitationType;
    const isChecked = e.target.checked;
    
    let updatedLimitations = [...(formData.limitations || [])];
    
    if (isChecked) {
      // Add limitation if not already in the array
      if (!updatedLimitations.includes(limitation)) {
        updatedLimitations.push(limitation);
      }
      
      // If "none" is selected, remove all other limitations
      if (limitation === 'none') {
        updatedLimitations = ['none'];
      } else {
        // If another limitation is selected, remove "none"
        updatedLimitations = updatedLimitations.filter(lim => lim !== 'none');
      }
    } else {
      // Remove limitation if it exists
      updatedLimitations = updatedLimitations.filter(lim => lim !== limitation);
      
      // If all limitations are removed, add "none"
      if (updatedLimitations.length === 0) {
        updatedLimitations = ['none'];
      }
    }
    
    onChange('limitations', updatedLimitations);
  };
  
  // Handle text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.name, e.target.value);
  };
  
  return (
    <div className="form-step health-step">
      <h2>Health & Safety</h2>
      <p className="step-description">
        Help us keep you safe by sharing any health considerations or physical limitations.
      </p>
      
      <div className="form-section">
        <h3>Do you have any physical limitations?</h3>
        <p>Select all that apply</p>
        
        <div className="checkbox-group limitation-group">
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="none_limitation"
              name="limitations"
              value="none"
              checked={formData.limitations?.includes('none')}
              onChange={handleLimitationChange}
            />
            <label htmlFor="none_limitation">None</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="lower_back"
              name="limitations"
              value="lower_back"
              checked={formData.limitations?.includes('lower_back')}
              onChange={handleLimitationChange}
            />
            <label htmlFor="lower_back">Lower Back Issues</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="knee"
              name="limitations"
              value="knee"
              checked={formData.limitations?.includes('knee')}
              onChange={handleLimitationChange}
            />
            <label htmlFor="knee">Knee Problems</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="shoulder"
              name="limitations"
              value="shoulder"
              checked={formData.limitations?.includes('shoulder')}
              onChange={handleLimitationChange}
            />
            <label htmlFor="shoulder">Shoulder Issues</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="hip"
              name="limitations"
              value="hip"
              checked={formData.limitations?.includes('hip')}
              onChange={handleLimitationChange}
            />
            <label htmlFor="hip">Hip Problems</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="neck"
              name="limitations"
              value="neck"
              checked={formData.limitations?.includes('neck')}
              onChange={handleLimitationChange}
            />
            <label htmlFor="neck">Neck Issues</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="wrist"
              name="limitations"
              value="wrist"
              checked={formData.limitations?.includes('wrist')}
              onChange={handleLimitationChange}
            />
            <label htmlFor="wrist">Wrist Problems</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="ankle"
              name="limitations"
              value="ankle"
              checked={formData.limitations?.includes('ankle')}
              onChange={handleLimitationChange}
            />
            <label htmlFor="ankle">Ankle Issues</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="cardiovascular"
              name="limitations"
              value="cardiovascular"
              checked={formData.limitations?.includes('cardiovascular')}
              onChange={handleLimitationChange}
            />
            <label htmlFor="cardiovascular">Cardiovascular Conditions</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="other_limitation"
              name="limitations"
              value="other"
              checked={formData.limitations?.includes('other')}
              onChange={handleLimitationChange}
            />
            <label htmlFor="other_limitation">Other Limitations</label>
          </div>
        </div>
        
        {errors.limitations && (
          <div className="error-message">{errors.limitations}</div>
        )}
        
        {(formData.limitations?.length > 0 && !formData.limitations.includes('none')) && (
          <div className="form-field">
            <label htmlFor="limitationNotes">Please provide details about your limitations:</label>
            <textarea
              id="limitationNotes"
              name="limitationNotes"
              value={formData.limitationNotes || ''}
              onChange={handleTextChange}
              placeholder="Describe your specific limitations and how they affect your workouts..."
              rows={3}
            />
            
            {errors.limitationNotes && (
              <div className="error-message">{errors.limitationNotes}</div>
            )}
          </div>
        )}
      </div>
      
      <div className="form-section">
        <h3>Any other medical conditions we should know about?</h3>
        <p className="section-description">
          This information helps us create safer workouts. Optional but recommended.
        </p>
        
        <div className="form-field">
          <textarea
            id="medicalConditions"
            name="medicalConditions"
            value={formData.medicalConditions || ''}
            onChange={handleTextChange}
            placeholder="Enter any relevant medical conditions or health concerns..."
            rows={3}
          />
          
          {errors.medicalConditions && (
            <div className="error-message">{errors.medicalConditions}</div>
          )}
        </div>
      </div>
      
      <div className="form-note">
        <p>
          <strong>Note:</strong> This information is used only to create safer, more appropriate 
          workout plans. It is stored securely and not shared with third parties.
        </p>
      </div>
    </div>
  );
};

export default HealthStep; 