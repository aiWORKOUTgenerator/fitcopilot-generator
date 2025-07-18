/**
 * Profile Summary Component
 * 
 * Enhanced profile display with fitness stats, goals, and quick actions.
 * Integrates with the workout generator for contextual data sharing.
 */
import React, { useState } from 'react';
import Card from '../../../components/ui/Card/Card';
import Button from '../../../components/ui/Button/Button';
import { FitnessStats } from './FitnessStats';
import './ProfileTab.scss';

interface UserProfile {
  name: string;
  email: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoals: string[];
  preferredWorkoutTypes: string[];
  availableEquipment: string[];
  completedWorkouts: number;
  currentStreak: number;
  totalMinutesExercised: number;
  profileCompleteness: number;
}

interface ProfileSummaryProps {
  profile: UserProfile;
  onEditProfile: () => void;
  isLoading?: boolean;
}

/**
 * ProfileSummary displays comprehensive user profile information
 */
export const ProfileSummary: React.FC<ProfileSummaryProps> = ({
  profile,
  onEditProfile,
  isLoading = false
}) => {

  if (isLoading) {
    return (
      <div className="profile-summary loading">
        <div className="loading-skeleton">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-stats"></div>
        </div>
      </div>
    );
  }

  const getProfileCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const getFitnessLevelBadge = (level: string) => {
    const badges = {
      beginner: { color: 'green', icon: '🌱' },
      intermediate: { color: 'blue', icon: '💪' },
      advanced: { color: 'purple', icon: '🏆' }
    };
    return badges[level as keyof typeof badges] || badges.beginner;
  };

  const formatMinutesToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  const levelBadge = getFitnessLevelBadge(profile.fitnessLevel);

  return (
    <div className="profile-summary">
      {/* Profile Header */}
      <Card className="profile-header-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-initial">{profile.name.charAt(0).toUpperCase()}</span>
            <div className={`fitness-level-badge ${levelBadge.color}`}>
              <span className="level-icon">{levelBadge.icon}</span>
            </div>
          </div>
          
          <div className="profile-info">
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-email">{profile.email}</p>
            <div className="fitness-level">
              <span className="level-label">Fitness Level:</span>
              <span className={`level-value ${profile.fitnessLevel}`}>
                {profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="profile-actions">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEditProfile}
              className="edit-profile-btn"
            >
              Edit Profile
            </Button>
          </div>
        </div>
        
        {/* Profile Completeness */}
        <div className="profile-completeness">
          <div className="completeness-header">
            <span className="completeness-label">Profile Completeness</span>
            <span className={`completeness-percentage ${getProfileCompletenessColor(profile.profileCompleteness)}`}>
              {profile.profileCompleteness}%
            </span>
          </div>
          <div className="completeness-bar">
            <div 
              className={`completeness-fill ${getProfileCompletenessColor(profile.profileCompleteness)}`}
              style={{ width: `${profile.profileCompleteness}%` }}
            ></div>
          </div>
          {profile.profileCompleteness < 100 && (
            <p className="completeness-tip">
              Complete your profile to get better workout recommendations
            </p>
          )}
        </div>
      </Card>

      {/* Fitness Stats - Premium Version */}
      <FitnessStats
        completedWorkouts={profile.completedWorkouts}
        currentStreak={profile.currentStreak}
        totalMinutesExercised={profile.totalMinutesExercised}
        weeklyGoal={5}
        className="profile-fitness-stats"
      />


    </div>
  );
};

export default ProfileSummary; 