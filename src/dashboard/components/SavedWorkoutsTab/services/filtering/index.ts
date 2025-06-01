/**
 * Filtering Services Index
 * 
 * Centralized exports for workout filtering and sorting services.
 * Part of Week 1 Foundation Sprint - Service Layer Organization.
 */

// Core filtering service
export { default as FilterEngine } from './FilterEngine';
export { FilterEngine } from './FilterEngine';

/**
 * Service Usage Examples:
 * 
 * import { FilterEngine } from './services/filtering';
 * 
 * // Apply all filters to workouts
 * const filteredWorkouts = FilterEngine.applyFilters(workouts, filters);
 * 
 * // Apply only sorting
 * const sortedWorkouts = FilterEngine.applySorting(workouts, 'date', 'desc');
 * 
 * // Check if filters are active
 * const hasFilters = FilterEngine.hasActiveFilters(filters);
 * 
 * // Clear all filters
 * const clearedFilters = FilterEngine.clearFilters(currentFilters);
 * 
 * // Get default filter state
 * const defaultFilters = FilterEngine.getDefaultFilters();
 */ 