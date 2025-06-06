/**
 * SessionInputsPanel Component
 * 
 * This component provides session-specific inputs that change frequently
 * to tailor workouts to the user's current state.
 */
import React, { useState } from 'react';
import { SessionSpecificInputs } from '../../types/workout';
import { ChevronDown } from 'lucide-react';
import './SessionInputsPanel.scss';

/**
 * Focus area options for workouts
 */
const FOCUS_AREA_OPTIONS = [
  { id: 'upper-body', label: 'Upper Body' },
  { id: 'lower-body', label: 'Lower Body' },
  { id: 'core', label: 'Core' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'chest', label: 'Chest' },
  { id: 'arms', label: 'Arms' },
  { id: 'mobility', label: 'Mobility/Flexibility' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'recovery', label: 'Recovery/Stretching' }
];



/**
 * Body areas that might experience soreness
 */
const BODY_AREA_OPTIONS = [
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms' },
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'core', label: 'Core/Abs' },
  { id: 'hips', label: 'Hips' },
  { id: 'legs', label: 'Legs' },
  { id: 'knees', label: 'Knees' },
  { id: 'ankles', label: 'Ankles' }
];

interface SessionInputsPanelProps {
  /** Current session input values */
  sessionInputs: SessionSpecificInputs;
  /** Update session inputs */
  onSessionInputsChange: (inputs: SessionSpecificInputs) => void;
  /** Panel expanded state */
  isExpanded?: boolean;
  /** Toggle expanded state */
  onToggleExpand?: () => void;
}

/**
 * Component for collecting session-specific workout inputs
 */
export const SessionInputsPanel: React.FC<SessionInputsPanelProps> = ({
  sessionInputs,
  onSessionInputsChange,
  isExpanded = true,
  onToggleExpand = () => {}
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  /**
   * Handle dropdown focus
   */
  const handleDropdownFocus = (id: string) => {
    setActiveDropdown(id);
  };

  /**
   * Handle dropdown blur
   */
  const handleDropdownBlur = () => {
    setActiveDropdown(null);
  };



  /**
   * Handle change in energy level
   */
  const handleEnergyLevelChange = (value: number) => {
    onSessionInputsChange({
      ...sessionInputs,
      energyLevel: value
    });
  };

  /**
   * Handle change in mood level
   */
  const handleMoodLevelChange = (value: number) => {
    onSessionInputsChange({
      ...sessionInputs,
      moodLevel: value
    });
  };
  
  /**
   * Handle change in sleep quality
   */
  const handleSleepQualityChange = (value: number) => {
    onSessionInputsChange({
      ...sessionInputs,
      sleepQuality: value
    });
  };

  /**
   * Handle change in focus area selection
   */
  const handleFocusAreaChange = (id: string, checked: boolean) => {
    const currentFocusAreas = sessionInputs.focusArea || [];
    let newFocusAreas: string[];
    
    if (checked) {
      newFocusAreas = [...currentFocusAreas, id];
    } else {
      newFocusAreas = currentFocusAreas.filter(item => item !== id);
    }
    
    onSessionInputsChange({
      ...sessionInputs,
      focusArea: newFocusAreas
    });
  };

  /**
   * Handle change in soreness selection
   */
  const handleSorenessChange = (id: string, checked: boolean) => {
    const currentSoreness = sessionInputs.currentSoreness || [];
    let newSoreness: string[];
    
    if (checked) {
      newSoreness = [...currentSoreness, id];
    } else {
      newSoreness = currentSoreness.filter(item => item !== id);
    }
    
    onSessionInputsChange({
      ...sessionInputs,
      currentSoreness: newSoreness
    });
  };



  /**
   * Render a rating selector (1-5 scale)
   */
  const renderRatingSelector = (
    value: number | undefined,
    onChange: (value: number) => void,
    labels: string[] = ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
  ) => {
    return (
      <div className="session-inputs__rating">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={`session-inputs__rating-button ${value === rating ? 'active' : ''}`}
            onClick={() => onChange(rating)}
          >
            {rating}
          </button>
        ))}
        <div className="session-inputs__rating-labels">
          <span>{labels[0]}</span>
          <span>{labels[4]}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`session-inputs-panel ${isExpanded ? 'expanded' : ''}`}>
      <div className="session-inputs-panel__header" onClick={onToggleExpand}>
        <h3 className="session-inputs-panel__title">Today's Workout Factors</h3>
        <button 
          type="button" 
          className="session-inputs-panel__toggle"
          onClick={(e) => {
            e.stopPropagation(); // Prevent double firing with header click
            onToggleExpand();
          }}
        >
          {isExpanded ? <ChevronDown /> : <ChevronDown style={{ transform: 'rotate(-90deg)' }} />}
        </button>
      </div>

      {isExpanded && (
        <div className="session-inputs-panel__content">

          {/* Energy Level */}
          <div className="session-inputs__form-group">
            <label className="session-inputs__label">
              Energy/motivation level today
            </label>
            {renderRatingSelector(
              sessionInputs.energyLevel,
              handleEnergyLevelChange
            )}
          </div>

          {/* Focus Area */}
          <div className="session-inputs__form-group">
            <label className="session-inputs__label">
              Focus area for today's workout
            </label>
            <div className="session-inputs__checkbox-grid">
              {FOCUS_AREA_OPTIONS.map(option => (
                <label key={option.id} className="session-inputs__checkbox-label">
                  <input
                    type="checkbox"
                    className="session-inputs__checkbox"
                    checked={(sessionInputs.focusArea || []).includes(option.id)}
                    onChange={(e) => handleFocusAreaChange(option.id, e.target.checked)}
                  />
                  <span className="session-inputs__checkbox-text">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Current Soreness */}
          <div className="session-inputs__form-group">
            <label className="session-inputs__label">
              Current soreness or discomfort
            </label>
            <div className="session-inputs__checkbox-grid">
              {BODY_AREA_OPTIONS.map(option => (
                <label key={option.id} className="session-inputs__checkbox-label">
                  <input
                    type="checkbox"
                    className="session-inputs__checkbox"
                    checked={(sessionInputs.currentSoreness || []).includes(option.id)}
                    onChange={(e) => handleSorenessChange(option.id, e.target.checked)}
                  />
                  <span className="session-inputs__checkbox-text">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mood/Stress Level */}
          <div className="session-inputs__form-group">
            <label className="session-inputs__label">
              Current stress level
            </label>
            {renderRatingSelector(
              sessionInputs.moodLevel,
              handleMoodLevelChange,
              ['Very Relaxed', 'Relaxed', 'Neutral', 'Stressed', 'Very Stressed']
            )}
          </div>

          {/* Sleep Quality */}
          <div className="session-inputs__form-group">
            <label className="session-inputs__label">
              Last night's sleep quality
            </label>
            {renderRatingSelector(
              sessionInputs.sleepQuality,
              handleSleepQualityChange,
              ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']
            )}
          </div>


        </div>
      )}
    </div>
  );
};

export default SessionInputsPanel; 