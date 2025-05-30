/**
 * Enhanced Workout Grid Component
 * 
 * Displays saved workouts in a responsive grid layout with enhanced filtering,
 * search, bulk selection capabilities, and improved visual design.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { 
  Grid, 
  List, 
  MoreHorizontal,
  CheckSquare,
  Square,
  Trash2,
  Copy,
  Download,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Card from '../../../components/ui/Card/Card';
import Button from '../../../components/ui/Button/Button';
import AdvancedWorkoutFilters from './AdvancedWorkoutFilters';
import EnhancedWorkoutCard from './EnhancedWorkoutCard';
import './SavedWorkoutsTab.scss';
import './AdvancedFilters.scss';
import './EnhancedWorkoutCard.scss';

interface DisplayWorkout {
  id: string | number;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: any[];
  created_at: string;
  updated_at: string;
  // Computed/derived properties for display
  workoutType: string;
  equipment: string[];
  isCompleted: boolean;
  completedAt?: string;
  tags: string[];
  createdAt: string; // For backward compatibility
  lastModified: string; // For backward compatibility
  isFavorite?: boolean;
  rating?: number;
}

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

interface EnhancedWorkoutGridProps {
  workouts: any[]; // Accept any workout format from API
  isLoading?: boolean;
  onWorkoutSelect: (workout: DisplayWorkout) => void;
  onWorkoutEdit: (workout: DisplayWorkout) => void;
  onWorkoutDelete: (workoutId: string) => void;
  onWorkoutDuplicate: (workout: DisplayWorkout) => void;
  onCreateSimilar: (workout: DisplayWorkout) => void;
  onMarkComplete: (workoutId: string) => void;
  onBulkDelete?: (workoutIds: string[]) => void;
  onToggleFavorite?: (workoutId: string) => void;
  onRateWorkout?: (workoutId: string, rating: number) => void;
}

/**
 * Transform API workout data for grid display
 */
const transformWorkoutForDisplay = (workout: any): DisplayWorkout => {
  // Defensive coding: ensure workout is an object
  if (!workout || typeof workout !== 'object') {
    console.warn('Invalid workout data received:', workout);
    return createDefaultWorkout();
  }

  try {
    // Extract equipment from exercises if not provided
    const equipment = workout.equipment || extractEquipmentFromExercises(workout.exercises);
    
    // Determine workout type from exercises or use default
    const workoutType = workout.workoutType || deriveWorkoutTypeFromExercises(workout.exercises);
    
    return {
      id: workout.id || `temp-${Date.now()}`,
      title: workout.title || 'Untitled Workout',
      description: workout.description || '',
      duration: typeof workout.duration === 'number' ? workout.duration : 30,
      difficulty: ['beginner', 'intermediate', 'advanced'].includes(workout.difficulty) ? workout.difficulty : 'intermediate',
      exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
      created_at: workout.created_at || new Date().toISOString(),
      updated_at: workout.updated_at || new Date().toISOString(),
      workoutType,
      equipment,
      isCompleted: Boolean(workout.isCompleted),
      tags: Array.isArray(workout.tags) ? workout.tags : [],
      completedAt: workout.completedAt,
      createdAt: workout.createdAt || workout.created_at || new Date().toISOString(),
      lastModified: workout.lastModified || workout.updated_at || new Date().toISOString(),
      isFavorite: Boolean(workout.isFavorite),
      rating: typeof workout.rating === 'number' ? workout.rating : undefined
    };
  } catch (error) {
    console.error('Error transforming workout data:', error, workout);
    return createDefaultWorkout();
  }
};

/**
 * Create a default workout object for error cases
 */
const createDefaultWorkout = (): DisplayWorkout => ({
  id: `error-${Date.now()}`,
  title: 'Error Loading Workout',
  description: 'There was an error loading this workout data.',
  duration: 30,
  difficulty: 'intermediate',
  exercises: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  workoutType: 'General',
  equipment: [],
  isCompleted: false,
  tags: [],
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  isFavorite: false
});

/**
 * Extract equipment from exercises
 */
