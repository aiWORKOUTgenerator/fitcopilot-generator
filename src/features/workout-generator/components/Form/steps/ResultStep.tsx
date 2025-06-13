/**
 * ResultStep Component
 * 
 * Displays the final generated workout result with contextual actions.
 * Integrates with dual-modal navigation system for seamless workout editing.
 * 
 * This component represents the completion state of the workout generation flow,
 * providing users with their generated workout and clear action paths for viewing,
 * editing, or generating new workouts. Follows WorkoutGeneratorGrid design patterns
 * with glassmorphism styling and responsive behavior.
 * 
 * Now modularized with sub-components for enhanced maintainability and accessibility:
 * - ResultHeader: Icon, title, and subtitle display
 * - ResultContent: Workout display or error/empty messaging
 * - ResultActions: Contextual action buttons with keyboard navigation
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage with tabbed display
 * <ResultStep 
 *   workout={generatedWorkout}
 *   postId={123}
 *   error={null}
 *   onGenerateNew={() => handleRestart()}
 *   useTabbedDisplay={true}
 * />
 * 
 * // Fallback to legacy WorkoutCard
 * <ResultStep 
 *   workout={generatedWorkout}
 *   postId={123}
 *   error={null}
 *   onGenerateNew={() => handleRestart()}
 *   useTabbedDisplay={false}
 * />
 * ```
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { GeneratedWorkout } from '../../../types/workout';
import ErrorBoundary from '../../common/ErrorBoundary';
import { useNavigation } from '../../../navigation/NavigationContext';
import { ResultHeader, ResultContent, ResultActions } from './components';
import './ResultStep.scss';

interface ResultStepProps {
  /** The generated workout to display */
  workout: GeneratedWorkout | null;
  /** Optional post ID if the workout has been saved */
  postId?: number;
  /** Optional error message to display */
  error: string | null;
  /** Callback when the user wants to generate a new workout */
  onGenerateNew: () => void;
  /** Whether any actions are currently in progress */
  isLoading?: boolean;
  /** Auto-focus the primary action for better accessibility */
  autoFocus?: boolean;
}

/**
 * Component for displaying the generated workout result
 * 
 * Provides three distinct UI states:
 * - Success: Shows workout with actions to view full details or generate new
 * - Error: Displays error message with retry option
 * - Empty: Shows placeholder when no workout is available
 * 
 * Integrates with NavigationContext for seamless modal transitions.
 * Enhanced with modular sub-components for better maintainability.
 */
export const ResultStep: React.FC<ResultStepProps> = ({
  workout,
  postId,
  error,
  onGenerateNew,
  isLoading = false,
  autoFocus = true,
}) => {
  // Use navigation context to control the editor
  const { openEditor } = useNavigation();
  
  // Reference to the main container for focus management
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Determine the current state based on props
  const currentState: 'success' | 'error' | 'empty' = error 
    ? 'error' 
    : workout 
      ? 'success' 
      : 'empty';

  /**
   * Handle workout display actions
   * Processes actions from the tabbed workout display
   * Memoized to prevent unnecessary re-renders
   */
  const handleWorkoutAction = useCallback((action: string, data?: any) => {
    // Get WordPress nonce from global data
    const nonce = (window as any)?.fitcopilotData?.nonce;
    
    switch (action) {
      case 'tab_changed':
        // Log tab changes for analytics (client-side only)
        console.log('Tab changed to:', data?.newFormat);
        break;
      case 'print':
        // Handle print action (client-side only)
        window.print();
        break;
      case 'share':
        // Handle share action (client-side only)
        if (navigator.share && workout) {
          navigator.share({
            title: workout.title,
            text: `Check out my workout: ${workout.title}`,
            url: window.location.href,
          }).catch(console.error);
        }
        break;
      case 'copy':
        // Handle copy action (client-side only)
        if (data?.text) {
          navigator.clipboard.writeText(data.text).catch(console.error);
        }
        break;
      case 'export':
        // Handle export action (would require server communication)
        if (nonce) {
          console.log('Export action with nonce verification:', data);
          // Future: Make API call with nonce for server-side actions
        } else {
          console.warn('WordPress nonce not available for export action');
        }
        break;
      default:
        console.log('Unhandled workout action:', action, data);
    }
  }, [workout]); // Only re-create when workout changes

  /**
   * Handle viewing the full workout details
   * Opens the workout in the dual-modal system for viewing/editing
   */
  const handleViewFullWorkout = () => {
    if (!workout) return;
    
    // Open the workout editor using navigation context
    const workoutId = postId ? String(postId) : 'new';
    openEditor(workoutId, { referrer: 'generator' });
  };

  // Announce state changes to screen readers
  useEffect(() => {
    if (containerRef.current) {
      // Create and dispatch a custom event for screen reader announcements
      const announcement = `Workout generation ${currentState === 'success' ? 'completed successfully' : currentState === 'error' ? 'failed' : 'incomplete'}`;
      
      // Use a live region to announce the result
      const liveRegion = document.getElementById('result-announcements');
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    }
  }, [currentState]);

  return (
    <ErrorBoundary>
      {/* Live region for screen reader announcements */}
      <div 
        id="result-announcements"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      <div 
        className="result-step-premium"
        ref={containerRef}
        role="region"
        aria-labelledby="result-title"
      >
        <div className={`result-step-container result-step-container--${currentState}`}>
          {/* Header Section */}
          <ResultHeader 
            state={currentState}
          />
          
          {/* Content Section */}
          <ResultContent 
            state={currentState}
            workout={workout}
            errorMessage={error}
            onWorkoutAction={handleWorkoutAction}
          />
          
          {/* Actions Section */}
          <ResultActions 
            state={currentState}
            onViewFullWorkout={handleViewFullWorkout}
            onGenerateNew={onGenerateNew}
            isLoading={isLoading}
            autoFocus={autoFocus}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}; 