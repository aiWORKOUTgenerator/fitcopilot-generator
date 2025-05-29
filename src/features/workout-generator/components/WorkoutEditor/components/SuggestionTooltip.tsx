/**
 * Suggestion Tooltip Component
 * 
 * Displays contextual suggestions for workout fields with smart positioning
 * and keyboard navigation. Integrates with validation feedback to provide
 * helpful recommendations to users.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Lightbulb, ChevronUp, ChevronDown } from 'lucide-react';
import './SuggestionTooltip.scss';

export interface SuggestionItem {
  /** Unique identifier for the suggestion */
  id: string;
  /** The suggestion text to display */
  text: string;
  /** Optional description or context */
  description?: string;
  /** Suggestion category for grouping */
  category?: string;
  /** Whether this suggestion is highlighted/recommended */
  highlighted?: boolean;
}

export interface SuggestionTooltipProps {
  /** Array of suggestions to display */
  suggestions: SuggestionItem[];
  /** Whether the tooltip is visible */
  isVisible: boolean;
  /** Preferred position relative to target */
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  /** Target element to position relative to */
  targetRef?: React.RefObject<HTMLElement>;
  /** Callback when a suggestion is selected */
  onSelectSuggestion: (suggestion: SuggestionItem) => void;
  /** Callback when tooltip should be closed */
  onClose?: () => void;
  /** Maximum number of suggestions to show */
  maxSuggestions?: number;
  /** Whether to show category headers */
  showCategories?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Custom positioning offset */
  offset?: { x: number; y: number };
}

/**
 * Groups suggestions by category
 */
const groupSuggestionsByCategory = (suggestions: SuggestionItem[]) => {
  const groups: Record<string, SuggestionItem[]> = {};
  const ungrouped: SuggestionItem[] = [];

  suggestions.forEach(suggestion => {
    if (suggestion.category) {
      if (!groups[suggestion.category]) {
        groups[suggestion.category] = [];
      }
      groups[suggestion.category].push(suggestion);
    } else {
      ungrouped.push(suggestion);
    }
  });

  return { groups, ungrouped };
};

/**
 * Smart positioning hook for tooltip placement
 */
const useSmartPositioning = (
  targetRef: React.RefObject<HTMLElement> | undefined,
  tooltipRef: React.RefObject<HTMLDivElement>,
  isVisible: boolean,
  preferredPosition: SuggestionTooltipProps['position'],
  offset: { x: number; y: number } = { x: 0, y: 0 }
) => {
  const [position, setPosition] = useState<{ top: number; left: number; placement: string }>({
    top: 0,
    left: 0,
    placement: 'bottom'
  });

  const calculatePosition = useCallback(() => {
    if (!targetRef?.current || !tooltipRef.current || !isVisible) return;

    const target = targetRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let finalPosition = preferredPosition;
    let top = 0;
    let left = 0;

    // Auto positioning logic
    if (preferredPosition === 'auto') {
      const spaceBelow = viewport.height - target.bottom;
      const spaceAbove = target.top;
      const spaceRight = viewport.width - target.right;
      const spaceLeft = target.left;

      if (spaceBelow >= tooltip.height) {
        finalPosition = 'bottom';
      } else if (spaceAbove >= tooltip.height) {
        finalPosition = 'top';
      } else if (spaceRight >= tooltip.width) {
        finalPosition = 'right';
      } else if (spaceLeft >= tooltip.width) {
        finalPosition = 'left';
      } else {
        finalPosition = 'bottom'; // Default fallback
      }
    }

    // Calculate position based on final placement
    switch (finalPosition) {
      case 'top':
        top = target.top - tooltip.height - 8;
        left = target.left + (target.width - tooltip.width) / 2;
        break;
      case 'bottom':
        top = target.bottom + 8;
        left = target.left + (target.width - tooltip.width) / 2;
        break;
      case 'left':
        top = target.top + (target.height - tooltip.height) / 2;
        left = target.left - tooltip.width - 8;
        break;
      case 'right':
        top = target.top + (target.height - tooltip.height) / 2;
        left = target.right + 8;
        break;
    }

    // Apply offset
    top += offset.y;
    left += offset.x;

    // Viewport boundary checks
    if (left < 8) left = 8;
    if (left + tooltip.width > viewport.width - 8) {
      left = viewport.width - tooltip.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltip.height > viewport.height - 8) {
      top = viewport.height - tooltip.height - 8;
    }

    setPosition({ top, left, placement: finalPosition });
  }, [targetRef, tooltipRef, isVisible, preferredPosition, offset]);

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isVisible, calculatePosition]);

  return position;
};

