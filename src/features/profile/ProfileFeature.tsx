/**
 * Profile Feature Component
 * 
 * Main entry point for the user profile feature
 */
import React, { useState } from 'react';
import { ProfileProvider, useProfile } from './context';
import { ProfileForm, ProfileCard } from './components';
import { debugProfileAuth } from './api/profileApi';

// Add debug function to window for troubleshooting
if (typeof window !== 'undefined') {
  (window as any).debugProfileAuth = debugProfileAuth;
  console.log('🔧 [Profile Debug] Debug function available: window.debugProfileAuth()');
}

interface ProfileFeatureProps {
  onProfileComplete?: () => void;
  className?: string;
}

/**
 * Profile Feature Content Component
 * 
 * Internal component that uses the ProfileProvider context
 */
const ProfileFeatureContent: React.FC<ProfileFeatureProps> = ({
  onProfileComplete,
  className = ''
}) => {
  const { profile, isLoading, error, fetchProfile, isProfileComplete } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  
  // Handle profile form completion
  const handleProfileComplete = () => {
    setIsFormCompleted(true);
    setIsEditing(false);
    
    if (onProfileComplete) {
      onProfileComplete();
    }
  };

  // Handle edit button click
  const handleEditProfile = () => {
    setIsEditing(true);
    setIsFormCompleted(false);
  };

  // Handle refresh/retry
  const refreshProfile = async () => {
    try {
      await fetchProfile();
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="profile-container">
        <div className="http-error" role="alert">
          <div>
            <p className="font-bold">Error loading profile</p>
            <p>{error}</p>
            <button
              className="mt-3 bg-red-800 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
              onClick={refreshProfile}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success message after form completion
  if (isFormCompleted) {
    return (
      <div className="profile-container">
        <div className="profile-success">
          <h2>Profile Updated Successfully!</h2>
          <p>
            Your fitness profile has been saved. Your workouts will now be personalized
            based on your preferences and fitness goals.
          </p>
          <button
            className="button button-primary"
            onClick={() => setIsFormCompleted(false)}
          >
            View Profile
          </button>
        </div>
      </div>
    );
  }

  // Determine whether to show form or profile card
  const shouldShowForm = isEditing || !profile || !isProfileComplete;

  return (
    <div className={`profile-feature ${className}`}>
      <h3 className="profile-feature__subtitle">
        Manage your fitness profile to get personalized workout recommendations
      </h3>
      <div className="profile-container">
        {shouldShowForm ? (
          <ProfileForm onComplete={handleProfileComplete} />
        ) : (
          <ProfileCard profile={profile} onEdit={handleEditProfile} />
        )}
      </div>
    </div>
  );
};

/**
 * Profile Feature Component
 * 
 * Main container for the profile management feature
 */
const ProfileFeature: React.FC<ProfileFeatureProps> = (props) => {
  return (
    <ProfileProvider>
      <ProfileFeatureContent {...props} />
    </ProfileProvider>
  );
};

export default ProfileFeature; 