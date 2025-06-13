/**
 * LocationCard Component
 * 
 * Workout location selection card for daily workout customization.
 * Allows users to specify where they'll exercise today (Home, Gym, Outdoors, Travel).
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { BaseCardProps } from '../shared/types';
import { useProfile } from '../../../../../profile/context';
import { useLocationSelection } from './useLocationSelection';
import './LocationCard.scss';

interface LocationCardProps extends BaseCardProps {}

export const LocationCard: React.FC<LocationCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const {
    selectedLocation,
    handleLocationSelection,
    isProfileSufficient,
    profileMapping,
    locationOptions
  } = useLocationSelection();

  return (
    <FormFieldCard
      title="Location"
      description="Where will you work out today?"
      delay={delay}
      variant="complex"
      className={`location-card ${className}`}
    >
      <div className="location-card-structure">
        {/* HEADER: Profile Location Section */}
        <div className="location-card-header">
          {!profileLoading && !profileError && isProfileSufficient && profileMapping && profileMapping.displayData.location ? (
            <div className="profile-location-section">
              <div className="profile-location-label">Your Preferred Location:</div>
              <div className="profile-location-badges">
                <span 
                  className={`workout-type-badge profile-location-badge ${
                    selectedLocation === profileMapping.displayData.location.value ? 'active-today' : ''
                  }`}
                  onClick={() => handleLocationSelection(profileMapping.displayData.location.value)}
                  style={{ 
                    backgroundColor: selectedLocation === profileMapping.displayData.location.value 
                      ? `${profileMapping.displayData.location.color}40` 
                      : `${profileMapping.displayData.location.color}20`,
                    borderColor: selectedLocation === profileMapping.displayData.location.value
                      ? profileMapping.displayData.location.color
                      : `${profileMapping.displayData.location.color}60`,
                    color: profileMapping.displayData.location.color,
                    cursor: 'pointer',
                    opacity: selectedLocation === profileMapping.displayData.location.value ? 1 : 0.8
                  }}
                  title={`Click to ${selectedLocation === profileMapping.displayData.location.value ? 'deselect' : 'select'} your preferred location: ${profileMapping.displayData.location.context}`}
                >
                  <span className="workout-type-icon">
                    {profileMapping.displayData.location.value === 'home' && '🏠'}
                    {profileMapping.displayData.location.value === 'gym' && '🏋️'}
                    {profileMapping.displayData.location.value === 'outdoors' && '🌳'}
                    {(profileMapping.displayData.location.value === 'anywhere' || profileMapping.displayData.location.value === 'travel') && '✈️'}
                  </span>
                  {profileMapping.displayData.location.display}
                </span>
              </div>
            </div>
          ) : (
            <div className="header-fallback">
              <div className="header-fallback-text">
                <span className="header-icon">📍</span>
                <span>Workout Location</span>
              </div>
              <div className="header-subtitle">Set up your profile to see your preferred location</div>
            </div>
          )}
        </div>

        {/* BODY: Today's Location Selector */}
        <div className="location-card-body">
          <div className="location-selector-container">
            <div className="location-selector-label">
              Today's workout location:
            </div>
            
            <div className="location-grid">
              {locationOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`location-option ${selectedLocation === option.value ? 'selected' : ''}`}
                  onClick={() => handleLocationSelection(option.value)}
                  title={option.title}
                >
                  <span className="location-icon">{option.icon}</span>
                  <span className="location-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FormFieldCard>
  );
}; 