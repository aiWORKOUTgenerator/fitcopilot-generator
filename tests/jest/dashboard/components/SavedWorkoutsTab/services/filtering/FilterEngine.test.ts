/**
 * FilterEngine Service Tests
 * 
 * Comprehensive unit tests for workout filtering and sorting logic.
 * Part of Week 1 Foundation Sprint - Service Testing.
 */

import { FilterEngine } from '../../../../../../../src/dashboard/components/SavedWorkoutsTab/services/filtering/FilterEngine';

// Mock workout data for testing
const mockWorkouts = [
  {
    id: 1,
    title: 'Morning Cardio',
    description: 'A great cardio workout to start your day',
    duration: 30,
    difficulty: 'beginner' as const,
    exercises: [{ name: 'Running', duration: '30min' }],
    created_at: '2023-05-31T08:00:00',
    updated_at: '2023-05-31T08:00:00',
    workoutType: 'Cardio',
    equipment: ['treadmill'],
    isCompleted: false,
    tags: ['cardio', 'morning'],
    createdAt: '2023-05-31T08:00:00',
    lastModified: '2023-05-31T08:00:00',
    isFavorite: true,
    rating: 5
  },
  {
    id: 2,
    title: 'Strength Training',
    description: 'Build muscle with this strength workout',
    duration: 60,
    difficulty: 'intermediate' as const,
    exercises: [{ name: 'Bench Press', sets: 3, reps: 10 }],
    created_at: '2023-05-30T18:00:00',
    updated_at: '2023-05-30T18:00:00',
    workoutType: 'Strength',
    equipment: ['barbell', 'dumbbells'],
    isCompleted: true,
    completedAt: '2023-05-30T19:00:00',
    tags: ['strength', 'evening'],
    createdAt: '2023-05-30T18:00:00',
    lastModified: '2023-05-30T18:00:00',
    isFavorite: false,
    rating: 4
  },
  {
    id: 3,
    title: 'Yoga Flow',
    description: 'Relaxing yoga session',
    duration: 45,
    difficulty: 'beginner' as const,
    exercises: [{ name: 'Downward Dog', duration: '5min' }],
    created_at: '2023-05-29T07:00:00',
    updated_at: '2023-05-29T07:00:00',
    workoutType: 'Flexibility',
    equipment: ['yoga_mat'],
    isCompleted: false,
    tags: ['yoga', 'flexibility'],
    createdAt: '2023-05-29T07:00:00',
    lastModified: '2023-05-29T07:00:00',
    isFavorite: true,
    rating: 5
  },
  {
    id: 4,
    title: 'Advanced HIIT',
    description: 'High intensity interval training',
    duration: 25,
    difficulty: 'advanced' as const,
    exercises: [{ name: 'Burpees', sets: 5, reps: 20 }],
    created_at: '2023-05-28T19:00:00',
    updated_at: '2023-05-28T19:00:00',
    workoutType: 'Cardio',
    equipment: ['none'],
    isCompleted: true,
    completedAt: '2023-05-28T19:30:00',
    tags: ['hiit', 'intense'],
    createdAt: '2023-05-28T19:00:00',
    lastModified: '2023-05-28T19:00:00',
    isFavorite: false,
    rating: 3
  }
];

