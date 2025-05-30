/**
 * Advanced Workout Filters Component
 * 
 * Enhanced filtering system with presets, advanced criteria,
 * real-time search, and improved user experience.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  Bookmark,
  Calendar,
  Clock,
  Target,
  Zap,
  CheckCircle,
  Circle
} from 'lucide-react';
import Button from '../../../components/ui/Button/Button';
import './AdvancedFilters.scss';

interface WorkoutFilters {
  difficulty: string[];
  workoutType: string[];
  equipment: string[];
  duration: { min: number; max: number };
  completed: 'all' | 'completed' | 'pending';
  sortBy: 'date' | 'title' | 'duration' | 'difficulty';
  sortOrder: 'asc' | 'desc';
  tags: string[];
  createdDate: { start: Date | null; end: Date | null };
  searchQuery: string;
}

interface FilterPreset {
  id: string;
  name: string;
  filters: Partial<WorkoutFilters>;
  isDefault?: boolean;
}

interface AdvancedWorkoutFiltersProps {
  filters: WorkoutFilters;
  workouts: any[];
  onChange: (filters: Partial<WorkoutFilters>) => void;
  onClear: () => void;
  onSearchChange: (query: string) => void;
}

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner', icon: '🟢', color: 'green' },
  { value: 'intermediate', label: 'Intermediate', icon: '🟡', color: 'yellow' },
  { value: 'advanced', label: 'Advanced', icon: '🔴', color: 'red' }
];

const COMPLETION_OPTIONS = [
  { value: 'all', label: 'All Workouts', icon: Circle },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'pending', label: 'Pending', icon: Clock }
];

const SORT_OPTIONS = [
  { value: 'date', label: 'Date Created', icon: Calendar },
  { value: 'title', label: 'Title', icon: Target },
  { value: 'duration', label: 'Duration', icon: Clock },
  { value: 'difficulty', label: 'Difficulty', icon: Zap }
];

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'all',
    name: 'All Workouts',
    filters: {},
    isDefault: true
  },
  {
    id: 'recent',
    name: 'Recent Workouts',
    filters: {
      sortBy: 'date',
      sortOrder: 'desc'
    },
    isDefault: true
  },
  {
    id: 'quick-workouts',
    name: 'Quick Workouts',
    filters: {
      duration: { min: 0, max: 30 },
      sortBy: 'duration',
      sortOrder: 'asc'
    },
    isDefault: true
  },
  {
    id: 'completed',
    name: 'Completed',
    filters: {
      completed: 'completed',
      sortBy: 'date',
      sortOrder: 'desc'
    },
    isDefault: true
  },
  {
    id: 'favorites',
    name: 'My Favorites',
    filters: {
      tags: ['favorite']
    },
    isDefault: true
  }
];

/**
 * Advanced Workout Filters Component
 */
