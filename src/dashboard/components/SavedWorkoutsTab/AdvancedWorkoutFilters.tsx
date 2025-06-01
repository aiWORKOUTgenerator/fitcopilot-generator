/**
 * Advanced Workout Filters Component - REFACTORED
 * 
 * Enhanced filtering system using extracted components for better maintainability.
 * Week 2 Component Splitting: Reduced from 520 lines to composition-focused design.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  CheckCircle,
  Circle,
  Clock
} from 'lucide-react';
import Button from '../../../components/ui/Button/Button';

// Import extracted components
import { FilterPresets, DEFAULT_PRESETS } from './components/Filters/FilterPresets';
import { DifficultyFilter } from './components/Filters/FilterComponents';
import { DurationFilter } from './components/Filters/FilterComponents';
import { WorkoutSearch } from './components/Search';

// Import types
import type { FilterPreset, WorkoutFilters } from './components/Filters/FilterPresets';

import './AdvancedFilters.scss';

interface AdvancedWorkoutFiltersProps {
  filters: WorkoutFilters;
  workouts: any[];
  onChange: (filters: Partial<WorkoutFilters>) => void;
  onClear: () => void;
  onSearchChange: (query: string) => void;
}

const COMPLETION_OPTIONS = [
  { value: 'all', label: 'All Workouts', icon: Circle },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'pending', label: 'Pending', icon: Clock }
];

/**
 * Advanced Workout Filters Component - Now uses modular sub-components
 */
