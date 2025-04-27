/**
 * ProfileSetupPrompt Component
 * 
 * Wrapper for the common ProfileSetupModal with workout generator specific functionality
 */
import React from 'react';
import { ProfileSetupModal } from '../../../../common/modals';

interface ProfileSetupPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

/**
 * Wrapper for the profile setup modal, can add feature-specific behavior
 */
const ProfileSetupPrompt: React.FC<ProfileSetupPromptProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => (
  <ProfileSetupModal
    isOpen={isOpen}
    onClose={onClose}
    onComplete={onComplete}
  />
);

export default ProfileSetupPrompt; 