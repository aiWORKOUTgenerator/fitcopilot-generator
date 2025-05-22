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
import React, { useRef, useEffect, useCallback } from 'react';
import { Textarea, TextareaProps } from './Textarea';

export interface AutoResizeTextareaProps extends TextareaProps {
  /**
   * Minimum number of rows to display
   * @default 4
   */
  minRows?: number;
  
  /**
   * Maximum number of rows before scrolling
   * @default undefined (no maximum)
   */
  maxRows?: number;
  
  /**
   * Whether to show all content immediately on initial render
   * @default true
   */
  expandOnMount?: boolean;
}

/**
 * A textarea that automatically adjusts its height based on content.
 * 
 * Features:
 * - Auto-resizes height based on content
 * - Supports minimum and maximum height constraints
 * - Preserves all functionality of the base Textarea component
 * - Smooth height transitions
 * 
 * @param {AutoResizeTextareaProps} props - Component properties
 * @returns {JSX.Element} Rendered auto-resize textarea
 */
export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  minRows = 4,
  maxRows,
  onChange,
  className = '',
  expandOnMount = true,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Calculate and set appropriate height based on content
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Store the current scroll position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Get line height for row calculations
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight) || 20;
    
    // Calculate minimum and maximum heights if specified
    const minHeight = minRows * lineHeight;
    const maxHeight = maxRows ? maxRows * lineHeight : Number.MAX_SAFE_INTEGER;
    
    // Calculate content height based on scrollHeight
    const contentHeight = textarea.scrollHeight;
    
    // Set new height based on scrollHeight, constrained by min/max
    const newHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
    
    // If content exceeds maximum height, enable scrolling
    if (contentHeight > maxHeight && maxRows) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
    
    // Restore scroll position to prevent page jump
    window.scrollTo(0, scrollTop);
  }, [minRows, maxRows]);
  
  // Adjust height on content change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
    adjustHeight();
  };
  
  // Force initial height adjustment after content loads
  useEffect(() => {
    // Use a small delay to ensure content is properly rendered
    const timeoutId = setTimeout(() => {
      if (expandOnMount) {
        adjustHeight();
      }
    }, 10);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Adjust height on initial render, when value prop changes, and on window resize
  useEffect(() => {
    adjustHeight();
    
    // Also adjust when window resizes (affects line wrapping)
    window.addEventListener('resize', adjustHeight);
    return () => {
      window.removeEventListener('resize', adjustHeight);
    };
  }, [props.value, adjustHeight]);
  
  return (
    <Textarea
      {...props}
      ref={textareaRef}
      onChange={handleChange}
      className={`auto-resize-textarea ${className}`}
      rows={minRows} // Set initial rows
    />
  );
};

export default AutoResizeTextarea; 