/**
 * FilterEngine Service
 * 
 * Handles all filtering, sorting, and searching logic for workout data.
 * Extracted from WorkoutGrid.tsx as part of Week 1 Foundation Sprint.
 */

// Import types (using existing interfaces from WorkoutGrid for now)
interface DisplayWorkout {
  id: string | number;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: any[];
  created_at: string;
  updated_at: string;
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

export class FilterEngine {
  /**
   * Apply all filters to workout list
   * 
   * @param workouts - Array of workout objects to filter
   * @param filters - Filter criteria to apply
   * @returns Filtered array of workouts
   */
  static applyFilters(
    workouts: DisplayWorkout[], 
    filters: WorkoutFilters
  ): DisplayWorkout[] {
    if (!Array.isArray(workouts)) {
      console.warn('FilterEngine.applyFilters: Expected array, received:', typeof workouts);
      return [];
    }

    try {
      // 🐛 DEBUG: Log filtering process
      console.group(`🔍 FilterEngine: Applying filters to ${workouts.length} workouts`);
      console.log('📥 Filters:', filters);
      
      let filtered = workouts.filter(workout => {
        // Search filter
        if (filters.searchQuery && !this.passesSearchFilter(workout, filters.searchQuery)) {
          return false;
        }

        // Difficulty filter
        if (filters.difficulty.length > 0 && !this.passesDifficultyFilter(workout, filters.difficulty)) {
          return false;
        }

        // Workout type filter
        if (filters.workoutType.length > 0 && !this.passesWorkoutTypeFilter(workout, filters.workoutType)) {
          return false;
        }

        // Equipment filter
        if (filters.equipment.length > 0 && !this.passesEquipmentFilter(workout, filters.equipment)) {
          return false;
        }

        // Duration filter
        if (!this.passesDurationFilter(workout, filters.duration)) {
          return false;
        }

        // Completion status filter
        if (!this.passesCompletionFilter(workout, filters.completed)) {
          return false;
        }

        // Tags filter
        if (filters.tags.length > 0 && !this.passesTagsFilter(workout, filters.tags)) {
          return false;
        }

        // Date range filter
        if (filters.createdDate.start || filters.createdDate.end) {
          if (!this.passesDateRangeFilter(workout, filters.createdDate)) {
            return false;
          }
        }

        return true;
      });

      // Apply sorting
      filtered = this.applySorting(filtered, filters.sortBy, filters.sortOrder);

      // 🐛 DEBUG: Log filtering results
      console.log(`✨ Filtered results: ${filtered.length} workouts`);
      console.groupEnd();

      return filtered;
    } catch (error) {
      console.error('❌ Error applying filters:', error);
      console.groupEnd();
      return workouts; // Return original workouts on error
    }
  }

  /**
   * Apply search query filtering
   * 
   * @param workout - Workout object to check
   * @param searchQuery - Search query string
   * @returns True if workout matches search query
   */
  private static passesSearchFilter(workout: DisplayWorkout, searchQuery: string): boolean {
    if (!searchQuery || typeof searchQuery !== 'string') return true;
    
    const query = searchQuery.toLowerCase().trim();
    if (query.length === 0) return true;

    try {
      const matchesSearch = 
        workout.title.toLowerCase().includes(query) ||
        workout.description.toLowerCase().includes(query) ||
        workout.workoutType.toLowerCase().includes(query) ||
        (Array.isArray(workout.tags) && workout.tags.some((tag: string) => 
          typeof tag === 'string' && tag.toLowerCase().includes(query)
        ));
      
      return matchesSearch;
    } catch (error) {
      console.warn('Error in search filter:', error, workout);
      return true; // Include workout on error
    }
  }

  /**
   * Apply difficulty filter
   * 
   * @param workout - Workout object to check
   * @param difficulties - Array of difficulty levels to match
   * @returns True if workout matches difficulty filter
   */
  private static passesDifficultyFilter(workout: DisplayWorkout, difficulties: string[]): boolean {
    if (!Array.isArray(difficulties) || difficulties.length === 0) return true;
    
    return difficulties.includes(workout.difficulty);
  }

