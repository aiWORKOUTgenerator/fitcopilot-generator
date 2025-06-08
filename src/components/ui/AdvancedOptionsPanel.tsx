import React, { useState } from 'react';
import { ChevronDown, Dumbbell, CheckSquare } from 'lucide-react';
import { Textarea } from './Textarea';
import { useProfile } from '../../features/profile/context';
import { mapProfileToWorkoutContext } from '../../features/workout-generator/utils/profileMapping';
import './AdvancedOptionsPanel.scss';

/**
 * Equipment option item structure
 */
export interface EquipmentOption {
  id: string;
  label: string;
}

/**
 * Advanced options panel props
 */
export interface AdvancedOptionsPanelProps {
  /** Equipment options available for selection */
  equipmentOptions: EquipmentOption[];
  /** Currently selected equipment */
  selectedEquipment: string[];
  /** Function to update equipment selections */
  onEquipmentChange: (equipment: string[]) => void;
  /** Workout intensity value (1-5) */
  intensity: number;
  /** Function to update intensity */
  onIntensityChange: (intensity: number) => void;
  /** Current preferences text value */
  preferences: string;
  /** Function to update preferences */
  onPreferencesChange: (preferences: string) => void;
  /** Current restrictions text value */
  restrictions: string;
  /** Function to update restrictions */
  onRestrictionsChange: (restrictions: string) => void;
  /** Additional className to apply */
  className?: string;
  /** Optional handler for auto-filling equipment from profile */
  onAutoFillEquipment?: (equipment: string[]) => void;
}

/**
 * Advanced options panel for workout customization
 * 
 * Provides equipment selection, intensity control, and text areas
 * for preferences and restrictions.
 */
