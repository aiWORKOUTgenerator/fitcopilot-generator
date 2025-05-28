/**
 * ProfileCard Component
 * Displays user profile information in a modern step-based card layout
 */

import React from 'react';
import { UserProfile } from '../types';
import { 
  ProfileHeader, 
  ProfileStepsGrid, 
  ProfileActions 
} from './step-cards';

interface ProfileCardProps {
  profile: UserProfile;
  onEdit: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onEdit }) => {
  // Handle step click for future enhancement (optional)
  const handleStepClick = (stepNumber: number) => {
    // For now, just trigger the main edit function
    // In the future, this could navigate to a specific step
    onEdit();
  };

  return (
    <div className="profile-card">
      {/* Header with title and completion percentage */}
      <ProfileHeader 
        profile={profile}
        className="profile-card__header"
      />
      
      {/* Step-based grid layout */}
      <ProfileStepsGrid 
        profile={profile}
        onStepClick={handleStepClick}
        className="profile-card__steps"
      />
      
      {/* Actions with prominent CTA button */}
      <ProfileActions 
        profile={profile}
        onEdit={onEdit}
        className="profile-card__actions"
      />
    </div>
  );
};

export default ProfileCard; 