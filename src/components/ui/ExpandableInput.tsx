/**
 * Expandable Input Component
 * 
 * An enhanced input component that dynamically expands to accommodate all content
 * without truncation, providing optimal editing experience.
 * 
 * @example
 * <ExpandableInput 
 *   id="exercise-name"
 *   value={name}
 *   onChange={handleNameChange}
 *   placeholder="Exercise name"
 *   allowMultiLine={true}
 *   autoExpand={true}
 * />
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Input, InputProps } from './Input';
import { AutoResizeTextarea } from './AutoResizeTextarea';

export interface EnhancedExpandableInputProps extends InputProps {
  /**
   * Whether to show a tooltip with the full text on hover when text is truncated
   * @default true
   */
  showTooltip?: boolean;
  
  /**
   * Whether to expand the input width when focused
   * @default false
   */
  expandOnFocus?: boolean;
  
  /**
   * Maximum width of the expanded input (in pixels)
   * Only used when expandOnFocus is true
   * @default 300
   */
  maxExpandedWidth?: number;
  
  /**
   * Allow multi-line expansion for complex content
   * @default false
   */
  allowMultiLine?: boolean;
  
  /**
   * Auto-expand based on content length
   * @default false
   */
  autoExpand?: boolean;
  
  /**
   * Maximum expanded height (in lines)
   * @default 5
   */
  maxExpandedLines?: number;
  
  /**
   * Minimum expanded height (in lines)
   * @default 1
   */
  minExpandedLines?: number;
  
  /**
   * Show expansion indicator when content is truncated
   * @default true
   */
  showExpansionIndicator?: boolean;
  
  /**
   * Character count threshold to trigger expansion
   * @default 30
   */
  expansionThreshold?: number;
  
  /**
   * Expand width based on content
   * @default true
   */
  adaptiveWidth?: boolean;
  
  /**
   * Expand height for multi-line content
   * @default true
   */
  adaptiveHeight?: boolean;
}

interface ContentMetrics {
  isOverflowing: boolean;
  estimatedWidth: number;
  estimatedHeight: number;
  lineCount: number;
  needsExpansion: boolean;
}

/**
 * Hook for analyzing content and determining expansion needs
 */
const useContentExpansion = (
  value: string,
  autoExpand: boolean,
  expansionThreshold: number,
  inputRef: React.RefObject<HTMLElement>
) => {
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics>({
    isOverflowing: false,
    estimatedWidth: 0,
    estimatedHeight: 0,
    lineCount: 1,
    needsExpansion: false
  });

  const analyzeContent = useCallback(() => {
    if (!inputRef.current || !value) {
      setContentMetrics({
        isOverflowing: false,
        estimatedWidth: 0,
        estimatedHeight: 0,
        lineCount: 1,
        needsExpansion: false
      });
      return;
    }

    const element = inputRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (context) {
      const computedStyle = window.getComputedStyle(element);
      context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
      
      const textWidth = context.measureText(value).width;
      const containerWidth = element.clientWidth || 200; // Fallback width
      const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
      
      const lineCount = Math.max(1, Math.ceil(textWidth / containerWidth));
      const estimatedHeight = lineCount * lineHeight;
      const hasLineBreaks = value.includes('\n');
      const actualLineCount = hasLineBreaks ? value.split('\n').length : lineCount;
      
      const needsExpansion = 
        value.length > expansionThreshold ||
        hasLineBreaks ||
        textWidth > containerWidth ||
        autoExpand;

      setContentMetrics({
        isOverflowing: textWidth > containerWidth,
        estimatedWidth: textWidth,
        estimatedHeight,
        lineCount: actualLineCount,
        needsExpansion
      });
    }
  }, [value, expansionThreshold, autoExpand, inputRef]);

  // Debounced content analysis for performance
  useEffect(() => {
    const timer = setTimeout(analyzeContent, 100);
    return () => clearTimeout(timer);
  }, [analyzeContent]);

  return contentMetrics;
};

/**
 * Expansion Indicator Component
 */
const ExpansionIndicator: React.FC<{
  onClick: () => void;
  contentMetrics: ContentMetrics;
}> = ({ onClick, contentMetrics }) => (
  <button
    type="button"
    className="expansion-indicator"
    onClick={onClick}
    title="Click to expand for full content"
    tabIndex={-1}
    aria-label={`Expand to show ${contentMetrics.lineCount} lines of content`}
  >
    <span className="expansion-indicator__icon">⤢</span>
    <span className="expansion-indicator__hint">
      {contentMetrics.lineCount > 1 ? `${contentMetrics.lineCount} lines` : 'Expand'}
    </span>
  </button>
);

