/**
 * Profile Header Component
 * 
 * Displays user identity information and profile completion status
 */

import React from 'react';
import { UserProfile } from '../../types/profile';
import { calculateOverallCompletion } from '../../utils/step-data';
import { getUserIdentitySummary } from '../../utils/userDisplay';
import Avatar from '../ui/Avatar';

// Default profile for avatar when profile is null
const DEFAULT_PROFILE: UserProfile = {
  id: 0,
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  username: undefined,
  displayName: undefined,
  avatarUrl: undefined,
  fitnessLevel: 'beginner',
  goals: ['general_fitness'],
  customGoal: '',
  weight: 0,
  weightUnit: 'lbs',
  height: 0,
  heightUnit: 'ft',
  age: 0,
  gender: undefined,
  availableEquipment: ['none'],
  customEquipment: '',
  preferredLocation: 'home',
  limitations: ['none'],
  limitationNotes: '',
  preferredWorkoutDuration: 30,
  workoutFrequency: '3-4',
  customFrequency: '',
  favoriteExercises: [],
  dislikedExercises: [],
  medicalConditions: '',
  lastUpdated: new Date().toISOString(),
  profileComplete: false,
  completedWorkouts: 0
};

interface ProfileHeaderProps {
  profile: UserProfile | null;
  className?: string;
}



/**
 * Profile Header Component
 */
const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  className = ''
}) => {
  const completion = calculateOverallCompletion(profile);
  const userIdentity = getUserIdentitySummary(profile);

  return (
    <div className={`profile-header ${className}`}>
      <div className="profile-header__content">
        {/* User Identity Section */}
        <div className="profile-header__user-section">
          <div className="profile-header__avatar-container">
            <Avatar 
              profile={profile || DEFAULT_PROFILE}
              size="large"
              className="profile-header__avatar"
            />
          </div>
          <div className="profile-header__user-info">
            <h2 className="profile-header__user-name">
              {userIdentity.displayName}
            </h2>
            {userIdentity.email && (
              <p className="profile-header__user-email">
                {userIdentity.email}
              </p>
            )}
            <p className="profile-header__subtitle">
              Profile Details
            </p>
          </div>
        </div>

        {/* Completion Section */}
        <div className="profile-header__completion-section">
          <div className="profile-header__completion">
            <span className="completion-percentage">
              {completion.completionPercentage}% Complete
            </span>
            <div className="completion-progress">
              <div className="completion-progress__track">
                <div 
                  className="completion-progress__fill"
                  style={{ width: `${completion.completionPercentage}%` }}
                />
              </div>
              <span className="completion-steps">
                {completion.completedSteps} of {completion.totalSteps} steps
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 