/**
 * Muscle Group Dropdown Component
 * 
 * Multi-select dropdown for choosing muscle groups with limit validation.
 * Optimized with React.memo to prevent unnecessary re-renders.
 */
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MuscleGroup, MuscleGroupDropdownProps } from '../../../../types/muscle-types';
import { 
  muscleGroupData, 
  MUSCLE_GROUP_DISPLAY_ORDER 
} from '../../../../constants/muscle-data';

export const MuscleGroupDropdown: React.FC<MuscleGroupDropdownProps> = React.memo(({
  selectedGroups = [],
  onGroupSelect,
  disabled = false,
  maxGroups = 3,
  placeholder = "Select a muscle group"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Memoize available groups calculation to prevent recalculation on every render
  const availableGroups = useMemo(() => 
    MUSCLE_GROUP_DISPLAY_ORDER.filter(
      group => !selectedGroups.includes(group)
    ), [selectedGroups]
  );

  // Memoize disabled state to prevent unnecessary comparisons
  const isDisabled = useMemo(() => 
    disabled || availableGroups.length === 0, 
    [disabled, availableGroups.length]
  );

  // Memoize placeholder text to prevent string recreation
  const displayText = useMemo(() => 
    availableGroups.length === 0 ? 'All muscle groups selected' : placeholder,
    [availableGroups.length, placeholder]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoize keyboard handler to prevent recreation on every render
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (isDisabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (focusedIndex >= 0 && focusedIndex < availableGroups.length) {
          onGroupSelect(availableGroups[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => 
            prev < availableGroups.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : availableGroups.length - 1
          );
        }
        break;
    }
  }, [isDisabled, isOpen, focusedIndex, availableGroups, onGroupSelect]);

  // Memoize group selection handler
  const handleGroupSelect = useCallback((group: MuscleGroup) => {
    onGroupSelect(group);
    setIsOpen(false);
    setFocusedIndex(-1);
  }, [onGroupSelect]);

  // Memoize dropdown toggle handler
  const toggleDropdown = useCallback(() => {
    if (isDisabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(0);
    }
  }, [isDisabled, isOpen]);

  // Memoize mouse enter handler for options
  const createMouseEnterHandler = useCallback((index: number) => 
    () => setFocusedIndex(index), 
    []
  );

  return (
    <div 
      className={`muscle-group-dropdown ${isDisabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
      ref={dropdownRef}
    >
      <div
        className="dropdown-trigger"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={isDisabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select muscle group"
        aria-disabled={isDisabled}
      >
        <span className="dropdown-text">
          {displayText}
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}>
          ▼
        </span>
      </div>

      {isOpen && availableGroups.length > 0 && (
        <div className="dropdown-menu" role="listbox" aria-label="Available muscle groups">
          {availableGroups.map((group, index) => {
            const groupData = muscleGroupData[group];
            const isFocused = index === focusedIndex;
            
            return (
              <DropdownOption
                key={group}
                group={group}
                groupData={groupData}
                isFocused={isFocused}
                onSelect={handleGroupSelect}
                onMouseEnter={createMouseEnterHandler(index)}
              />
            );
          })}
        </div>
      )}

      {/* Selection limit indicator */}
      {selectedGroups.length > 0 && (
        <div className="selection-limit-indicator">
          {selectedGroups.length}/{maxGroups} selected
        </div>
      )}
    </div>
  );
});

// Memoized dropdown option component to prevent unnecessary re-renders
const DropdownOption: React.FC<{
  group: MuscleGroup;
  groupData: any;
  isFocused: boolean;
  onSelect: (group: MuscleGroup) => void;
  onMouseEnter: () => void;
}> = React.memo(({ group, groupData, isFocused, onSelect, onMouseEnter }) => {
  // Memoize click handler for this specific group
  const handleClick = useCallback(() => onSelect(group), [onSelect, group]);

  return (
    <div
      className={`dropdown-option ${isFocused ? 'focused' : ''}`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      role="option"
      aria-selected={false}
      tabIndex={-1}
    >
      <span className="option-icon">{groupData.icon}</span>
      <div className="option-content">
        <div className="option-name">{groupData.display}</div>
        <div className="option-description">{groupData.description}</div>
      </div>
      <div className="option-muscle-count">
        {groupData.muscles.length} muscles
      </div>
    </div>
  );
});

// Add display names for React DevTools
MuscleGroupDropdown.displayName = 'MuscleGroupDropdown';
DropdownOption.displayName = 'DropdownOption'; 