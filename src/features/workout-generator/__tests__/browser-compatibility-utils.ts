/**
 * Browser Compatibility Testing Utilities
 * 
 * Provides tools to simulate different browser environments for testing
 * cross-browser compatibility of AbortController implementations.
 */

/**
 * Browser environment types for testing
 */
export type BrowserEnvironmentType = 
  | 'modern'     // Full AbortController support with reason
  | 'legacy'     // Basic AbortController without reason support
  | 'partial'    // AbortController with reason property but throws on abort(reason)
  | 'minimal';   // Most basic implementation with only abort() support

/**
 * Creates a mock environment that simulates different browser AbortController implementations
 * 
 * @param type - The type of browser environment to simulate
 * @returns Object with cleanup function to restore original implementations
 */
export function createMockBrowserEnvironment(type: BrowserEnvironmentType = 'modern') {
  // Save original implementations
  const saved = {
    AbortController: window.AbortController,
    DOMException: window.DOMException,
  };
  
  // Implementation depends on the environment type
  switch (type) {
    case 'modern':
      // Modern browser with full AbortController.abort(reason) support
      window.AbortController = class AbortController {
        signal = {
          aborted: false,
          reason: undefined,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        };
        
        abort(reason?: any) {
          this.signal.aborted = true;
          this.signal.reason = reason;
        }
      } as any;
      break;
      
    case 'legacy':
      // Legacy browser with no reason support at all
      window.AbortController = class AbortController {
        signal = {
          aborted: false,
          // No reason property at all
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        };
        
        abort() {
          this.signal.aborted = true;
        }
      } as any;
      break;
      
    case 'partial':
      // Browser with signal.reason property but throws on abort(reason)
      window.AbortController = class AbortController {
        signal = {
          aborted: false,
          reason: undefined,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        };
        
        abort(reason?: any) {
          if (reason !== undefined) {
            // Simulate browser that throws error for abort with reason
            throw new TypeError("Failed to execute 'abort' on 'AbortController': parameter 1 is not of type 'undefined'");
          }
          this.signal.aborted = true;
        }
      } as any;
      break;
      
    case 'minimal':
      // Most basic implementation with just enough to function
      window.AbortController = class AbortController {
        signal = { 
          aborted: false,
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        };
        
        abort() {
          this.signal.aborted = true;
        }
      } as any;
      break;
  }
  
  // Return cleanup function to restore original implementations
  return {
    cleanup: () => {
      window.AbortController = saved.AbortController;
      window.DOMException = saved.DOMException;
    }
  };
}

/**
 * Creates a DOMException that simulates an AbortError
 * 
 * @param message - Optional message for the error
 * @returns A DOMException with name set to 'AbortError'
 */
export function createAbortError(message = 'The operation was aborted'): DOMException {
  return new DOMException(message, 'AbortError');
}

/**
 * Example test for browser compatibility:
 * 
 * ```typescript
 * import { createMockBrowserEnvironment } from './browser-compatibility-utils';
 * 
 * describe('Browser Compatibility', () => {
 *   test('should work in legacy browsers', () => {
 *     // Setup legacy browser environment
 *     const { cleanup } = createMockBrowserEnvironment('legacy');
 *     
 *     try {
 *       // Run your test with legacy browser implementation
 *       const controller = new AbortController();
 *       expect(controller.signal.aborted).toBe(false);
 *       controller.abort();
 *       expect(controller.signal.aborted).toBe(true);
 *       expect('reason' in controller.signal).toBe(false);
 *     } finally {
 *       // Always clean up to restore original implementation
 *       cleanup();
 *     }
 *   });
 * });
 * ```
 */ 