export const AdvancedWorkoutFilters: React.FC<AdvancedWorkoutFiltersProps> = ({
  filters,
  workouts,
  onChange,
  onClear,
  onSearchChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.searchQuery || '');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

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
      maxDuration: Math.ceil(maxDuration / 15) * 15
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
    
    // Apply preset filters
    const presetFilters = {
      difficulty: [],
      workoutType: [],
      equipment: [],
      tags: [],
      duration: { min: 0, max: 120 },
      completed: 'all' as const,
      sortBy: 'date' as const,
      sortOrder: 'desc' as const,
      createdDate: { start: null, end: null },
      searchQuery: '',
      ...preset.filters
    };
    
    onChange(presetFilters);
    setSearchValue(presetFilters.searchQuery || '');
  }, [onChange]);

  // Handle individual filter changes
  const handleFilterChange = useCallback((filterName: keyof WorkoutFilters, value: any) => {
    setActivePreset(null); // Clear active preset when manually changing filters
    onChange({ [filterName]: value });
  }, [onChange]);

  // Handle array filter toggle
  const handleArrayFilterToggle = useCallback((filterName: 'difficulty' | 'workoutType' | 'equipment' | 'tags', value: string) => {
    const currentValues = filters[filterName] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleFilterChange(filterName, newValues);
  }, [filters, handleFilterChange]);

  // Handle duration range change
  const handleDurationChange = useCallback((type: 'min' | 'max', value: number) => {
    handleFilterChange('duration', {
      ...filters.duration,
      [type]: value
    });
  }, [filters.duration, handleFilterChange]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setActivePreset('all');
    setSearchValue('');
    onClear();
  }, [onClear]);

  return (
    <div className="advanced-workout-filters">
      {/* Search Bar */}
      <div className="filter-search-section">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search workouts by title, description, or tags..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
          />
          {searchValue && (
            <button
              className="clear-search"
              onClick={() => setSearchValue('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Presets */}
      <div className="filter-presets">
        <div className="preset-buttons">
          {DEFAULT_PRESETS.map(preset => (
            <button
              key={preset.id}
              className={`preset-btn ${activePreset === preset.id ? 'active' : ''}`}
              onClick={() => handlePresetSelect(preset)}
            >
              <Bookmark size={14} />
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="filter-header">
        <button
          className="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter size={16} />
          <span>Advanced Filters</span>
          {activeFilterCount > 0 && (
            <span className="filter-count">{activeFilterCount}</span>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="clear-all-btn"
          >
            <RotateCcw size={14} />
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="filter-content">
          <div className="filter-grid">
            {/* Difficulty Filter */}
            <div className="filter-section">
              <h4 className="filter-title">
                <Zap size={16} />
                Difficulty
              </h4>
              <div className="checkbox-group">
                {DIFFICULTY_OPTIONS.map(option => (
                  <label key={option.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.difficulty.includes(option.value)}
                      onChange={() => handleArrayFilterToggle('difficulty', option.value)}
                    />
                    <span className={`checkbox-label ${option.color}`}>
                      <span className="difficulty-icon">{option.icon}</span>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Workout Type Filter */}
            {filterOptions.workoutTypes.length > 0 && (
              <div className="filter-section">
                <h4 className="filter-title">
                  <Target size={16} />
                  Workout Type
                </h4>
                <div className="checkbox-group">
                  {filterOptions.workoutTypes.map(type => (
                    <label key={type} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.workoutType.includes(type)}
                        onChange={() => handleArrayFilterToggle('workoutType', type)}
                      />
                      <span className="checkbox-label">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment Filter */}
            {filterOptions.equipment.length > 0 && (
              <div className="filter-section">
                <h4 className="filter-title">
                  <Target size={16} />
                  Equipment
                </h4>
                <div className="checkbox-group">
                  {filterOptions.equipment.map(equipment => (
                    <label key={equipment} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.equipment.includes(equipment)}
                        onChange={() => handleArrayFilterToggle('equipment', equipment)}
                      />
                      <span className="checkbox-label">{equipment}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Duration Filter */}
            <div className="filter-section">
              <h4 className="filter-title">
                <Clock size={16} />
                Duration (minutes)
              </h4>
              <div className="duration-filter">
                <div className="duration-inputs">
                  <div className="duration-input-group">
                    <label htmlFor="duration-min">Min</label>
                    <input
                      id="duration-min"
                      type="number"
                      min="0"
                      max={filterOptions.maxDuration}
                      value={filters.duration.min}
                      onChange={(e) => handleDurationChange('min', parseInt(e.target.value) || 0)}
                      className="duration-input"
                    />
                  </div>
                  <span className="duration-separator">to</span>
                  <div className="duration-input-group">
                    <label htmlFor="duration-max">Max</label>
                    <input
                      id="duration-max"
                      type="number"
                      min={filters.duration.min}
                      max={filterOptions.maxDuration}
                      value={filters.duration.max}
                      onChange={(e) => handleDurationChange('max', parseInt(e.target.value) || 120)}
                      className="duration-input"
                    />
                  </div>
                </div>
                <div className="duration-range">
                  <input
                    type="range"
                    min="0"
                    max={filterOptions.maxDuration}
                    value={filters.duration.min}
                    onChange={(e) => handleDurationChange('min', parseInt(e.target.value))}
                    className="range-slider range-min"
                  />
                  <input
                    type="range"
                    min="0"
                    max={filterOptions.maxDuration}
                    value={filters.duration.max}
                    onChange={(e) => handleDurationChange('max', parseInt(e.target.value))}
                    className="range-slider range-max"
                  />
                </div>
              </div>
            </div>

            {/* Completion Status Filter */}
            <div className="filter-section">
              <h4 className="filter-title">
                <CheckCircle size={16} />
                Status
              </h4>
              <div className="radio-group">
                {COMPLETION_OPTIONS.map(option => (
                  <label key={option.value} className="radio-item">
                    <input
                      type="radio"
                      name="completion"
                      value={option.value}
                      checked={filters.completed === option.value}
                      onChange={() => handleFilterChange('completed', option.value)}
                    />
                    <span className="radio-label">
                      <option.icon size={16} />
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="filter-section">
              <h4 className="filter-title">
                <Calendar size={16} />
                Sort By
              </h4>
              <div className="sort-controls">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="sort-select"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  className={`sort-order-btn ${filters.sortOrder}`}
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="active-filters-summary">
          <span className="summary-text">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </span>
          <div className="active-filter-tags">
            {filters.difficulty.map(diff => (
              <span key={`diff-${diff}`} className="filter-tag">
                {diff}
                <button onClick={() => handleArrayFilterToggle('difficulty', diff)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.workoutType.map(type => (
              <span key={`type-${type}`} className="filter-tag">
                {type}
                <button onClick={() => handleArrayFilterToggle('workoutType', type)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.equipment.map(eq => (
              <span key={`eq-${eq}`} className="filter-tag">
                {eq}
                <button onClick={() => handleArrayFilterToggle('equipment', eq)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.completed !== 'all' && (
              <span className="filter-tag">
                {filters.completed}
                <button onClick={() => handleFilterChange('completed', 'all')}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedWorkoutFilters; 