/**
 * ResultHeader Component
 * 
 * Displays the header section of the ResultStep with icon, title, and subtitle.
 * Provides contextual visual feedback for different result states (success, error, empty).
 * 
 * @component
 */
import React from 'react';
import { RefreshCw, PlusCircle, CheckCircle, Sparkles } from 'lucide-react';

interface ResultHeaderProps {
  /** The current state of the result */
  state: 'success' | 'error' | 'empty';
  /** Optional custom title to override default state titles */
  customTitle?: string;
  /** Optional custom subtitle for additional context */
  customSubtitle?: string;
}

/**
 * Maps result states to their corresponding icons
 */
const getStateIcon = (state: ResultHeaderProps['state'], size: number = 24) => {
  switch (state) {
    case 'success':
      return <CheckCircle size={size} aria-hidden="true" />;
    case 'error':
      return <RefreshCw size={size} aria-hidden="true" />;
    case 'empty':
      return <PlusCircle size={size} aria-hidden="true" />;
    default:
      return <CheckCircle size={size} aria-hidden="true" />;
  }
};

/**
 * Maps result states to their default titles
 */
const getStateTitle = (state: ResultHeaderProps['state']): string => {
  switch (state) {
    case 'success':
      return 'Your Custom Workout';
    case 'error':
      return 'Error Generating Workout';
    case 'empty':
      return 'No Workout Generated';
    default:
      return 'Workout Result';
  }
};

/**
 * Maps result states to their CSS modifier classes
 */
const getStateModifier = (state: ResultHeaderProps['state']): string => {
  return `result-step-icon--${state}`;
};

/**
 * ResultHeader Component
 * 
 * Renders the visual header for workout generation results with appropriate
 * icons, titles, and accessibility attributes for different states.
 */
export const ResultHeader: React.FC<ResultHeaderProps> = ({
  state,
  customTitle,
  customSubtitle,
}) => {
  const title = customTitle || getStateTitle(state);
  const isSuccessState = state === 'success';
  
  return (
    <header className="result-step-header" role="banner">
      <div className={`result-step-icon ${getStateModifier(state)}`}>
        {getStateIcon(state, 24)}
      </div>
      
      {/* Use h2 for success (main result), h3 for error/empty states */}
      {isSuccessState ? (
        <h2 className="result-step-title" id="result-title">
          {title}
        </h2>
      ) : (
        <h3 className="result-step-title" id="result-title">
          {title}
        </h3>
      )}
      
      {/* Subtitle only shown for success state or custom subtitle */}
      {(isSuccessState || customSubtitle) && (
        <div 
          className="result-step-subtitle"
          aria-describedby="result-title"
        >
          {isSuccessState && !customSubtitle && (
            <>
              <Sparkles size={16} className="sparkle-icon" aria-hidden="true" />
              Generated with your preferences
            </>
          )}
          {customSubtitle && customSubtitle}
        </div>
      )}
      
      {/* Screen reader only content for better context */}
      <div className="sr-only">
        Workout generation result: {state === 'success' ? 'successful' : state === 'error' ? 'failed' : 'incomplete'}
      </div>
    </header>
  );
}; 