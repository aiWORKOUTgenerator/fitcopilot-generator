/**
 * Tests for useAbortController hook
 */
import { renderHook, act } from '@testing-library/react-hooks';
import { useAbortController, AbortReason } from '../useAbortController';

describe('useAbortController', () => {
  // Mock fetch function for testing abort functionality
  global.fetch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should create a new signal when getSignal is called', () => {
    const { result } = renderHook(() => useAbortController());
    
    const signal = result.current.getSignal();
    
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });
  
  test('should abort previous request when getting a new signal', () => {
    const { result } = renderHook(() => useAbortController());
    
    // Get first signal
    const signal1 = result.current.getSignal('user_cancelled');
    
    // Create a spy to check if abort was called
    const abortSpy = jest.spyOn(signal1, 'dispatchEvent');
    
    // Get second signal (should abort first one)
    const signal2 = result.current.getSignal('new_request_started');
    
    // Verify first signal was aborted
    expect(abortSpy).toHaveBeenCalled();
    expect(signal1.aborted).toBe(true);
    
    // Verify new signal is ready
    expect(signal2.aborted).toBe(false);
  });
  
  test('should abort request with specified reason when abort is called', () => {
    const { result } = renderHook(() => useAbortController());
    
    // Create a signal and spy on it
    const signal = result.current.getSignal();
    const abortReason: AbortReason = 'user_cancelled';
    
    // Call abort
    act(() => {
      result.current.abort(abortReason);
    });
    
    // Check if signal is aborted
    expect(signal.aborted).toBe(true);
    expect(result.current.getCurrentReason()).toBe(abortReason);
  });
  
  test('should abort request when component unmounts', () => {
    const { result, unmount } = renderHook(() => useAbortController());
    
    // Create a signal
    const signal = result.current.getSignal();
    
    // Unmount the component
    unmount();
    
    // Check if signal was aborted
    expect(signal.aborted).toBe(true);
  });
  
  test('should abort request on step transition if currentStep changes', () => {
    const { result, rerender } = renderHook(
      ({ step }) => useAbortController(step),
      { initialProps: { step: 'input' as const } }
    );
    
    // Create a signal
    const signal = result.current.getSignal();
    
    // Change step
    rerender({ step: 'generating' as const });
    
    // Check if signal was aborted
    expect(signal.aborted).toBe(true);
    expect(result.current.getCurrentReason()).toBe('step_transition');
  });
  
  test('should report active request status correctly', () => {
    const { result } = renderHook(() => useAbortController());
    
    // Initially no active request
    expect(result.current.hasActiveRequest()).toBe(false);
    
    // Create a signal
    result.current.getSignal();
    
    // Now should have active request
    expect(result.current.hasActiveRequest()).toBe(true);
    
    // Abort the request
    act(() => {
      result.current.abort('user_cancelled');
    });
    
    // No active request after aborting
    expect(result.current.hasActiveRequest()).toBe(false);
  });
  
  test('should clear controller references', () => {
    const { result } = renderHook(() => useAbortController());
    
    // Create a signal
    result.current.getSignal();
    
    // Should have active request
    expect(result.current.hasActiveRequest()).toBe(true);
    
    // Clear references
    act(() => {
      result.current.clear();
    });
    
    // Should not have active request
    expect(result.current.hasActiveRequest()).toBe(false);
    expect(result.current.getCurrentReason()).toBeNull();
  });
}); 