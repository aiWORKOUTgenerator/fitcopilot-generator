/**
 * Dynamic Text Container Component
 * 
 * A wrapper component that intelligently sizes itself based on content,
 * providing smooth transitions and optimal space utilization.
 * 
 * @example
 * <DynamicTextContainer minHeight="2em" animated>
 *   <input value={longText} onChange={handleChange} />
 * </DynamicTextContainer>
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useContentResize } from './hooks/useContentResize';

export interface DynamicTextContainerProps {
  /**
   * Content to display with dynamic sizing
   */
  children: React.ReactNode;
  
  /**
   * Minimum height in CSS units
   * @default "auto"
   */
  minHeight?: string;
  
  /**
   * Maximum height in CSS units (optional)
   * @default undefined (no maximum)
   */
  maxHeight?: string;
  
  /**
   * Whether to animate size changes
   * @default true
   */
  animated?: boolean;
  
  /**
   * Animation duration in milliseconds
   * @default 150
   */
  animationDuration?: number;
  
  /**
   * Callback when container size changes
   */
  onSizeChange?: (dimensions: { width: number; height: number }) => void;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Whether to observe content changes for auto-resizing
   * @default true
   */
  observeContentChanges?: boolean;
  
  /**
   * Debounce delay for resize calculations in milliseconds
   * @default 150
   */
  resizeDebounce?: number;
}

/**
 * A container that dynamically adjusts its size based on content.
 * 
 * Features:
 * - Automatically resizes based on content dimensions
 * - Smooth animations for size changes
 * - Intelligent content observation
 * - Configurable constraints (min/max height)
 * - Performance optimized with debounced calculations
 * 
 * @param {DynamicTextContainerProps} props - Component properties
 * @returns {JSX.Element} Rendered dynamic container
 */
export const DynamicTextContainer: React.FC<DynamicTextContainerProps> = ({
  children,
  minHeight = "auto",
  maxHeight,
  animated = true,
  animationDuration = 150,
  onSizeChange,
  className = '',
  observeContentChanges = true,
  resizeDebounce = 150,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Debounced resize function
  const debouncedResize = useContentResize((newDimensions: { width: number; height: number }) => {
    setDimensions(newDimensions);
    if (onSizeChange) {
      onSizeChange(newDimensions);
    }
  }, resizeDebounce);
  
  // Calculate container dimensions
  const calculateDimensions = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Get the natural content dimensions
    const scrollWidth = container.scrollWidth;
    const scrollHeight = container.scrollHeight;
    
    // Apply constraints
    let finalHeight = scrollHeight;
    
    // Apply minimum height constraint
    if (minHeight !== "auto") {
      const minHeightPx = convertCSSUnitToPixels(minHeight, container);
      finalHeight = Math.max(finalHeight, minHeightPx);
    }
    
    // Apply maximum height constraint
    if (maxHeight) {
      const maxHeightPx = convertCSSUnitToPixels(maxHeight, container);
      finalHeight = Math.min(finalHeight, maxHeightPx);
    }
    
    const newDimensions = {
      width: scrollWidth,
      height: finalHeight
    };
    
    debouncedResize(newDimensions);
  }, [minHeight, maxHeight, debouncedResize]);
  
  // Convert CSS units to pixels
  const convertCSSUnitToPixels = (value: string, element: HTMLElement): number => {
    if (value.endsWith('px')) {
      return parseFloat(value);
    } else if (value.endsWith('em')) {
      const fontSize = window.getComputedStyle(element).fontSize;
      return parseFloat(value) * parseFloat(fontSize);
    } else if (value.endsWith('rem')) {
      const rootFontSize = window.getComputedStyle(document.documentElement).fontSize;
      return parseFloat(value) * parseFloat(rootFontSize);
    } else if (value.endsWith('%')) {
      const parentHeight = element.parentElement?.clientHeight || 0;
      return (parseFloat(value) / 100) * parentHeight;
    }
    // Default to pixels if no unit specified
    return parseFloat(value) || 0;
  };
  
  // Set up content observation
  useEffect(() => {
    if (!observeContentChanges || !containerRef.current) return;
    
    const container = containerRef.current;
    
    // Initial calculation
    calculateDimensions();
    
    // Set up MutationObserver to watch for content changes
    const observer = new MutationObserver(() => {
      calculateDimensions();
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
    
    // Set up ResizeObserver to watch for external size changes
    const resizeObserver = new ResizeObserver(() => {
      calculateDimensions();
    });
    
    resizeObserver.observe(container);
    
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [calculateDimensions, observeContentChanges]);
  
  // Handle window resize
  useEffect(() => {
    const handleWindowResize = () => {
      calculateDimensions();
    };
    
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [calculateDimensions]);
  
  // Container styles
  const containerStyle: React.CSSProperties = {
    minHeight,
    maxHeight,
    overflow: 'hidden',
    transition: animated ? `height ${animationDuration}ms ease-in-out` : undefined,
    height: dimensions.height > 0 ? `${dimensions.height}px` : undefined,
  };
  
  return (
    <div
      ref={containerRef}
      className={`dynamic-text-container ${className}`}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

export default DynamicTextContainer; 