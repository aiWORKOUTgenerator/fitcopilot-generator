/**
 * Equipment Step Component
 * 
 * Form step for selecting available equipment and workout location
 */
import React from 'react';
import { Equipment, PartialUserProfile, WorkoutLocation } from '../../types';

interface EquipmentStepProps {
  formData: PartialUserProfile;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

/**
 * Form step for selecting available equipment and workout location
 */
const EquipmentStep: React.FC<EquipmentStepProps> = ({
  formData,
  errors,
  onChange
}) => {
  // Handle equipment selection change
  const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const equipment = e.target.value as Equipment;
    const isChecked = e.target.checked;
    
    let updatedEquipment = [...(formData.availableEquipment || [])];
    
    if (isChecked) {
      // Add equipment if not already in the array
      if (!updatedEquipment.includes(equipment)) {
        updatedEquipment.push(equipment);
      }
      
      // If "none" is selected, remove all other equipment
      if (equipment === 'none') {
        updatedEquipment = ['none'];
      } else {
        // If another equipment is selected, remove "none"
        updatedEquipment = updatedEquipment.filter(eq => eq !== 'none');
      }
    } else {
      // Remove equipment if it exists
      updatedEquipment = updatedEquipment.filter(eq => eq !== equipment);
      
      // If all equipment is removed, add "none"
      if (updatedEquipment.length === 0) {
        updatedEquipment = ['none'];
      }
    }
    
    onChange('availableEquipment', updatedEquipment);
  };
  
  // Handle custom equipment change
  const handleCustomEquipmentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange('customEquipment', e.target.value);
  };
  
  // Handle location change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('preferredLocation', e.target.value as WorkoutLocation);
  };
  
  return (
    <div className="form-step equipment-step">
      <h2>Available Equipment</h2>
      <p className="step-description">
        Select the equipment you have access to so we can create workouts that fit your setup.
      </p>
      
      <div className="form-section">
        <h3>What equipment do you have access to?</h3>
        <p>Select all that apply</p>
        
        <div className="checkbox-group equipment-group">
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="none"
              name="availableEquipment"
              value="none"
              checked={formData.availableEquipment?.includes('none')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="none">None / Bodyweight only</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="dumbbells"
              name="availableEquipment"
              value="dumbbells"
              checked={formData.availableEquipment?.includes('dumbbells')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="dumbbells">Dumbbells</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="resistance_bands"
              name="availableEquipment"
              value="resistance_bands"
              checked={formData.availableEquipment?.includes('resistance_bands')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="resistance_bands">Resistance Bands</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="barbell"
              name="availableEquipment"
              value="barbell"
              checked={formData.availableEquipment?.includes('barbell')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="barbell">Barbell</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="kettlebell"
              name="availableEquipment"
              value="kettlebell"
              checked={formData.availableEquipment?.includes('kettlebell')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="kettlebell">Kettlebell</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="pull_up_bar"
              name="availableEquipment"
              value="pull_up_bar"
              checked={formData.availableEquipment?.includes('pull_up_bar')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="pull_up_bar">Pull-up Bar</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="bench"
              name="availableEquipment"
              value="bench"
              checked={formData.availableEquipment?.includes('bench')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="bench">Weight Bench</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="stability_ball"
              name="availableEquipment"
              value="stability_ball"
              checked={formData.availableEquipment?.includes('stability_ball')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="stability_ball">Stability Ball</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="treadmill"
              name="availableEquipment"
              value="treadmill"
              checked={formData.availableEquipment?.includes('treadmill')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="treadmill">Treadmill</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="bicycle"
              name="availableEquipment"
              value="bicycle"
              checked={formData.availableEquipment?.includes('bicycle')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="bicycle">Exercise Bike</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="rowing_machine"
              name="availableEquipment"
              value="rowing_machine"
              checked={formData.availableEquipment?.includes('rowing_machine')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="rowing_machine">Rowing Machine</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="elliptical"
              name="availableEquipment"
              value="elliptical"
              checked={formData.availableEquipment?.includes('elliptical')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="elliptical">Elliptical</label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="other"
              name="availableEquipment"
              value="other"
              checked={formData.availableEquipment?.includes('other')}
              onChange={handleEquipmentChange}
            />
            <label htmlFor="other">Other Equipment</label>
          </div>
        </div>
        
        {errors.availableEquipment && (
          <div className="error-message">{errors.availableEquipment}</div>
        )}
        
        {formData.availableEquipment?.includes('other') && (
          <div className="form-field">
            <label htmlFor="customEquipment">Please specify your equipment:</label>
            <textarea
              id="customEquipment"
              name="customEquipment"
              value={formData.customEquipment || ''}
              onChange={handleCustomEquipmentChange}
              placeholder="List any additional equipment you have..."
              rows={2}
            />
            
            {errors.customEquipment && (
              <div className="error-message">{errors.customEquipment}</div>
            )}
          </div>
        )}
      </div>
      
      <div className="form-section">
        <h3>Where do you prefer to work out?</h3>
        
        <div className="radio-group">
          <div className="radio-option">
            <input
              type="radio"
              id="home"
              name="preferredLocation"
              value="home"
              checked={formData.preferredLocation === 'home'}
              onChange={handleLocationChange}
            />
            <label htmlFor="home">At Home</label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="gym"
              name="preferredLocation"
              value="gym"
              checked={formData.preferredLocation === 'gym'}
              onChange={handleLocationChange}
            />
            <label htmlFor="gym">At the Gym</label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="outdoors"
              name="preferredLocation"
              value="outdoors"
              checked={formData.preferredLocation === 'outdoors'}
              onChange={handleLocationChange}
            />
            <label htmlFor="outdoors">Outdoors</label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="anywhere"
              name="preferredLocation"
              value="anywhere"
              checked={formData.preferredLocation === 'anywhere'}
              onChange={handleLocationChange}
            />
            <label htmlFor="anywhere">Anywhere / No Preference</label>
          </div>
        </div>
        
        {errors.preferredLocation && (
          <div className="error-message">{errors.preferredLocation}</div>
        )}
      </div>
    </div>
  );
};

export default EquipmentStep; 