export const AdvancedWorkoutFilters: React.FC<AdvancedWorkoutFiltersProps> = ({
  filters,
  workouts,
  onChange,
  onClear,
  onSearchChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Extract unique filter options from workouts
  const filterOptions = useMemo(() => {
    const workoutTypes = [...new Set(workouts.map(w => w.workoutType || 'General'))].filter(Boolean);
    const equipment = [...new Set(workouts.flatMap(w => w.equipment || []))].filter(Boolean);
    const tags = [...new Set(workouts.flatMap(w => w.tags || []))].filter(Boolean);
    const maxDuration = Math.max(...workouts.map(w => w.duration || 30), 120);
    
    return {
      workoutTypes: workoutTypes.sort(),
      equipment: equipment.sort(),
      tags: tags.sort(),
      maxDuration: Math.ceil(maxDuration / 15) * 15,
      searchSuggestions: [...workoutTypes, ...equipment, ...tags, ...workouts.map(w => w.title)].filter(Boolean)
    };
  }, [workouts]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.difficulty.length > 0) count++;
    if (filters.workoutType.length > 0) count++;
    if (filters.equipment.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.duration.min > 0 || filters.duration.max < 120) count++;
    if (filters.completed !== 'all') count++;
    if (filters.createdDate.start || filters.createdDate.end) count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset: FilterPreset) => {
    setActivePreset(preset.id);
    
    // Apply preset filters with defaults
    const presetFilters = {
      difficulty: [],
      workoutType: [],
      equipment: [],
      tags: [],
      duration: { min: 0, max: filterOptions.maxDuration },
      completed: 'all' as const,
      sortBy: 'date' as const,
      sortOrder: 'desc' as const,
      createdDate: { start: null, end: null },
      searchQuery: '',
      ...preset.filters
    };
    
    onChange(presetFilters);
  }, [onChange, filterOptions.maxDuration]);

  // Handle individual filter changes
  const handleFilterChange = useCallback((filterName: keyof WorkoutFilters, value: any) => {
    setActivePreset(null); // Clear active preset when manually changing filters
    onChange({ [filterName]: value });
  }, [onChange]);

  // Handle array filter toggle (for multi-select filters)
  const handleArrayFilterToggle = useCallback((filterName: keyof WorkoutFilters, value: string) => {
    const currentArray = filters[filterName] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterChange(filterName, newArray);
  }, [filters, handleFilterChange]);

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    setActivePreset(null);
    onClear();
  }, [onClear]);

  return (
    <div className="advanced-workout-filters">
      {/* Search Section - Always visible */}
      <div className="filter-section filter-section--search">
        <WorkoutSearch
          searchQuery={filters.searchQuery}
          onSearchChange={onSearchChange}
          suggestions={filterOptions.searchSuggestions}
          placeholder="Search workouts by title, exercise, or equipment..."
        />
      </div>

      {/* Filter Presets - Always visible */}
      <div className="filter-section filter-section--presets">
        <FilterPresets
          activePreset={activePreset}
          onPresetSelect={handlePresetSelect}
        />
      </div>

      {/* Advanced Filters Toggle */}
      <div className="filter-section filter-section--toggle">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="filters-toggle"
        >
          <Filter size={16} />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="filter-count">{activeFilterCount}</span>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="clear-filters"
          >
            <RotateCcw size={14} />
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Advanced Filters */}
      {isExpanded && (
        <div className="advanced-filters-expanded">
          {/* Difficulty Filter */}
          <div className="filter-section">
            <DifficultyFilter
              selectedDifficulties={filters.difficulty}
              onChange={(difficulties) => handleFilterChange('difficulty', difficulties)}
            />
          </div>

          {/* Duration Filter */}
          <div className="filter-section">
            <DurationFilter
              duration={filters.duration}
              maxDuration={filterOptions.maxDuration}
              onChange={(duration) => handleFilterChange('duration', duration)}
            />
          </div>

          {/* Workout Type Filter */}
          <div className="filter-section">
            <div className="filter-section__header">
              <h4 className="filter-section__title">Workout Type</h4>
              <button
                type="button"
                className="filter-section__action"
                onClick={() => handleFilterChange('workoutType', [])}
              >
                Clear
              </button>
            </div>
            <div className="filter-options">
              {filterOptions.workoutTypes.map(type => (
                <label key={type} className={`filter-option ${filters.workoutType.includes(type) ? 'filter-option--selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={filters.workoutType.includes(type)}
                    onChange={() => handleArrayFilterToggle('workoutType', type)}
                    className="filter-option__input"
                  />
                  <span className="filter-option__label">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Equipment Filter */}
          <div className="filter-section">
            <div className="filter-section__header">
              <h4 className="filter-section__title">Equipment</h4>
              <button
                type="button"
                className="filter-section__action"
                onClick={() => handleFilterChange('equipment', [])}
              >
                Clear
              </button>
            </div>
            <div className="filter-options">
              {filterOptions.equipment.map(item => (
                <label key={item} className={`filter-option ${filters.equipment.includes(item) ? 'filter-option--selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={filters.equipment.includes(item)}
                    onChange={() => handleArrayFilterToggle('equipment', item)}
                    className="filter-option__input"
                  />
                  <span className="filter-option__label">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Completion Status Filter */}
          <div className="filter-section">
            <div className="filter-section__header">
              <h4 className="filter-section__title">Status</h4>
            </div>
            <div className="filter-options">
              {COMPLETION_OPTIONS.map(option => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`filter-option ${filters.completed === option.value ? 'filter-option--selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="completion"
                      value={option.value}
                      checked={filters.completed === option.value}
                      onChange={() => handleFilterChange('completed', option.value)}
                      className="filter-option__input"
                    />
                    <Icon size={16} className="filter-option__icon" />
                    <span className="filter-option__label">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="active-filters-summary">
          <div className="active-filters-summary__header">
            <span className="active-filters-summary__title">
              Active Filters ({activeFilterCount})
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="active-filters-summary__clear"
            >
              Clear All
            </button>
          </div>
          
          <div className="active-filters-summary__tags">
            {filters.searchQuery && (
              <span className="filter-tag">
                Search: "{filters.searchQuery}"
                <button onClick={() => onSearchChange('')} className="filter-tag__remove">×</button>
              </span>
            )}
            
            {filters.difficulty.map(difficulty => (
              <span key={difficulty} className="filter-tag">
                {difficulty}
                <button 
                  onClick={() => handleArrayFilterToggle('difficulty', difficulty)}
                  className="filter-tag__remove"
                >×</button>
              </span>
            ))}
            
            {filters.workoutType.map(type => (
              <span key={type} className="filter-tag">
                {type}
                <button 
                  onClick={() => handleArrayFilterToggle('workoutType', type)}
                  className="filter-tag__remove"
                >×</button>
              </span>
            ))}
            
            {filters.equipment.map(item => (
              <span key={item} className="filter-tag">
                {item}
                <button 
                  onClick={() => handleArrayFilterToggle('equipment', item)}
                  className="filter-tag__remove"
                >×</button>
              </span>
            ))}
            
            {(filters.duration.min > 0 || filters.duration.max < filterOptions.maxDuration) && (
              <span className="filter-tag">
                Duration: {filters.duration.min}-{filters.duration.max}min
                <button 
                  onClick={() => handleFilterChange('duration', { min: 0, max: filterOptions.maxDuration })}
                  className="filter-tag__remove"
                >×</button>
              </span>
            )}
            
            {filters.completed !== 'all' && (
              <span className="filter-tag">
                Status: {filters.completed}
                <button 
                  onClick={() => handleFilterChange('completed', 'all')}
                  className="filter-tag__remove"
                >×</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Maintain backward compatibility
export default AdvancedWorkoutFilters; 