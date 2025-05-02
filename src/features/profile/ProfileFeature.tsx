/**
 * Profile Feature Component
 * 
 * Main entry point for the user profile feature
 */
import React, { useState } from 'react';
import { ProfileProvider } from './context';
import { ProfileForm } from './components';

interface ProfileFeatureProps {
  onProfileComplete?: () => void;
  className?: string;
}

/**
 * Profile Feature Component
 * 
 * Main container for the profile management feature
 */
const ProfileFeature: React.FC<ProfileFeatureProps> = ({
  onProfileComplete,
  className = ''
}) => {
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle profile form completion
  const handleProfileComplete = () => {
    setIsFormCompleted(true);
    
    if (onProfileComplete) {
      onProfileComplete();
    }
  };
  
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
  
  return (
    <ProfileProvider>
      <div className={`profile-feature ${className}`}>
        <h3 className="profile-feature__subtitle">
          Manage your fitness profile to get personalized workout recommendations
        </h3>
        <div className="profile-container">
          {isFormCompleted ? (
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
                Edit Profile
              </button>
            </div>
          ) : (
            <ProfileForm onComplete={handleProfileComplete} />
          )}
        </div>
      </div>
    </ProfileProvider>
  );
};

export default ProfileFeature; 