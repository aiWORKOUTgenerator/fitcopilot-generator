/**
 * Tests for workoutApiClient
 */
import { workoutApiClient, ApiRequestOptions } from '../workoutApiClient';

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
}); 