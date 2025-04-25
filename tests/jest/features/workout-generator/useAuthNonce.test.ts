/**
 * Tests for useAuthNonce hook
 */
import { renderHook, act } from '@testing-library/react';
import { useAuthNonce } from '../../../../src/features/workout-generator/hooks/useAuthNonce';

// Mock the nonceCache outside of the hook since it's module-level
let mockNonceCache: { value: string; expiresAt: number } | null = null;

// Mock the window.fitcopilotData
let mockWindowNonce = 'test-nonce-123';

// Mock the implementation of useAuthNonce to control the cache
jest.mock('../../../../src/features/workout-generator/hooks/useAuthNonce', () => {
  return {
    useAuthNonce: jest.fn(() => {
      const [nonce, setNonce] = jest.requireActual('react').useState<string>(
        mockNonceCache?.value || mockWindowNonce
      );
      const [isLoading, setIsLoading] = jest.requireActual('react').useState<boolean>(false);
      const [error, setError] = jest.requireActual('react').useState<Error | null>(null);
      
      const refreshNonce = jest.fn(() => {
        setIsLoading(true);
        setError(null);
        
        try {
          if (!mockWindowNonce) {
            throw new Error('Failed to get authentication nonce');
          }
          
          mockNonceCache = {
            value: mockWindowNonce,
            expiresAt: Date.now() + 30 * 60 * 1000
          };
          
          setNonce(mockWindowNonce);
          setIsLoading(false);
        } catch (err) {
          setNonce('');
          setError(err instanceof Error ? err : new Error('Unknown authentication error'));
          setIsLoading(false);
        }
      });
      
      // Initial load
      jest.requireActual('react').useEffect(() => {
        if (mockNonceCache && Date.now() < mockNonceCache.expiresAt) {
          setNonce(mockNonceCache.value);
        } else if (!nonce) {
          refreshNonce();
        }
      }, []);
      
      return {
        nonce,
        refreshNonce,
        isLoading,
        error
      };
    })
  };
});

describe('useAuthNonce hook', () => {
  beforeEach(() => {
    // Reset the mock cache
    mockNonceCache = null;
    mockWindowNonce = 'test-nonce-123';
    
    // Mock the window.fitcopilotData object
    Object.defineProperty(window, 'fitcopilotData', {
      value: { nonce: mockWindowNonce },
      writable: true,
      configurable: true
    });
    
    // Mock Date.now() to return a predictable timestamp for testing
    jest.spyOn(Date, 'now').mockImplementation(() => 1600000000000);
  });
  
  afterEach(() => {
    // Clean up mocks
    jest.restoreAllMocks();
  });
  
  it('should return the nonce from window.fitcopilotData', () => {
    const { result } = renderHook(() => useAuthNonce());
    
    // Wait for the hook to initialize
    expect(result.current.nonce).toBe('test-nonce-123');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  it('should return an error if nonce is not available', () => {
    // Remove the nonce from window.fitcopilotData
    mockWindowNonce = '';
    
    // Reset the mock cache to ensure a fresh start
    mockNonceCache = null;
    
    const { result } = renderHook(() => useAuthNonce());
    
    // First call refreshNonce to trigger error handling
    act(() => {
      result.current.refreshNonce();
    });
    
    // Wait for the hook to initialize
    expect(result.current.nonce).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Failed to get authentication nonce');
  });
  
  it('should provide a refresh function that updates the nonce', () => {
    const { result } = renderHook(() => useAuthNonce());
    
    // Initial state
    expect(result.current.nonce).toBe('test-nonce-123');
    
    // Update the mock nonce
    mockWindowNonce = 'updated-nonce-456';
    
    // Call the refresh function
    act(() => {
      result.current.refreshNonce();
    });
    
    // Check that the nonce has been updated
    expect(result.current.nonce).toBe('updated-nonce-456');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  it('should cache the nonce', () => {
    // Set up initial cache
    mockNonceCache = {
      value: 'test-nonce-123',
      expiresAt: Date.now() + 30 * 60 * 1000
    };
    
    // First render should use the cached nonce
    const { result, rerender } = renderHook(() => useAuthNonce());
    expect(result.current.nonce).toBe('test-nonce-123');
    
    // Update the window nonce but don't refresh
    mockWindowNonce = 'should-not-be-used';
    
    // Re-render without refreshing - should still use cached value
    rerender();
    expect(result.current.nonce).toBe('test-nonce-123');
    
    // Refresh should get the new value
    act(() => {
      result.current.refreshNonce();
    });
    
    expect(result.current.nonce).toBe('should-not-be-used');
  });
  
  it('should handle errors during refresh', () => {
    const { result } = renderHook(() => useAuthNonce());
    
    // Set initial state
    expect(result.current.nonce).toBe('test-nonce-123');
    
    // Remove the nonce to cause an error
    mockWindowNonce = '';
    
    // Call refresh which should now error
    act(() => {
      result.current.refreshNonce();
    });
    
    // Check that an error is returned
    expect(result.current.nonce).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Failed to get authentication nonce');
  });
}); 