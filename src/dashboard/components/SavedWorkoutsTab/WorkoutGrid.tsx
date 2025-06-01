/**
 * Enhanced Workout Grid Component
 * 
 * Displays saved workouts in a responsive grid layout with enhanced filtering,
 * search, bulk selection capabilities, and improved visual design.
 * 
 * Updated for Week 1 Foundation Sprint - now uses extracted WorkoutTransformer service.
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

// Import the extracted services
import { WorkoutTransformer } from './services/workoutData/WorkoutTransformer';
import { FilterEngine } from './services/filtering/FilterEngine';

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

// 🔄 MIGRATION NOTE: The following functions have been moved to WorkoutTransformer service
// but are temporarily kept here for backward compatibility until Week 2 component splitting

/**
 * @deprecated Use WorkoutTransformer.transformForDisplay() instead
 * Legacy function maintained for backward compatibility during Week 1 refactor
 */
const transformWorkoutForDisplay = (workout: any): DisplayWorkout => {
  console.warn('🔄 MIGRATION: transformWorkoutForDisplay is deprecated. Use WorkoutTransformer.transformForDisplay() instead.');
  return WorkoutTransformer.transformForDisplay(workout);
};

/**
 * @deprecated Use WorkoutTransformer.createDefaultWorkout() instead
 * Legacy function maintained for backward compatibility during Week 1 refactor
 */
const createDefaultWorkout = (): DisplayWorkout => {
  console.warn('🔄 MIGRATION: createDefaultWorkout is deprecated. Use WorkoutTransformer.createDefaultWorkout() instead.');
  return WorkoutTransformer.createDefaultWorkout();
};

/**
 * @deprecated Use WorkoutTransformer.extractEquipmentFromExercises() instead
 * Legacy function maintained for backward compatibility during Week 1 refactor
 */
const extractEquipmentFromExercises = (exercises: any[]): string[] => {
  console.warn('🔄 MIGRATION: extractEquipmentFromExercises is deprecated. Use WorkoutTransformer.extractEquipmentFromExercises() instead.');
  return WorkoutTransformer.extractEquipmentFromExercises(exercises);
};

/**
 * @deprecated Use WorkoutTransformer.deriveWorkoutTypeFromExercises() instead
 * Legacy function maintained for backward compatibility during Week 1 refactor
 */
const deriveWorkoutTypeFromExercises = (exercises: any[]): string => {
  console.warn('🔄 MIGRATION: deriveWorkoutTypeFromExercises is deprecated. Use WorkoutTransformer.deriveWorkoutTypeFromExercises() instead.');
  return WorkoutTransformer.deriveWorkoutTypeFromExercises(exercises);
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
  const [filters, setFilters] = useState<WorkoutFilters>(
    // 🚀 WEEK 1 IMPROVEMENT: Use FilterEngine.getDefaultFilters instead of hardcoded defaults
    FilterEngine.getDefaultFilters()
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<string>>(new Set());
  const [transformationErrors, setTransformationErrors] = useState<Map<string, string>>(new Map());

  // Filter and sort workouts based on current filters and search
  const filteredWorkouts = useMemo(() => {
    try {
      // 🚀 WEEK 1 IMPROVEMENT: Use extracted WorkoutTransformer and FilterEngine services
      const transformedWorkouts = WorkoutTransformer.transformMultipleForDisplay(workouts);
      
      // Track any transformation errors for debugging
      const errors = new Map<string, string>();
      transformedWorkouts.forEach(workout => {
        if (workout.exercises.length === 0 && workout.id) {
          errors.set(workout.id.toString(), 'No exercises found - may indicate data transformation issue');
        }
      });
      setTransformationErrors(errors);
      
      // Apply all filters and sorting using the FilterEngine service
      return FilterEngine.applyFilters(transformedWorkouts, filters);
    } catch (error) {
      console.error('🔄 WorkoutGrid: Error filtering workouts:', error);
      return [];
    }
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
    // 🚀 WEEK 1 IMPROVEMENT: Use FilterEngine.clearFilters instead of hardcoded defaults
    setFilters(FilterEngine.clearFilters(filters));
  }, [filters]);

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
              // 🚀 WEEK 1 IMPROVEMENT: More robust navigation to generator
              const generator = document.querySelector('.workout-generator-feature, [data-tab="generator"], .workout-generator');
              if (generator) {
                generator.scrollIntoView({ behavior: 'smooth' });
              } else {
                // Fallback: dispatch custom event for parent component to handle
                window.dispatchEvent(new CustomEvent('fitcopilot:navigate-to-generator'));
              }
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

      {/* 🚀 WEEK 1 IMPROVEMENT: Show transformation errors in development */}
      {process.env.NODE_ENV === 'development' && transformationErrors.size > 0 && (
        <div className="workout-grid-debug-info" style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '12px'
        }}>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              ⚠️ {transformationErrors.size} workout{transformationErrors.size !== 1 ? 's' : ''} with transformation issues
            </summary>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {Array.from(transformationErrors.entries()).map(([id, error]) => (
                <li key={id}>Workout {id}: {error}</li>
              ))}
            </ul>
          </details>
        </div>
      )}

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