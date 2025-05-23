/**
 * Auto-Resize Textarea Component
 * 
 * An enhanced textarea that automatically adjusts its height based on content.
 * Extends the base Textarea component with auto-resizing capabilities.
 * 
 * @example
 * <AutoResizeTextarea
 *   id="description"
 *   value={description}
 *   onChange={handleChange}
 *   placeholder="Enter description..."
 *   minRows={2}
 *   maxRows={10}
 * />
 */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Textarea, TextareaProps } from './Textarea';
import { useContentResize } from './hooks/useContentResize';

export interface AutoResizeTextareaProps extends TextareaProps {
  /**
   * Minimum number of rows to display
   * @default 2
   */
  minRows?: number;
  
  /**
   * Maximum number of rows before scrolling (optional)
   * When not specified, textarea expands without limit
   * @default undefined (no maximum)
   */
  maxRows?: number;
  
  /**
   * Whether to show all content immediately on initial render
   * @default true
   */
  expandOnMount?: boolean;
  
  /**
   * Callback when component resizes
   */
  onResize?: (height: number) => void;
  
  /**
   * Whether to animate height changes
   * @default true
   */
  animateResize?: boolean;
  
  /**
   * Performance mode for frequent content changes
   * 'optimized' reduces calculation frequency for better performance
   * @default 'standard'
   */
  performanceMode?: 'standard' | 'optimized';
}

/**
 * A textarea that automatically adjusts its height based on content.
 * 
 * Features:
 * - Auto-resizes height based on content
 * - Supports minimum and optional maximum height constraints
 * - Enhanced performance with debounced calculations
 * - Smooth height transitions
 * - Preserves all functionality of the base Textarea component
 * 
 * @param {AutoResizeTextareaProps} props - Component properties
 * @returns {JSX.Element} Rendered auto-resize textarea
 */
export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  minRows = 2,
  maxRows,
  onChange,
  className = '',
  expandOnMount = true,
  onResize,
  animateResize = true,
  performanceMode = 'standard',
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Determine debounce delay based on performance mode
  const debounceDelay = performanceMode === 'optimized' ? 200 : 100;
  
  // Debounced resize function for performance optimization
  const debouncedAdjustHeight = useContentResize(() => {
    adjustHeightImmediate();
  }, debounceDelay);
  
  // Calculate and set appropriate height based on content
  const adjustHeightImmediate = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Store the current scroll position to prevent page jump
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Reset height to auto to get the correct scrollHeight
    const originalHeight = textarea.style.height;
    textarea.style.height = 'auto';
    
    // Get computed styles for calculations
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
    const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
    
    // Calculate minimum height based on minRows
    const minHeight = (minRows * lineHeight) + paddingTop + paddingBottom + borderTop + borderBottom;
    
    // Get content height
    const contentHeight = textarea.scrollHeight;
    
    // Calculate final height
    let newHeight = Math.max(contentHeight, minHeight);
    
    // Apply maximum height constraint only if specified
    if (maxRows) {
      const maxHeight = (maxRows * lineHeight) + paddingTop + paddingBottom + borderTop + borderBottom;
      newHeight = Math.min(newHeight, maxHeight);
      
      // Enable scrolling if content exceeds maximum height
      textarea.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';
    } else {
      // No max height constraint - always hide scroll
      textarea.style.overflowY = 'hidden';
    }
    
    // Set the new height
    textarea.style.height = `${newHeight}px`;
    
    // Call resize callback if provided
    if (onResize && originalHeight !== textarea.style.height) {
      onResize(newHeight);
    }
    
    // Restore scroll position to prevent page jump
    window.scrollTo(0, scrollTop);
  }, [minRows, maxRows, onResize]);
  
  // Main adjust height function that may be debounced
  const adjustHeight = useCallback(() => {
    if (performanceMode === 'optimized') {
      debouncedAdjustHeight();
    } else {
      adjustHeightImmediate();
    }
  }, [performanceMode, debouncedAdjustHeight, adjustHeightImmediate]);
  
  // Handle content change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
    // Adjust height after content change
    adjustHeight();
  };
  
  // Initialize component and set up initial height
  useEffect(() => {
    if (!isInitialized && textareaRef.current) {
      setIsInitialized(true);
      
      // Use immediate adjustment for initial render
      if (expandOnMount) {
        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
          adjustHeightImmediate();
        }, 0);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [isInitialized, expandOnMount, adjustHeightImmediate]);
  
  // Adjust height when value prop changes
  useEffect(() => {
    if (isInitialized) {
      adjustHeight();
    }
  }, [props.value, isInitialized, adjustHeight]);
  
  // Handle window resize events
  useEffect(() => {
    const handleWindowResize = () => {
      if (isInitialized) {
        adjustHeight();
      }
    };
    
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isInitialized, adjustHeight]);
  
  // Apply animation class based on animateResize prop
  const textareaClassName = `
    auto-resize-textarea 
    ${animateResize ? 'auto-resize-textarea--animated' : ''}
    ${className}
  `.trim();
  
  return (
    <Textarea
      {...props}
      ref={textareaRef}
      onChange={handleChange}
      className={textareaClassName}
      rows={minRows} // Set initial rows
    />
  );
};

export default AutoResizeTextarea; 