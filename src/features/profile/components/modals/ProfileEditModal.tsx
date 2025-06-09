/**
 * Profile Edit Modal Component
 * 
 * Modal wrapper for the ProfileForm component that integrates with the dashboard modal system.
 * Provides a seamless editing experience with proper state management and accessibility.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ProfileForm from '../ProfileForm';
import { useProfile } from '../../context/ProfileContext';
import { Profile } from '../../types';
import './ProfileEditModal.scss';

/**
 * Props for the ProfileEditModal component
 */
export interface ProfileEditModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback fired when modal should close */
  onClose: () => void;
  /** Callback fired when profile editing is completed */
  onComplete: (updatedProfile: Profile) => void;
  /** Initial step to start the form on (1-5) */
  initialStep?: number;
  /** Custom class name for styling */
  className?: string;
}

/**
 * ProfileEditModal - Modal wrapper for profile editing
 * 
 * Provides a complete profile editing experience using the existing ProfileForm
 * component within a modal interface that follows dashboard modal patterns.
 */
const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialStep = 1,
  className = ''
}) => {
  // Modal state management
  const [isClosing, setIsClosing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Profile context
  const { state } = useProfile();
  const { loading, error } = state;

  // Refs for accessibility
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management - store previous focus when modal opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal after a brief delay to ensure it's rendered
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Trap focus within modal
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCloseAttempt();
      return;
    }

    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(focusableSelector);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      handleCloseAttempt();
    }
  }, []);

  // Handle close attempt with unsaved changes check
  const handleCloseAttempt = useCallback(() => {
    if (hasUnsavedChanges && !isSubmitting) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) {
        return;
      }
    }
    
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setHasUnsavedChanges(false);
      setShowSuccessMessage(false);
    }, 300); // Match CSS transition duration
  }, [hasUnsavedChanges, isSubmitting, onClose]);

  // Handle form completion
  const handleFormComplete = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      // The ProfileForm handles the actual saving through useProfileForm
      // We just need to show success feedback and close
      setShowSuccessMessage(true);
      setHasUnsavedChanges(false);
      
      // Brief delay to show success message
      setTimeout(() => {
        if (state.profile) {
          onComplete(state.profile);
        }
        handleCloseAttempt();
      }, 1500);
      
    } catch (error) {
      console.error('[ProfileEditModal] Error during form completion:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [state.profile, onComplete, handleCloseAttempt]);

  // Handle form changes to track dirty state
  const handleFormChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={modalRef}
      className={`profile-edit-modal__overlay ${isClosing ? 'closing' : 'visible'} ${className}`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-edit-title"
      aria-describedby="profile-edit-description"
      tabIndex={-1}
    >
      <div className="profile-edit-modal__content">
        {/* Modal Header */}
        <div className="profile-edit-modal__header">
          <div className="modal-title-section">
            <h2 id="profile-edit-title" className="modal-title">
              ✏️ Edit Your Profile
            </h2>
            <p id="profile-edit-description" className="modal-description">
              Update your fitness profile to get better personalized workouts
            </p>
          </div>
          
          <button
            type="button"
            className="modal-close-button"
            onClick={handleCloseAttempt}
            aria-label="Close profile edit modal"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="profile-edit-modal__body">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="profile-edit-modal__success">
              <div className="success-icon">✅</div>
              <div className="success-message">
                <h3>Profile Updated Successfully!</h3>
                <p>Your changes have been saved and will be used for future workouts.</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && !showSuccessMessage && (
            <div className="profile-edit-modal__error">
              <div className="error-icon">⚠️</div>
              <div className="error-message">
                <h3>Profile Update Error</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !showSuccessMessage && (
            <div className="profile-edit-modal__loading">
              <div className="loading-spinner"></div>
              <p>Loading your profile...</p>
            </div>
          )}

          {/* Profile Form */}
          {!loading && !showSuccessMessage && (
            <div className="profile-edit-modal__form-container">
              <ProfileForm
                onComplete={handleFormComplete}
                className="profile-edit-modal__form"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="profile-edit-modal__footer">
          <div className="modal-actions">
            <button
              type="button"
              className="modal-action-button modal-action-button--secondary"
              onClick={handleCloseAttempt}
              disabled={isSubmitting}
            >
              {hasUnsavedChanges ? 'Cancel' : 'Close'}
            </button>
          </div>
          
          {hasUnsavedChanges && (
            <div className="unsaved-changes-indicator">
              <span className="unsaved-dot"></span>
              <span className="unsaved-text">Unsaved changes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal; 