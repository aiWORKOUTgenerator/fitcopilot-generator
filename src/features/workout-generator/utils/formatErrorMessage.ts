/**
 * Error message formatting utilities
 * Transforms error codes into user-friendly messages
 */
import { API_ERROR_CODES, ErrorCategory, ERROR_CATEGORY_MAP, WorkoutGeneratorError } from './errorTypes';

// User-friendly messages for error codes
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  [API_ERROR_CODES.INVALID_NONCE]: 'Your session has expired. Please refresh the page and try again.',
  [API_ERROR_CODES.UNAUTHORIZED]: 'You need to be logged in to perform this action.',
  [API_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'You don\'t have permission to perform this action.',
  
  // Network errors
  [API_ERROR_CODES.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
  [API_ERROR_CODES.REQUEST_TIMEOUT]: 'The request timed out. Please try again later.',
  [API_ERROR_CODES.REQUEST_ABORTED]: 'The request was cancelled.',
  
  // Server errors
  [API_ERROR_CODES.SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
  [API_ERROR_CODES.MAINTENANCE_MODE]: 'The service is currently undergoing maintenance. Please try again later.',
  [API_ERROR_CODES.RATE_LIMITED]: 'You\'ve made too many requests. Please wait a moment before trying again.',
  
  // AI provider errors
  [API_ERROR_CODES.AI_PROVIDER_ERROR]: 'There was an issue with the AI service. Please try again later.',
  [API_ERROR_CODES.PROMPT_ERROR]: 'There was an issue with your workout request. Please try different parameters.',
  [API_ERROR_CODES.PARSING_ERROR]: 'We couldn\'t process the AI response. Please try again with different parameters.',
  [API_ERROR_CODES.CONTENT_MODERATION]: 'Your request was flagged by content moderation. Please try different parameters.',
  
  // Input validation errors
  [API_ERROR_CODES.INVALID_INPUT]: 'Please check your input and try again.',
  [API_ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
  [API_ERROR_CODES.INVALID_FORMAT]: 'One or more fields have an invalid format.',
  
  // Data storage errors
  [API_ERROR_CODES.STORAGE_ERROR]: 'There was an issue saving your workout. Please try again.',
  [API_ERROR_CODES.WORKOUT_NOT_FOUND]: 'The requested workout could not be found.',
  
  // Unknown errors
  [API_ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again later.'
};

// Fallback error messages by category
const CATEGORY_FALLBACK_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.AUTH]: 'Authentication error. Please log in and try again.',
  [ErrorCategory.NETWORK]: 'Network error. Please check your connection and try again.',
  [ErrorCategory.SERVER]: 'Server error. Please try again later.',
  [ErrorCategory.AI_PROVIDER]: 'AI service error. Please try again with different parameters.',
  [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
  [ErrorCategory.STORAGE]: 'Storage error. Please try again later.',
  [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again later.'
};

/**
 * Get a user-friendly error message from an error code
 * 
 * @param code - The error code
 * @returns A user-friendly error message
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || 'An unexpected error occurred. Please try again.';
}

/**
 * Format an error into a standardized Error object
 * 
 * @param error - The error to format
 * @returns A standardized Error object
 */
export function formatError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  if (typeof error === 'object' && error !== null) {
    // Handle API error responses
    if ('message' in error && typeof error.message === 'string') {
      const formattedError = new Error(error.message);
      
      // Copy code property if it exists
      if ('code' in error && error.code) {
        (formattedError as any).code = error.code;
      }
      
      return formattedError;
    }
    
    // Handle server error objects
    if ('error' in error && typeof error.error === 'string') {
      return new Error(error.error);
    }
    
    // Handle generic error objects with code and message
    if ('code' in error && 'message' in error && typeof error.message === 'string') {
      const formattedError = new Error(error.message);
      // Add code as a property to the error
      (formattedError as any).code = error.code;
      return formattedError;
    }
  }
  
  // For unexpected values, return a generic error
  return new Error(
    typeof error === 'object' && error !== null
      ? `Unknown error: ${JSON.stringify(error)}`
      : 'An unknown error occurred'
  );
}

/**
 * Get a user-friendly error message
 * 
 * @param error - The error to format
 * @param fallback - Optional fallback message
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(
  error: unknown, 
  fallback = 'Something went wrong. Please try again.'
): string {
  const formattedError = formatError(error);
  
  // Match known error patterns and return friendly messages
  if (formattedError.message.includes('network') || 
      formattedError.message.includes('Network Error') ||
      formattedError.message.includes('Failed to fetch')) {
    return 'A network error occurred. Please check your connection and try again.';
  }
  
  if (formattedError.message.includes('timeout') || 
      formattedError.message.includes('Timeout')) {
    return 'The request timed out. Please try again.';
  }
  
  if (formattedError.message.includes('unauthorized') || 
      formattedError.message.includes('not logged in') ||
      formattedError.message.includes('authentication')) {
    return 'Your session may have expired. Please refresh the page and try again.';
  }
  
  // Return the original message if it seems user-friendly enough,
  // otherwise return the fallback message
  return formattedError.message.length > 10 && !formattedError.message.includes('Error:')
    ? formattedError.message
    : fallback;
}

/**
 * Log an error to the console and potentially to monitoring services
 * 
 * @param error - The error to log
 */
export function logError(error: WorkoutGeneratorError): void {
  // Console logging for development
  console.error('[WorkoutGenerator]', error);
  
  // TODO: Add integration with monitoring services like Sentry
  // if (process.env.NODE_ENV === 'production') {
  //   // Sentry.captureException(error);
  // }
} 