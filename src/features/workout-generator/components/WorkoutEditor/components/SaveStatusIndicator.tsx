/**
 * Save Status Indicator Component
 * 
 * Displays real-time save status with visual feedback for auto-save functionality.
 * Integrates with useAutoSave hook to show saving states, success confirmations,
 * and error states with retry options.
 */

import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, Loader, RotateCcw, Clock } from 'lucide-react';
import { Button } from '../../../../../components/ui';
import './SaveStatusIndicator.scss';

export interface SaveStatusIndicatorProps {
  /** Current save status */
  status: 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
  /** When the workout was last saved */
  lastSaved?: Date;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Number of items in save queue */
  queueLength: number;
  /** Last error message if status is error */
  lastError?: string;
  /** Callback to retry failed save */
  onRetry?: () => void;
  /** Whether to show full status or compact version */
  compact?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Formats time ago display for last saved timestamp
 */
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 30) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
};

/**
 * Save Status Indicator with real-time feedback and error handling
 */
export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  lastSaved,
  hasUnsavedChanges,
  queueLength,
  lastError,
  onRetry,
  compact = false,
  className = ''
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Update time ago display every 30 seconds
  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      setTimeAgo(formatTimeAgo(lastSaved));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000);

    return () => clearInterval(interval);
  }, [lastSaved]);

  // Show success animation when save completes
  useEffect(() => {
    if (status === 'saved') {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Generate component classes
  const componentClasses = [
    'save-status-indicator',
    `save-status-indicator--${status}`,
    compact ? 'save-status-indicator--compact' : '',
    showSuccess ? 'save-status-indicator--success-animation' : '',
    className
  ].filter(Boolean).join(' ');

  // Render different content based on status
  const renderStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="save-status-indicator__content save-status-indicator__content--saving">
            <Loader size={16} className="save-status-indicator__icon save-status-indicator__icon--spinning" />
            <span className="save-status-indicator__text">
              {compact ? 'Saving...' : `Saving${queueLength > 1 ? ` (${queueLength} items)` : ''}...`}
            </span>
          </div>
        );

      case 'saved':
        return (
          <div className="save-status-indicator__content save-status-indicator__content--saved">
            <Check size={16} className="save-status-indicator__icon save-status-indicator__icon--success" />
            <span className="save-status-indicator__text">
              {compact ? 'Saved' : `Saved${timeAgo ? ` ${timeAgo}` : ''}`}
            </span>
          </div>
        );

      case 'error':
        return (
          <div className="save-status-indicator__content save-status-indicator__content--error">
            <AlertCircle size={16} className="save-status-indicator__icon save-status-indicator__icon--error" />
            <span className="save-status-indicator__text">
              {compact ? 'Save Failed' : lastError || 'Save failed'}
            </span>
            {onRetry && (
              <Button
                variant="text"
                size="sm"
                onClick={onRetry}
                startIcon={<RotateCcw size={14} />}
                className="save-status-indicator__retry-button"
                aria-label="Retry save operation"
              >
                Retry
              </Button>
            )}
          </div>
        );

      case 'conflict':
        return (
          <div className="save-status-indicator__content save-status-indicator__content--conflict">
            <AlertCircle size={16} className="save-status-indicator__icon save-status-indicator__icon--warning" />
            <span className="save-status-indicator__text">
              {compact ? 'Conflict' : 'Save conflict detected'}
            </span>
          </div>
        );

      case 'idle':
      default:
        if (hasUnsavedChanges) {
          return (
            <div className="save-status-indicator__content save-status-indicator__content--unsaved">
              <Clock size={16} className="save-status-indicator__icon save-status-indicator__icon--unsaved" />
              <span className="save-status-indicator__text">
                {compact ? 'Unsaved' : 'Unsaved changes'}
              </span>
            </div>
          );
        }

        if (lastSaved && timeAgo) {
          return (
            <div className="save-status-indicator__content save-status-indicator__content--idle">
              <Check size={16} className="save-status-indicator__icon save-status-indicator__icon--idle" />
              <span className="save-status-indicator__text">
                {compact ? 'Saved' : `Saved ${timeAgo}`}
              </span>
            </div>
          );
        }

        return null;
    }
  };

  // Don't render if no meaningful status to show
  if (status === 'idle' && !hasUnsavedChanges && !lastSaved) {
    return null;
  }

  return (
    <div 
      className={componentClasses}
      role="status"
      aria-live="polite"
      aria-label={`Save status: ${status}`}
    >
      {renderStatusContent()}
    </div>
  );
};

export default SaveStatusIndicator; 