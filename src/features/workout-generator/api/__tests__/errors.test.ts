/**
 * Unit tests for the API error handling
 * 
 * Tests functionality including:
 * - ApiError creation and properties
 * - Error normalization for different error response formats
 * - Error classification (network, timeout, abort, etc.)
 */

import { ApiError, isAbortError, isTimeoutError, normalizeError } from '../errors';

describe('API Error Handling', () => {
  describe('ApiError', () => {
    test('should create ApiError with basic properties', () => {
      const error = new ApiError('Test message', 400);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Test message');
      expect(error.status).toBe(400);
      expect(error.name).toBe('ApiError');
    });
    
    test('should create ApiError with optional properties', () => {
      const error = new ApiError('Test message', 404, 'not_found', { id: 123 });
      
      expect(error.message).toBe('Test message');
      expect(error.status).toBe(404);
      expect(error.code).toBe('not_found');
      expect(error.data).toEqual({ id: 123 });
    });
    
    test('should have stack trace', () => {
      const error = new ApiError('Test message', 500);
      
      expect(error.stack).toBeDefined();
    });
  });
  
  describe('Error Classification', () => {
    test('should identify AbortError correctly', () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      const regularError = new Error('Regular error');
      
      expect(isAbortError(abortError)).toBe(true);
      expect(isAbortError(regularError)).toBe(false);
      
      // Case where the error has name but is not DOMException
      const mockAbortError = new Error('Aborted');
      mockAbortError.name = 'AbortError';
      expect(isAbortError(mockAbortError)).toBe(true);
    });
    
    test('should identify TimeoutError correctly', () => {
      const timeoutError = new Error('Timeout exceeded');
      timeoutError.name = 'TimeoutError';
      
      const regularError = new Error('Regular error');
      
      expect(isTimeoutError(timeoutError)).toBe(true);
      expect(isTimeoutError(regularError)).toBe(false);
      
      // Timeout message check
      const errorWithTimeoutMessage = new Error('The request timed out');
      expect(isTimeoutError(errorWithTimeoutMessage)).toBe(true);
    });
  });
  
  describe('Error Normalization', () => {
    test('should normalize standard errors into ApiError', () => {
      const standardError = new Error('Standard error');
      const apiError = normalizeError(standardError);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.message).toBe('Standard error');
      expect(apiError.status).toBe(500); // Default status
    });
    
    test('should preserve ApiError instances', () => {
      const originalApiError = new ApiError('Original error', 400, 'invalid_request');
      const normalizedError = normalizeError(originalApiError);
      
      expect(normalizedError).toBe(originalApiError); // Should be the same instance
    });
    
    test('should normalize WordPress REST API errors', () => {
      const wpRestError = {
        code: 'rest_invalid_param',
        message: 'Invalid parameter',
        data: { status: 400, params: { id: 'Invalid ID' } }
      };
      
      const apiError = normalizeError(wpRestError);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.message).toBe('Invalid parameter');
      expect(apiError.status).toBe(400);
      expect(apiError.code).toBe('rest_invalid_param');
      expect(apiError.data).toEqual({ status: 400, params: { id: 'Invalid ID' } });
    });
    
    test('should normalize custom API response errors', () => {
      const customApiResponse = {
        success: false,
        message: 'Custom error message',
        code: 'custom_error',
        data: { details: 'Additional info' }
      };
      
      const apiError = normalizeError(customApiResponse);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.message).toBe('Custom error message');
      expect(apiError.code).toBe('custom_error');
      expect(apiError.data).toEqual({ details: 'Additional info' });
    });
    
    test('should normalize string errors', () => {
      const stringError = 'Simple string error';
      const apiError = normalizeError(stringError);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.message).toBe('Simple string error');
    });
    
    test('should handle null/undefined/non-error inputs', () => {
      const nullError = normalizeError(null);
      expect(nullError).toBeInstanceOf(ApiError);
      expect(nullError.message).toBe('Unknown error');
      
      const undefinedError = normalizeError(undefined);
      expect(undefinedError).toBeInstanceOf(ApiError);
      expect(undefinedError.message).toBe('Unknown error');
      
      const nonErrorObject = normalizeError({ random: 'object' });
      expect(nonErrorObject).toBeInstanceOf(ApiError);
      expect(nonErrorObject.message).toBe('Unknown error');
    });
    
    test('should preserve AbortError characteristics', () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      const normalizedError = normalizeError(abortError);
      
      expect(normalizedError).toBeInstanceOf(ApiError);
      expect(normalizedError.message).toBe('The operation was aborted');
      expect(normalizedError.name).toBe('AbortError');
      expect(isAbortError(normalizedError)).toBe(true);
    });
    
    test('should handle errors with status code', () => {
      const errorWithStatus = new Error('Error with status');
      (errorWithStatus as any).status = 403;
      
      const apiError = normalizeError(errorWithStatus);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.status).toBe(403);
    });
    
    test('should handle network errors', () => {
      const networkError = new TypeError('Failed to fetch');
      const apiError = normalizeError(networkError);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.message).toBe('Failed to fetch');
      expect(apiError.status).toBe(0); // Network errors typically have 0 status
    });
  });
}); 