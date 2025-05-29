/**
 * Validation Feedback Component
 * 
 * Displays real-time validation messages for workout fields with appropriate
 * visual styling and severity indicators. Integrates with useWorkoutValidation
 * hook to provide immediate feedback to users.
 */

import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Lightbulb } from 'lucide-react';
import './ValidationFeedback.scss';

export interface ValidationMessage {
  /** Unique identifier for the message */
  id: string;
  /** The validation message text */
  message: string;
  /** Severity level of the validation */
  severity: 'error' | 'warning' | 'info' | 'success';
  /** Field this message relates to */
  field?: string;
  /** Additional context or help text */
  context?: string;
}

export interface ValidationFeedbackProps {
  /** Array of validation messages to display */
  messages: ValidationMessage[];
  /** Field name this feedback is for */
  fieldName?: string;
  /** Whether to show only the highest severity message */
  showOnlyHighest?: boolean;
  /** Whether to group messages by severity */
  groupBySeverity?: boolean;
  /** Maximum number of messages to show */
  maxMessages?: number;
  /** Whether to show suggestions */
  showSuggestions?: boolean;
  /** Array of suggestion messages */
  suggestions?: string[];
  /** Callback when a suggestion is clicked */
  onSuggestionClick?: (suggestion: string) => void;
  /** Whether the field is currently being validated */
  isValidating?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Gets the appropriate icon for each severity level
 */
const getSeverityIcon = (severity: ValidationMessage['severity'], size: number = 16) => {
  switch (severity) {
    case 'error':
      return <AlertCircle size={size} />;
    case 'warning':
      return <AlertTriangle size={size} />;
    case 'info':
      return <Info size={size} />;
    case 'success':
      return <CheckCircle size={size} />;
    default:
      return <Info size={size} />;
  }
};

/**
 * Determines severity priority for sorting
 */
const getSeverityPriority = (severity: ValidationMessage['severity']): number => {
  switch (severity) {
    case 'error': return 4;
    case 'warning': return 3;
    case 'info': return 2;
    case 'success': return 1;
    default: return 0;
  }
};

/**
 * Groups messages by severity level
 */
const groupMessagesBySeverity = (messages: ValidationMessage[]) => {
  return messages.reduce((groups, message) => {
    if (!groups[message.severity]) {
      groups[message.severity] = [];
    }
    groups[message.severity].push(message);
    return groups;
  }, {} as Record<ValidationMessage['severity'], ValidationMessage[]>);
};

/**
 * Validation Feedback with real-time messages and suggestions
 */
export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  messages,
  fieldName,
  showOnlyHighest = false,
  groupBySeverity = false,
  maxMessages,
  showSuggestions = true,
  suggestions = [],
  onSuggestionClick,
  isValidating = false,
  className = ''
}) => {
  const [visibleMessages, setVisibleMessages] = useState<ValidationMessage[]>([]);
  const [animatingMessages, setAnimatingMessages] = useState<Set<string>>(new Set());

  // Process and filter messages
  useEffect(() => {
    let processedMessages = [...messages];

    // Filter by field if specified
    if (fieldName) {
      processedMessages = processedMessages.filter(msg => 
        !msg.field || msg.field === fieldName
      );
    }

    // Sort by severity priority
    processedMessages.sort((a, b) => 
      getSeverityPriority(b.severity) - getSeverityPriority(a.severity)
    );

    // Show only highest priority if requested
    if (showOnlyHighest && processedMessages.length > 0) {
      const highestSeverity = processedMessages[0].severity;
      processedMessages = processedMessages.filter(msg => msg.severity === highestSeverity);
    }

    // Limit number of messages
    if (maxMessages && processedMessages.length > maxMessages) {
      processedMessages = processedMessages.slice(0, maxMessages);
    }

    setVisibleMessages(processedMessages);
  }, [messages, fieldName, showOnlyHighest, maxMessages]);

  // Handle message animations
  useEffect(() => {
    const newMessageIds = visibleMessages.map(msg => msg.id);
    const currentIds = Array.from(animatingMessages);
    
    // Animate new messages
    const newIds = newMessageIds.filter(id => !currentIds.includes(id));
    if (newIds.length > 0) {
      setAnimatingMessages(prev => new Set([...prev, ...newIds]));
      
      // Remove animation class after animation completes
      const timer = setTimeout(() => {
        setAnimatingMessages(prev => {
          const updated = new Set(prev);
          newIds.forEach(id => updated.delete(id));
          return updated;
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [visibleMessages, animatingMessages]);

  // Generate component classes
  const componentClasses = [
    'validation-feedback',
    isValidating ? 'validation-feedback--validating' : '',
    className
  ].filter(Boolean).join(' ');

  // Don't render if no messages and no suggestions
  if (visibleMessages.length === 0 && suggestions.length === 0 && !isValidating) {
    return null;
  }

  // Render grouped messages
  const renderGroupedMessages = () => {
    const groups = groupMessagesBySeverity(visibleMessages);
    const severityOrder: ValidationMessage['severity'][] = ['error', 'warning', 'info', 'success'];

    return severityOrder.map(severity => {
      const severityMessages = groups[severity];
      if (!severityMessages || severityMessages.length === 0) return null;

      return (
        <div key={severity} className={`validation-feedback__group validation-feedback__group--${severity}`}>
          {severityMessages.map(message => renderMessage(message))}
        </div>
      );
    });
  };

  // Render individual message
  const renderMessage = (message: ValidationMessage) => {
    const isAnimating = animatingMessages.has(message.id);
    
    return (
      <div
        key={message.id}
        className={`validation-feedback__message validation-feedback__message--${message.severity} ${
          isAnimating ? 'validation-feedback__message--animating' : ''
        }`}
        role="alert"
        aria-live="polite"
      >
        <div className="validation-feedback__message-content">
          <div className="validation-feedback__icon">
            {getSeverityIcon(message.severity)}
          </div>
          <div className="validation-feedback__text">
            <div className="validation-feedback__primary-text">
              {message.message}
            </div>
            {message.context && (
              <div className="validation-feedback__context-text">
                {message.context}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render suggestions
  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <div className="validation-feedback__suggestions">
        <div className="validation-feedback__suggestions-header">
          <Lightbulb size={14} />
          <span>Suggestions:</span>
        </div>
        <div className="validation-feedback__suggestions-list">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="validation-feedback__suggestion"
              onClick={() => onSuggestionClick?.(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={componentClasses}>
      {isValidating && (
        <div className="validation-feedback__validating">
          <div className="validation-feedback__spinner" />
          <span>Validating...</span>
        </div>
      )}

      <div className="validation-feedback__messages">
        {groupBySeverity ? renderGroupedMessages() : visibleMessages.map(renderMessage)}
      </div>

      {renderSuggestions()}
    </div>
  );
};

export default ValidationFeedback; 