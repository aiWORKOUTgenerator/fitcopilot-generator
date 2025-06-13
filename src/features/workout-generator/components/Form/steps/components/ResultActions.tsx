/**
 * ResultActions Component
 * 
 * Displays the action buttons for the ResultStep with enhanced accessibility,
 * keyboard navigation, and focus management for different result states.
 * 
 * @component
 */
import React, { useRef, useEffect } from 'react';
import { Button } from '../../../../../../components/ui';
import { RefreshCw, Eye, PlusCircle } from 'lucide-react';

interface ResultActionsProps {
  /** The current state of the result */
  state: 'success' | 'error' | 'empty';
  /** Callback when the view full workout button is clicked */
  onViewFullWorkout?: () => void;
  /** Callback when the generate new workout button is clicked */
  onGenerateNew: () => void;
  /** Whether any actions are currently in progress */
  isLoading?: boolean;
  /** Focus the primary action button on mount */
  autoFocus?: boolean;
}

/**
 * ResultActions Component
 * 
 * Renders contextual action buttons based on the result state with proper
 * ARIA attributes, keyboard navigation, and focus management.
 */
export const ResultActions: React.FC<ResultActionsProps> = ({
  state,
  onViewFullWorkout,
  onGenerateNew,
  isLoading = false,
  autoFocus = false,
}) => {
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (autoFocus && primaryButtonRef.current) {
      // Small delay to ensure component is fully rendered
      const timeoutId = setTimeout(() => {
        primaryButtonRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [autoFocus, state]);

  const renderSuccessActions = () => (
    <>
      <Button 
        ref={primaryButtonRef}
        variant="gradient"
        size="lg"
        onClick={onViewFullWorkout}
        aria-label="View full workout details in editor"
        startIcon={<Eye size={18} aria-hidden="true" />}
        disabled={isLoading}
        className="result-step-button result-step-button--primary"
        data-testid="view-workout-button"
      >
        View Full Workout
      </Button>
      
      <Button
        variant="secondary"
        size="lg"
        onClick={onGenerateNew}
        aria-label="Generate another workout with new parameters"
        startIcon={<PlusCircle size={18} aria-hidden="true" />}
        disabled={isLoading}
        className="result-step-button result-step-button--secondary"
        data-testid="generate-new-button"
      >
        Generate Another Workout
      </Button>
    </>
  );

  const renderErrorActions = () => (
    <Button 
      ref={primaryButtonRef}
      variant="gradient"
      size="lg"
      onClick={onGenerateNew}
      aria-label="Try generating a workout again"
      startIcon={<RefreshCw size={18} aria-hidden="true" />}
      disabled={isLoading}
      className="result-step-button result-step-button--primary"
      data-testid="try-again-button"
    >
      {isLoading ? 'Trying Again...' : 'Try Again'}
    </Button>
  );

  const renderEmptyActions = () => (
    <Button 
      ref={primaryButtonRef}
      variant="gradient"
      size="lg"
      onClick={onGenerateNew}
      aria-label="Generate a new workout"
      startIcon={<RefreshCw size={18} aria-hidden="true" />}
      disabled={isLoading}
      className="result-step-button result-step-button--primary"
      data-testid="generate-new-workout-button"
    >
      {isLoading ? 'Generating...' : 'Generate New Workout'}
    </Button>
  );

  // Handle keyboard navigation within the action group
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const buttons = Array.from(
        event.currentTarget.querySelectorAll('button:not(:disabled)')
      ) as HTMLButtonElement[];
      
      const currentIndex = buttons.indexOf(event.target as HTMLButtonElement);
      
      if (currentIndex !== -1) {
        event.preventDefault();
        
        let nextIndex;
        if (event.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % buttons.length;
        } else {
          nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        }
        
        buttons[nextIndex]?.focus();
      }
    }
  };

  return (
    <div 
      className="result-step-actions"
      role="group"
      aria-label={`${state === 'success' ? 'Workout' : 'Generation'} actions`}
      onKeyDown={handleKeyDown}
    >
      {/* Screen reader context */}
      <div className="sr-only">
        Available actions for {state} state:
      </div>

      {/* Render appropriate actions based on state */}
      {state === 'success' && renderSuccessActions()}
      {state === 'error' && renderErrorActions()}
      {state === 'empty' && renderEmptyActions()}

      {/* Loading announcement for screen readers */}
      {isLoading && (
        <div 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        >
          Processing your request, please wait...
        </div>
      )}
    </div>
  );
}; 