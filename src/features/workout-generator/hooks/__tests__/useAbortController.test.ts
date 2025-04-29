/**
 * Tests for useAbortController hook
 * 
 * Verifies AbortController compatibility, reason tracking, signal handling, and cleanup
 */
import { renderHook, act } from '@testing-library/react-hooks';
import { useAbortController, AbortReason } from '../useAbortController';
import { FormSteps } from '../../types/workout';

describe('useAbortController', () => {
  // Store original AbortController
  let originalAbortController: typeof AbortController;
  
  beforeAll(() => {
    // Save original implementation
    originalAbortController = global.AbortController;
  });
  
  afterAll(() => {
    // Restore original implementation
    global.AbortController = originalAbortController;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    test('should return an object with expected methods', () => {
      // Act
      const { result } = renderHook(() => useAbortController());
  
      // Assert
      expect(result.current.getSignal).toBeInstanceOf(Function);
      expect(result.current.abort).toBeInstanceOf(Function);
      expect(result.current.hasActiveRequest).toBeInstanceOf(Function);
      expect(result.current.getCurrentReason).toBeInstanceOf(Function);
      expect(result.current.clear).toBeInstanceOf(Function);
      expect(result.current.cleanupController).toBeInstanceOf(Function);
      expect(result.current.resetController).toBeInstanceOf(Function);
    });
  
    test('should return a valid AbortSignal when getSignal is called', () => {
      // Arrange
      const mockAbort = jest.fn();
      const mockSignal = { aborted: false };
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: mockSignal,
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      let signal: AbortSignal;
      
      act(() => {
        signal = result.current.getSignal();
      });
  
      // Assert
      expect(signal).toBe(mockSignal);
      expect(result.current.hasActiveRequest()).toBe(true);
    });
    
    test('should abort existing request when getSignal is called again', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      act(() => {
        result.current.getSignal();
        result.current.getSignal();
      });
  
      // Assert
      expect(mockAbort).toHaveBeenCalledTimes(1);
      expect(mockAbort).toHaveBeenCalledWith('new_request_started');
    });
  
    test('should abort the current request when abort is called', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      act(() => {
        result.current.getSignal();
        result.current.abort('user_cancelled');
      });
  
      // Assert
      expect(mockAbort).toHaveBeenCalledTimes(1);
      expect(mockAbort).toHaveBeenCalledWith('user_cancelled');
    });
    
    test('should return true when abort is called on active request', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      let abortResult: boolean;
      
      act(() => {
        result.current.getSignal();
        abortResult = result.current.abort('user_cancelled');
      });
  
      // Assert
      expect(abortResult).toBe(true);
    });
    
    test('should return false when abort is called with no active request', () => {
      // Act
      const { result } = renderHook(() => useAbortController());
      let abortResult: boolean;
      
      act(() => {
        abortResult = result.current.abort('user_cancelled');
      });
  
      // Assert
      expect(abortResult).toBe(false);
    });
    
    test('should report hasActiveRequest correctly', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      // Assert - No active request initially
      expect(result.current.hasActiveRequest()).toBe(false);
      
      // Act - Create request
      act(() => {
        result.current.getSignal();
      });
      
      // Assert - Has active request
      expect(result.current.hasActiveRequest()).toBe(true);
      
      // Act - Abort request
      act(() => {
        result.current.abort('user_cancelled');
      });
      
      // Assert - No active request after abort
      expect(result.current.hasActiveRequest()).toBe(false);
    });
    
    test('should track the current abort reason', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      // Assert - No reason initially
      expect(result.current.getCurrentReason()).toBeNull();
      
      // Act - Create request with reason
      act(() => {
        result.current.getSignal('new_request_started');
      });
      
      // Assert - Has reason
      expect(result.current.getCurrentReason()).toBe('new_request_started');
      
      // Act - Clear reason
      act(() => {
        result.current.clear();
      });
      
      // Assert - No reason after clear
      expect(result.current.getCurrentReason()).toBeNull();
    });
    
    test('should clear controller references', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      act(() => {
        result.current.getSignal();
        result.current.clear();
      });
      
      // Assert
      expect(result.current.hasActiveRequest()).toBe(false);
      expect(result.current.getCurrentReason()).toBeNull();
    });
    
    test('should cleanup controller properly', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      act(() => {
        result.current.getSignal();
        result.current.cleanupController();
      });
      
      // Assert
      expect(mockAbort).toHaveBeenCalledTimes(1);
      expect(mockAbort).toHaveBeenCalledWith('component_unmount');
      expect(result.current.hasActiveRequest()).toBe(false);
    });
    
    test('should reset controller without aborting', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      act(() => {
        result.current.getSignal();
        result.current.resetController();
      });
      
      // Assert
      expect(mockAbort).not.toHaveBeenCalled();
      expect(result.current.hasActiveRequest()).toBe(false);
    });
  });

  describe('Form step behavior', () => {
    test('should abort when transitioning from generating to another step (except completed)', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act - Initial render with 'generating' step
      const { result, rerender } = renderHook(
        (props) => useAbortController(props.currentStep), 
        { initialProps: { currentStep: 'generating' as FormSteps } }
      );
      
      // Create request
      act(() => {
        result.current.getSignal();
      });
      
      // Change step to 'form'
      rerender({ currentStep: 'form' as FormSteps });
      
      // Assert
      expect(mockAbort).toHaveBeenCalledTimes(1);
      expect(mockAbort).toHaveBeenCalledWith('step_transition');
    });
    
    test('should NOT abort when transitioning from generating to completed', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act - Initial render with 'generating' step
      const { result, rerender } = renderHook(
        (props) => useAbortController(props.currentStep), 
        { initialProps: { currentStep: 'generating' as FormSteps } }
      );
      
      // Create request
      act(() => {
        result.current.getSignal();
      });
      
      // Change step to 'completed'
      rerender({ currentStep: 'completed' as FormSteps });
      
      // Assert
      expect(mockAbort).not.toHaveBeenCalled();
    });
    
    test('should NOT abort when transitioning between non-generating steps', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act - Initial render with 'form' step
      const { result, rerender } = renderHook(
        (props) => useAbortController(props.currentStep), 
        { initialProps: { currentStep: 'form' as FormSteps } }
      );
      
      // Create request
      act(() => {
        result.current.getSignal();
      });
      
      // Change step to 'review'
      rerender({ currentStep: 'review' as FormSteps });
      
      // Assert
      expect(mockAbort).not.toHaveBeenCalled();
    });
  });

  describe('Component lifecycle', () => {
    test('should clean up controller on component unmount', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result, unmount } = renderHook(() => useAbortController());
      
      act(() => {
        result.current.getSignal();
      });
      
      // Unmount component
      unmount();
      
      // Assert
      expect(mockAbort).toHaveBeenCalledTimes(1);
      expect(mockAbort).toHaveBeenCalledWith('component_unmount');
    });
  });

  describe('Browser compatibility', () => {
    test('should use fallback abort behavior for browsers without reason support', () => {
      // Arrange - Mock an AbortController that throws when abort is called with a reason
      const mockAbort = jest.fn().mockImplementation((reason?: AbortReason) => {
        if (reason) {
          throw new Error('Abort reason not supported');
        }
      });
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      act(() => {
        result.current.getSignal();
        result.current.abort('user_cancelled');
      });
      
      // Assert - Should call abort without a reason as fallback
      expect(mockAbort).toHaveBeenCalledTimes(2);
      expect(mockAbort).toHaveBeenNthCalledWith(2);
    });
    
    test('should gracefully handle errors during abort operation', () => {
      // Arrange - Mock an AbortController that throws when abort is called
      const mockAbort = jest.fn().mockImplementation(() => {
        throw new Error('Failed to abort');
      });
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act & Assert - Should not throw when abort fails
      const { result } = renderHook(() => useAbortController());
      
      expect(() => {
        act(() => {
          result.current.getSignal();
          result.current.abort('user_cancelled');
        });
      }).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    test('should handle multiple consecutive aborts', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      act(() => {
        result.current.getSignal();
        result.current.abort('user_cancelled');
        result.current.abort('timeout'); // Should return false and not call abort again
        result.current.abort('form_reset'); // Should return false and not call abort again
      });
      
      // Assert - Should only call abort once
      expect(mockAbort).toHaveBeenCalledTimes(1);
      expect(mockAbort).toHaveBeenCalledWith('user_cancelled');
    });
    
    test('should handle aborting already aborted controller', () => {
      // Arrange - Mock an AbortController with an already aborted signal
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: true },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      act(() => {
        result.current.getSignal();
        result.current.abort('user_cancelled');
      });
      
      // Assert - Should not try to abort an already aborted controller
      expect(mockAbort).not.toHaveBeenCalled();
    });
  });

  describe('Timeout functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should support manual timeout implementation', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      let timeoutId: NodeJS.Timeout;
      
      act(() => {
        const signal = result.current.getSignal();
        
        // Set up a manual timeout that will abort the controller
        timeoutId = setTimeout(() => {
          result.current.abort('timeout');
        }, 5000);
      });
      
      // Fast-forward time to trigger the timeout
      act(() => {
        jest.advanceTimersByTime(5001);
      });
      
      // Assert
      expect(mockAbort).toHaveBeenCalledTimes(1);
      expect(mockAbort).toHaveBeenCalledWith('timeout');
      
      // Clean up timeout
      clearTimeout(timeoutId);
    });
    
    test('should clean up timeout when manually aborted before timeout', () => {
      // Arrange
      const mockAbort = jest.fn();
      
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: { aborted: false },
        abort: mockAbort
      })) as unknown as typeof AbortController;
  
      // Act
      const { result } = renderHook(() => useAbortController());
      
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      let timeoutId: NodeJS.Timeout;
      
      act(() => {
        const signal = result.current.getSignal();
        
        // Set up a manual timeout
        timeoutId = setTimeout(() => {
          result.current.abort('timeout');
        }, 5000);
        
        // Store the timeout in a ref or state in real implementation
      });
      
      // Manually abort before timeout
      act(() => {
        result.current.abort('user_cancelled');
        // Clear the timeout manually (in real implementation this would be handled by the component)
        clearTimeout(timeoutId);
      });
      
      // Fast-forward time past when the timeout would have fired
      act(() => {
        jest.advanceTimersByTime(6000);
      });
      
      // Assert
      expect(mockAbort).toHaveBeenCalledTimes(1);
      expect(mockAbort).toHaveBeenCalledWith('user_cancelled');
      expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
    });
    
    test('should demonstrate using useAbortController with fetch and timeout', async () => {
      // Arrange - Mock global fetch
      const mockFetch = jest.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
      const origFetch = global.fetch;
      global.fetch = mockFetch;
      
      try {
        const mockAbort = jest.fn();
        
        global.AbortController = jest.fn().mockImplementation(() => ({
          signal: { aborted: false },
          abort: mockAbort
        })) as unknown as typeof AbortController;
    
        // Act
        const { result } = renderHook(() => useAbortController());
        
        let timeoutId: NodeJS.Timeout;
        
        // Start a fetch request with abort controller and timeout
        act(() => {
          const signal = result.current.getSignal();
          
          // This is how you'd use the hook with fetch and a timeout
          fetch('https://api.example.com/workout', { signal });
          
          // Set up timeout
          timeoutId = setTimeout(() => {
            result.current.abort('timeout');
          }, 30000);
        });
        
        // Simulate timeout occurring
        act(() => {
          jest.advanceTimersByTime(30001);
        });
        
        // Assert
        expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/workout', 
          expect.objectContaining({ signal: expect.anything() })
        );
        expect(mockAbort).toHaveBeenCalledTimes(1);
        expect(mockAbort).toHaveBeenCalledWith('timeout');
        
        // Clean up
        clearTimeout(timeoutId);
      } finally {
        // Restore original fetch
        global.fetch = origFetch;
      }
    });
  });
});