  /**
   * Apply workout type filter
   * 
   * @param workout - Workout object to check
   * @param workoutTypes - Array of workout types to match
   * @returns True if workout matches workout type filter
   */
  private static passesWorkoutTypeFilter(workout: DisplayWorkout, workoutTypes: string[]): boolean {
    if (!Array.isArray(workoutTypes) || workoutTypes.length === 0) return true;
    
    return workoutTypes.includes(workout.workoutType);
  }

  /**
   * Apply equipment filter
   * 
   * @param workout - Workout object to check
   * @param requiredEquipment - Array of equipment to match
   * @returns True if workout has any of the required equipment
   */
  private static passesEquipmentFilter(workout: DisplayWorkout, requiredEquipment: string[]): boolean {
    if (!Array.isArray(requiredEquipment) || requiredEquipment.length === 0) return true;
    
    if (!Array.isArray(workout.equipment)) return false;
    
    const hasRequiredEquipment = requiredEquipment.some(eq => 
      workout.equipment.includes(eq)
    );
    
    return hasRequiredEquipment;
  }

  /**
   * Apply duration filter
   * 
   * @param workout - Workout object to check
   * @param durationRange - Duration range object with min and max
   * @returns True if workout duration is within range
   */
  private static passesDurationFilter(
    workout: DisplayWorkout, 
    durationRange: { min: number; max: number }
  ): boolean {
    if (!durationRange || typeof durationRange.min !== 'number' || typeof durationRange.max !== 'number') {
      return true;
    }
    
    const duration = typeof workout.duration === 'number' ? workout.duration : 0;
    
    return duration >= durationRange.min && duration <= durationRange.max;
  }

  /**
   * Apply completion status filter
   * 
   * @param workout - Workout object to check
   * @param completionStatus - Completion status to filter by
   * @returns True if workout matches completion status
   */
  private static passesCompletionFilter(
    workout: DisplayWorkout, 
    completionStatus: 'all' | 'completed' | 'pending'
  ): boolean {
    if (completionStatus === 'all') return true;
    
    const isCompleted = Boolean(workout.isCompleted);
    
    if (completionStatus === 'completed') return isCompleted;
    if (completionStatus === 'pending') return !isCompleted;
    
    return true;
  }

  /**
   * Apply tags filter
   * 
   * @param workout - Workout object to check
   * @param requiredTags - Array of tags to match
   * @returns True if workout has any of the required tags
   */
  private static passesTagsFilter(workout: DisplayWorkout, requiredTags: string[]): boolean {
    if (!Array.isArray(requiredTags) || requiredTags.length === 0) return true;
    
    if (!Array.isArray(workout.tags)) return false;
    
    const hasRequiredTags = requiredTags.some(tag => 
      workout.tags.includes(tag)
    );
    
    return hasRequiredTags;
  }

  /**
   * Apply date range filter
   * 
   * @param workout - Workout object to check
   * @param dateRange - Date range object with start and end dates
   * @returns True if workout created date is within range
   */
  private static passesDateRangeFilter(
    workout: DisplayWorkout, 
    dateRange: { start: Date | null; end: Date | null }
  ): boolean {
    if (!dateRange || (!dateRange.start && !dateRange.end)) return true;
    
    try {
      const workoutDate = new Date(workout.createdAt || workout.created_at);
      
      if (isNaN(workoutDate.getTime())) {
        console.warn('Invalid workout date:', workout.createdAt || workout.created_at);
        return true; // Include workout with invalid date
      }
      
      // Convert to UTC date strings for consistent comparison
      const workoutDateStr = workoutDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (dateRange.start) {
        const startDateStr = dateRange.start.toISOString().split('T')[0];
        if (workoutDateStr < startDateStr) return false;
      }
      
      if (dateRange.end) {
        const endDateStr = dateRange.end.toISOString().split('T')[0];
        if (workoutDateStr > endDateStr) return false;
      }
      
      return true;
    } catch (error) {
      console.warn('Error in date filter:', error, workout);
      return true; // Include workout on error
    }
  }

