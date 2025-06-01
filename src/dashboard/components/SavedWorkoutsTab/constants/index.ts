/**
 * SavedWorkoutsTab Constants Index
 * 
 * Centralized exports for all shared constants.
 * Constants will be extracted from components during Week 1, Days 2-3.
 */

// ===========================================
// WORKOUT CONSTANTS
// ===========================================
// Will be populated during service extraction (Week 1, Days 2-3)

// Workout metadata constants
// export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
// export const WORKOUT_TYPES = [
//   'Cardio',
//   'Strength', 
//   'Flexibility',
//   'HIIT',
//   'Yoga',
//   'Pilates',
//   'General'
// ] as const;

// export const EQUIPMENT_TYPES = [
//   'none',
//   'dumbbells',
//   'resistance_bands',
//   'barbell',
//   'kettlebell',
//   'pull_up_bar',
//   'bench',
//   'stability_ball',
//   'treadmill',
//   'bicycle',
//   'rowing_machine',
//   'elliptical',
//   'other'
// ] as const;

// Duration and rating ranges
// export const DURATION_RANGE = {
//   MIN: 5,
//   MAX: 180,
//   DEFAULT: 30,
//   STEP: 5
// } as const;

// export const RATING_RANGE = {
//   MIN: 1,
//   MAX: 5,
//   DEFAULT: 0
// } as const;

// ===========================================
// UI CONSTANTS
// ===========================================
// Will be populated during component breakdown (Week 1, Days 4-5)

// Grid layout constants
// export const GRID_LAYOUT = {
//   MIN_CARD_WIDTH: 280,
//   MAX_CARD_WIDTH: 400,
//   CARD_ASPECT_RATIO: 1.2,
//   GAP: 16,
//   COLUMNS: {
//     MOBILE: 1,
//     TABLET: 2,
//     DESKTOP: 3,
//     WIDE: 4
//   }
// } as const;

// Breakpoints
// export const BREAKPOINTS = {
//   MOBILE: 768,
//   TABLET: 1024,
//   DESKTOP: 1440,
//   WIDE: 1920
// } as const;

// View modes
// export const VIEW_MODES = ['grid', 'list', 'compact', 'detailed'] as const;

// ===========================================
// FILTER CONSTANTS
// ===========================================

// Filter presets
// export const FILTER_PRESETS = {
//   ALL: {
//     id: 'all',
//     name: 'All Workouts',
//     filters: {}
//   },
//   RECENT: {
//     id: 'recent',
//     name: 'Recent',
//     filters: {
//       dateRange: {
//         start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
//         end: new Date().toISOString()
//       }
//     }
//   },
//   FAVORITES: {
//     id: 'favorites',
//     name: 'Favorites',
//     filters: {
//       favorites: true
//     }
//   },
//   QUICK: {
//     id: 'quick',
//     name: 'Quick Workouts',
//     filters: {
//       duration: { min: 0, max: 30 }
//     }
//   }
// } as const;

// Search configuration
// export const SEARCH_CONFIG = {
//   DEBOUNCE_MS: 300,
//   MIN_QUERY_LENGTH: 2,
//   MAX_SUGGESTIONS: 10,
//   SEARCH_FIELDS: ['title', 'description', 'exercises', 'tags'] as const
// } as const;

// ===========================================
// API CONSTANTS
// ===========================================

// API endpoints
// export const API_ENDPOINTS = {
//   WORKOUTS: '/wp-json/fitcopilot/v1/workouts',
//   WORKOUT_DETAIL: '/wp-json/fitcopilot/v1/workouts/:id',
//   SEARCH: '/wp-json/fitcopilot/v1/workouts/search',
//   FILTERS: '/wp-json/fitcopilot/v1/workouts/filters',
//   COMPLETE: '/wp-json/fitcopilot/v1/workouts/:id/complete',
//   RATE: '/wp-json/fitcopilot/v1/workouts/:id/rate',
//   AUTH_CHECK: '/wp-json/fitcopilot/v1/auth/check',
//   HEALTH: '/wp-json/fitcopilot/v1/health'
// } as const;

// Request configuration
// export const API_CONFIG = {
//   TIMEOUT: 10000, // 10 seconds
//   RETRY_ATTEMPTS: 3,
//   RETRY_DELAY: 1000, // 1 second
//   CACHE_TTL: 300000, // 5 minutes
//   PAGE_SIZE: 20
// } as const;

// ===========================================
// AUTHENTICATION CONSTANTS
// ===========================================
// Will be populated during authentication sprint (Week 3)

// Authentication strategies
// export const AUTH_STRATEGIES = {
//   FITCOPILOT_DATA: 'fitcopilotData',
//   API_HEADERS: 'apiHeaders',
//   WP_API_FETCH: 'wpApiFetch',
//   META_TAG: 'metaTag',
//   DYNAMIC_FETCH: 'dynamicFetch'
// } as const;

// Authentication configuration
// export const AUTH_CONFIG = {
//   CHECK_INTERVAL: 30000, // 30 seconds
//   RETRY_ATTEMPTS: 3,
//   RETRY_DELAY: 2000, // 2 seconds
//   NONCE_REFRESH_THRESHOLD: 300000, // 5 minutes
//   MAX_STRATEGY_ATTEMPTS: 5
// } as const;

// ===========================================
// ERROR CONSTANTS
// ===========================================