const extractEquipmentFromExercises = (exercises: any[]): string[] => {
  if (!Array.isArray(exercises)) return [];
  
  try {
    const equipment = new Set<string>();
    exercises.forEach(exercise => {
      if (exercise && exercise.equipment) {
        if (Array.isArray(exercise.equipment)) {
          exercise.equipment.forEach((eq: string) => equipment.add(eq));
        } else if (typeof exercise.equipment === 'string') {
          equipment.add(exercise.equipment);
        }
      }
    });
    return Array.from(equipment).filter(Boolean);
  } catch (error) {
    console.warn('Error extracting equipment:', error);
    return [];
  }
};

/**
 * Derive workout type from exercises
 */
const deriveWorkoutTypeFromExercises = (exercises: any[]): string => {
  if (!Array.isArray(exercises) || exercises.length === 0) return 'General';
  
  try {
    // Simple heuristic based on exercise names
    const exerciseNames = exercises
      .map(ex => ex && ex.name && typeof ex.name === 'string' ? ex.name.toLowerCase() : '')
      .filter(name => name.length > 0)
      .join(' ');
    
    if (exerciseNames.includes('cardio') || exerciseNames.includes('running') || exerciseNames.includes('cycling')) {
      return 'Cardio';
    }
    if (exerciseNames.includes('strength') || exerciseNames.includes('weights') || exerciseNames.includes('lifting')) {
      return 'Strength';
    }
    if (exerciseNames.includes('yoga') || exerciseNames.includes('stretch')) {
      return 'Flexibility';
    }
  } catch (error) {
    console.warn('Error deriving workout type:', error);
  }
  
  return 'General';
};

/**
 * Enhanced WorkoutGrid displays saved workouts with advanced filtering and search
 */
