/**
 * API Client Unit Tests
 * 
 * Tests the API client functionality including:
 * - Browser compatibility with different fetch implementations
 * - Timeout handling and cancellation 
 * - AbortController and polyfill functionality
 */

import { makeRequest, abortableRequest, API_NAMESPACE } from '../client';
import { ApiError } from '../errors';

describe('API Client', () => {
  // Store original fetch implementation
  const originalFetch = global.fetch;
  
  // Mock response data
  const mockResponseData = { success: true, data: { id: 1 } };
  
  // Mock server setup function
  const setupMockServer = (responseData = mockResponseData, status = 200, delay = 0) => {
    global.fetch = jest.fn().mockImplementation((url, options) => {
      // Create mock response
      const response = {
        ok: status >= 200 && status < 300,
        status,
        json: jest.fn().mockResolvedValue(responseData),
        text: jest.fn().mockResolvedValue(JSON.stringify(responseData)),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      };
      
      // Handle abort signal
      if (options?.signal) {
        if (options.signal.aborted) {
          const error = new Error('The operation was aborted');
          error.name = 'AbortError';
          return Promise.reject(error);
        }
        
        // Set up listener for future aborts
        const listener = () => {
          const error = new Error('The operation was aborted');
          error.name = 'AbortError';
          throw error;
        };
        
        options.signal.addEventListener('abort', listener);
      }
      
      // Return promise with optional delay
      return delay > 0
        ? new Promise(resolve => setTimeout(() => resolve(response), delay))
        : Promise.resolve(response);
    });
    
    return global.fetch;
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for successful responses
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: { result: 'test' } }),
        headers: new Headers({ 'content-type': 'application/json' })
      })
    );
  });
  
  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    jest.useRealTimers();
  });
  
  describe('makeRequest', () => {
    test('successfully fetches data and parses JSON', async () => {
      setupMockServer();
      
      const result = await makeRequest('/test-endpoint');
      
      expect(result).toEqual(mockResponseData);
      expect(global.fetch).toHaveBeenCalledWith(
        '/test-endpoint',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
        })
      );
    });
    
    test('sends request with payload when provided', async () => {
      setupMockServer();
      
      const payload = { name: 'Test', value: 123 };
      
      await makeRequest('/test-endpoint', {
        method: 'POST',
        data: payload,
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
    
    test('gracefully handles network errors', async () => {
      // Mock a network error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));
      
      await expect(makeRequest('/test-endpoint')).rejects.toThrow('Network failure');
    });
    
    test('consistently applies headers to all requests', async () => {
      setupMockServer();
      
      const customHeaders = {
        'X-Custom-Header': 'custom-value',
        'Authorization': 'Bearer token123',
      };
      
      await makeRequest('/test-endpoint', {
        headers: customHeaders,
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/test-endpoint',
        expect.objectContaining({
          headers: expect.objectContaining(customHeaders),
        })
      );
    });
    
    test('handles JSON parse errors', async () => {
      // Setup mock with invalid JSON
      global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.reject(new Error('Invalid JSON')),
          text: () => Promise.resolve('invalid json content'),
          headers: new Headers({ 'Content-Type': 'application/json' }),
        });
      });
      
      await expect(makeRequest('/test-endpoint')).rejects.toThrow('Invalid JSON');
    });
    
    test('handles non-200 responses with error objects', async () => {
      const errorResponse = { 
        success: false, 
        message: 'Not found', 
        code: 'RESOURCE_NOT_FOUND' 
      };
      
      setupMockServer(errorResponse, 404);
      
      const result = await makeRequest('/test-endpoint');
      
      expect(result).toEqual(errorResponse);
    });
  });
  
  describe('abortableRequest', () => {
    test('successfully completes request with abort signal', async () => {
      setupMockServer();
      
      const controller = new AbortController();
      
      const result = await abortableRequest({
        url: '/test-endpoint',
        signal: controller.signal,
      });
      
      expect(result).toEqual(mockResponseData);
      expect(global.fetch).toHaveBeenCalledWith(
        '/test-endpoint',
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });
    
    test('aborts request when signal is triggered', async () => {
      // Setup a delayed response
      setupMockServer(mockResponseData, 200, 500);
      
      jest.useFakeTimers();
      
      const controller = new AbortController();
      
      // Start request
      const requestPromise = abortableRequest({
        url: '/test-endpoint',
        signal: controller.signal,
      });
      
      // Abort the request
      controller.abort();
      
      // Need to wait for the promise to resolve or reject
      jest.runAllTimers();
      
      await expect(requestPromise).rejects.toThrow(/abort/i);
    });
    
    test('handles request timeout correctly', async () => {
      // Setup a delayed response (2 seconds)
      setupMockServer(mockResponseData, 200, 2000);
      
      jest.useFakeTimers();
      
      // Start request with 1 second timeout
      const requestPromise = abortableRequest({
        url: '/test-endpoint',
        timeout: 1000,
      });
      
      // Fast-forward time past the timeout
      jest.advanceTimersByTime(1100);
      
      // Allow any pending promises to resolve
      jest.runAllTimers();
      
      await expect(requestPromise).rejects.toThrow(/timeout/i);
    });
    
    test('falls back to polyfill when AbortController is not available', async () => {
      setupMockServer();
      
      // Remove AbortController from global
      const originalAbortController = global.AbortController;
      // @ts-ignore - Intentionally removing for test
      global.AbortController = undefined;
      
      try {
        const result = await abortableRequest({
          url: '/test-endpoint',
        });
        
        expect(result).toEqual(mockResponseData);
        expect(global.fetch).toHaveBeenCalledWith(
          '/test-endpoint',
          expect.objectContaining({
            // Should still have a signal-like object
            signal: expect.objectContaining({
              aborted: expect.any(Boolean),
            }),
          })
        );
      } finally {
        // Restore AbortController
        global.AbortController = originalAbortController;
      }
    });
    
    test('retries failed requests according to retry configuration', async () => {
      // First two calls fail, third one succeeds
      const mockFetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockImplementationOnce(() => {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponseData),
            headers: new Headers({ 'Content-Type': 'application/json' }),
          });
        });
      
      global.fetch = mockFetch;
      
      const result = await abortableRequest({
        url: '/test-endpoint',
        retries: 3,
        retryDelay: 100,
      });
      
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockResponseData);
    });
    
    test('respects browser cache settings', async () => {
      setupMockServer();
      
      await abortableRequest({
        url: '/test-endpoint',
        cache: 'no-cache',
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/test-endpoint',
        expect.objectContaining({
          cache: 'no-cache',
        })
      );
    });
    
    test('adds custom headers to the request', async () => {
      setupMockServer();
      
      await abortableRequest({
        url: '/test-endpoint',
        headers: {
          'X-Custom-Header': 'test-value',
        },
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/test-endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'test-value',
          }),
        })
      );
    });
    
    test('uses correct HTTP method for the request', async () => {
      setupMockServer();
      
      await abortableRequest({
        url: '/test-endpoint',
        method: 'DELETE',
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/test-endpoint',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
    
    test('includes payload in the request body', async () => {
      setupMockServer();
      
      const payload = { id: 123, action: 'update' };
      
      await abortableRequest({
        url: '/test-endpoint',
        method: 'PUT',
        data: payload,
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/test-endpoint',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      );
    });
  });

  test('should make GET requests with proper headers', async () => {
    await makeRequest('endpoint');
    
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_NAMESPACE}endpoint`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-WP-Nonce': expect.any(String)
        })
      })
    );
  });
  
  test('should make POST requests with body and proper headers', async () => {
    const requestBody = { test: 'data' };
    
    await makeRequest('endpoint', {
      method: 'POST',
      body: requestBody
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_NAMESPACE}endpoint`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-WP-Nonce': expect.any(String)
        }),
        body: JSON.stringify(requestBody)
      })
    );
  });
  
  test('should parse JSON responses correctly', async () => {
    const result = await makeRequest('endpoint');
    
    expect(result).toEqual({ success: true, data: { result: 'test' } });
  });
  
  test('should handle non-JSON responses', async () => {
    // Mock text response
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve('Plain text response'),
        headers: new Headers({ 'content-type': 'text/plain' })
      })
    );
    
    const result = await makeRequest('endpoint');
    
    // Should return raw text for non-JSON responses
    expect(result).toBe('Plain text response');
  });
  
  test('should throw ApiError for 4xx/5xx responses', async () => {
    // Mock error response
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ 
          success: false, 
          message: 'Resource not found',
          code: 'not_found' 
        })
      })
    );
    
    await expect(makeRequest('not-found')).rejects.toThrow(ApiError);
    
    try {
      await makeRequest('not-found');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.status).toBe(404);
      expect(apiError.message).toBe('Resource not found');
      expect(apiError.code).toBe('not_found');
    }
  });
  
  test('should handle network errors', async () => {
    // Mock network failure
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    await expect(makeRequest('endpoint')).rejects.toThrow('Network error');
  });
  
  test('should handle malformed JSON responses', async () => {
    // Mock bad JSON response
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
        headers: new Headers({ 'content-type': 'application/json' })
      })
    );
    
    await expect(makeRequest('endpoint')).rejects.toThrow('Invalid JSON');
  });
  
  test('should support abort signal', async () => {
    const abortController = new AbortController();
    
    // Create a promise that we can resolve to simulate an aborted request
    let rejectFetch: (reason?: any) => void;
    global.fetch = jest.fn().mockImplementationOnce(() => 
      new Promise((_resolve, reject) => {
        rejectFetch = reject;
      })
    );
    
    // Start request with abort signal
    const requestPromise = makeRequest('endpoint', {
      signal: abortController.signal
    });
    
    // Abort the request
    abortController.abort();
    
    // Simulate fetch rejection due to abort
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    rejectFetch!(abortError);
    
    // Verify request throws AbortError
    await expect(requestPromise).rejects.toThrow('The operation was aborted');
    await expect(requestPromise).rejects.toHaveProperty('name', 'AbortError');
  });
  
  test('should pass custom headers to request', async () => {
    await makeRequest('endpoint', {
      headers: {
        'X-Custom-Header': 'custom-value',
        'Authorization': 'Bearer token'
      }
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_NAMESPACE}endpoint`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-WP-Nonce': expect.any(String),
          'X-Custom-Header': 'custom-value',
          'Authorization': 'Bearer token'
        })
      })
    );
  });
  
  test('should normalize API errors consistently', async () => {
    // Test different error response formats
    
    // WordPress REST API error format
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ 
          code: 'rest_invalid_param',
          message: 'Invalid parameter',
          data: { status: 400 }
        })
      })
    );
    
    await expect(makeRequest('endpoint')).rejects.toThrow(ApiError);
    
    try {
      await makeRequest('endpoint');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.status).toBe(400);
      expect(apiError.message).toBe('Invalid parameter');
      expect(apiError.code).toBe('rest_invalid_param');
    }
    
    // Custom error format
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ 
          success: false,
          message: 'Server error',
          code: 'server_error' 
        })
      })
    );
    
    try {
      await makeRequest('endpoint');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.status).toBe(500);
      expect(apiError.message).toBe('Server error');
      expect(apiError.code).toBe('server_error');
    }
    
    // String error message
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve('Access denied')
      })
    );
    
    try {
      await makeRequest('endpoint');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.status).toBe(403);
      expect(apiError.message).toBe('Access denied');
    }
  });
  
  test('should handle empty responses', async () => {
    // Mock empty response (204 No Content)
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.reject(new Error('No content')),
        text: () => Promise.resolve(''),
        headers: new Headers({ 'content-type': 'application/json' })
      })
    );
    
    const result = await makeRequest('endpoint');
    
    // Empty response should be null
    expect(result).toBeNull();
  });
  
  test('should correctly build URLs with query parameters', async () => {
    await makeRequest('endpoint', {
      params: {
        id: 123,
        filter: 'active',
        include: ['name', 'description']
      }
    });
    
    // URL should include query parameters
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_NAMESPACE}endpoint?id=123&filter=active&include=name%2Cdescription`,
      expect.any(Object)
    );
  });
}); 