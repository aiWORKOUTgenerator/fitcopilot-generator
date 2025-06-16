/**
 * GenerationProfileSection Component
 * 
 * Displays profile data as it's used by GenerateEndpoint.php for workout generation
 * Shows the actual values that are retrieved and used in the AI prompt generation
 */
import React from 'react';
import { Profile } from '../types/profile';

interface GenerationProfileSectionProps {
  profile: Profile;
}

export const GenerationProfileSection: React.FC<GenerationProfileSectionProps> = ({ profile }) => {
  // Format physical stats as they appear in GenerateEndpoint.php
  const formatPhysicalStats = () => {
    const stats = [];
    if (profile.age) stats.push(`age=${profile.age}`);
    if (profile.weight) stats.push(`weight=${profile.weight}${profile.weightUnit || 'lbs'}`);
    if (profile.height) {
      const heightUnit = profile.heightUnit || 'ft';
      if (heightUnit === 'ft') {
        // Convert total inches to feet'inches" format
        const feet = Math.floor(profile.height / 12);
        const inches = Math.round(profile.height % 12);
        stats.push(`height=${feet}'${inches}"`);
      } else {
        stats.push(`height=${profile.height}${heightUnit}`);
      }
    }
    if (profile.gender) stats.push(`gender=${profile.gender}`);
    return stats.length > 0 ? stats.join(', ') : 'not_specified';
  };

  // Get the name summary as used in GenerateEndpoint.php
  const getNameSummary = () => {
    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    return fullName || 'not_specified';
  };

  // Get goals summary as used in GenerateEndpoint.php
  const getGoalsSummary = () => {
    return profile.goals && profile.goals.length > 0 
      ? profile.goals.join(',') 
      : 'not_specified';
  };

  // Get equipment summary as used in GenerateEndpoint.php
  const getEquipmentSummary = () => {
    return profile.availableEquipment && profile.availableEquipment.length > 0 
      ? profile.availableEquipment.join(',') 
      : 'not_specified';
  };

  // Get limitations summary as used in GenerateEndpoint.php - Enhanced to show actual details
  const getLimitationsSummary = () => {
    const hasLimitationNotes = profile.limitationNotes && profile.limitationNotes.trim();
    const hasLimitations = profile.limitations && profile.limitations.length > 0 && !profile.limitations.includes('none');
    
    if (hasLimitationNotes || hasLimitations) {
      const details = [];
      if (hasLimitations) {
        const limitationLabels = profile.limitations
          .filter(l => l !== 'none')
          .map(l => l.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
        details.push(limitationLabels.join(', '));
      }
      if (hasLimitationNotes) {
        details.push(profile.limitationNotes);
      }
      return details.join(' - ');
    }
    return 'none';
  };

  // Format height for individual display
  const formatHeight = () => {
    if (!profile.height) return 'null';
    
    const heightUnit = profile.heightUnit || 'ft';
    if (heightUnit === 'ft') {
      // Convert total inches to feet'inches" format
      const feet = Math.floor(profile.height / 12);
      const inches = Math.round(profile.height % 12);
      return `${feet}'${inches}"`;
    } else {
      return profile.height.toString();
    }
  };

  return (
    <div className="profile-display__section">
      <div className="profile-display__section-header">
        <div className="profile-display__section-icon">⚙️</div>
        <h3 className="profile-display__section-title">Workout Generation Profile</h3>
        <div className="profile-display__section-subtitle">
          Profile data as used by the AI workout generation system
        </div>
      </div>
      <div className="profile-display__section-content">
        
        {/* Core Profile Data */}
        <div className="generation-profile__subsection">
          <h4 className="generation-profile__subsection-title">
            <span className="generation-profile__subsection-icon">👤</span>
            Core Profile Data
          </h4>
          <div className="profile-display__field-grid">
            <div className="profile-display__field">
              <label className="profile-display__field-label">Name Summary</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{getNameSummary()}</code>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Fitness Level</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{profile.fitnessLevel || 'beginner'}</code>
                <span className="generation-profile__field-note">
                  (default: beginner)
                </span>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Goals Summary</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{getGoalsSummary()}</code>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Equipment Summary</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{getEquipmentSummary()}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Data */}
        <div className="generation-profile__subsection">
          <h4 className="generation-profile__subsection-title">
            <span className="generation-profile__subsection-icon">📏</span>
            Physical Data for AI Personalization
          </h4>
          <div className="profile-display__field-grid">
            <div className="profile-display__field">
              <label className="profile-display__field-label">Physical Summary</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{formatPhysicalStats()}</code>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Age</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{profile.age || 'null'}</code>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Weight</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{profile.weight || 'null'}</code>
                {profile.weight && (
                  <span className="generation-profile__field-note">
                    {profile.weightUnit || 'lbs'}
                  </span>
                )}
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Height</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{formatHeight()}</code>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Gender</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{profile.gender || "'' (empty)"}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Preferences */}
        <div className="generation-profile__subsection">
          <h4 className="generation-profile__subsection-title">
            <span className="generation-profile__subsection-icon">🏋️</span>
            Workout Preferences
          </h4>
          <div className="profile-display__field-grid">
            <div className="profile-display__field">
              <label className="profile-display__field-label">Workout Frequency</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{profile.workoutFrequency || '2-3'}</code>
                <span className="generation-profile__field-note">
                  (default: 2-3)
                </span>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Preferred Location</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{profile.preferredLocation || 'any'}</code>
                <span className="generation-profile__field-note">
                  (default: any)
                </span>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Preferred Workout Duration</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{profile.preferredWorkoutDuration || 'null'}</code>
                <span className="generation-profile__field-note">
                  minutes (_profile_preferredWorkoutDuration)
                </span>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Limitations Summary</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{getLimitationsSummary()}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Parameters */}
        <div className="generation-profile__subsection">
          <h4 className="generation-profile__subsection-title">
            <span className="generation-profile__subsection-icon">🔧</span>
            Default Generation Parameters
          </h4>
          <div className="profile-display__field-grid">
            <div className="profile-display__field">
              <label className="profile-display__field-label">Default Duration</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>30</code>
                <span className="generation-profile__field-note">
                  minutes (wg_default_workout_duration filter)
                </span>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Default Intensity</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>3</code>
                <span className="generation-profile__field-note">
                  (wg_default_intensity_level filter)
                </span>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Default Goals</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>'general fitness'</code>
                <span className="generation-profile__field-note">
                  (wg_default_workout_goals filter)
                </span>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Exercise Complexity</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>
                  {profile.fitnessLevel === 'beginner' ? 'basic' : 
                   profile.fitnessLevel === 'advanced' ? 'advanced' : 'moderate'}
                </code>
                <span className="generation-profile__field-note">
                  (derived from fitness level)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Profile Fields */}
        <div className="generation-profile__subsection">
          <h4 className="generation-profile__subsection-title">
            <span className="generation-profile__subsection-icon">📋</span>
            Additional Profile Fields
          </h4>
          <div className="profile-display__field-grid">
            <div className="profile-display__field">
              <label className="profile-display__field-label">Custom Goal</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{profile.customGoal || "'' (empty)"}</code>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Custom Equipment</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{profile.customEquipment || "'' (empty)"}</code>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Custom Frequency</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{profile.customFrequency || "'' (empty)"}</code>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Favorite Exercises</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>
                  {profile.favoriteExercises && profile.favoriteExercises.length > 0 
                    ? `[${profile.favoriteExercises.length} exercises]` 
                    : '[] (empty)'}
                </code>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Disliked Exercises</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>
                  {profile.dislikedExercises && profile.dislikedExercises.length > 0 
                    ? `[${profile.dislikedExercises.join(', ')}]` 
                    : '[] (empty)'}
                </code>
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Medical Conditions</label>
              <div className="profile-display__field-value generation-profile__field-value">
                <code>{profile.medicalConditions || "'' (empty)"}</code>
              </div>
            </div>
          </div>
        </div>

        {/* API Integration Info */}
        <div className="generation-profile__info">
          <div className="generation-profile__info-header">
            <span className="generation-profile__info-icon">ℹ️</span>
            <strong>API Integration</strong>
          </div>
          <div className="generation-profile__info-content">
            <p>
              This data is retrieved by <code>GenerateEndpoint.php</code> when generating workouts 
              and passed to the AI system for personalized workout creation.
            </p>
            <p>
              Values shown as <code>null</code> or <code>not_specified</code> will use system defaults 
              or be omitted from AI prompts.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}; 