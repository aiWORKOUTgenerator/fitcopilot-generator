/**
 * Filter Presets Component
 * 
 * Manages predefined filter combinations for quick workout filtering.
 * Extracted from AdvancedWorkoutFilters as part of Week 2 Component Splitting.
 */
import React, { useCallback } from 'react';
import { Bookmark } from 'lucide-react';

export interface FilterPreset {
  id: string;
  name: string;
  filters: Partial<WorkoutFilters>;
  isDefault?: boolean;
}

export interface WorkoutFilters {
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

interface FilterPresetsProps {
  activePreset: string | null;
  onPresetSelect: (preset: FilterPreset) => void;
  customPresets?: FilterPreset[];
}

export const DEFAULT_PRESETS: FilterPreset[] = [
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
 * FilterPresets Component - Manages workout filter presets
 */
export const FilterPresets: React.FC<FilterPresetsProps> = ({
  activePreset,
  onPresetSelect,
  customPresets = []
}) => {
  const allPresets = [...DEFAULT_PRESETS, ...customPresets];

  const handlePresetClick = useCallback((preset: FilterPreset) => {
    onPresetSelect(preset);
  }, [onPresetSelect]);

  return (
    <div className="filter-presets">
      <div className="filter-presets__header">
        <h4 className="filter-presets__title">
          <Bookmark size={16} />
          Quick Filters
        </h4>
      </div>
      
      <div className="filter-presets__list">
        {allPresets.map(preset => (
          <button
            key={preset.id}
            className={`filter-preset ${activePreset === preset.id ? 'filter-preset--active' : ''}`}
            onClick={() => handlePresetClick(preset)}
            type="button"
          >
            <span className="filter-preset__name">{preset.name}</span>
            {preset.isDefault && (
              <span className="filter-preset__badge">Default</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterPresets; 