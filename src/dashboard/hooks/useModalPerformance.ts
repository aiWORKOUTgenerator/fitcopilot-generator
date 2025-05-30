/**
 * Modal Performance Optimization Hook
 * 
 * Provides virtual scrolling, lazy loading, and performance optimizations
 * for the unified modal system with large data sets.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  visibleItems: any[];
  totalHeight: number;
  offsetY: number;
}

/**
 * Virtual scrolling hook for large exercise lists
 */
export const useVirtualScroll = <T>(
  items: T[],
  options: VirtualScrollOptions
): VirtualScrollResult => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    visibleItems,
    totalHeight,
    offsetY
  };
};

/**
 * Modal loading states and performance optimizations
 */
interface ModalPerformanceOptions {
  /** Enable virtual scrolling for large lists */
  enableVirtualScroll?: boolean;
  /** Item height for virtual scrolling */
  itemHeight?: number;
  /** Container height for virtual scrolling */
  containerHeight?: number;
  /** Debounce delay for search/filter operations */
  debounceDelay?: number;
  /** Enable lazy loading of modal content */
  enableLazyLoading?: boolean;
}

interface ModalPerformanceResult {
  /** Virtual scroll utilities */
  virtualScroll: {
    useVirtualScroll: typeof useVirtualScroll;
    createScrollHandler: (callback: (scrollTop: number) => void) => (e: React.UIEvent) => void;
  };
  /** Debounced value for search/filter */
  debouncedValue: string;
  /** Set value for debouncing */
  setValue: (value: string) => void;
  /** Loading state management */
  loadingStates: {
    isInitialLoading: boolean;
    isContentLoading: boolean;
    isTransitioning: boolean;
    setInitialLoading: (loading: boolean) => void;
    setContentLoading: (loading: boolean) => void;
    setTransitioning: (loading: boolean) => void;
  };
  /** Performance metrics */
  metrics: {
    renderTime: number;
    lastRenderTime: number;
  };
}

/**
 * Main modal performance optimization hook
 */
export const useModalPerformance = (
  options: ModalPerformanceOptions = {}
): ModalPerformanceResult => {
  const {
    debounceDelay = 300,
    enableLazyLoading = true
  } = options;

  // Debounced value state
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Loading states
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [isContentLoading, setContentLoading] = useState(false);
  const [isTransitioning, setTransitioning] = useState(false);

  // Performance metrics
  const [renderTime, setRenderTime] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(0);
  const renderStartTime = useRef<number>(0);

  // Debouncing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [value, debounceDelay]);

  // Performance tracking
  useEffect(() => {
    renderStartTime.current = performance.now();
    
    const trackRenderComplete = () => {
      const endTime = performance.now();
      const duration = endTime - renderStartTime.current;
      setLastRenderTime(renderTime);
      setRenderTime(duration);
    };

    // Use setTimeout to track after React render
    setTimeout(trackRenderComplete, 0);
  });

  // Virtual scroll utilities
  const createScrollHandler = useCallback(
    (callback: (scrollTop: number) => void) => {
      let rafId: number;
      
      return (e: React.UIEvent) => {
        const target = e.currentTarget as HTMLElement;
        
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        
        rafId = requestAnimationFrame(() => {
          callback(target.scrollTop);
        });
      };
    },
    []
  );

  return {
    virtualScroll: {
      useVirtualScroll,
      createScrollHandler
    },
    debouncedValue,
    setValue,
    loadingStates: {
      isInitialLoading,
      isContentLoading,
      isTransitioning,
      setInitialLoading,
      setContentLoading,
      setTransitioning
    },
    metrics: {
      renderTime,
      lastRenderTime
    }
  };
};

/**
 * Lazy loading hook for modal content sections
 */
interface LazyContentOptions {
  /** Delay before loading content */
  delay?: number;
  /** Whether to load immediately */
  immediate?: boolean;
}

export const useLazyContent = (
  shouldLoad: boolean,
  options: LazyContentOptions = {}
): { isLoaded: boolean; load: () => void } => {
  const { delay = 100, immediate = false } = options;
  const [isLoaded, setIsLoaded] = useState(immediate);

  useEffect(() => {
    if (shouldLoad && !isLoaded) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [shouldLoad, isLoaded, delay]);

  const load = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return { isLoaded, load };
};

/**
 * Modal focus management hook
 */
export const useModalFocus = (isOpen: boolean, modalRef: React.RefObject<HTMLElement>) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else if (previousFocusRef.current) {
      // Restore focus to the previously focused element
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen, modalRef]);

  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, modalRef]);
};

/**
 * Optimized re-render prevention hook
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  const ref = useRef<T>(callback);

  useEffect(() => {
    ref.current = callback;
  }, deps);

  return useCallback(((...args: Parameters<T>) => {
    return ref.current(...args);
  }) as T, []);
};

export default useModalPerformance; 