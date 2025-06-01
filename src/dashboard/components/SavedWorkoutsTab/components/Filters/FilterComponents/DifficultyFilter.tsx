/**
 * Difficulty Filter Component
 * 
 * Handles difficulty level filtering with visual indicators.
 * Extracted from AdvancedWorkoutFilters as part of Week 2 Component Splitting.
 */
import React, { useCallback } from 'react';
import { Target } from 'lucide-react';

export interface DifficultyOption {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { value: 'beginner', label: 'Beginner', icon: '🟢', color: 'green' },
  { value: 'intermediate', label: 'Intermediate', icon: '🟡', color: 'yellow' },
  { value: 'advanced', label: 'Advanced', icon: '🔴', color: 'red' }
];

interface DifficultyFilterProps {
  selectedDifficulties: string[];
  onChange: (difficulties: string[]) => void;
  showLabel?: boolean;
}

/**
 * DifficultyFilter Component - Multi-select difficulty filtering
 */
export const DifficultyFilter: React.FC<DifficultyFilterProps> = ({
  selectedDifficulties,
  onChange,
  showLabel = true
}) => {
  const handleToggleDifficulty = useCallback((difficulty: string) => {
    const newSelection = selectedDifficulties.includes(difficulty)
      ? selectedDifficulties.filter(d => d !== difficulty)
      : [...selectedDifficulties, difficulty];
    
    onChange(newSelection);
  }, [selectedDifficulties, onChange]);

  const handleSelectAll = useCallback(() => {
    if (selectedDifficulties.length === DIFFICULTY_OPTIONS.length) {
      onChange([]);
    } else {
      onChange(DIFFICULTY_OPTIONS.map(opt => opt.value));
    }
  }, [selectedDifficulties, onChange]);

  return (
    <div className="difficulty-filter">
      {showLabel && (
        <div className="filter-section__header">
          <h4 className="filter-section__title">
            <Target size={16} />
            Difficulty Level
          </h4>
          <button
            type="button"
            className="filter-section__action"
            onClick={handleSelectAll}
          >
            {selectedDifficulties.length === DIFFICULTY_OPTIONS.length ? 'Clear All' : 'Select All'}
          </button>
        </div>
      )}
      
      <div className="difficulty-filter__options">
        {DIFFICULTY_OPTIONS.map(option => {
          const isSelected = selectedDifficulties.includes(option.value);
          
          return (
            <label
              key={option.value}
              className={`difficulty-option ${isSelected ? 'difficulty-option--selected' : ''}`}
              data-color={option.color}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleDifficulty(option.value)}
                className="difficulty-option__input"
              />
              <span className="difficulty-option__indicator">
                {option.icon}
              </span>
              <span className="difficulty-option__label">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      
      {selectedDifficulties.length > 0 && (
        <div className="difficulty-filter__summary">
          <span className="filter-summary">
            {selectedDifficulties.length} of {DIFFICULTY_OPTIONS.length} selected
          </span>
        </div>
      )}
    </div>
  );
};

export default DifficultyFilter; 