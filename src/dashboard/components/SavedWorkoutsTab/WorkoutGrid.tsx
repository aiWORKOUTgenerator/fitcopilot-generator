/**
 * Workout Grid Component
 * 
 * Displays saved workouts in a responsive grid layout with filtering,
 * search, and quick actions for each workout.
 */
import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui';
import WorkoutCard from './WorkoutCard';
import WorkoutFilters from './WorkoutFilters';
import WorkoutSearch from './WorkoutSearch';
import './SavedWorkoutsTab.scss';

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

interface WorkoutFilters {
  difficulty: string[];
  workoutType: string[];
  equipment: string[];
  duration: { min: number; max: number };
  completed: 'all' | 'completed' | 'pending';
  sortBy: 'date' | 'title' | 'duration' | 'difficulty';
  sortOrder: 'asc' | 'desc';
}

interface WorkoutGridProps {
  workouts: GeneratedWorkout[];
  isLoading?: boolean;
  onWorkoutSelect: (workout: GeneratedWorkout) => void;
  onWorkoutEdit: (workout: GeneratedWorkout) => void;
  onWorkoutDelete: (workoutId: string) => void;
  onWorkoutDuplicate: (workout: GeneratedWorkout) => void;
  onCreateSimilar: (workout: GeneratedWorkout) => void;
  onMarkComplete: (workoutId: string) => void;
}

/**
 * WorkoutGrid displays saved workouts with filtering and search
 */
export const WorkoutGrid: React.FC<WorkoutGridProps> = ({
  workouts,
  isLoading = false,
  onWorkoutSelect,
  onWorkoutEdit,
  onWorkoutDelete,
  onWorkoutDuplicate,
  onCreateSimilar,
  onMarkComplete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<WorkoutFilters>({
    difficulty: [],
    workoutType: [],
    equipment: [],
    duration: { min: 0, max: 120 },
    completed: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort workouts based on current filters and search
  const filteredWorkouts = useMemo(() => {
    let filtered = workouts.filter(workout => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          workout.title.toLowerCase().includes(query) ||
          workout.description.toLowerCase().includes(query) ||
          workout.workoutType.toLowerCase().includes(query) ||
          workout.tags.some(tag => tag.toLowerCase().includes(query));
        
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
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [workouts, searchQuery, filters]);

  const handleFilterChange = (newFilters: Partial<WorkoutFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      difficulty: [],
      workoutType: [],
      equipment: [],
      duration: { min: 0, max: 120 },
      completed: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  if (isLoading) {
    return (
      <div className="workout-grid loading">
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
      <div className="workout-grid empty">
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
    <div className="workout-grid">
      {/* Search and Filters */}
      <div className="workout-controls">
        <div className="search-section">
          <WorkoutSearch 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search workouts by title, type, or tags..."
          />
        </div>
        
        <div className="filter-section">
          <WorkoutFilters 
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            workouts={workouts}
          />
        </div>
        
        <div className="view-controls">
          <div className="view-mode-toggle">
            <button 
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              ⊞
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
          
          <div className="results-count">
            {filteredWorkouts.length} of {workouts.length} workouts
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
        <div className={`workouts-container ${viewMode}`}>
          {filteredWorkouts.map(workout => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              viewMode={viewMode}
              onSelect={() => onWorkoutSelect(workout)}
              onEdit={() => onWorkoutEdit(workout)}
              onDelete={() => onWorkoutDelete(workout.id)}
              onDuplicate={() => onWorkoutDuplicate(workout)}
              onCreateSimilar={() => onCreateSimilar(workout)}
              onMarkComplete={() => onMarkComplete(workout.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutGrid; 