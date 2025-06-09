/**
 * Profile Edit Button Component
 * 
 * Self-contained button component that manages ProfileEditModal state internally.
 * Can be used anywhere without affecting parent component state or dependencies.
 */
import React, { useState, useCallback } from 'react';
import { ProfileEditModal } from './modals';
import { useProfile } from '../context/ProfileContext';
import './ProfileEditButton.scss';

/**
 * Props for the ProfileEditButton component
 */
export interface ProfileEditButtonProps {
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Custom CSS classes */
  className?: string;
  /** Custom button text */
  children?: React.ReactNode;
  /** Whether button should be full width */
  fullWidth?: boolean;
  /** Callback fired when profile edit is completed */
  onEditComplete?: (updatedProfile: any) => void;
}

/**
 * Self-contained Profile Edit Button with integrated modal
 * 
 * @example
 * // Basic usage
 * <ProfileEditButton />
 * 
 * @example
 * // Custom styling
 * <ProfileEditButton variant="outline" size="large">
 *   Customize Profile
 * </ProfileEditButton>
 * 
 * @example
 * // With completion callback
 * <ProfileEditButton onEditComplete={(profile) => console.log('Updated!', profile)} />
 */
export default function ProfileEditButton({
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  fullWidth = false,
  onEditComplete
}: ProfileEditButtonProps) {
  // Internal modal state - completely isolated
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get profile context for refreshing data
  const { getProfile } = useProfile();

  // Modal control handlers
  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleEditComplete = useCallback((updatedProfile: any) => {
    console.log('[ProfileEditButton] Profile updated successfully:', updatedProfile);
    
    // Refresh profile data in context
    getProfile();
    
    // Close modal
    setIsModalOpen(false);
    
    // Call external callback if provided
    if (onEditComplete) {
      onEditComplete(updatedProfile);
    }
  }, [getProfile, onEditComplete]);

  // Build CSS classes
  const buttonClasses = [
    'profile-edit-button',
    `profile-edit-button--${variant}`,
    `profile-edit-button--${size}`,
    fullWidth ? 'profile-edit-button--full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Self-contained button */}
      <button 
        type="button"
        className={buttonClasses}
        onClick={handleOpenModal}
        aria-label="Edit Profile"
      >
        <span className="profile-edit-button__icon">✏️</span>
        <span className="profile-edit-button__text">
          {children || 'Edit Profile'}
        </span>
      </button>

      {/* Self-managed modal */}
      <ProfileEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onComplete={handleEditComplete}
      />
    </>
  );
} 