export const EnhancedWorkoutGrid: React.FC<EnhancedWorkoutGridProps> = ({
  workouts,
  isLoading = false,
  onWorkoutSelect,
  onWorkoutEdit,
  onWorkoutDelete,
  onWorkoutDuplicate,
  onCreateSimilar,
  onMarkComplete,
  onBulkDelete,
  onToggleFavorite,
  onRateWorkout
}) => {
  const [filters, setFilters] = useState<WorkoutFilters>({
    difficulty: [],
    workoutType: [],
    equipment: [],
    duration: { min: 0, max: 120 },
    completed: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    tags: [],
    createdDate: { start: null, end: null },
    searchQuery: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<string>>(new Set());

  // Filter and sort workouts based on current filters and search
  const filteredWorkouts = useMemo(() => {
    // Transform raw API data to display format
    const transformedWorkouts = workouts.map(transformWorkoutForDisplay);
    
    let filtered = transformedWorkouts.filter(workout => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          workout.title.toLowerCase().includes(query) ||
          workout.description.toLowerCase().includes(query) ||
          workout.workoutType.toLowerCase().includes(query) ||
          workout.tags.some((tag: string) => tag.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Difficulty filter
      if (filters.difficulty.length > 0 && !filters.difficulty.includes(workout.difficulty)) {
        return false;
      }

      // Workout type filter
      if (filters.workoutType.length > 0 && !filters.workoutType.includes(workout.workoutType)) {
        return false;
      }

      // Equipment filter
      if (filters.equipment.length > 0) {
        const hasRequiredEquipment = filters.equipment.some(eq => 
          workout.equipment.includes(eq)
        );
        if (!hasRequiredEquipment) return false;
      }

      // Duration filter
      if (workout.duration < filters.duration.min || workout.duration > filters.duration.max) {
        return false;
      }

      // Completion status filter
      if (filters.completed === 'completed' && !workout.isCompleted) return false;
      if (filters.completed === 'pending' && workout.isCompleted) return false;

      // Tags filter
      if (filters.tags.length > 0) {
        const hasRequiredTags = filters.tags.some(tag => 
          workout.tags.includes(tag)
        );
        if (!hasRequiredTags) return false;
      }

      return true;
    });

    // Sort workouts
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'difficulty':
          const difficultyOrder: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
          comparison = (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [workouts, filters]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<WorkoutFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle search changes
  const handleSearchChange = useCallback((searchQuery: string) => {
    setFilters(prev => ({ ...prev, searchQuery }));
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      difficulty: [],
      workoutType: [],
      equipment: [],
      duration: { min: 0, max: 120 },
      completed: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      tags: [],
      createdDate: { start: null, end: null },
      searchQuery: ''
    });
  }, []);

  // Selection handlers
  const handleToggleSelection = useCallback((workoutId: string) => {
    setSelectedWorkouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedWorkouts.size === filteredWorkouts.length) {
      setSelectedWorkouts(new Set());
    } else {
      setSelectedWorkouts(new Set(filteredWorkouts.map(w => w.id.toString())));
    }
  }, [selectedWorkouts, filteredWorkouts]);

  const handleBulkDelete = useCallback(() => {
    if (selectedWorkouts.size > 0 && onBulkDelete) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${selectedWorkouts.size} workout${selectedWorkouts.size !== 1 ? 's' : ''}?`
      );
      if (confirmDelete) {
        onBulkDelete(Array.from(selectedWorkouts));
        setSelectedWorkouts(new Set());
        setIsSelectionMode(false);
      }
    }
  }, [selectedWorkouts, onBulkDelete]);

  if (isLoading) {
    return (
      <div className="enhanced-workout-grid loading">
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="workout-card-skeleton">
              <div className="skeleton-header"></div>
              <div className="skeleton-content"></div>
              <div className="skeleton-footer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="enhanced-workout-grid empty">
        <div className="empty-state">
          <div className="empty-icon">🏋️‍♀️</div>
          <h3 className="empty-title">No Saved Workouts</h3>
          <p className="empty-description">
            Start by generating your first workout to see it here.
          </p>
          <Button 
            variant="primary" 
            onClick={() => {
              // Scroll to workout generator
              const generator = document.querySelector('.workout-generator-feature');
              generator?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Create Your First Workout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-workout-grid">
      {/* Advanced Filters */}
      <AdvancedWorkoutFilters
        filters={filters}
        workouts={workouts}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        onSearchChange={handleSearchChange}
      />

      {/* Toolbar */}
      <div className="workout-toolbar">
        <div className="toolbar-left">
          <div className="results-info">
            <span className="results-count">
              {filteredWorkouts.length} of {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
            </span>
            {selectedWorkouts.size > 0 && (
              <span className="selection-count">
                ({selectedWorkouts.size} selected)
              </span>
            )}
          </div>
        </div>

        <div className="toolbar-right">
          {/* Selection Controls */}
          {isSelectionMode && (
            <div className="selection-controls">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedWorkouts.size === filteredWorkouts.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedWorkouts.size > 0 && onBulkDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="danger"
                >
                  <Trash2 size={14} />
                  Delete ({selectedWorkouts.size})
                </Button>
              )}
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="view-controls">
            <button
              className={`selection-mode-btn ${isSelectionMode ? 'active' : ''}`}
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (!isSelectionMode) {
                  setSelectedWorkouts(new Set());
                }
              }}
              title="Toggle selection mode"
            >
              {isSelectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>

            <div className="view-mode-toggle">
              <button 
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Grid size={16} />
              </button>
              <button 
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Grid/List */}
      {filteredWorkouts.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3 className="no-results-title">No workouts match your filters</h3>
          <p className="no-results-description">
            Try adjusting your search terms or filters to find more workouts.
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className={`enhanced-workouts-container ${viewMode}`}>
          {filteredWorkouts.map(workout => (
            <EnhancedWorkoutCard
              key={workout.id}
              workout={workout as any}
              viewMode={viewMode}
              isSelected={selectedWorkouts.has(workout.id.toString())}
              isSelectionMode={isSelectionMode}
              onSelect={() => onWorkoutSelect(workout)}
              onEdit={() => onWorkoutEdit(workout)}
              onDelete={() => onWorkoutDelete(workout.id.toString())}
              onDuplicate={() => onWorkoutDuplicate(workout)}
              onCreateSimilar={() => onCreateSimilar(workout)}
              onMarkComplete={() => onMarkComplete(workout.id.toString())}
              onToggleSelection={handleToggleSelection}
              onToggleFavorite={onToggleFavorite}
              onRate={onRateWorkout}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Maintain backward compatibility
export const WorkoutGrid = EnhancedWorkoutGrid;
export default EnhancedWorkoutGrid; 