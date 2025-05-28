/**
 * Profile Actions Component
 * 
 * Displays the main CTA button and additional profile actions
 */

import React from 'react';
import { Button } from '../../../../components/ui';
import { UserProfile } from '../../types/profile';
import { calculateOverallCompletion, getNextIncompleteStep } from '../../utils/step-data';
import { Edit3, CheckCircle } from 'lucide-react';

interface ProfileActionsProps {
  profile: UserProfile | null;
  onEdit: () => void;
  className?: string;
}

/**
 * Profile Actions Component
 */
const ProfileActions: React.FC<ProfileActionsProps> = ({
  profile,
  onEdit,
  className = ''
}) => {
  const completion = calculateOverallCompletion(profile);
  const nextStep = getNextIncompleteStep(profile);

  // Determine button text and variant based on completion status
  const getButtonConfig = () => {
    if (completion.isComplete) {
      return {
        text: 'Edit Profile',
        variant: 'gradient' as const,
        icon: <Edit3 size={18} />
      };
    } else if (nextStep) {
      return {
        text: `Continue Setup (Step ${nextStep})`,
        variant: 'gradient' as const,
        icon: <Edit3 size={18} />
      };
    } else {
      return {
        text: 'Complete Profile',
        variant: 'gradient' as const,
        icon: <Edit3 size={18} />
      };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className={`profile-actions ${className}`}>
      <div className="profile-actions__main">
        <Button
          variant={buttonConfig.variant}
          size="lg"
          onClick={onEdit}
          endIcon={buttonConfig.icon}
          className="profile-actions__primary-button"
        >
          {buttonConfig.text}
        </Button>
      </div>

      {/* Optional: Show completion status */}
      {completion.isComplete && (
        <div className="profile-actions__status">
          <div className="completion-badge">
            <CheckCircle size={16} className="completion-badge__icon" />
            <span className="completion-badge__text">Profile Complete!</span>
          </div>
        </div>
      )}

      {/* Optional: Show last updated info */}
      {profile?.lastUpdated && (
        <div className="profile-actions__meta">
          <span className="last-updated">
            Last updated: {new Date(profile.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfileActions; 