/**
 * Card Error Display Component
 * 
 * Displays error states for workout cards with:
 * - User-friendly error messages
 * - Retry functionality
 * - Error categorization
 * - Debug information (dev mode)
 */
import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, Server, FileX, Bug } from 'lucide-react';
import { GeneratedWorkout } from '../../../types/workout';

export interface CardErrorDisplayProps {
  error: Error;
  workout?: GeneratedWorkout;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDebugInfo?: boolean;
}

interface ErrorInfo {
  icon: React.ComponentType<any>;
  title: string;
  message: string;
  actionText?: string;
  severity: 'warning' | 'error' | 'critical';
}

export const CardErrorDisplay: React.FC<CardErrorDisplayProps> = ({
  error,
  workout,
  onRetry,
  onDismiss,
  showDebugInfo = process.env.NODE_ENV === 'development'
}) => {
  const getErrorInfo = (error: Error): ErrorInfo => {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return {
        icon: Wifi,
        title: 'Connection Problem',
        message: 'Unable to connect to the server. Please check your internet connection.',
        actionText: 'Retry',
        severity: 'warning'
      };
    }

    // Server errors
    if (message.includes('server') || message.includes('500') || message.includes('503')) {
      return {
        icon: Server,
        title: 'Server Error',
        message: 'The server is experiencing issues. Please try again in a few moments.',
        actionText: 'Retry',
        severity: 'error'
      };
    }

    // Data/parsing errors
    if (message.includes('parse') || message.includes('invalid') || message.includes('corrupt')) {
      return {
        icon: FileX,
        title: 'Data Error',
        message: 'This workout data appears to be corrupted or invalid.',
        actionText: 'Reload',
        severity: 'error'
      };
    }

    // Permission/auth errors
    if (message.includes('unauthorized') || message.includes('forbidden') || message.includes('401') || message.includes('403')) {
      return {
        icon: AlertTriangle,
        title: 'Access Denied',
        message: 'You don\'t have permission to access this workout.',
        severity: 'critical'
      };
    }

    // Generic error
    return {
      icon: Bug,
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred while loading this workout.',
      actionText: 'Retry',
      severity: 'error'
    };
  };

  const errorInfo = getErrorInfo(error);
  const Icon = errorInfo.icon;

  const renderErrorHeader = () => (
    <div className="card-error__header">
      <div className={`card-error__icon card-error__icon--${errorInfo.severity}`}>
        <Icon size={24} />
      </div>
      <div className="card-error__title">
        <h3>{errorInfo.title}</h3>
        {workout && (
          <span className="card-error__workout-title">
            Failed to load: {workout.title}
          </span>
        )}
      </div>
    </div>
  );

  const renderErrorMessage = () => (
    <div className="card-error__message">
      <p>{errorInfo.message}</p>
    </div>
  );

  const renderErrorActions = () => {
    const hasActions = onRetry || onDismiss || errorInfo.actionText;
    if (!hasActions) return null;

    return (
      <div className="card-error__actions">
        {onRetry && errorInfo.actionText && (
          <button 
            className="card-error__action card-error__action--primary"
            onClick={onRetry}
          >
            <RefreshCw size={16} />
            {errorInfo.actionText}
          </button>
        )}
        
        {onDismiss && (
          <button 
            className="card-error__action card-error__action--secondary"
            onClick={onDismiss}
          >
            Dismiss
          </button>
        )}
      </div>
    );
  };

  const renderDebugInfo = () => {
    if (!showDebugInfo) return null;

    return (
      <details className="card-error__debug">
        <summary>Debug Information</summary>
        <div className="card-error__debug-content">
          <div className="debug-section">
            <strong>Error Type:</strong> {error.constructor.name}
          </div>
          <div className="debug-section">
            <strong>Message:</strong> {error.message}
          </div>
          {error.stack && (
            <div className="debug-section">
              <strong>Stack Trace:</strong>
              <pre className="debug-stack">{error.stack}</pre>
            </div>
          )}
          {workout && (
            <div className="debug-section">
              <strong>Workout ID:</strong> {workout.id}
            </div>
          )}
          <div className="debug-section">
            <strong>Timestamp:</strong> {new Date().toISOString()}
          </div>
        </div>
      </details>
    );
  };

  return (
    <div className={`card-error card-error--${errorInfo.severity}`}>
      <div className="card-error__content">
        {renderErrorHeader()}
        {renderErrorMessage()}
        {renderErrorActions()}
        {renderDebugInfo()}
      </div>
    </div>
  );
};

// Default export for easier importing
export default CardErrorDisplay; 