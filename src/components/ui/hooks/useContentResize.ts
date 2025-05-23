/**
 * useContentResize Hook
 * 
 * A custom hook that provides debounced resize functionality for optimizing
 * performance during frequent content changes and dynamic sizing operations.
 * 
 * @example
 * const debouncedResize = useContentResize((dimensions) => {
 *   console.log('New dimensions:', dimensions);
 * }, 150);
 */
import { useMemo, useRef, useCallback } from 'react';

/**
 * Debounce function utility
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Hook for managing debounced content resize operations
 * 
 * @param callback - Function to call when resize occurs
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced callback function
 */
export const useContentResize = (
  callback: (...args: any[]) => any, 
  delay: number = 150
) => {
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  callbackRef.current = callback;
  
  // Create debounced function with useMemo to prevent recreation on every render
  const debouncedCallback = useMemo(
    () => debounce((...args: any[]) => {
      callbackRef.current(...args);
    }, delay),
    [delay]
  );
  
  return debouncedCallback;
};

/**
 * Hook for managing element dimension observations
 * 
 * @param callback - Function to call when dimensions change
 * @param delay - Debounce delay in milliseconds
 * @returns Callback function and utilities for dimension tracking
 */
export const useDimensionObserver = (
  callback: (dimensions: { width: number; height: number }) => void,
  delay: number = 150
) => {
  const debouncedCallback = useContentResize(callback, delay);
  const observerRef = useRef<ResizeObserver | null>(null);
  
  // Function to start observing an element
  const observe = useCallback((element: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        debouncedCallback({ width, height });
      }
    });
    
    observerRef.current.observe(element);
  }, [debouncedCallback]);
  
  // Function to stop observing
  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);
  
  return { observe, disconnect };
};

/**
 * Hook for calculating text content dimensions
 * 
 * @param delay - Debounce delay in milliseconds
 * @returns Function to calculate text dimensions
 */
export const useTextDimensions = (delay: number = 100) => {
  const measureText = useContentResize((
    text: string, 
    element: HTMLElement,
    callback: (dimensions: { width: number; height: number }) => void
  ) => {
    // Create a temporary element to measure text dimensions
    const measurer = document.createElement('div');
    
    // Copy styles from the target element
    const computedStyle = window.getComputedStyle(element);
    measurer.style.font = computedStyle.font;
    measurer.style.fontSize = computedStyle.fontSize;
    measurer.style.fontFamily = computedStyle.fontFamily;
    measurer.style.fontWeight = computedStyle.fontWeight;
    measurer.style.lineHeight = computedStyle.lineHeight;
    measurer.style.letterSpacing = computedStyle.letterSpacing;
    measurer.style.wordSpacing = computedStyle.wordSpacing;
    measurer.style.padding = computedStyle.padding;
    measurer.style.border = computedStyle.border;
    
    // Set up measurement styles
    measurer.style.position = 'absolute';
    measurer.style.visibility = 'hidden';
    measurer.style.whiteSpace = 'pre-wrap';
    measurer.style.wordWrap = 'break-word';
    measurer.style.width = `${element.clientWidth}px`;
    measurer.style.height = 'auto';
    
    // Add text content
    measurer.textContent = text;
    
    // Add to DOM for measurement
    document.body.appendChild(measurer);
    
    // Get dimensions
    const dimensions = {
      width: measurer.scrollWidth,
      height: measurer.scrollHeight
    };
    
    // Clean up
    document.body.removeChild(measurer);
    
    // Call callback with dimensions
    callback(dimensions);
  }, delay);
  
  return measureText;
};

export default useContentResize; 