/**
 * Suggestion Tooltip with smart positioning and keyboard navigation
 */
export const SuggestionTooltip: React.FC<SuggestionTooltipProps> = ({
  suggestions,
  isVisible,
  position: preferredPosition = 'auto',
  targetRef,
  onSelectSuggestion,
  onClose,
  maxSuggestions = 8,
  showCategories = true,
  className = '',
  offset = { x: 0, y: 0 }
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Smart positioning
  const { top, left, placement } = useSmartPositioning(
    targetRef,
    tooltipRef,
    isVisible,
    preferredPosition,
    offset
  );

  // Filter and limit suggestions
  const filteredSuggestions = suggestions
    .filter(suggestion => 
      !searchTerm || suggestion.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, maxSuggestions);

  // Group suggestions if categories are enabled
  const { groups, ungrouped } = showCategories 
    ? groupSuggestionsByCategory(filteredSuggestions)
    : { groups: {}, ungrouped: filteredSuggestions };

  // Flatten suggestions for keyboard navigation
  const allSuggestions = [
    ...ungrouped,
    ...Object.values(groups).flat()
  ];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || allSuggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < allSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : allSuggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (allSuggestions[selectedIndex]) {
            onSelectSuggestion(allSuggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, allSuggestions, selectedIndex, onSelectSuggestion, onClose]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions, searchTerm]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(e.target as Node) &&
        targetRef?.current &&
        !targetRef.current.contains(e.target as Node)
      ) {
        onClose?.();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose, targetRef]);

  // Generate component classes
  const componentClasses = [
    'suggestion-tooltip',
    `suggestion-tooltip--${placement}`,
    isVisible ? 'suggestion-tooltip--visible' : '',
    className
  ].filter(Boolean).join(' ');

  // Don't render if not visible or no suggestions
  if (!isVisible || allSuggestions.length === 0) {
    return null;
  }

  // Render suggestion item
  const renderSuggestion = (suggestion: SuggestionItem, index: number) => {
    const globalIndex = allSuggestions.findIndex(s => s.id === suggestion.id);
    const isSelected = globalIndex === selectedIndex;

    return (
      <button
        key={suggestion.id}
        className={`suggestion-tooltip__item ${
          isSelected ? 'suggestion-tooltip__item--selected' : ''
        } ${suggestion.highlighted ? 'suggestion-tooltip__item--highlighted' : ''}`}
        onClick={() => onSelectSuggestion(suggestion)}
        onMouseEnter={() => setSelectedIndex(globalIndex)}
        type="button"
      >
        <div className="suggestion-tooltip__item-content">
          <div className="suggestion-tooltip__item-text">
            {suggestion.text}
          </div>
          {suggestion.description && (
            <div className="suggestion-tooltip__item-description">
              {suggestion.description}
            </div>
          )}
        </div>
        {suggestion.highlighted && (
          <div className="suggestion-tooltip__item-badge">
            Recommended
          </div>
        )}
      </button>
    );
  };

  return (
    <div
      ref={tooltipRef}
      className={componentClasses}
      style={{ top, left }}
      role="listbox"
      aria-label="Suggestions"
    >
      {/* Header */}
      <div className="suggestion-tooltip__header">
        <div className="suggestion-tooltip__header-content">
          <Lightbulb size={16} />
          <span>Suggestions</span>
        </div>
        <div className="suggestion-tooltip__navigation-hint">
          <ChevronUp size={12} />
          <ChevronDown size={12} />
        </div>
      </div>

      {/* Content */}
      <div className="suggestion-tooltip__content">
        {/* Ungrouped suggestions */}
        {ungrouped.length > 0 && (
          <div className="suggestion-tooltip__group">
            {ungrouped.map((suggestion, index) => renderSuggestion(suggestion, index))}
          </div>
        )}

        {/* Grouped suggestions */}
        {Object.entries(groups).map(([category, categorySuggestions]) => (
          <div key={category} className="suggestion-tooltip__group">
            <div className="suggestion-tooltip__group-header">
              {category}
            </div>
            {categorySuggestions.map((suggestion, index) => 
              renderSuggestion(suggestion, index)
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="suggestion-tooltip__footer">
        <span className="suggestion-tooltip__hint">
          ↵ Select • ↑↓ Navigate • Esc Close
        </span>
      </div>
    </div>
  );
};

export default SuggestionTooltip; 