  /**
   * Apply sorting to workout list
   * 
   * @param workouts - Array of workouts to sort
   * @param sortBy - Field to sort by
   * @param sortOrder - Sort order (asc or desc)
   * @returns Sorted array of workouts
   */
  static applySorting(
    workouts: DisplayWorkout[], 
    sortBy: 'date' | 'title' | 'duration' | 'difficulty', 
    sortOrder: 'asc' | 'desc'
  ): DisplayWorkout[] {
    if (!Array.isArray(workouts)) {
      console.warn('FilterEngine.applySorting: Expected array, received:', typeof workouts);
      return [];
    }

    try {
      const sorted = [...workouts].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'date':
            comparison = this.compareDates(a.createdAt, b.createdAt);
            break;
          case 'title':
            comparison = this.compareStrings(a.title, b.title);
            break;
          case 'duration':
            comparison = this.compareNumbers(a.duration, b.duration);
            break;
          case 'difficulty':
            comparison = this.compareDifficulty(a.difficulty, b.difficulty);
            break;
          default:
            console.warn('Unknown sort field:', sortBy);
            return 0;
        }

        return sortOrder === 'desc' ? -comparison : comparison;
      });

      return sorted;
    } catch (error) {
      console.error('Error sorting workouts:', error);
      return workouts; // Return original array on error
    }
  }

  /**
   * Compare two date strings
   * 
   * @param dateA - First date string
   * @param dateB - Second date string
   * @returns Comparison result (-1, 0, 1)
   */
  private static compareDates(dateA: string, dateB: string): number {
    try {
      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();
      
      if (isNaN(timeA) && isNaN(timeB)) return 0;
      if (isNaN(timeA)) return 1; // Invalid dates go to end
      if (isNaN(timeB)) return -1;
      
      return timeA - timeB;
    } catch {
      return 0;
    }
  }

  /**
   * Compare two strings
   * 
   * @param stringA - First string
   * @param stringB - Second string
   * @returns Comparison result (-1, 0, 1)
   */
  private static compareStrings(stringA: string, stringB: string): number {
    const a = typeof stringA === 'string' ? stringA : '';
    const b = typeof stringB === 'string' ? stringB : '';
    
    return a.localeCompare(b);
  }

  /**
   * Compare two numbers
   * 
   * @param numberA - First number
   * @param numberB - Second number
   * @returns Comparison result (-1, 0, 1)
   */
  private static compareNumbers(numberA: number, numberB: number): number {
    const a = typeof numberA === 'number' ? numberA : 0;
    const b = typeof numberB === 'number' ? numberB : 0;
    
    return a - b;
  }

  /**
   * Compare two difficulty levels
   * 
   * @param difficultyA - First difficulty level
   * @param difficultyB - Second difficulty level
   * @returns Comparison result (-1, 0, 1)
   */
  private static compareDifficulty(
    difficultyA: 'beginner' | 'intermediate' | 'advanced', 
    difficultyB: 'beginner' | 'intermediate' | 'advanced'
  ): number {
    const difficultyOrder: Record<string, number> = { 
      beginner: 1, 
      intermediate: 2, 
      advanced: 3 
    };
    
    const orderA = difficultyOrder[difficultyA] || 2;
    const orderB = difficultyOrder[difficultyB] || 2;
    
    return orderA - orderB;
  }

  /**
   * Get default filter state
   * 
   * @returns Default WorkoutFilters object
   */
  static getDefaultFilters(): WorkoutFilters {
    return {
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
    };
  }

  /**
   * Check if any filters are active
   * 
   * @param filters - Filter state to check
   * @returns True if any non-default filters are applied
   */
  static hasActiveFilters(filters: WorkoutFilters): boolean {
    const defaults = this.getDefaultFilters();
    
    return (
      filters.difficulty.length > 0 ||
      filters.workoutType.length > 0 ||
      filters.equipment.length > 0 ||
      filters.duration.min !== defaults.duration.min ||
      filters.duration.max !== defaults.duration.max ||
      filters.completed !== defaults.completed ||
      filters.tags.length > 0 ||
      filters.createdDate.start !== null ||
      filters.createdDate.end !== null ||
      filters.searchQuery.trim().length > 0
    );
  }

  /**
   * Clear all filters except sorting
   * 
   * @param currentFilters - Current filter state
   * @returns Cleared filters with sorting preserved
   */
  static clearFilters(currentFilters: WorkoutFilters): WorkoutFilters {
    const defaults = this.getDefaultFilters();
    
    return {
      ...defaults,
      // Preserve current sorting preferences
      sortBy: currentFilters.sortBy,
      sortOrder: currentFilters.sortOrder
    };
  }
}

export default FilterEngine; 