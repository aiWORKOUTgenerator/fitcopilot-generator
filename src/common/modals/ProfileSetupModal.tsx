/**
 * ProfileSetupModal Component
 * 
 * Modal for users to set up their fitness profile
 */
import React, { useState } from 'react';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

/**
 * Modal for setting up user fitness profile with goals and preferences
 */
const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [formData, setFormData] = useState({
    fitnessLevel: 'intermediate',
    fitnessGoals: [] as string[],
    restrictions: '',
    preferredEquipment: [] as string[]
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        [name]: [...(prev[name as keyof typeof prev] as string[]), value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: (prev[name as keyof typeof prev] as string[]).filter(item => item !== value)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would save the profile data to user settings
    console.log('Profile data to save:', formData);
    onComplete();
  };

  return (
    <div className="profile-setup-modal">
      <div className="profile-setup-overlay" onClick={onClose}></div>
      <div className="profile-setup-content">
        <h2>Complete Your Fitness Profile</h2>
        <p>Help us personalize your workout recommendations</p>
        
        <form onSubmit={handleSubmit}>
          {/* Fitness level selection */}
          <div className="form-group">
            <label htmlFor="fitnessLevel">Fitness Level</label>
            <select 
              id="fitnessLevel" 
              name="fitnessLevel"
              value={formData.fitnessLevel}
              onChange={handleChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          {/* Fitness goals selection */}
          <div className="form-group">
            <label>Fitness Goals</label>
            <div className="checkbox-group">
              {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Health'].map(goal => (
                <label key={goal} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="fitnessGoals"
                    value={goal}
                    checked={formData.fitnessGoals.includes(goal)}
                    onChange={handleMultiChange}
                  />
                  {goal}
                </label>
              ))}
            </div>
          </div>
          
          {/* Restrictions or limitations */}
          <div className="form-group">
            <label htmlFor="restrictions">Restrictions or Limitations</label>
            <textarea
              id="restrictions"
              name="restrictions"
              value={formData.restrictions}
              onChange={handleChange}
              placeholder="List any injuries, health conditions, or limitations..."
            />
          </div>
          
          {/* Available equipment */}
          <div className="form-group">
            <label>Available Equipment</label>
            <div className="checkbox-group">
              {['Dumbbells', 'Resistance Bands', 'Yoga Mat', 'Pull-up Bar', 'Kettlebell', 'None'].map(equipment => (
                <label key={equipment} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="preferredEquipment"
                    value={equipment}
                    checked={formData.preferredEquipment.includes(equipment)}
                    onChange={handleMultiChange}
                  />
                  {equipment}
                </label>
              ))}
            </div>
          </div>
          
          <div className="button-group">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupModal; 