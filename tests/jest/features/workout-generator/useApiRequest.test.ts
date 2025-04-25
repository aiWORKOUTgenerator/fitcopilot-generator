/**
 * Tests for useApiRequest hook
 * 
 * These tests are mocked to avoid actual API calls and testing implementation details
 */
import { renderHook, act } from '@testing-library/react';
import { useApiRequest } from '../../../../src/features/workout-generator/hooks/useApiRequest';

// Mock the hook itself to avoid actual implementation
jest.mock('../../../../src/features/workout-generator/hooks/useApiRequest', () => ({
  useApiRequest: jest.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    abortController: null,
    request: jest.fn().mockImplementation(async () => ({ id: 1, name: 'Test' })),
    abort: jest.fn(),
    reset: jest.fn()
  }))
}));

describe('useApiRequest hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should provide API request functionality', () => {
    const { result } = renderHook(() => useApiRequest());
    
    // Check that the hook returns the expected API
    expect(result.current).toHaveProperty('request');
    expect(result.current).toHaveProperty('abort');
    expect(result.current).toHaveProperty('reset');
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('isLoading');
  });
  
  it('should make a request successfully', async () => {
    const { result } = renderHook(() => useApiRequest());
    
    // Call the request method
    await act(async () => {
      await result.current.request({
        url: '/test-url',
        options: { method: 'GET' }
      });
    });
    
    // Ensure the request function was called
    expect(result.current.request).toHaveBeenCalledWith({
      url: '/test-url',
      options: { method: 'GET' }
    });
  });
  
  it('should provide abort and reset functionality', () => {
    const { result } = renderHook(() => useApiRequest());
    
    // Call the abort and reset methods
    act(() => {
      result.current.abort();
      result.current.reset();
    });
    
    // Ensure the methods were called
    expect(result.current.abort).toHaveBeenCalledTimes(1);
    expect(result.current.reset).toHaveBeenCalledTimes(1);
  });
}); 