describe('FilterEngine', () => {
  describe('applyFilters', () => {
    it('returns all workouts when no filters are applied', () => {
      const filters = FilterEngine.getDefaultFilters();
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(4);
      expect(result[0].title).toBe('Morning Cardio'); // Most recent first (desc order)
    });

    it('filters by difficulty correctly', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        difficulty: ['beginner']
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(2);
      expect(result.every(w => w.difficulty === 'beginner')).toBe(true);
    });

    it('filters by workout type correctly', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        workoutType: ['Cardio']
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(2);
      expect(result.every(w => w.workoutType === 'Cardio')).toBe(true);
    });

    it('filters by equipment correctly', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        equipment: ['dumbbells']
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Strength Training');
    });

    it('filters by duration range correctly', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        duration: { min: 40, max: 70 }
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(2);
      expect(result.every(w => w.duration >= 40 && w.duration <= 70)).toBe(true);
    });

    it('filters by completion status correctly', () => {
      const filtersCompleted = {
        ...FilterEngine.getDefaultFilters(),
        completed: 'completed' as const
      };
      const resultCompleted = FilterEngine.applyFilters(mockWorkouts, filtersCompleted);
      
      expect(resultCompleted).toHaveLength(2);
      expect(resultCompleted.every(w => w.isCompleted === true)).toBe(true);

      const filtersPending = {
        ...FilterEngine.getDefaultFilters(),
        completed: 'pending' as const
      };
      const resultPending = FilterEngine.applyFilters(mockWorkouts, filtersPending);
      
      expect(resultPending).toHaveLength(2);
      expect(resultPending.every(w => w.isCompleted === false)).toBe(true);
    });

    it('filters by tags correctly', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        tags: ['yoga']
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Yoga Flow');
    });

    it('filters by search query correctly', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        searchQuery: 'cardio'
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(2);
      expect(result.some(w => w.title.toLowerCase().includes('cardio') || w.workoutType.toLowerCase().includes('cardio'))).toBe(true);
    });

    it('combines multiple filters correctly', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        difficulty: ['beginner'],
        workoutType: ['Cardio']
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Morning Cardio');
    });

    it('handles invalid input gracefully', () => {
      const filters = FilterEngine.getDefaultFilters();
      const result1 = FilterEngine.applyFilters(null as any, filters);
      const result2 = FilterEngine.applyFilters('invalid' as any, filters);
      
      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
    });

    it('returns empty array when no workouts match filters', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        difficulty: ['beginner'],
        workoutType: ['Strength'] // No beginner strength workouts in mock data
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('applySorting', () => {
    it('sorts by date ascending', () => {
      const result = FilterEngine.applySorting(mockWorkouts, 'date', 'asc');
      
      expect(result[0].title).toBe('Advanced HIIT'); // Oldest
      expect(result[3].title).toBe('Morning Cardio'); // Newest
    });

    it('sorts by date descending', () => {
      const result = FilterEngine.applySorting(mockWorkouts, 'date', 'desc');
      
      expect(result[0].title).toBe('Morning Cardio'); // Newest
      expect(result[3].title).toBe('Advanced HIIT'); // Oldest
    });

    it('sorts by title ascending', () => {
      const result = FilterEngine.applySorting(mockWorkouts, 'title', 'asc');
      
      expect(result[0].title).toBe('Advanced HIIT');
      expect(result[1].title).toBe('Morning Cardio');
      expect(result[2].title).toBe('Strength Training');
      expect(result[3].title).toBe('Yoga Flow');
    });

    it('sorts by title descending', () => {
      const result = FilterEngine.applySorting(mockWorkouts, 'title', 'desc');
      
      expect(result[0].title).toBe('Yoga Flow');
      expect(result[3].title).toBe('Advanced HIIT');
    });

    it('sorts by duration ascending', () => {
      const result = FilterEngine.applySorting(mockWorkouts, 'duration', 'asc');
      
      expect(result[0].duration).toBe(25); // Advanced HIIT
      expect(result[3].duration).toBe(60); // Strength Training
    });

    it('sorts by difficulty ascending', () => {
      const result = FilterEngine.applySorting(mockWorkouts, 'difficulty', 'asc');
      
      const beginnerCount = result.filter(w => w.difficulty === 'beginner').length;
      const intermediateCount = result.filter(w => w.difficulty === 'intermediate').length;
      const advancedCount = result.filter(w => w.difficulty === 'advanced').length;
      
      expect(beginnerCount).toBe(2);
      expect(intermediateCount).toBe(1);
      expect(advancedCount).toBe(1);
      
      // First items should be beginner
      expect(result[0].difficulty).toBe('beginner');
      expect(result[1].difficulty).toBe('beginner');
    });

    it('handles invalid input gracefully', () => {
      const result1 = FilterEngine.applySorting(null as any, 'date', 'asc');
      const result2 = FilterEngine.applySorting('invalid' as any, 'date', 'asc');
      
      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
    });

    it('handles unknown sort field gracefully', () => {
      const result = FilterEngine.applySorting(mockWorkouts, 'unknown' as any, 'asc');
      
      expect(result).toHaveLength(4);
      // Should return workouts in original order when sort field is unknown
    });
  });

  describe('getDefaultFilters', () => {
    it('returns default filter state', () => {
      const defaults = FilterEngine.getDefaultFilters();
      
      expect(defaults.difficulty).toEqual([]);
      expect(defaults.workoutType).toEqual([]);
      expect(defaults.equipment).toEqual([]);
      expect(defaults.duration).toEqual({ min: 0, max: 120 });
      expect(defaults.completed).toBe('all');
      expect(defaults.sortBy).toBe('date');
      expect(defaults.sortOrder).toBe('desc');
      expect(defaults.tags).toEqual([]);
      expect(defaults.createdDate).toEqual({ start: null, end: null });
      expect(defaults.searchQuery).toBe('');
    });
  });

  describe('hasActiveFilters', () => {
    it('returns false for default filters', () => {
      const defaults = FilterEngine.getDefaultFilters();
      
      expect(FilterEngine.hasActiveFilters(defaults)).toBe(false);
    });

    it('returns true when difficulty filter is active', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        difficulty: ['beginner']
      };
      
      expect(FilterEngine.hasActiveFilters(filters)).toBe(true);
    });

    it('returns true when search query is active', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        searchQuery: 'cardio'
      };
      
      expect(FilterEngine.hasActiveFilters(filters)).toBe(true);
    });

    it('returns true when duration is modified', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        duration: { min: 30, max: 60 }
      };
      
      expect(FilterEngine.hasActiveFilters(filters)).toBe(true);
    });

    it('returns true when completion filter is set', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        completed: 'completed' as const
      };
      
      expect(FilterEngine.hasActiveFilters(filters)).toBe(true);
    });

    it('returns false when only sorting is changed', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        sortBy: 'title' as const,
        sortOrder: 'asc' as const
      };
      
      expect(FilterEngine.hasActiveFilters(filters)).toBe(false);
    });
  });

  describe('clearFilters', () => {
    it('clears all filters but preserves sorting', () => {
      const currentFilters = {
        difficulty: ['intermediate'],
        workoutType: ['Cardio'],
        equipment: ['dumbbells'],
        duration: { min: 30, max: 90 },
        completed: 'completed' as const,
        sortBy: 'title' as const,
        sortOrder: 'asc' as const,
        tags: ['strength'],
        createdDate: { start: new Date('2023-01-01'), end: new Date('2023-12-31') },
        searchQuery: 'test query'
      };
      
      const cleared = FilterEngine.clearFilters(currentFilters);
      
      // Check that filters are cleared
      expect(cleared.difficulty).toEqual([]);
      expect(cleared.workoutType).toEqual([]);
      expect(cleared.equipment).toEqual([]);
      expect(cleared.duration).toEqual({ min: 0, max: 120 });
      expect(cleared.completed).toBe('all');
      expect(cleared.tags).toEqual([]);
      expect(cleared.createdDate).toEqual({ start: null, end: null });
      expect(cleared.searchQuery).toBe('');
      
      // Check that sorting is preserved
      expect(cleared.sortBy).toBe('title');
      expect(cleared.sortOrder).toBe('asc');
    });
  });

  describe('date range filtering', () => {
    it('filters by date range correctly', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        createdDate: {
          start: new Date('2023-05-30'),
          end: new Date('2023-05-31')
        }
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(2);
      expect(result.some(w => w.title === 'Morning Cardio')).toBe(true);
      expect(result.some(w => w.title === 'Strength Training')).toBe(true);
    });

    it('filters by start date only', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        createdDate: {
          start: new Date('2023-05-30'),
          end: null
        }
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      // Should include Morning Cardio (2023-05-31) and Strength Training (2023-05-30)
      expect(result).toHaveLength(2);
    });

    it('filters by end date only', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        createdDate: {
          start: null,
          end: new Date('2023-05-29')
        }
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      // Should include Yoga Flow (2023-05-29) and Advanced HIIT (2023-05-28)
      expect(result).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('handles workouts with missing fields', () => {
      const incompleteWorkouts = [
        {
          id: 1,
          title: 'Incomplete Workout',
          // Missing many fields
          difficulty: 'beginner' as const,
          exercises: [],
          workoutType: 'General',
          equipment: [],
          isCompleted: false,
          tags: [],
          createdAt: '2023-05-31',
          duration: 30,
          description: '',
          created_at: '2023-05-31',
          updated_at: '2023-05-31',
          lastModified: '2023-05-31'
        }
      ];
      
      const filters = FilterEngine.getDefaultFilters();
      const result = FilterEngine.applyFilters(incompleteWorkouts, filters);
      
      expect(result).toHaveLength(1);
    });

    it('handles empty search query', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        searchQuery: '   '
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(4);
    });

    it('handles case-insensitive search', () => {
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        searchQuery: 'CARDIO'
      };
      const result = FilterEngine.applyFilters(mockWorkouts, filters);
      
      expect(result).toHaveLength(2);
    });

    it('handles workouts with invalid dates', () => {
      const workoutsWithBadDates = [
        {
          ...mockWorkouts[0],
          createdAt: 'invalid-date',
          created_at: 'invalid-date'
        }
      ];
      
      const filters = {
        ...FilterEngine.getDefaultFilters(),
        createdDate: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31')
        }
      };
      const result = FilterEngine.applyFilters(workoutsWithBadDates, filters);
      
      // Should include workout with invalid date (graceful handling)
      expect(result).toHaveLength(1);
    });
  });
}); 