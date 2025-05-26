/**
 * Workout Filters Component
 * 
 * Provides filtering and sorting options for saved workouts
 * with collapsible filter sections and clear functionality.
 */
import React, { useState, useMemo } from 'react';
import { Button } from '../../../components/ui';

interface WorkoutFilters {
  difficulty: string[];
  workoutType: string[];
  equipment: string[];
  duration: { min: number; max: number };
  completed: 'all' | 'completed' | 'pending';
  sortBy: 'date' | 'title' | 'duration' | 'difficulty';
  sortOrder: 'asc' | 'desc';
}

interface GeneratedWorkout {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  workoutType: string;
  equipment: string[];
  exercises: any[];
  createdAt: string;
  lastModified: string;
  isCompleted: boolean;
  completedAt?: string;
  tags: string[];
}

interface WorkoutFiltersProps {
  filters: WorkoutFilters;
  onChange: (filters: Partial<WorkoutFilters>) => void;
  onClear: () => void;
  workouts: GeneratedWorkout[];
}

/**
 * WorkoutFilters provides filtering and sorting controls
 */
const WorkoutFilters: React.FC<WorkoutFiltersProps> = ({
  filters,
  onChange,
  onClear,
  workouts
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique values from workouts for filter options
  const filterOptions = useMemo(() => {
    const workoutTypes = [...new Set(workouts.map(w => w.workoutType))];
    const equipment = [...new Set(workouts.flatMap(w => w.equipment))];
    const maxDuration = Math.max(...workouts.map(w => w.duration), 120);
    
    return {
      workoutTypes: workoutTypes.sort(),
      equipment: equipment.sort(),
      maxDuration: Math.ceil(maxDuration / 15) * 15 // Round up to nearest 15
    };
  }, [workouts]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.difficulty.length > 0) count++;
    if (filters.workoutType.length > 0) count++;
    if (filters.equipment.length > 0) count++;
    if (filters.duration.min > 0 || filters.duration.max < 120) count++;
    if (filters.completed !== 'all') count++;
    return count;
  }, [filters]);

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    const newDifficulty = checked
      ? [...filters.difficulty, difficulty]
      : filters.difficulty.filter(d => d !== difficulty);
    onChange({ difficulty: newDifficulty });
  };

  const handleWorkoutTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.workoutType, type]
      : filters.workoutType.filter(t => t !== type);
    onChange({ workoutType: newTypes });
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    const newEquipment = checked
      ? [...filters.equipment, equipment]
      : filters.equipment.filter(e => e !== equipment);
    onChange({ equipment: newEquipment });
  };

  const handleDurationChange = (type: 'min' | 'max', value: number) => {
    onChange({
      duration: {
        ...filters.duration,
        [type]: value
      }
    });
  };

  return (
    <div className="workout-filters">
      <div className="filters-header">
        <button
          className="filters-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="toggle-text">Filters</span>
          {activeFilterCount > 0 && (
            <span className="active-filters-badge">{activeFilterCount}</span>
          )}
        </button>

        <div className="sort-controls">
          <select
            className="sort-select"
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as any })}
            aria-label="Sort by"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="duration">Sort by Duration</option>
            <option value="difficulty">Sort by Difficulty</option>
          </select>

          <button
            className={`sort-order-btn ${filters.sortOrder}`}
            onClick={() => onChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
            aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            title={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="filters-content">
          {/* Completion Status Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Status</h4>
            <div className="filter-options">
              {[
                { value: 'all', label: 'All Workouts' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' }
              ].map(option => (
                <label key={option.value} className="filter-option">
                  <input
                    type="radio"
                    name="completion"
                    value={option.value}
                    checked={filters.completed === option.value}
                    onChange={(e) => onChange({ completed: e.target.value as any })}
                  />
                  <span className="option-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Difficulty</h4>
            <div className="filter-options">
              {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                <label key={difficulty} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.difficulty.includes(difficulty)}
                    onChange={(e) => handleDifficultyChange(difficulty, e.target.checked)}
                  />
                  <span className="option-label">
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Workout Type Filter */}
          {filterOptions.workoutTypes.length > 0 && (
            <div className="filter-section">
              <h4 className="filter-title">Workout Type</h4>
              <div className="filter-options">
                {filterOptions.workoutTypes.map(type => (
                  <label key={type} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.workoutType.includes(type)}
                      onChange={(e) => handleWorkoutTypeChange(type, e.target.checked)}
                    />
                    <span className="option-label">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Equipment Filter */}
          {filterOptions.equipment.length > 0 && (
            <div className="filter-section">
              <h4 className="filter-title">Equipment</h4>
              <div className="filter-options">
                {filterOptions.equipment.slice(0, 6).map(equipment => (
                  <label key={equipment} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.equipment.includes(equipment)}
                      onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                    />
                    <span className="option-label">{equipment}</span>
                  </label>
                ))}
                {filterOptions.equipment.length > 6 && (
                  <div className="more-options">
                    +{filterOptions.equipment.length - 6} more equipment options
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Duration Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Duration (minutes)</h4>
            <div className="duration-filter">
              <div className="duration-inputs">
                <label className="duration-input-label">
                  Min:
                  <input
                    type="number"
                    min="0"
                    max={filterOptions.maxDuration}
                    value={filters.duration.min}
                    onChange={(e) => handleDurationChange('min', parseInt(e.target.value) || 0)}
                    className="duration-input"
                  />
                </label>
                
                <label className="duration-input-label">
                  Max:
                  <input
                    type="number"
                    min="0"
                    max={filterOptions.maxDuration}
                    value={filters.duration.max}
                    onChange={(e) => handleDurationChange('max', parseInt(e.target.value) || 120)}
                    className="duration-input"
                  />
                </label>
              </div>
              
              <div className="duration-range">
                <input
                  type="range"
                  min="0"
                  max={filterOptions.maxDuration}
                  value={filters.duration.min}
                  onChange={(e) => handleDurationChange('min', parseInt(e.target.value))}
                  className="duration-slider min"
                />
                <input
                  type="range"
                  min="0"
                  max={filterOptions.maxDuration}
                  value={filters.duration.max}
                  onChange={(e) => handleDurationChange('max', parseInt(e.target.value))}
                  className="duration-slider max"
                />
              </div>
              
              <div className="duration-display">
                {filters.duration.min} - {filters.duration.max} minutes
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutFilters; 