export const AdvancedOptionsPanel: React.FC<AdvancedOptionsPanelProps> = ({
  equipmentOptions,
  selectedEquipment,
  onEquipmentChange,
  intensity,
  onIntensityChange,
  preferences,
  onPreferencesChange,
  restrictions,
  onRestrictionsChange,
  className = '',
  onAutoFillEquipment,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Get profile data for equipment badges with error handling
  let state, profile, profileLoading, profileMapping;
  try {
    const profileResult = useProfile();
    state = profileResult.state;
    profile = state.profile;
    profileLoading = state.loading;
    profileMapping = profile ? mapProfileToWorkoutContext(profile) : null;
  } catch (error) {
    console.error('[AdvancedOptionsPanel] Error calling useProfile hook:', error);
    // Fallback values
    state = { profile: null, loading: false, error: null };
    profile = null;
    profileLoading = false;
    profileMapping = null;
  }

  // Debug logging to understand what's happening
  React.useEffect(() => {
    console.log('[AdvancedOptionsPanel] Debug Info:', {
      profileState: state,
      profile: profile,
      profileLoading: profileLoading,
      profileMappingExists: !!profileMapping,
      useProfileType: typeof useProfile,
      profileContextAvailable: !!useProfile,
    });
  }, [state, profile, profileLoading, profileMapping]);

  /**
   * Toggle advanced options visibility
   */
  const toggleAdvancedOptions = () => {
    setShowAdvanced(!showAdvanced);
  };

  /**
   * Handle equipment selection/deselection
   */
  const handleEquipmentChange = (id: string) => {
    if (selectedEquipment.includes(id)) {
      // Remove from selection
      onEquipmentChange(selectedEquipment.filter(item => item !== id));
    } else {
      // Add to selection
      onEquipmentChange([...selectedEquipment, id]);
    }
  };

  /**
   * Handle preferences textarea change
   */
  const handlePreferencesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPreferencesChange(e.target.value);
  };

  /**
   * Handle restrictions textarea change
   */
  const handleRestrictionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onRestrictionsChange(e.target.value);
  };

  /**
   * Handle auto-fill equipment from profile
   */
  const handleAutoFillFromProfile = () => {
    if (profileMapping && onAutoFillEquipment) {
      onAutoFillEquipment(profileMapping.availableEquipment);
    }
  };

  return (
    <div className={`advanced-options-panel ${className}`}>
      <button 
        type="button" 
        className={`advanced-options-panel__toggle ${showAdvanced ? 'advanced-options-panel__toggle--open' : ''}`}
        onClick={toggleAdvancedOptions}
        aria-expanded={showAdvanced}
        aria-controls="advanced-options-content"
      >
        <div className="advanced-options-panel__toggle-left">
          <Dumbbell className="advanced-options-panel__toggle-icon" />
          <span className="advanced-options-panel__toggle-text">Advanced Options</span>
        </div>
        <ChevronDown className="advanced-options-panel__toggle-chevron" />
      </button>
      
      {showAdvanced && (
        <div 
          id="advanced-options-content"
          className="advanced-options-panel__content"
        >
          {/* Equipment Selection */}
          <div className="advanced-options-panel__section">
            <h3 className="advanced-options-panel__heading">Available Equipment</h3>
            
            {/* Profile Equipment Badge - Show user's profile equipment */}
            {/* Debug: Always show this section for now to test */}
            {!profileLoading && (
              <div className="advanced-options-panel__profile-context">
                <p className="advanced-options-panel__profile-label">
                  {profileMapping ? 'From your fitness profile:' : 'Profile data not available'}
                </p>
                
                {/* Debug info */}
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
                  Debug: Profile exists: {profile ? 'Yes' : 'No'}, 
                  Equipment count: {profileMapping?.displayData?.equipment?.length || 0}
                </div>
                
                {profileMapping && profileMapping.displayData.equipment.length > 0 ? (
                  <>
                    <div className="meta-badges">
                      {profileMapping.displayData.equipment.slice(0, 4).map((equipment, index) => (
                        <span 
                          key={equipment.value}
                          className="workout-type-badge"
                          onClick={handleAutoFillFromProfile}
                          style={{ cursor: 'pointer' }}
                          title={`Click to use: ${equipment.display}`}
                        >
                          {equipment.icon} {equipment.display}
                        </span>
                      ))}
                      {profileMapping.displayData.equipment.length > 4 && (
                        <span className="equipment-more-indicator">
                          +{profileMapping.displayData.equipment.length - 4} more
                        </span>
                      )}
                    </div>
                    <p className="advanced-options-panel__profile-hint">
                      💡 Click badges to auto-fill from your profile
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: '#666', fontStyle: 'italic' }}>
                    No equipment found in profile. Please update your fitness profile to see equipment badges here.
                  </p>
                )}
              </div>
            )}
            
            <div className="advanced-options-panel__checkbox-grid">
              {equipmentOptions.map(option => (
                <label key={option.id} className="advanced-options-panel__checkbox-label">
                  <input
                    type="checkbox"
                    className="advanced-options-panel__checkbox-input"
                    value={option.id}
                    checked={selectedEquipment.includes(option.id)}
                    onChange={() => handleEquipmentChange(option.id)}
                  />
                  <div className="advanced-options-panel__checkbox-box">
                    <CheckSquare size={14} className="advanced-options-panel__checkbox-indicator" />
                  </div>
                  <span className="advanced-options-panel__checkbox-text">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Workout Intensity */}
          <div className="advanced-options-panel__section">
            <h3 className="advanced-options-panel__heading">Workout Intensity</h3>
            <div className="advanced-options-panel__slider-container">
              <input
                type="range"
                className="advanced-options-panel__slider"
                min="1"
                max="5"
                value={intensity}
                onChange={(e) => onIntensityChange(parseInt(e.target.value))}
                aria-label="Workout intensity"
              />
              <div className="advanced-options-panel__slider-labels">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Preferences Input */}
          <div className="advanced-options-panel__section">
            <h3 className="advanced-options-panel__heading">Workout Preferences</h3>
            <div className="advanced-options-panel__textarea-wrapper">
              <Textarea
                id="preferences"
                value={preferences}
                onChange={handlePreferencesChange}
                placeholder="Enter workout preferences (e.g., prefer outdoor activities, enjoy HIIT workouts, like to focus on upper body, etc.)"
                rows={3}
                className="advanced-options-panel__textarea"
              />
            </div>
          </div>

          {/* Restrictions Input */}
          <div className="advanced-options-panel__section">
            <h3 className="advanced-options-panel__heading">Restrictions</h3>
            <div className="advanced-options-panel__textarea-wrapper">
              <Textarea
                id="restrictions"
                value={restrictions}
                onChange={handleRestrictionsChange}
                placeholder="Enter any exercise restrictions or physical limitations (e.g., no burpees or mountain climbers, recovering from knee injury, lower back pain, limited shoulder mobility, etc.)"
                rows={3}
                className="advanced-options-panel__textarea"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 