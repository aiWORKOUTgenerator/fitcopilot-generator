/**
 * Workout Search Component
 * 
 * Provides search functionality for saved workouts with
 * debounced input and clear functionality.
 */
import React, { useState, useEffect, useRef } from 'react';

interface WorkoutSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * WorkoutSearch provides search input with debouncing
 */
const WorkoutSearch: React.FC<WorkoutSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search workouts...',
  debounceMs = 300
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localValue, onChange, debounceMs]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="workout-search">
      <div className="search-input-container">
        <span className="search-icon" aria-hidden="true">🔍</span>
        
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search workouts"
        />
        
        {localValue && (
          <button
            className="clear-search-btn"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      
      {localValue && (
        <div className="search-status">
          Searching for "{localValue}"
        </div>
      )}
    </div>
  );
};

export default WorkoutSearch; 