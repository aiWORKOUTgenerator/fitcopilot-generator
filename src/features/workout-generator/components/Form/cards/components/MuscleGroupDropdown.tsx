/**
 * Muscle Group Dropdown Component
 * 
 * Multi-select dropdown for choosing muscle groups with limit validation.
 */
import React, { useState, useRef, useEffect } from 'react';
import { MuscleGroup, MuscleGroupDropdownProps } from '../../../../types/muscle-types';
import { 
  muscleGroupData, 
  MUSCLE_GROUP_DISPLAY_ORDER 
} from '../../../../constants/muscle-data';

export const MuscleGroupDropdown: React.FC<MuscleGroupDropdownProps> = ({
  selectedGroups = [],
  onGroupSelect,
  disabled = false,
  maxGroups = 3,
  placeholder = "Select a muscle group"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Available groups (not already selected)
  const availableGroups = MUSCLE_GROUP_DISPLAY_ORDER.filter(
    group => !selectedGroups.includes(group)
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

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled || availableGroups.length === 0) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (focusedIndex >= 0 && focusedIndex < availableGroups.length) {
          handleGroupSelect(availableGroups[focusedIndex]);
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
  };

  // Handle group selection
  const handleGroupSelect = (group: MuscleGroup) => {
    onGroupSelect(group);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (disabled || availableGroups.length === 0) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(0);
    }
  };

  return (
    <div 
      className={`muscle-group-dropdown ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
      ref={dropdownRef}
    >
      <div
        className="dropdown-trigger"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select muscle group"
        aria-disabled={disabled}
      >
        <span className="dropdown-text">
          {availableGroups.length === 0 ? 'All muscle groups selected' : placeholder}
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}>
          ▼
        </span>
      </div>

      {isOpen && availableGroups.length > 0 && (
        <div className="dropdown-menu" role="listbox" aria-label="Available muscle groups">
          {availableGroups.map((group, index) => (
            <div
              key={group}
              className={`dropdown-option ${index === focusedIndex ? 'focused' : ''}`}
              onClick={() => handleGroupSelect(group)}
              onMouseEnter={() => setFocusedIndex(index)}
              role="option"
              aria-selected={false}
              tabIndex={-1}
            >
              <span className="option-icon">{muscleGroupData[group].icon}</span>
              <div className="option-content">
                <div className="option-name">{muscleGroupData[group].display}</div>
                <div className="option-description">{muscleGroupData[group].description}</div>
              </div>
              <div className="option-muscle-count">
                {muscleGroupData[group].muscles.length} muscles
              </div>
            </div>
          ))}
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
}; 