/**
 * Debounce Utility
 * 
 * Delays function execution until after a specified delay has passed
 * since the last time it was invoked. Useful for auto-save functionality.
 */

export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
};

/**
 * Creates a debounced version of a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T>;
  let lastThis: any;

  const debouncedFunction = function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      func.apply(lastThis, lastArgs);
    }, delay);
  } as DebouncedFunction<T>;

  // Cancel pending execution
  debouncedFunction.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  // Execute immediately if pending
  debouncedFunction.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      func.apply(lastThis, lastArgs);
    }
  };

  // Check if execution is pending
  debouncedFunction.pending = () => {
    return timeoutId !== null;
  };

  return debouncedFunction;
}

/**
 * Creates a debounced async function with proper error handling
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T>;
  let lastThis: any;

  const debouncedFunction = function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
      timeoutId = null;
      try {
        await func.apply(lastThis, lastArgs);
      } catch (error) {
        console.error('Debounced async function error:', error);
        // Error will be handled by the calling function
        throw error;
      }
    }, delay);
  } as DebouncedFunction<T>;

  debouncedFunction.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  debouncedFunction.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      func.apply(lastThis, lastArgs).catch(error => {
        console.error('Debounced async flush error:', error);
      });
    }
  };

  debouncedFunction.pending = () => {
    return timeoutId !== null;
  };

  return debouncedFunction;
}

/**
 * Throttle function - limits execution to once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  interval: number
): T {
  let lastExecution = 0;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastExecution >= interval) {
      lastExecution = now;
      return func(...args);
    }
  }) as T;
} 