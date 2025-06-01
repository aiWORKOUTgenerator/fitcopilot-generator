/**
 * Workout Search Component
 * 
 * Handles workout search with debounced input and suggestions.
 * Extracted from AdvancedWorkoutFilters as part of Week 2 Component Splitting.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface WorkoutSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}

/**
 * WorkoutSearch Component - Debounced search with suggestions
 */
export const WorkoutSearch: React.FC<WorkoutSearchProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search workouts...",
  debounceMs = 300,
  suggestions = [],
  onSuggestionSelect
}) => {
  const [localValue, setLocalValue] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Sync local value with props
  useEffect(() => {
    setLocalValue(searchQuery);
  }, [searchQuery]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onSearchChange, debounceMs]);

  // Filter suggestions based on current input
  useEffect(() => {
    if (localValue.length > 0 && suggestions.length > 0) {
      const filtered = suggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(localValue.toLowerCase()) &&
          suggestion.toLowerCase() !== localValue.toLowerCase()
        )
        .slice(0, 5); // Limit to 5 suggestions
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [localValue, suggestions]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
    setShowSuggestions(false);
    onSearchChange('');
  }, [onSearchChange]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setLocalValue(suggestion);
    setShowSuggestions(false);
    onSearchChange(suggestion);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  }, [onSearchChange, onSuggestionSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, []);

  const handleFocus = useCallback(() => {
    if (filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [filteredSuggestions]);

  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  }, []);

  return (
    <div className="workout-search">
      <div className="search-input-container">
        <div className="search-input">
          <Search size={16} className="search-input__icon" />
          <input
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="search-input__field"
          />
          {localValue && (
            <button
              type="button"
              onClick={handleClear}
              className="search-input__clear"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        {/* Search suggestions dropdown */}
        {showSuggestions && (
          <div className="search-suggestions">
            <ul className="search-suggestions__list">
              {filteredSuggestions.map((suggestion, index) => (
                <li key={index} className="search-suggestions__item">
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="search-suggestions__button"
                  >
                    <Search size={12} className="search-suggestions__icon" />
                    <span className="search-suggestions__text">
                      {suggestion}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Search status */}
      {localValue && (
        <div className="search-status">
          <span className="search-status__text">
            Searching for: <strong>"{localValue}"</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default WorkoutSearch; 