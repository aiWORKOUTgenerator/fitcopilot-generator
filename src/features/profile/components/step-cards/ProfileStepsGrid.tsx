/**
 * Profile Steps Grid Component
 * 
 * Responsive grid layout for profile step cards (2x2 on desktop, 1 column on mobile)
 */

import React from 'react';
import { UserProfile } from '../../types/profile';
import { generateAllStepCardData } from '../../utils/step-data';
import ProfileStepCard from './ProfileStepCard';

interface ProfileStepsGridProps {
  profile: UserProfile | null;
  onStepClick?: (stepNumber: number) => void;
  className?: string;
}

/**
 * Profile Steps Grid Component
 */
const ProfileStepsGrid: React.FC<ProfileStepsGridProps> = ({
  profile,
  onStepClick,
  className = ''
}) => {
  const stepCards = generateAllStepCardData(profile);

  const handleStepClick = (stepNumber: number) => {
    if (onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className={`profile-steps-grid ${className}`}>
      {stepCards.map((stepData) => (
        <ProfileStepCard
          key={stepData.stepNumber}
          stepData={stepData}
          onClick={onStepClick ? () => handleStepClick(stepData.stepNumber) : undefined}
          className="profile-steps-grid__item"
        />
      ))}
    </div>
  );
};

export default ProfileStepsGrid; 