/**
 * An input component with enhanced overflow handling and dynamic expansion.
 * 
 * Features:
 * - Auto-resizes based on content
 * - Multi-line support when needed
 * - Smart expansion detection
 * - Smooth transitions
 * - Preserves all functionality of the base Input component
 * 
 * @param {EnhancedExpandableInputProps} props - Component properties
 * @returns {JSX.Element} Rendered expandable input
 */
export const ExpandableInput: React.FC<EnhancedExpandableInputProps> = ({
  showTooltip = true,
  expandOnFocus = false,
  maxExpandedWidth = 300,
  allowMultiLine = false,
  autoExpand = false,
  maxExpandedLines = 5,
  minExpandedLines = 1,
  showExpansionIndicator = true,
  expansionThreshold = 30,
  adaptiveWidth = true,
  adaptiveHeight = true,
  className = '',
  onFocus,
  onBlur,
  value = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  const contentMetrics = useContentExpansion(
    value.toString(),
    autoExpand,
    expansionThreshold,
    inputRef
  );

  // Determine if we should expand
  const shouldExpand = useMemo(() => {
    return (
      contentMetrics.needsExpansion ||
      isManuallyExpanded ||
      (isFocused && (expandOnFocus || contentMetrics.isOverflowing))
    );
  }, [contentMetrics, isManuallyExpanded, isFocused, expandOnFocus]);

  // Determine if we should use textarea
  const useTextarea = allowMultiLine && (shouldExpand || contentMetrics.lineCount > 1);

  // Handle focus event
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e as any);
    }
  }, [onFocus]);

  // Handle blur event
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(false);
    // Reset manual expansion on blur if content doesn't require it
    if (!contentMetrics.needsExpansion) {
      setIsManuallyExpanded(false);
    }
    if (onBlur) {
      onBlur(e as any);
    }
  }, [onBlur, contentMetrics.needsExpansion]);

  // Handle expansion indicator click
  const handleExpansionClick = useCallback(() => {
    setIsManuallyExpanded(true);
    inputRef.current?.focus();
  }, []);

  // Generate class names
  const getExpandableClassName = () => {
    const baseClasses = [
      'expandable-input',
      className
    ];

    if (shouldExpand) {
      baseClasses.push('expandable-input--expanded');
    }
    
    if (contentMetrics.isOverflowing && !shouldExpand) {
      baseClasses.push('expandable-input--overflowing');
    }
    
    if (useTextarea) {
      baseClasses.push('expandable-input--multiline');
    }
    
    if (adaptiveWidth) {
      baseClasses.push('expandable-input--adaptive-width');
    }
    
    if (adaptiveHeight) {
      baseClasses.push('expandable-input--adaptive-height');
    }

    return baseClasses.filter(Boolean).join(' ');
  };

  // Generate dynamic styles
  const getDynamicStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (shouldExpand && adaptiveWidth) {
      styles.minWidth = '200px';
      styles.maxWidth = `${maxExpandedWidth}px`;
    }
    
    if (shouldExpand && adaptiveHeight && contentMetrics.estimatedHeight > 0) {
      const lineHeight = 24; // Approximate line height
      const minHeight = minExpandedLines * lineHeight;
      const maxHeight = maxExpandedLines * lineHeight;
      const contentHeight = Math.max(minHeight, Math.min(contentMetrics.estimatedHeight, maxHeight));
      
      if (useTextarea) {
        styles.minHeight = `${minHeight}px`;
        styles.maxHeight = `${maxHeight}px`;
      }
    }
    
    return styles;
  };

  const dynamicProps = {
    ...props,
    value,
    onFocus: handleFocus,
    onBlur: handleBlur,
    className: getExpandableClassName(),
    style: { ...props.style, ...getDynamicStyles() },
    title: showTooltip && contentMetrics.isOverflowing && !shouldExpand ? value.toString() : props.title,
  };

  return (
    <div 
      className="expandable-input-wrapper"
      role="group"
      aria-expanded={shouldExpand}
      aria-describedby={showExpansionIndicator ? "expansion-status" : undefined}
    >
      {useTextarea ? (
        <AutoResizeTextarea
          {...(dynamicProps as any)}
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          minRows={minExpandedLines}
          maxRows={maxExpandedLines}
          expandOnMount={shouldExpand}
          performanceMode="optimized"
        />
      ) : (
        <Input
          {...dynamicProps}
          ref={inputRef as React.RefObject<HTMLInputElement>}
        />
      )}
      
      {showExpansionIndicator && 
       contentMetrics.needsExpansion && 
       !shouldExpand && 
       !isFocused && (
        <ExpansionIndicator 
          onClick={handleExpansionClick}
          contentMetrics={contentMetrics}
        />
      )}
      
      {/* Screen reader announcements */}
      <div
        id="expansion-status"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {shouldExpand ? 
          `Input expanded to show ${contentMetrics.lineCount} lines of content` : 
          'Input collapsed'
        }
      </div>
    </div>
  );
};

export default ExpandableInput; 