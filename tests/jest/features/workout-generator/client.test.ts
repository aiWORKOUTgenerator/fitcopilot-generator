/**
 * Tests for API client
 */
import { apiFetch, createAbortableRequest, getNonce } from '../../../../src/features/workout-generator/api/client';

// Mock fetch globally
global.fetch = jest.fn();
global.AbortController = jest.fn().mockImplementation(() => ({
  signal: 'mock-signal',
  abort: jest.fn()
}));

// Mock setTimeout to execute callback immediately
const originalSetTimeout = global.setTimeout;
global.setTimeout = jest.fn((cb) => {
  if (typeof cb === 'function') cb();
  return 123;
}) as unknown as typeof setTimeout;

// Mock clearTimeout
const originalClearTimeout = global.clearTimeout;
global.clearTimeout = jest.fn() as unknown as typeof clearTimeout;

describe('API Client', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock window.fitcopilotData
    Object.defineProperty(window, 'fitcopilotData', {
      value: { nonce: 'test-nonce' },
      writable: true,
      configurable: true
    });
  });
  
  afterAll(() => {
    // Restore original timers
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  });
  
  describe('getNonce', () => {
    it('should return the nonce from window.fitcopilotData', () => {
      expect(getNonce()).toBe('test-nonce');
    });
    
    it('should return empty string if nonce is not available', () => {
      Object.defineProperty(window, 'fitcopilotData', {
        value: undefined,
        writable: true,
        configurable: true
      });
      
      expect(getNonce()).toBe('');
    });
  });
  
  describe('apiFetch', () => {
    it('should make a fetch request with correct headers and options', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, data: { id: 1 } })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await apiFetch('/test-url', {
        method: 'POST',
        body: JSON.stringify({ test: true })
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/test-url', expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-WP-Nonce': 'test-nonce'
        }),
        body: JSON.stringify({ test: true }),
        signal: 'mock-signal'
      }));
      
      expect(result).toEqual({ success: true, data: { id: 1 } });
    });
  });
  
  describe('createAbortableRequest', () => {
    it('should create an abortable request object', async () => {
      const mockAbort = jest.fn();
      
      // Override the abort function for this test
      (global.AbortController as jest.Mock).mockImplementation(() => ({
        signal: 'mock-signal',
        abort: mockAbort
      }));
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, data: { id: 1 } })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const { request, abort } = createAbortableRequest<{ id: number }>();
      
      // Start a request but don't await it
      const requestPromise = request('/test-url');
      
      // Call the abort function
      abort();
      
      // Check that abort was called with the expected argument
      expect(mockAbort).toHaveBeenCalledWith('Request cancelled by user');
      
      // Need to await the promise to prevent it from being an unhandled rejection
      await requestPromise.catch(() => {});
    });
  });
}); 