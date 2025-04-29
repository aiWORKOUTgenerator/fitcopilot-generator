/**
 * Enhanced AbortController Hook
 * 
 * This hook provides a wrapper around the AbortController API with the following enhancements:
 * - Tracking of abort reasons for better error handling
 * - Automatic cleanup on component unmount
 * - Step-aware abort handling for multi-step forms
 * - Prevention of memory leaks from orphaned controllers
 * 
 * This hook helps centralize and standardize abort controller usage across the application,
 * particularly for the workout generation flow where reliable cancellation is critical.
 */
import { useRef, useCallback, useEffect } from 'react';
import { FormSteps } from '../types/workout';

/**
 * Standardized abort reasons for consistent error handling
 */
export type AbortReason = 
  | 'user_cancelled' 
  | 'step_transition' 
  | 'timeout' 
  | 'component_unmount'
  | 'form_reset'
  | 'new_request_started';

/**
 * Hook for managing AbortController with reason tracking
 * 
 * @param currentStep - The current form step, used to track step transitions
 * @returns Object with abort controller management methods
 */
export function useAbortController(currentStep?: FormSteps) {
  // Keep references to current controller and reason
  const controllerRef = useRef<AbortController | null>(null);
  const reasonRef = useRef<AbortReason | null>(null);
  const previousStepRef = useRef<FormSteps | undefined>(currentStep);
  
  /**
   * Explicit cleanup function to handle controller abort and reset
   * This centralized function ensures consistent cleanup across all pathways
   *
   * @param forcedReason - Override the current reason with this value
   */
  const cleanupController = useCallback((forcedReason?: AbortReason) => {
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      try {
        // Use forced reason if provided, otherwise fallback to current reason or default
        const abortReason = forcedReason || reasonRef.current || 'component_unmount';
        reasonRef.current = abortReason;
        
        try {
          // Try modern approach with reason parameter
          controllerRef.current.abort(abortReason);
        } catch (innerError) {
          // Fallback for older browsers that don't support abort with reason
          try {
            controllerRef.current.abort();
          } catch (fallbackError) {
            console.debug('Failed to abort controller:', fallbackError);
          }
        }
      } catch (e) {
        // Ignore errors during abort
      }
      controllerRef.current = null;
      reasonRef.current = null;
    }
  }, []);
  
  /**
   * Explicitly reset controller state without aborting
   * Use this to clear any lingering state between generation attempts
   */
  const resetController = useCallback(() => {
    controllerRef.current = null;
    reasonRef.current = null;
  }, []);
  
  /**
   * Get a new signal for a request, aborting any existing request
   * 
   * @param reason - The reason for aborting any existing request
   * @returns AbortSignal for the new request
   */
  const getSignal = useCallback((reason: AbortReason = 'new_request_started'): AbortSignal => {
    // Clean up existing controller if present
    if (controllerRef.current) {
      cleanupController(reason);
    }
    
    // Ensure we start with a clean slate
    resetController();
    
    // Create a new controller with the current reason
    controllerRef.current = new AbortController();
    reasonRef.current = reason;
    
    return controllerRef.current.signal;
  }, [cleanupController, resetController]);
  
  /**
   * Abort the current request if one exists
   * 
   * @param reason - The reason for aborting the request
   * @returns Whether a request was aborted
   */
  const abort = useCallback((reason: AbortReason): boolean => {
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      reasonRef.current = reason;
      // Call abort with reason parameter - this is the correct way to set the reason
      try {
        // Try modern approach with reason parameter
        controllerRef.current.abort(reason);
      } catch (e) {
        // Fallback for older browsers
        try {
          controllerRef.current.abort();
        } catch (innerError) {
          console.debug('Failed to abort controller:', innerError);
        }
      }
      
      // Reset the controller reference after aborting
      controllerRef.current = null;
      return true;
    }
    return false;
  }, []);
  
  /**
   * Check if there is an active request
   * 
   * @returns Whether there is an active request
   */
  const hasActiveRequest = useCallback((): boolean => {
    return controllerRef.current !== null && !controllerRef.current.signal.aborted;
  }, []);
  
  /**
   * Get the current abort reason if one exists
   * 
   * @returns The current abort reason or null
   */
  const getCurrentReason = useCallback((): AbortReason | null => {
    return reasonRef.current;
  }, []);
  
  /**
   * Clear the current controller reference
   * Useful after handling an aborted request
   */
  const clear = useCallback((): void => {
    controllerRef.current = null;
    reasonRef.current = null;
  }, []);
  
  // Automatically abort on step change if specified
  useEffect(() => {
    if (currentStep && previousStepRef.current && currentStep !== previousStepRef.current) {
      // Only abort if we're moving away from the generating step to a non-completed step
      // This prevents aborting when transitioning from generating → completed (success case)
      if (previousStepRef.current === 'generating' && currentStep !== 'completed') {
        abort('step_transition');
      }
    }
    
    previousStepRef.current = currentStep;
  }, [currentStep, abort]);
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      // Always use 'component_unmount' as the reason when cleaning up during unmount
      cleanupController('component_unmount');
    };
  }, [cleanupController]);
  
  return {
    getSignal,
    abort,
    hasActiveRequest,
    getCurrentReason,
    clear,
    cleanupController,
    resetController
  };
} 