/**
 * Tests for formatErrorMessage utility
 */
import { formatError, getErrorMessage, logError } from '../../../../src/features/workout-generator/utils/formatErrorMessage';
import { API_ERROR_CODES, ErrorCategory } from '../../../../src/features/workout-generator/utils/errorTypes';

describe('Error Formatting Utilities', () => {
  // Mock console.error to prevent test output pollution
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    console.error = jest.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });
  
  describe('getErrorMessage', () => {
    it('should return the correct message for a known error code', () => {
      const message = getErrorMessage(API_ERROR_CODES.NETWORK_ERROR);
      expect(message).toBe('Unable to connect to the server. Please check your internet connection.');
    });
    
    it('should return a fallback message for an unknown error code', () => {
      const message = getErrorMessage('INVALID_CODE');
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });
  });
  
  describe('formatError', () => {
    it('should return the error if it is already formatted', () => {
      const formattedError = {
        code: API_ERROR_CODES.NETWORK_ERROR,
        message: 'Network error',
        category: ErrorCategory.NETWORK,
        retry: true
      };
      
      const result = formatError(formattedError);
      expect(result).toBe(formattedError);
    });
    
    it('should format an Error object with unknown error code', () => {
      const error = new Error('Something went wrong');
      const result = formatError(error);
      
      expect(result).toEqual({
        code: API_ERROR_CODES.UNKNOWN_ERROR,
        message: expect.any(String),
        category: ErrorCategory.UNKNOWN,
        details: {
          name: 'Error',
          stack: error.stack
        },
        retry: false
      });
    });
    
    it('should extract error code from Error message if present', () => {
      const error = new Error(`Error occurred: ${API_ERROR_CODES.NETWORK_ERROR}`);
      const result = formatError(error);
      
      expect(result).toEqual({
        code: API_ERROR_CODES.NETWORK_ERROR,
        message: expect.any(String),
        category: ErrorCategory.NETWORK,
        details: {
          name: 'Error',
          stack: error.stack
        },
        retry: true
      });
    });
    
    it('should format a string error message', () => {
      const result = formatError('String error message');
      
      expect(result).toEqual({
        code: API_ERROR_CODES.UNKNOWN_ERROR,
        message: expect.any(String),
        category: ErrorCategory.UNKNOWN,
        details: undefined,
        retry: false
      });
    });
    
    it('should set retry to true for retryable error categories', () => {
      // Network error
      let result = formatError(new Error(`Error: ${API_ERROR_CODES.NETWORK_ERROR}`));
      expect(result.retry).toBe(true);
      
      // Server error
      result = formatError(new Error(`Error: ${API_ERROR_CODES.SERVER_ERROR}`));
      expect(result.retry).toBe(true);
      
      // Rate limited
      result = formatError(new Error(`Error: ${API_ERROR_CODES.RATE_LIMITED}`));
      expect(result.retry).toBe(true);
      
      // AI provider error
      result = formatError(new Error(`Error: ${API_ERROR_CODES.AI_PROVIDER_ERROR}`));
      expect(result.retry).toBe(true);
      
      // Validation error (not retryable)
      result = formatError(new Error(`Error: ${API_ERROR_CODES.INVALID_INPUT}`));
      expect(result.retry).toBe(false);
    });
  });
  
  describe('logError', () => {
    it('should log the error to console', () => {
      const error = {
        code: API_ERROR_CODES.NETWORK_ERROR,
        message: 'Network error',
        category: ErrorCategory.NETWORK,
        retry: true
      };
      
      logError(error);
      expect(console.error).toHaveBeenCalledWith('[WorkoutGenerator]', error);
    });
  });
}); 