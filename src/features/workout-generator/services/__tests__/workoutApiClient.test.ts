/**
 * Tests for workoutApiClient
 */
import { workoutApiClient, ApiRequestOptions } from '../workoutApiClient';
import { createMockBrowserEnvironment } from '../../__tests__/browser-compatibility-utils';

describe('WorkoutApiClient', () => {
  // Mock fetch
  global.fetch = jest.fn();
  
  // Mock setTimeout and clearTimeout
  jest.useFakeTimers();
  
  // Mock nonce settings
  (window as any).wpApiSettings = {
    nonce: 'test-nonce-123'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    jest.clearAllTimers();
  });
  
  describe('generateWorkout', () => {
    it('should make request with correct parameters', async () => {
      // Setup mock response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          success: true,
          data: { workout: { title: 'Test Workout' } }
        })
      });
      
      // Create AbortController for testing
      const controller = new AbortController();
      
      // Create test parameters
      const params = {
        duration: 30,
        difficulty: 'intermediate',
        goals: 'strength'
      };
      
      const options: ApiRequestOptions = {
        signal: controller.signal,
        timeout: 30000,
        retries: 1
      };
      
      // Call the method
      const result = await workoutApiClient.generateWorkout(params, options);
      
      // Verify fetch was called with the right arguments
      expect(global.fetch).toHaveBeenCalledWith(
        '/wp-json/fitcopilot/v1/generate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': 'test-nonce-123'
          },
          body: JSON.stringify(params)
        })
      );
      
      // Verify the result
      expect(result).toEqual({
        success: true,
        data: { workout: { title: 'Test Workout' } }
      });
    });
    
    it('should handle API errors', async () => {
      // Setup mock error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValueOnce({
          success: false,
          message: 'Invalid parameters',
          code: 'invalid_params'
        })
      });
      
      // Create AbortController for testing
      const controller = new AbortController();
      
      // Call with any parameters
      const result = await workoutApiClient.generateWorkout(
        { duration: 30 },
        { signal: controller.signal }
      );
      
      // Verify error was handled properly
      expect(result).toEqual({
        success: false,
        message: 'Invalid parameters',
        code: 'invalid_params'
      });
    });
    
    it('should handle network errors with retry', async () => {
      // First request fails with network error, second succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('network failure'))
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({
            success: true,
            data: { workout: { title: 'Test Workout' } }
          })
        });
      
      // Create AbortController for testing
      const controller = new AbortController();
      
      // Call the method
      const promise = workoutApiClient.generateWorkout(
        { duration: 30 },
        { signal: controller.signal, retries: 1 }
      );
      
      // Fast-forward through retry delay
      jest.runAllTimers();
      
      // Resolve promise
      const result = await promise;
      
      // Verify fetch was called twice (original + retry)
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // Verify the result
      expect(result).toEqual({
        success: true,
        data: { workout: { title: 'Test Workout' } }
      });
    });
    
    it('should abort request when signal is aborted', async () => {
      // Setup mock that will never resolve (simulating long request)
      const fetchPromise = new Promise(() => {});
      (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);
      
      // Create AbortController for testing
      const controller = new AbortController();
      
      // Start request
      const resultPromise = workoutApiClient.generateWorkout(
        { duration: 30 },
        { signal: controller.signal }
      );
      
      // Abort the request
      controller.abort('user_cancelled');
      
      // Should return error response
      const result = await resultPromise;
      
      // Verify error was handled properly
      expect(result).toEqual({
        success: false,
        message: 'Workout generation was cancelled.',
        code: 'abort_user_cancelled'
      });
    });
    
    it('should timeout after specified duration', async () => {
      // Setup mock that will never resolve (simulating hanging request)
      const fetchPromise = new Promise(() => {});
      (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);
      
      // Create AbortController for testing
      const controller = new AbortController();
      
      // Start request with short timeout
      const resultPromise = workoutApiClient.generateWorkout(
        { duration: 30 },
        { signal: controller.signal, timeout: 5000 }
      );
      
      // Fast-forward past the timeout
      jest.advanceTimersByTime(5001);
      
      // Should return timeout error
      const result = await resultPromise;
      
      // Verify error was handled properly
      expect(result).toEqual({
        success: false,
        message: 'The workout generation request timed out. Please try again.',
        code: 'abort_timeout'
      });
    });
    
    it('should report progress during request', async () => {
      // Setup mock response that takes time
      (global.fetch as jest.Mock).mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                data: { workout: { title: 'Test Workout' } }
              })
            });
          }, 2000);
        });
      });
      
      // Create progress tracking
      const progressUpdates: number[] = [];
      const onProgress = (progress: number) => {
        progressUpdates.push(progress);
      };
      
      // Create AbortController for testing
      const controller = new AbortController();
      
      // Start request
      const resultPromise = workoutApiClient.generateWorkout(
        { duration: 30 },
        { signal: controller.signal },
        onProgress
      );
      
      // Should get initial progress update
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0]).toBe(5); // Initial progress
      
      // Fast-forward time to see progress increase
      jest.advanceTimersByTime(3000);
      
      // Should have more progress updates
      expect(progressUpdates.length).toBeGreaterThan(1);
      
      // Complete the request
      jest.runAllTimers();
      const result = await resultPromise;
      
      // Verify the result
      expect(result).toEqual({
        success: true,
        data: { workout: { title: 'Test Workout' } }
      });
    });
  });
  
  describe('Abort Handling', () => {
    test('should abort request when signal is aborted', async () => {
      // Arrange
      const workoutParams = { duration: 30 };
      const controller = new AbortController();
      
      // Mock fetch to never resolve
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      // Act
      const resultPromise = workoutApiClient.generateWorkout(
        workoutParams,
        { signal: controller.signal }
      );
      
      // Abort the request
      controller.abort('user_cancelled');
      
      // Wait for result
      const result = await resultPromise;
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.code).toContain('abort');
    });
    
    test('should timeout after specified duration', async () => {
      // Arrange
      const workoutParams = { duration: 30 };
      const controller = new AbortController();
      
      // Mock fetch to never resolve
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      // Act
      const resultPromise = workoutApiClient.generateWorkout(
        workoutParams,
        { signal: controller.signal, timeout: 1000 }
      );
      
      // Advance timers to trigger timeout
      jest.advanceTimersByTime(1001);
      
      // Get the result
      const result = await resultPromise;
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('timed out');
      expect(result.code).toContain('timeout');
    });
    
    test('should combine multiple signals correctly', async () => {
      // Arrange
      const workoutParams = { duration: 30 };
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      // Access private method for testing
      const combinedSignal = (workoutApiClient as any).combineSignals([
        controller1.signal, 
        controller2.signal
      ]);
      
      // Mock fetch to never resolve
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      // Act - Start a request and abort one of the controllers
      const resultPromise = fetch('/test', { signal: combinedSignal });
      controller1.abort('test_reason');
      
      // Assert
      expect(combinedSignal.aborted).toBe(true);
      
      // Clean up
      await resultPromise.catch(() => {});
    });
    
    test('should clean up signal listeners when request completes', async () => {
      // Arrange
      const mockSignal1 = {
        aborted: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      
      const mockSignal2 = {
        aborted: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      
      // Act
      const combinedSignal = (workoutApiClient as any).combineSignals([
        mockSignal1 as any, 
        mockSignal2 as any
      ]);
      
      // Simulate abort on first signal
      const abortHandler = mockSignal1.addEventListener.mock.calls[0][1];
      mockSignal1.aborted = true;
      abortHandler();
      
      // Assert
      expect(mockSignal2.removeEventListener).toHaveBeenCalled();
    });
  });
  
  describe('Browser Compatibility', () => {
    test('should handle modern browsers with full AbortController support', async () => {
      // Arrange
      const { cleanup } = createMockBrowserEnvironment('modern');
      
      try {
        const workoutParams = { duration: 30 };
        const controller = new AbortController();
        
        // Mock fetch to throw AbortError
        (global.fetch as jest.Mock).mockImplementation(() => {
          controller.abort('test_reason');
          const error = new DOMException('The operation was aborted', 'AbortError');
          return Promise.reject(error);
        });
        
        // Act
        const result = await workoutApiClient.generateWorkout(
          workoutParams,
          { signal: controller.signal }
        );
        
        // Assert
        expect(result.success).toBe(false);
        expect(result.code).toContain('abort');
      } finally {
        cleanup();
      }
    });
    
    test('should handle legacy browsers with basic AbortController', async () => {
      // Arrange
      const { cleanup } = createMockBrowserEnvironment('legacy');
      
      try {
        const workoutParams = { duration: 30 };
        const controller = new AbortController();
        
        // Mock fetch to throw AbortError
        (global.fetch as jest.Mock).mockImplementation(() => {
          controller.abort(); // Legacy browsers don't support reason
          const error = new DOMException('The operation was aborted', 'AbortError');
          return Promise.reject(error);
        });
        
        // Act
        const result = await workoutApiClient.generateWorkout(
          workoutParams,
          { signal: controller.signal }
        );
        
        // Assert
        expect(result.success).toBe(false);
        expect(result.code).toContain('abort');
      } finally {
        cleanup();
      }
    });
    
    test('should handle browsers that throw on abort with reason', async () => {
      // Arrange
      const { cleanup } = createMockBrowserEnvironment('partial');
      
      try {
        const workoutParams = { duration: 30 };
        const controller = new AbortController();
        
        // Mock fetch to throw AbortError
        (global.fetch as jest.Mock).mockImplementation(() => {
          // This should work despite the browser throwing on abort with reason
          controller.abort('test_reason');
          const error = new DOMException('The operation was aborted', 'AbortError');
          return Promise.reject(error);
        });
        
        // Act
        const result = await workoutApiClient.generateWorkout(
          workoutParams,
          { signal: controller.signal }
        );
        
        // Assert
        expect(result.success).toBe(false);
        expect(result.code).toContain('abort');
      } finally {
        cleanup();
      }
    });
  });
  
  describe('Progress Simulation', () => {
    test('should call progress callback with increasing values', async () => {
      // Arrange
      const workoutParams = { duration: 30 };
      const controller = new AbortController();
      const progressCallback = jest.fn();
      
      // Act
      const resultPromise = workoutApiClient.generateWorkout(
        workoutParams,
        { signal: controller.signal },
        progressCallback
      );
      
      // Advance timers to see progress updates
      jest.advanceTimersByTime(500);  // Initial progress
      jest.advanceTimersByTime(1000); // Additional progress
      jest.advanceTimersByTime(2000); // More progress
      
      // Complete the request
      await resultPromise;
      
      // Assert
      expect(progressCallback).toHaveBeenCalled();
      
      // Check that progress values increase
      const calls = progressCallback.mock.calls;
      let lastProgress = 0;
      
      for (const call of calls) {
        const progress = call[0];
        expect(progress).toBeGreaterThanOrEqual(lastProgress);
        lastProgress = progress;
      }
    });
    
    test('should stop progress simulation when request is aborted', async () => {
      // Arrange
      const workoutParams = { duration: 30 };
      const controller = new AbortController();
      const progressCallback = jest.fn();
      
      // Mock fetch to never resolve
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      // Act
      const resultPromise = workoutApiClient.generateWorkout(
        workoutParams,
        { signal: controller.signal },
        progressCallback
      );
      
      // Advance timers a bit
      jest.advanceTimersByTime(1000);
      
      // Reset mock to check calls after abort
      progressCallback.mockReset();
      
      // Abort the request
      controller.abort('user_cancelled');
      
      // Advance timers more
      jest.advanceTimersByTime(2000);
      
      // Assert
      expect(progressCallback).not.toHaveBeenCalled();
      
      // Clean up
      await resultPromise;
    });
  });
}); 