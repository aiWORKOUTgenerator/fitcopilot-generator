import React, { useState } from 'react';
import { Card, Button } from '../../../components/ui';
import './InputStep.scss';

interface InputStepProps {
  onNext: (formData: any) => void;
}

const InputStep: React.FC<InputStepProps> = ({ onNext }) => {
  const [formData, setFormData] = useState({
    goal: '',
    fitnessLevel: '',
    duration: '',
    equipment: [],
    preferences: '',
    showAdvanced: false,
    focusAreas: [],
    injuries: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === 'equipment' || name === 'focusAreas') {
      setFormData(prev => {
        const currentValues = [...(prev[name] as string[])];
        
        if (checked) {
          return { ...prev, [name]: [...currentValues, value] };
        } else {
          return { ...prev, [name]: currentValues.filter(item => item !== value) };
        }
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="input-step-container dark-theme">
      <form onSubmit={handleSubmit}>
        <Card className="workout-form-card">
          <h2 className="form-title">Create Your Custom Workout</h2>
          
          <div className="form-group">
            <label htmlFor="goal" className="form-label">Your Fitness Goal</label>
            <select 
              id="goal" 
              name="goal" 
              className="form-control" 
              value={formData.goal} 
              onChange={handleChange}
              required
            >
              <option value="">Select a goal</option>
              <option value="weight-loss">Weight Loss</option>
              <option value="muscle-gain">Muscle Gain</option>
              <option value="endurance">Improve Endurance</option>
              <option value="strength">Build Strength</option>
              <option value="flexibility">Increase Flexibility</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Fitness Level</label>
            <div className="radio-group">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <label key={level} className="radio-option">
                  <input
                    type="radio"
                    name="fitnessLevel"
                    value={level.toLowerCase()}
                    checked={formData.fitnessLevel === level.toLowerCase()}
                    onChange={handleChange}
                    required
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="duration" className="form-label">Workout Duration</label>
            <select 
              id="duration" 
              name="duration" 
              className="form-control" 
              value={formData.duration} 
              onChange={handleChange}
              required
            >
              <option value="">Select duration</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Available Equipment</label>
            <div className="checkbox-group">
              {['Dumbbells', 'Barbell', 'Kettlebells', 'Resistance Bands', 'Bodyweight Only'].map(item => (
                <label key={item} className="checkbox-option">
                  <input
                    type="checkbox"
                    name="equipment"
                    value={item.toLowerCase().replace(' ', '-')}
                    checked={formData.equipment.includes(item.toLowerCase().replace(' ', '-'))}
                    onChange={handleCheckboxChange}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
          
          <div className="advanced-options">
            <div className="advanced-toggle" onClick={() => setFormData(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}>
              <span className="toggle-icon">{formData.showAdvanced ? '−' : '+'}</span>
              <span className="toggle-text">Advanced Options</span>
            </div>
            
            {formData.showAdvanced && (
              <div className="advanced-content">
                <div className="form-group">
                  <label className="form-label">Focus Areas</label>
                  <div className="checkbox-group focus-areas">
                    {['Core', 'Upper Body', 'Lower Body', 'Back', 'Chest', 'Arms', 'Shoulders', 'Legs'].map(area => (
                      <label key={area} className="checkbox-option">
                        <input
                          type="checkbox"
                          name="focusAreas"
                          value={area.toLowerCase().replace(' ', '-')}
                          checked={formData.focusAreas.includes(area.toLowerCase().replace(' ', '-'))}
                          onChange={handleCheckboxChange}
                        />
                        {area}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="injuries" className="form-label">Injuries or Limitations</label>
                  <textarea
                    id="injuries"
                    name="injuries"
                    className="form-control"
                    value={formData.injuries}
                    onChange={handleChange}
                    placeholder="Describe any injuries or physical limitations"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="preferences" className="form-label">Additional Preferences</label>
            <textarea
              id="preferences"
              name="preferences"
              className="form-control"
              value={formData.preferences}
              onChange={handleChange}
              placeholder="Any specific exercises you enjoy or dislike?"
            />
          </div>
          
          <div className="form-actions">
            <Button type="submit" className="btn-accent">Generate Workout</Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default InputStep; 