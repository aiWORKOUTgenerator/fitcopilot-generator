/**
 * GridSelector Component
 * 
 * Reusable grid selection component for multiple choice selections
 */
import React, { useCallback } from 'react';
import { GridOption } from '../types';
import './GridSelector.scss';

interface GridSelectorProps<T extends string> {
  options: GridOption<T>[];
  selectedValues: T[];
  onSelectionChange: (values: T[]) => void;
  multiSelect?: boolean;
  gridColumns?: number;
  className?: string;
  label?: string;
}

export const GridSelector = <T extends string>({
  options,
  selectedValues,
  onSelectionChange,
  multiSelect = true,
  gridColumns = 4,
  className = '',
  label
}: GridSelectorProps<T>) => {
  const handleOptionClick = useCallback((value: T) => {
    if (multiSelect) {
      const isSelected = selectedValues.includes(value);
      const newSelection = isSelected
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([value]);
    }
  }, [selectedValues, onSelectionChange, multiSelect]);

  const gridStyle = {
    gridTemplateColumns: `repeat(${gridColumns}, 1fr)`
  };

  return (
    <div className={`grid-selector-container ${className}`}>
      {label && (
        <div className="grid-selector-label">{label}</div>
      )}
      
      <div 
        className="grid-selector-options" 
        style={gridStyle}
      >
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          
          return (
            <div
              key={option.value}
              className={`grid-option ${isSelected ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option.value)}
              title={option.tooltip || option.label}
              style={{
                backgroundColor: isSelected && option.bgColor 
                  ? option.bgColor 
                  : undefined,
                borderColor: isSelected && option.color 
                  ? option.color 
                  : undefined,
                color: isSelected && option.color 
                  ? option.color 
                  : undefined
              }}
            >
              {option.icon && (
                <span className="option-icon">{option.icon}</span>
              )}
              <span className="option-label">{option.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 