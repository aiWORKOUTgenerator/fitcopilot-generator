/**
 * ProfileCard Component
 * Displays user profile information in a card format
 */

import React from 'react';
import { ProfileData } from '../types';

interface ProfileCardProps {
  profile: ProfileData;
  onEdit: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onEdit }) => {
  // Format workout goals as readable text
  const formattedGoals = profile.workoutGoals.map(goal => 
    goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  ).join(', ');

  // Calculate profile completion percentage
  const totalFields = 5; // Count major profile fields
  const filledFields = [
    !!profile.fitnessLevel,
    profile.workoutGoals.length > 0,
    !!profile.equipmentAvailable,
    profile.workoutFrequency > 0,
    profile.workoutDuration > 0
  ].filter(Boolean).length;
  
  const completionPercentage = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <div>
          <h2 className="profile-card-title">Profile Details</h2>
          <p className="profile-card-subtitle">
            {completionPercentage}% Complete
          </p>
        </div>
        <button 
          className="profile-action-button"
          onClick={onEdit}
          aria-label="Edit profile"
        >
          <svg className="profile-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
      
      <div className="profile-card-body">
        <div className="profile-stats">
          <div className="profile-stat-item">
            <span className="profile-stat-label">Fitness Level</span>
            <span className="profile-stat-value">
              {profile.fitnessLevel?.replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}
            </span>
          </div>
          
          <div className="profile-stat-item">
            <span className="profile-stat-label">Workout Goals</span>
            <span className="profile-stat-value">
              {formattedGoals || 'Not set'}
            </span>
          </div>
          
          <div className="profile-stat-item">
            <span className="profile-stat-label">Equipment</span>
            <span className="profile-stat-value">
              {profile.equipmentAvailable?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}
            </span>
          </div>
          
          <div className="profile-stat-item">
            <span className="profile-stat-label">Workout Frequency</span>
            <span className="profile-stat-value">
              {profile.workoutFrequency > 0 ? `${profile.workoutFrequency} times per week` : 'Not set'}
            </span>
          </div>
          
          <div className="profile-stat-item">
            <span className="profile-stat-label">Workout Duration</span>
            <span className="profile-stat-value">
              {profile.workoutDuration > 0 ? `${profile.workoutDuration} minutes` : 'Not set'}
            </span>
          </div>
          
          {profile.medicalConditions && profile.medicalConditions.length > 0 && (
            <div className="profile-stat-item">
              <span className="profile-stat-label">Medical Conditions</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.medicalConditions.map(condition => (
                  <span key={condition.id} className="profile-badge profile-badge-red">
                    {condition.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="profile-card-footer">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Never'}
        </span>
        
        <button 
          className="profile-button-primary"
          onClick={onEdit}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCard; 