/**
 * Unsaved Changes Warning Component
 * 
 * Confirmation modal that warns users about unsaved changes when they attempt
 * to navigate away or close the editor. Provides options to save, discard, or
 * cancel the action. Integrates with useUnsavedChanges hook.
 */

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Save, Trash2, X } from 'lucide-react';
import { Button } from '../../../../../components/ui';
import './UnsavedChangesWarning.scss';

export interface UnsavedChangesWarningProps {
  /** Whether the warning modal is open */
  isOpen: boolean;
  /** Array of changed field names */
  changedFields: string[];
  /** Type of confirmation being requested */
  confirmationType: 'save' | 'discard' | 'navigate' | null;
  /** Custom confirmation message */
  confirmationMessage?: string;
  /** Whether a save operation is in progress */
  isSaving?: boolean;
  /** Callback when user chooses to save changes */
  onSave: () => void;
  /** Callback when user chooses to discard changes */
  onDiscard: () => void;
  /** Callback when user cancels the action */
  onCancel: () => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Formats field names for display in the warning
 */
const formatFieldName = (fieldName: string): string => {
  // Convert camelCase to readable format
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

/**
 * Gets the appropriate message based on confirmation type
 */
const getConfirmationMessage = (
  type: UnsavedChangesWarningProps['confirmationType'],
  customMessage?: string
): string => {
  if (customMessage) return customMessage;

  switch (type) {
    case 'save':
      return 'Do you want to save your changes before continuing?';
    case 'discard':
      return 'Are you sure you want to discard your unsaved changes?';
    case 'navigate':
      return 'You have unsaved changes. What would you like to do?';
    default:
      return 'You have unsaved changes that will be lost if you continue.';
  }
};

/**
 * Unsaved Changes Warning Modal with confirmation options
 */
export const UnsavedChangesWarning: React.FC<UnsavedChangesWarningProps> = ({
  isOpen,
  changedFields,
  confirmationType,
  confirmationMessage,
  isSaving = false,
  onSave,
  onDiscard,
  onCancel,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus the first button after modal opens
      const timer = setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onCancel, isSaving]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current && !isSaving) {
      onCancel();
    }
  };

  // Generate component classes
  const componentClasses = [
    'unsaved-changes-warning',
    isOpen ? 'unsaved-changes-warning--open' : '',
    isSaving ? 'unsaved-changes-warning--saving' : '',
    className
  ].filter(Boolean).join(' ');

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Get the confirmation message
  const message = getConfirmationMessage(confirmationType, confirmationMessage);

  // Format changed fields for display
  const formattedFields = changedFields
    .map(formatFieldName)
    .filter((field, index, array) => array.indexOf(field) === index) // Remove duplicates
    .slice(0, 5); // Limit to 5 fields

  return (
    <div 
      className={componentClasses}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-changes-title"
      aria-describedby="unsaved-changes-description"
    >
      <div 
        className="unsaved-changes-warning__backdrop"
        ref={modalRef}
        onClick={handleBackdropClick}
      >
        <div className="unsaved-changes-warning__modal">
          {/* Header */}
          <div className="unsaved-changes-warning__header">
            <div className="unsaved-changes-warning__icon">
              <AlertTriangle size={24} />
            </div>
            <h2 
              id="unsaved-changes-title" 
              className="unsaved-changes-warning__title"
            >
              Unsaved Changes
            </h2>
            <button
              className="unsaved-changes-warning__close"
              onClick={onCancel}
              disabled={isSaving}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="unsaved-changes-warning__content">
            <p 
              id="unsaved-changes-description"
              className="unsaved-changes-warning__message"
            >
              {message}
            </p>

            {/* Changed fields display */}
            {formattedFields.length > 0 && (
              <div className="unsaved-changes-warning__changes">
                <div className="unsaved-changes-warning__changes-header">
                  Modified fields:
                </div>
                <div className="unsaved-changes-warning__changes-list">
                  {formattedFields.map((field, index) => (
                    <span key={index} className="unsaved-changes-warning__field">
                      {field}
                    </span>
                  ))}
                  {changedFields.length > 5 && (
                    <span className="unsaved-changes-warning__field-more">
                      +{changedFields.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Save in progress indicator */}
            {isSaving && (
              <div className="unsaved-changes-warning__saving">
                <div className="unsaved-changes-warning__saving-spinner" />
                <span>Saving changes...</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="unsaved-changes-warning__actions">
            {confirmationType === 'discard' ? (
              // Discard confirmation flow
              <>
                <Button
                  ref={firstButtonRef}
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  disabled={isSaving}
                  aria-label="Keep changes and return to editor"
                >
                  Keep Changes
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={onDiscard}
                  disabled={isSaving}
                  startIcon={<Trash2 size={16} />}
                  aria-label="Discard all unsaved changes"
                >
                  Discard Changes
                </Button>
              </>
            ) : (
              // Save/navigate confirmation flow
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  disabled={isSaving}
                  aria-label="Cancel and return to editor"
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onDiscard}
                  disabled={isSaving}
                  startIcon={<Trash2 size={16} />}
                  aria-label="Continue without saving changes"
                >
                  Don't Save
                </Button>
                <Button
                  ref={firstButtonRef}
                  variant="gradient"
                  size="md"
                  onClick={onSave}
                  disabled={isSaving}
                  isLoading={isSaving}
                  startIcon={!isSaving ? <Save size={16} /> : undefined}
                  aria-label="Save changes and continue"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesWarning; 