describe('Specific abort reason detection', () => {
  test('should correctly detect different abort reasons', () => {
    // Arrange
    const mockAbort = jest.fn();
    
    global.AbortController = jest.fn().mockImplementation(() => ({
      signal: { 
        aborted: false,
        reason: null
      },
      abort: mockAbort.mockImplementation((reason) => {
        // Simulate setting the reason on abort
        this.signal.reason = reason;
        this.signal.aborted = true;
      })
    })) as unknown as typeof AbortController;

    // Act
    const { result } = renderHook(() => useAbortController());
    
    // Test multiple abort scenarios
    act(() => {
      // First request - user cancelled
      const signal1 = result.current.getSignal();
      result.current.abort('user_cancelled');
      expect(result.current.getCurrentReason()).toBe('user_cancelled');
      
      // Second request - timeout
      const signal2 = result.current.getSignal();
      result.current.abort('timeout');
      expect(result.current.getCurrentReason()).toBe('timeout');
      
      // Third request - form reset
      const signal3 = result.current.getSignal();
      result.current.abort('form_reset');
      expect(result.current.getCurrentReason()).toBe('form_reset');
    });
  });
});

describe('Memory leak prevention', () => {
  test('should prevent memory leaks by explicitly cleaning up controllers', () => {
    // Arrange
    let controllerInstances = 0;
    const mockAbort = jest.fn();
    
    global.AbortController = jest.fn().mockImplementation(() => {
      controllerInstances++;
      return {
        signal: { aborted: false },
        abort: mockAbort
      };
    }) as unknown as typeof AbortController;

    // Act
    const { result } = renderHook(() => useAbortController());
    
    // Create multiple controllers without proper cleanup
    act(() => {
      // First controller
      result.current.getSignal();
      
      // Second controller (should abort first)
      result.current.getSignal();
      
      // Third controller (should abort second)
      result.current.getSignal();
      
      // Explicit cleanup all controllers
      result.current.cleanupController();
    });
    
    // Reset for next test
    controllerInstances = 0;
    mockAbort.mockClear();
    
    // Create controllers with proper resets
    act(() => {
      // First controller
      result.current.getSignal();
      
      // Reset without aborting
      result.current.resetController();
      
      // Second controller (no abort)
      result.current.getSignal();
      
      // Explicit cleanup
      result.current.cleanupController();
    });
    
    // Assert
    expect(mockAbort.mock.calls.filter(call => call[0] === 'component_unmount').length).toBe(1);
    expect(mockAbort.mock.calls.filter(call => call[0] === 'new_request_started').length).toBe(2);
  });
});

