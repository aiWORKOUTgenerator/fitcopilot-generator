/**
 * Error Handler Hook
 * 
 * Centralizes error logging and handling across the application
 * Can be extended to integrate with monitoring services like Sentry
 */
import { useCallback } from 'react';
import { formatError } from '../utils/formatErrorMessage';

// Error context information
export interface ErrorContext {
  componentName?: string;
  action?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Hook for centralized error handling
 * 
 * @returns Functions for handling and logging errors
 */
export function useErrorHandler() {
  /**
   * Log an error with context information
   */
  const logError = useCallback((error: unknown, context: ErrorContext = {}) => {
    const { componentName, action, additionalData } = context;
    
    // If null is passed, this is a success log
    if (error === null) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[FitCopilot]${componentName ? ` ${componentName}` : ''}${action ? ` | ${action}` : ''} - Success`,
          additionalData || {}
        );
      }
      return null;
    }
    
    const formattedError = formatError(error);
    
    // Format context for logging
    const contextStr = [
      componentName && `Component: ${componentName}`,
      action && `Action: ${action}`
    ].filter(Boolean).join(' | ');
    
    // Log to console in development
    console.error(
      `[FitCopilot]${contextStr ? ` ${contextStr} -` : ''} ${formattedError.message}`, 
      { error: formattedError, ...additionalData }
    );
    
    // TODO: Integrate with Sentry or other error tracking service
    // if (typeof window.Sentry !== 'undefined') {
    //   window.Sentry.captureException(error, {
    //     extra: { componentName, action, ...additionalData }
    //   });
    // }
    
    return formattedError;
  }, []);
  
  /**
   * Handle and log an error, optionally running a side effect
   */
  const handleError = useCallback((
    error: unknown, 
    context: ErrorContext = {}, 
    onError?: (formattedError: Error | null) => void
  ) => {
    const formattedError = logError(error, context);
    
    if (onError) {
      onError(formattedError);
    }
    
    return formattedError;
  }, [logError]);
  
  return {
    logError,
    handleError
  };
} 