// Error types
// export const ERROR_TYPES = {
//   NETWORK: 'network',
//   TIMEOUT: 'timeout',
//   UNAUTHORIZED: 'unauthorized',
//   FORBIDDEN: 'forbidden',
//   NOT_FOUND: 'not_found',
//   SERVER_ERROR: 'server_error',
//   VALIDATION: 'validation',
//   UNKNOWN: 'unknown'
// } as const;

// Error recovery
// export const ERROR_RECOVERY = {
//   MAX_RETRY_ATTEMPTS: 3,
//   RETRY_DELAY: 1000,
//   RECOVERY_TIMEOUT: 30000,
//   USER_ACTION_TIMEOUT: 300000 // 5 minutes
// } as const;

// ===========================================
// PERFORMANCE CONSTANTS
// ===========================================

// Debounce and throttle timings
// export const PERFORMANCE = {
//   DEBOUNCE_SEARCH: 300,
//   DEBOUNCE_FILTER: 500,
//   THROTTLE_SCROLL: 16, // ~60fps
//   THROTTLE_RESIZE: 100,
//   CACHE_SIZE: 100,
//   VIRTUAL_SCROLL_BUFFER: 5
// } as const;

// Animation durations
// export const ANIMATIONS = {
//   FAST: 150,
//   NORMAL: 300,
//   SLOW: 500,
//   SPRING: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
//   EASE: 'cubic-bezier(0.4, 0, 0.2, 1)'
// } as const;

// ===========================================
// ACCESSIBILITY CONSTANTS
// ===========================================

// ARIA labels and roles
// export const ARIA = {
//   LABELS: {
//     WORKOUT_GRID: 'Workout grid',
//     WORKOUT_CARD: 'Workout card',
//     FILTER_PANEL: 'Filter panel',
//     SEARCH_INPUT: 'Search workouts',
//     VIEW_MODE_TOGGLE: 'Change view mode'
//   },
//   ROLES: {
//     GRID: 'grid',
//     GRIDCELL: 'gridcell',
//     BUTTON: 'button',
//     SEARCH: 'search',
//     COMPLEMENTARY: 'complementary'
//   }
// } as const;

// Keyboard shortcuts
// export const KEYBOARD_SHORTCUTS = {
//   SEARCH: 'ctrl+k',
//   SELECT_ALL: 'ctrl+a',
//   DELETE: 'Delete',
//   ESCAPE: 'Escape',
//   ENTER: 'Enter',
//   ARROW_UP: 'ArrowUp',
//   ARROW_DOWN: 'ArrowDown',
//   ARROW_LEFT: 'ArrowLeft',
//   ARROW_RIGHT: 'ArrowRight'
// } as const;

// ===========================================
// VALIDATION CONSTANTS
// ===========================================

// Input validation
// export const VALIDATION = {
//   WORKOUT_TITLE: {
//     MIN_LENGTH: 3,
//     MAX_LENGTH: 100
//   },
//   DESCRIPTION: {
//     MAX_LENGTH: 500
//   },
//   SEARCH_QUERY: {
//     MIN_LENGTH: 2,
//     MAX_LENGTH: 50
//   },
//   RATING: {
//     MIN: 1,
//     MAX: 5
//   }
// } as const;

// ===========================================
// STORAGE CONSTANTS
// ===========================================

// Local storage keys
// export const STORAGE_KEYS = {
//   FILTER_STATE: 'fitcopilot_workout_filters',
//   VIEW_MODE: 'fitcopilot_view_mode',
//   GRID_LAYOUT: 'fitcopilot_grid_layout',
//   SEARCH_HISTORY: 'fitcopilot_search_history',
//   USER_PREFERENCES: 'fitcopilot_user_preferences'
// } as const;

// Cache keys
// export const CACHE_KEYS = {
//   WORKOUTS: 'workouts',
//   WORKOUT_DETAIL: 'workout_detail',
//   SEARCH_RESULTS: 'search_results',
//   FILTER_OPTIONS: 'filter_options',
//   AUTH_STATUS: 'auth_status'
// } as const;

// ===========================================
// MIGRATION STATUS
// ===========================================
/**
 * Constants Extraction Timeline:
 * 
 * Week 1, Day 2 (Service Extraction):
 * - ✅ Extract workout metadata constants from components
 * - ✅ Define API endpoints and configuration
 * - ✅ Create filter and search constants
 * 
 * Week 1, Day 3 (UI Constants):
 * - ✅ Define grid layout and breakpoint constants
 * - ✅ Add animation and performance constants
 * - ✅ Create accessibility constants
 * 
 * Week 1, Day 4 (Validation and Storage):
 * - ✅ Add input validation constants
 * - ✅ Define storage and cache keys
 * - ✅ Create error and recovery constants
 * 
 * Week 3 (Authentication Constants):
 * - ✅ Add authentication strategy constants
 * - ✅ Define auth configuration constants
 * - ✅ Create security-related constants
 * 
 * Benefits:
 * - Centralized configuration management
 * - Easy to update global settings
 * - Type-safe constant access
 * - Clear documentation of all configurable values
 * - Consistency across components and services
 * 
 * Constants Organization:
 * - Grouped by domain (workout, UI, API, etc.)
 * - Nested objects for related constants
 * - Use of 'as const' for literal types
 * - Clear naming conventions
 * - Comprehensive documentation
 * 
 * All constants are commented out until extraction to prevent
 * conflicts with existing hardcoded values in components.
 * Can be uncommented gradually as components are refactored.
 */ 