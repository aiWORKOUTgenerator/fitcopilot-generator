/**
 * Profile Feature Component
 * 
 * Main entry point for the user profile feature
 */
import React from 'react';
import { ProfileProvider, useProfile } from './context/ProfileContext';

// Import the enhanced styles
import './styles/ProfileFeature.scss';

function ProfileContent() {
  const { state, getProfile, updateProfile, clearError } = useProfile();

  if (state.loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading__spinner" />
        <p className="profile-loading__text">Loading your profile...</p>
        <p className="profile-loading__subtext">Please wait while we retrieve your fitness information</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="profile-error">
        <div className="profile-error__header">
          <div className="profile-error__icon">⚠️</div>
          <h3 className="profile-error__title">Profile Error</h3>
        </div>
        <p className="profile-error__message">{state.error}</p>
        <p className="profile-error__description">
          We encountered an issue while loading your profile. Please try again or refresh the page.
        </p>
        <div className="profile-error__actions">
          <button 
            className="profile-button profile-button--primary"
            onClick={() => { clearError(); getProfile(); }}
          >
            <span>🔄</span>
            <span className="button-text">Retry</span>
          </button>
          <button
            className="profile-button profile-button--secondary"
            onClick={() => window.location.reload()}
          >
            <span>↻</span>
            <span className="button-text">Refresh Page</span>
          </button>
        </div>
      </div>
    );
  }

  if (!state.profile) {
    return (
      <div className="profile-error">
        <div className="profile-error__header">
          <div className="profile-error__icon">📝</div>
          <h3 className="profile-error__title">No Profile Data</h3>
        </div>
        <p className="profile-error__message">No profile data available</p>
        <p className="profile-error__description">
          Your profile information could not be found. Please try loading it again.
        </p>
        <div className="profile-error__actions">
          <button 
            className="profile-button profile-button--primary"
            onClick={getProfile}
          >
            <span>📊</span>
            <span className="button-text">Load Profile</span>
          </button>
        </div>
      </div>
    );
  }

  // Success! Show profile data with enhanced styling
  const { profile } = state;
  
  return (
    <div className="profile-feature profile-feature--enhanced">
      <div className="profile-success">
        <div className="profile-success__header">
          <div className="profile-success__icon">✅</div>
          <h2 className="profile-success__title">Profile Loaded Successfully!</h2>
        </div>
        <p className="profile-success__message">
          Your fitness profile has been loaded and is ready for personalized workouts.
        </p>
      </div>

      {/* User Information Section */}
      <div className="profile-display__section">
        <div className="profile-display__section-header">
          <div className="profile-display__section-icon">👤</div>
          <h3 className="profile-display__section-title">User Information</h3>
        </div>
        <div className="profile-display__section-content">
          <div className="profile-display__field-grid">
            <div className="profile-display__field">
              <label className="profile-display__field-label">Full Name</label>
              <div className="profile-display__field-value">
                {profile.firstName} {profile.lastName}
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Email</label>
              <div className="profile-display__field-value">{profile.email}</div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Username</label>
              <div className="profile-display__field-value">{profile.username}</div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Display Name</label>
              <div className="profile-display__field-value">{profile.displayName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fitness Profile Section */}
      <div className="profile-display__section">
        <div className="profile-display__section-header">
          <div className="profile-display__section-icon">💪</div>
          <h3 className="profile-display__section-title">Fitness Profile</h3>
        </div>
        <div className="profile-display__section-content">
          <div className="profile-display__field-grid">
            <div className="profile-display__field">
              <label className="profile-display__field-label">Fitness Level</label>
              <div className="profile-display__field-value">{profile.fitnessLevel}</div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Goals</label>
              <div className="profile-display__field-value profile-display__field-value--array">
                {profile.goals.map((goal, index) => (
                  <span key={index} className="tag">{goal}</span>
                ))}
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Workout Frequency</label>
              <div className="profile-display__field-value">{profile.workoutFrequency}</div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Preferred Duration</label>
              <div className="profile-display__field-value">{profile.preferredWorkoutDuration} minutes</div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Available Equipment</label>
              <div className="profile-display__field-value profile-display__field-value--array">
                {profile.availableEquipment.map((equipment, index) => (
                  <span key={index} className="tag">{equipment}</span>
                ))}
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Preferred Location</label>
              <div className="profile-display__field-value">{profile.preferredLocation}</div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Profile Complete</label>
              <div className="profile-display__field-value profile-display__field-value--boolean">
                <span className={`status-indicator status-indicator--${profile.profileComplete}`}></span>
                {profile.profileComplete ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Physical Information Section */}
      <div className="profile-display__section">
        <div className="profile-display__section-header">
          <div className="profile-display__section-icon">📏</div>
          <h3 className="profile-display__section-title">Physical Information</h3>
        </div>
        <div className="profile-display__section-content">
          <div className="profile-display__field-grid">
            <div className="profile-display__field">
              <label className="profile-display__field-label">Age</label>
              <div className={`profile-display__field-value ${!profile.age ? 'profile-display__field-value--not-specified' : ''}`}>
                {profile.age || 'Not specified'}
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Weight</label>
              <div className={`profile-display__field-value ${!profile.weight ? 'profile-display__field-value--not-specified' : ''}`}>
                {profile.weight ? `${profile.weight} ${profile.weightUnit}` : 'Not specified'}
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Height</label>
              <div className={`profile-display__field-value ${!profile.height ? 'profile-display__field-value--not-specified' : ''}`}>
                {profile.height ? `${profile.height} ${profile.heightUnit}` : 'Not specified'}
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Gender</label>
              <div className={`profile-display__field-value ${!profile.gender ? 'profile-display__field-value--not-specified' : ''}`}>
                {profile.gender || 'Not specified'}
              </div>
            </div>
            <div className="profile-display__field">
              <label className="profile-display__field-label">Limitations</label>
              <div className="profile-display__field-value profile-display__field-value--array">
                {profile.limitations.map((limitation, index) => (
                  <span key={index} className="tag">{limitation}</span>
                ))}
              </div>
            </div>
            {profile.limitationNotes && (
              <div className="profile-display__field">
                <label className="profile-display__field-label">Limitation Notes</label>
                <div className="profile-display__field-value">{profile.limitationNotes}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Actions */}
      <div className="profile-actions">
        <button 
          className="profile-button profile-button--primary"
          onClick={getProfile}
        >
          <span>🔄</span>
          <span className="button-text">Refresh Profile</span>
        </button>
        
        <button
          className="profile-button profile-button--secondary"
          onClick={() => updateProfile({ 
            fitnessLevel: 'advanced',
            goals: ['strength', 'muscle_building'] 
          })}
        >
          <span>🧪</span>
          <span className="button-text">Test Update (Advanced/Strength)</span>
        </button>
      </div>

      {/* Debug Information */}
      <div className="profile-debug">
        <div className="profile-debug__header">
          <span>🔧</span>
          <h4 className="profile-debug__title">Debug Information</h4>
        </div>
        <div className="profile-debug__content">
          <pre className="profile-debug__code">
{`Last Updated: ${profile.lastUpdated}
Profile ID: ${profile.id}
Completed Workouts: ${profile.completedWorkouts}
Profile Complete: ${profile.profileComplete}
Username: ${profile.username}
Email: ${profile.email}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function ProfileFeature() {
  return (
    <ProfileProvider>
      <ProfileContent />
    </ProfileProvider>
  );
} 