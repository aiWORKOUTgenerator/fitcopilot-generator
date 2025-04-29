/**
 * Integration tests for useWorkoutGenerator with useAbortController
 * 
 * Tests the abort and timeout functionality when generating workouts
 */
import { renderHook, act } from '@testing-library/react-hooks';
import { useWorkoutGenerator } from '../useWorkoutGenerator';
import * as useAbortControllerModule from '../useAbortController';

// Mock dependencies
jest.mock('../useAbortController', () => {
  const originalModule = jest.requireActual('../useAbortController');
  return {
    ...originalModule,
    useAbortController: jest.fn().mockImplementation(originalModule.useAbortController)
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('useWorkoutGenerator with useAbortController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset mock fetch
    (global.fetch as jest.Mock).mockReset();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('should abort generation when cancel is called', async () => {
    // Mock a successful fetch response
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(resolve => {
      // This promise won't resolve until jest timers are advanced
      setTimeout(() => {
        resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: { workout: 'test' } })
        });
      }, 5000);
    }));
    
    // Spy on abort method
    const abortSpy = jest.spyOn(useAbortControllerModule.useAbortController({} as any).abort);
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useWorkoutGenerator());
    
    // Start workout generation
    let generatePromise: Promise<any>;
    await act(async () => {
      generatePromise = result.current.generateWorkout({
        duration: 30,
        goals: 'strength',
        difficulty: 'intermediate'
      });
      
      // Allow state updates to process
      await waitForNextUpdate();
    });
    
    // Verify we're in generating state
    expect(result.current.status).toBe('generating');
    
    // Cancel the generation
    await act(async () => {
      result.current.cancelGeneration();
    });
    
    // Verify abort was called
    expect(abortSpy).toHaveBeenCalledWith('user_cancelled');
    
    // Verify state is updated
    expect(result.current.status).toBe('cancelled');
    expect(result.current.error).toMatch(/cancelled/i);
  });
  
  test('should timeout after configured duration', async () => {
    // Mock a fetch response that never resolves
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    // Spy on abort method
    const abortSpy = jest.spyOn(useAbortControllerModule.useAbortController({} as any).abort);
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useWorkoutGenerator());
    
    // Start workout generation with timeout
    let generatePromise: Promise<any>;
    await act(async () => {
      generatePromise = result.current.generateWorkout({
        duration: 30,
        goals: 'strength',
        difficulty: 'intermediate'
      }, {
        timeoutMs: 30000 // 30 seconds
      });
      
      // Allow state updates to process
      await waitForNextUpdate();
    });
    
    // Verify we're in generating state
    expect(result.current.status).toBe('generating');
    
    // Fast-forward past the timeout
    await act(async () => {
      jest.advanceTimersByTime(30001);
      // Need to wait for the timeout handler to execute
      await Promise.resolve();
    });
    
    // Verify timeout triggered abort
    expect(abortSpy).toHaveBeenCalledWith('timeout');
    
    // Verify state is updated
    expect(result.current.status).toBe('error');
    expect(result.current.error).toMatch(/timeout/i);
  });
  
  test('should clean up abort controller and timeouts when unmounting during generation', async () => {
    // Mock a fetch response that never resolves
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    // Spy on abort controller cleanup
    const cleanupSpy = jest.spyOn(useAbortControllerModule.useAbortController({} as any).cleanupController);
    
    // Render the hook
    const { result, waitForNextUpdate, unmount } = renderHook(() => useWorkoutGenerator());
    
    // Start workout generation
    let generatePromise: Promise<any>;
    await act(async () => {
      generatePromise = result.current.generateWorkout({
        duration: 30,
        goals: 'strength',
        difficulty: 'intermediate'
      });
      
      // Allow state updates to process
      await waitForNextUpdate();
    });
    
    // Unmount the component during generation
    unmount();
    
    // Verify cleanup was called
    expect(cleanupSpy).toHaveBeenCalled();
  });
  
  test('should handle abort error properly in API response', async () => {
    // Mock a fetch that throws an AbortError
    (global.fetch as jest.Mock).mockImplementation(() => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      return Promise.reject(error);
    });
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useWorkoutGenerator());
    
    // Start workout generation
    let generatePromise: Promise<any>;
    await act(async () => {
      generatePromise = result.current.generateWorkout({
        duration: 30,
        goals: 'strength',
        difficulty: 'intermediate'
      });
      
      // Allow state updates to process
      try {
        await waitForNextUpdate();
      } catch (e) {
        // Might throw due to rejected promise
      }
    });
    
    // Verify error state
    expect(result.current.status).toBe('error');
    expect(result.current.error).toMatch(/aborted|cancelled/i);
  });
  
  test('should use abort controller signal in fetch request', async () => {
    // Mock a successful fetch response
    (global.fetch as jest.Mock).mockImplementation(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: { workout: 'test' } })
    }));
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useWorkoutGenerator());
    
    // Start workout generation
    await act(async () => {
      result.current.generateWorkout({
        duration: 30,
        goals: 'strength',
        difficulty: 'intermediate'
      });
      
      // Allow state updates to process
      await waitForNextUpdate();
    });
    
    // Verify fetch was called with an AbortSignal
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: expect.any(Object)
      })
    );
  });
}); 