describe('Complex cancel/retry scenarios', () => {
  test('should handle cancel-retry pattern for long running requests', () => {
    // Arrange
    jest.useFakeTimers();
    
    const mockAbort = jest.fn();
    const mockFetch = jest.fn()
      .mockImplementationOnce(() => new Promise(() => {})) // First call - never resolves
      .mockImplementationOnce(() => Promise.resolve({ ok: true })); // Second call - success
    
    const origFetch = global.fetch;
    global.fetch = mockFetch;
    
    global.AbortController = jest.fn().mockImplementation(() => ({
      signal: { aborted: false },
      abort: mockAbort
    })) as unknown as typeof AbortController;

    try {
      // Act
      const { result } = renderHook(() => useAbortController());
      
      // Simulate first attempt that times out
      act(() => {
        const signal = result.current.getSignal();
        
        // First attempt
        fetch('https://api.example.com/workout', { signal });
        
        // Simulate timeout
        jest.advanceTimersByTime(30001);
        result.current.abort('timeout');
      });
      
      // Verify first attempt was aborted
      expect(mockAbort).toHaveBeenCalledWith('timeout');
      expect(result.current.hasActiveRequest()).toBe(false);
      
      // Simulate retry with success
      act(() => {
        const signal = result.current.getSignal();
        
        // Second attempt - this one would succeed in real code
        fetch('https://api.example.com/workout', { signal });
      });
      
      // Verify second attempt was made
      expect(mockFetch).toHaveBeenCalledTimes(2);
      
    } finally {
      // Cleanup
      global.fetch = origFetch;
      jest.useRealTimers();
    }
  });
}); 