/**
 * Workout Constants
 * 
 * Centralized constants for workout-related functionality.
 * Extracted from components during Week 1 Foundation Sprint.
 */

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate', 
  ADVANCED: 'advanced'
} as const;

export const WORKOUT_TYPES = {
  CARDIO: 'Cardio',
  STRENGTH: 'Strength',
  FLEXIBILITY: 'Flexibility',
  HIIT: 'HIIT',
  YOGA: 'Yoga',
  PILATES: 'Pilates',
  SPORTS: 'Sports',
  GENERAL: 'General'
} as const;

export const EQUIPMENT_LABELS = {
  none: 'No Equipment',
  dumbbells: 'Dumbbells',
  barbell: 'Barbell',
  kettlebell: 'Kettlebell',
  resistance_bands: 'Resistance Bands',
  resistance_band: 'Resistance Band',
  pull_up_bar: 'Pull-up Bar',
  medicine_ball: 'Medicine Ball',
  stability_ball: 'Stability Ball',
  foam_roller: 'Foam Roller',
  yoga_mat: 'Yoga Mat',
  bench: 'Bench',
  cables: 'Cable Machine',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
  treadmill: 'Treadmill',
  bike: 'Exercise Bike',
  elliptical: 'Elliptical'
} as const;

export const SORT_OPTIONS = {
  DATE: 'date',
  TITLE: 'title',
  DURATION: 'duration',
  DIFFICULTY: 'difficulty',
  RATING: 'rating'
} as const;

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

export const COMPLETION_STATUS = {
  ALL: 'all',
  COMPLETED: 'completed',
  PENDING: 'pending'
} as const;

export const VIEW_MODE = {
  GRID: 'grid',
  LIST: 'list',
  COMPACT: 'compact'
} as const;

// Default filter configuration
export const DEFAULT_FILTERS = {
  difficulty: [],
  workoutType: [],
  equipment: [],
  duration: { min: 0, max: 120 },
  completed: COMPLETION_STATUS.ALL,
  sortBy: SORT_OPTIONS.DATE,
  sortOrder: SORT_ORDER.DESC,
  tags: [],
  createdDate: { start: null, end: null },
  searchQuery: ''
} as const;

// UI Configuration Constants
export const UI_CONSTANTS = {
  // Responsive breakpoints
  GRID_BREAKPOINT: 768,
  MOBILE_BREAKPOINT: 480,
  
  // Display limits
  MAX_EQUIPMENT_TAGS_DISPLAY: 3,
  MAX_WORKOUT_TAGS_DISPLAY: 3,
  MAX_DESCRIPTION_LENGTH: 150,
  MAX_TITLE_LENGTH: 60,
  
  // Grid and list settings
  SKELETON_CARDS_COUNT: 6,
  CARDS_PER_PAGE: 12,
  
  // Search and interaction
  SEARCH_DEBOUNCE_MS: 300,
  SELECTION_TIMEOUT_MS: 5000,
  
  // Animation durations
  CARD_HOVER_DURATION: 200,
  FILTER_ANIMATION_DURATION: 300,
  TRANSITION_DURATION: 150
} as const;

// Default workout values
export const DEFAULT_WORKOUT = {
  DURATION: 30,
  DIFFICULTY: DIFFICULTY_LEVELS.INTERMEDIATE,
  WORKOUT_TYPE: WORKOUT_TYPES.GENERAL,
  RATING: 0
} as const;

// Exercise-related constants
export const EXERCISE_CONSTANTS = {
  MIN_EXERCISES_FOR_WORKOUT: 1,
  MAX_EXERCISES_PER_WORKOUT: 50,
  DEFAULT_SETS: 3,
  DEFAULT_REPS: 10,
  DEFAULT_DURATION_SECONDS: 30
} as const;

// Cache and performance constants
export const PERFORMANCE_CONSTANTS = {
  WORKOUT_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  FILTER_CACHE_TTL_MS: 10 * 60 * 1000, // 10 minutes
  MAX_CONCURRENT_REQUESTS: 3,
  REQUEST_TIMEOUT_MS: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000
} as const;

// Validation constants
export const VALIDATION_CONSTANTS = {
  MIN_WORKOUT_TITLE_LENGTH: 1,
  MAX_WORKOUT_TITLE_LENGTH: 200,
  MIN_WORKOUT_DESCRIPTION_LENGTH: 0,
  MAX_WORKOUT_DESCRIPTION_LENGTH: 1000,
  MIN_DURATION_MINUTES: 1,
  MAX_DURATION_MINUTES: 300, // 5 hours
  MIN_RATING: 1,
  MAX_RATING: 5
} as const;

// Error message constants
export const ERROR_MESSAGES = {
  WORKOUT_NOT_FOUND: 'Workout not found or has been deleted.',
  DATA_CORRUPTION: 'Workout data appears corrupted.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTHENTICATION_REQUIRED: 'Authentication required. Please refresh the page.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  VALIDATION_ERROR: 'Invalid workout data provided.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.'
} as const;

// Success message constants
export const SUCCESS_MESSAGES = {
  WORKOUT_SAVED: 'Workout saved successfully!',
  WORKOUT_DELETED: 'Workout deleted successfully!',
  WORKOUT_COMPLETED: 'Workout marked as completed!',
  WORKOUT_FAVORITED: 'Workout added to favorites!',
  WORKOUT_UNFAVORITED: 'Workout removed from favorites!',
  WORKOUT_RATED: 'Workout rating saved!',
  FILTERS_APPLIED: 'Filters applied successfully!',
  FILTERS_CLEARED: 'All filters cleared!'
} as const;

// API endpoint constants
export const API_ENDPOINTS = {
  WORKOUTS: '/wp-json/fitcopilot/v1/workouts',
  WORKOUT_SINGLE: '/wp-json/fitcopilot/v1/workouts/{id}',
  WORKOUT_COMPLETE: '/wp-json/fitcopilot/v1/workouts/{id}/complete',
  PROFILE: '/wp-json/fitcopilot/v1/profile'
} as const;

// WordPress-specific constants
export const WORDPRESS_CONSTANTS = {
  POST_TYPE: 'wg_workout',
  META_KEYS: {
    WORKOUT_DATA: '_workout_data',
    DURATION: '_workout_duration',
    DIFFICULTY: '_workout_difficulty',
    EQUIPMENT: '_workout_equipment',
    WORKOUT_TYPE: '_workout_type',
    IS_COMPLETED: '_is_completed',
    COMPLETED_AT: '_completed_at',
    RATING: '_workout_rating',
    IS_FAVORITE: '_is_favorite'
  },
  NONCE_ACTION: 'fitcopilot_nonce',
  CAPABILITY: 'edit_posts'
} as const;

// Type definitions for constants
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];
export type WorkoutType = typeof WORKOUT_TYPES[keyof typeof WORKOUT_TYPES];
export type EquipmentType = keyof typeof EQUIPMENT_LABELS;
export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];
export type SortOrder = typeof SORT_ORDER[keyof typeof SORT_ORDER];
export type CompletionStatus = typeof COMPLETION_STATUS[keyof typeof COMPLETION_STATUS];
export type ViewMode = typeof VIEW_MODE[keyof typeof VIEW_MODE]; 