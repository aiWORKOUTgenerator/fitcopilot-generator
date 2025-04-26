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
    it('should return the error if it is already an Error instance', () => {
      const error = new Error('Network error');
      const result = formatError(error);
      expect(result).toBe(error);
    });
    
    it('should format a string into an Error object', () => {
      const result = formatError('String error message');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('String error message');
    });
    
    it('should format an object with message property', () => {
      const errorObj = { message: 'Object error message' };
      const result = formatError(errorObj);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Object error message');
    });
    
    it('should format an object with error property', () => {
      const errorObj = { error: 'Object error property' };
      const result = formatError(errorObj);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Object error property');
    });
    
    it('should format an object with code and message properties', () => {
      const errorObj = { 
        code: API_ERROR_CODES.NETWORK_ERROR, 
        message: 'Network error with code' 
      };
      const result = formatError(errorObj);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Network error with code');
      expect((result as any).code).toBe(API_ERROR_CODES.NETWORK_ERROR);
    });
    
    it('should format null to a generic error', () => {
      const result = formatError(null);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('An unknown error occurred');
    });
    
    it('should convert an object to a JSON string in the error message', () => {
      const obj = { foo: 'bar' };
      const result = formatError(obj);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Unknown error: {"foo":"bar"}');
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
      
      logError(error as any);
      expect(console.error).toHaveBeenCalledWith('[WorkoutGenerator]', error);
    });
  });
}); 