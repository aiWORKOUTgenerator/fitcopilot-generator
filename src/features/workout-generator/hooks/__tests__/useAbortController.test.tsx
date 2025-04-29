/**
 * Unit tests for the useAbortController hook
 * 
 * Tests functionality including:
 * - Creating and managing the AbortController
 * - Getting the abort signal
 * - Aborting in-flight requests
 * - Cleanup on unmount
 */

import { renderHook, act } from '@testing-library/react-hooks';
import useAbortController from '../useAbortController';

describe('useAbortController Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should create an AbortController and provide signal', () => {
    const { result } = renderHook(() => useAbortController());

    expect(result.current.controller).toBeInstanceOf(AbortController);
    expect(result.current.signal).toBe(result.current.controller.signal);
    expect(result.current.abort).toBeInstanceOf(Function);
    expect(result.current.isAborted).toBe(false);
  });

  test('should abort the request when abort is called', () => {
    const { result } = renderHook(() => useAbortController());

    // Mock the abort method
    const originalAbort = result.current.controller.abort;
    result.current.controller.abort = jest.fn(originalAbort);

    // Call abort
    act(() => {
      result.current.abort();
    });

    // Verify abort was called and isAborted flag is set
    expect(result.current.controller.abort).toHaveBeenCalled();
    expect(result.current.isAborted).toBe(true);
  });

  test('should create a new controller after aborting', () => {
    const { result } = renderHook(() => useAbortController());
    
    // Store reference to first controller
    const firstController = result.current.controller;
    
    // Abort the request
    act(() => {
      result.current.abort();
    });
    
    // Verify a new controller is created
    expect(result.current.controller).not.toBe(firstController);
    expect(result.current.controller).toBeInstanceOf(AbortController);
    expect(result.current.isAborted).toBe(false);
  });

  test('should support timeout functionality', () => {
    const { result } = renderHook(() => useAbortController());
    
    // Mock the abort method
    result.current.controller.abort = jest.fn();
    
    // Start a timeout
    act(() => {
      result.current.setTimeout(1000);
    });
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1001);
    });
    
    // Verify abort was called after timeout
    expect(result.current.controller.abort).toHaveBeenCalled();
  });

  test('should clear timeout when aborted manually', () => {
    const { result } = renderHook(() => useAbortController());
    
    // Spy on clearTimeout
    jest.spyOn(global, 'clearTimeout');
    
    // Start a timeout
    act(() => {
      result.current.setTimeout(5000);
    });
    
    // Abort manually before timeout expires
    act(() => {
      result.current.abort();
    });
    
    // Verify clearTimeout was called
    expect(clearTimeout).toHaveBeenCalled();
    
    // Fast-forward past the original timeout
    act(() => {
      jest.advanceTimersByTime(6000);
    });
    
    // The abort should have been called only once (from manual abort)
    expect(result.current.isAborted).toBe(false); // Should be reset after manual abort
  });

  test('should create a new controller when resetController is called', () => {
    const { result } = renderHook(() => useAbortController());
    
    // Store reference to first controller
    const firstController = result.current.controller;
    
    // Reset the controller
    act(() => {
      result.current.resetController();
    });
    
    // Verify a new controller is created
    expect(result.current.controller).not.toBe(firstController);
    expect(result.current.controller).toBeInstanceOf(AbortController);
  });

  test('should cleanup timeouts on unmount', () => {
    // Spy on clearTimeout
    jest.spyOn(global, 'clearTimeout');
    
    const { result, unmount } = renderHook(() => useAbortController());
    
    // Start a timeout
    act(() => {
      result.current.setTimeout(2000);
    });
    
    // Unmount the component
    unmount();
    
    // Verify clearTimeout was called
    expect(clearTimeout).toHaveBeenCalled();
  });

  test('should handle multiple consecutive aborts', () => {
    const { result } = renderHook(() => useAbortController());
    
    // Call abort multiple times
    act(() => {
      result.current.abort();
      result.current.abort(); // Should not throw
      result.current.abort(); // Should not throw
    });
    
    // Should be in a valid state
    expect(result.current.controller).toBeInstanceOf(AbortController);
    expect(result.current.isAborted).toBe(false); // Reset after each abort
  });

  test('should handle race condition between timeout and manual abort', () => {
    const { result } = renderHook(() => useAbortController());
    
    // Start a timeout
    act(() => {
      result.current.setTimeout(1000);
    });
    
    // Advance time partially
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Abort manually
    act(() => {
      result.current.abort();
    });
    
    // Fast-forward past the original timeout
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Should be in a valid state with a new controller
    expect(result.current.controller).toBeInstanceOf(AbortController);
    expect(result.current.isAborted).toBe(false);
  });
}); 