/**
 * Preferences Step Component
 * 
 * Form step for workout preferences and favorite exercises
 */
import React from 'react';
import { PartialUserProfile, WorkoutFrequency } from '../../types';

interface PreferencesStepProps {
  formData: PartialUserProfile;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

/**
 * Form step for workout preferences and favorite exercises
 */
const PreferencesStep: React.FC<PreferencesStepProps> = ({
  formData,
  errors,
  onChange
}) => {
  // Handle frequency change
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('workoutFrequency', e.target.value as WorkoutFrequency);
  };
  
  // Handle custom frequency change
  const handleCustomFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('customFrequency', e.target.value);
  };
  
  // Handle favorite exercise tags
  const handleExerciseTagsChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: string) => {
    // Store as string during editing to allow natural comma typing
    onChange(field, e.target.value);
  };
  
  // Handle exercise tags blur (convert to array when user finishes editing)
  const handleExerciseTagsBlur = (e: React.FocusEvent<HTMLTextAreaElement>, field: string) => {
    const values = e.target.value
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
    
    onChange(field, values);
  };
  
  // Get display value for exercise fields (convert array back to string for display)
  const getExerciseDisplayValue = (fieldValue: string[] | string | undefined): string => {
    if (Array.isArray(fieldValue)) {
      return fieldValue.join(', ');
    }
    return fieldValue || '';
  };
  
  // Handle preferred duration change
  const handlePreferredDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || undefined;
    onChange('preferredWorkoutDuration', value);
  };
  
  return (
    <div className="form-step preferences-step">
      <h2>Workout Preferences</h2>
      <p className="step-description">
        Help us tailor your workout experience to your preferences and schedule.
      </p>
      
      <div className="form-section">
        <h3>How often do you plan to work out?</h3>
        
        <div className="radio-group">
          <div className="radio-option">
            <input
              type="radio"
              id="freq_1-2"
              name="workoutFrequency"
              value="1-2"
              checked={formData.workoutFrequency === '1-2'}
              onChange={handleFrequencyChange}
            />
            <label htmlFor="freq_1-2">1-2 times per week</label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="freq_3-4"
              name="workoutFrequency"
              value="3-4"
              checked={formData.workoutFrequency === '3-4'}
              onChange={handleFrequencyChange}
            />
            <label htmlFor="freq_3-4">3-4 times per week</label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="freq_5+"
              name="workoutFrequency"
              value="5+"
              checked={formData.workoutFrequency === '5+'}
              onChange={handleFrequencyChange}
            />
            <label htmlFor="freq_5+">5+ times per week</label>
          </div>
          
          <div className="radio-option">
            <input
              type="radio"
              id="freq_custom"
              name="workoutFrequency"
              value="custom"
              checked={formData.workoutFrequency === 'custom'}
              onChange={handleFrequencyChange}
            />
            <label htmlFor="freq_custom">Custom schedule</label>
          </div>
        </div>
        
        {errors.workoutFrequency && (
          <div className="error-message">{errors.workoutFrequency}</div>
        )}
        
        {formData.workoutFrequency === 'custom' && (
          <div className="form-field">
            <label htmlFor="customFrequency">Describe your workout schedule:</label>
            <input
              type="text"
              id="customFrequency"
              name="customFrequency"
              value={formData.customFrequency || ''}
              onChange={handleCustomFrequencyChange}
              placeholder="e.g., 'Weekends only', 'Alternating days', etc."
            />
            
            {errors.customFrequency && (
              <div className="error-message">{errors.customFrequency}</div>
            )}
          </div>
        )}
      </div>
      
      <div className="form-section">
        <h3>Preferred Workout Duration</h3>
        <p>How long do you typically prefer your workouts to be?</p>
        
        <div className="form-field">
          <label htmlFor="preferredWorkoutDuration">
            Preferred Duration (minutes):
          </label>
          <input
            type="number"
            id="preferredWorkoutDuration"
            name="preferredWorkoutDuration"
            value={formData.preferredWorkoutDuration || ''}
            onChange={handlePreferredDurationChange}
            placeholder="e.g., 30"
            min="10"
            max="120"
            step="5"
          />
          <div className="form-hint">
            Enter your preferred workout duration in minutes (10-120 minutes)
          </div>
          
          {errors.preferredWorkoutDuration && (
            <div className="error-message">{errors.preferredWorkoutDuration}</div>
          )}
        </div>
      </div>
      
      <div className="form-section">
        <h3>Exercise Preferences (Optional)</h3>
        
        <div className="form-field">
          <label htmlFor="favoriteExercises">
            Favorite Exercises or Activities:
          </label>
          <textarea
            id="favoriteExercises"
            name="favoriteExercises"
            value={getExerciseDisplayValue(formData.favoriteExercises)}
            onChange={(e) => handleExerciseTagsChange(e, 'favoriteExercises')}
            onBlur={(e) => handleExerciseTagsBlur(e, 'favoriteExercises')}
            placeholder="Enter exercises you enjoy, separated by commas (e.g., 'squats, running, yoga')"
            rows={2}
          />
          <div className="form-hint">
            💡 Tip: Separate multiple exercises with commas. They'll be saved when you click outside the field.
          </div>
          
          {errors.favoriteExercises && (
            <div className="error-message">{errors.favoriteExercises}</div>
          )}
        </div>
        
        <div className="form-field">
          <label htmlFor="dislikedExercises">
            Exercises or Activities to Avoid:
          </label>
          <textarea
            id="dislikedExercises"
            name="dislikedExercises"
            value={getExerciseDisplayValue(formData.dislikedExercises)}
            onChange={(e) => handleExerciseTagsChange(e, 'dislikedExercises')}
            onBlur={(e) => handleExerciseTagsBlur(e, 'dislikedExercises')}
            placeholder="Enter exercises you dislike, separated by commas (e.g., 'burpees, running, jump rope')"
            rows={2}
          />
          <div className="form-hint">
            💡 Tip: Separate multiple exercises with commas. They'll be saved when you click outside the field.
          </div>
          
          {errors.dislikedExercises && (
            <div className="error-message">{errors.dislikedExercises}</div>
          )}
        </div>
      </div>
      
      <div className="form-completion-message">
        <h3>You're almost done!</h3>
        <p>
          Click 'Save Profile' to complete your profile setup and start receiving personalized workouts.
        </p>
      </div>
    </div>
  );
};

export default PreferencesStep; 