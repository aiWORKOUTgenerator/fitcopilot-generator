/**
 * API Type Definitions
 * 
 * Types for API requests, responses, and data structures.
 * Integrates with existing API client and upcoming authentication system.
 */

// ===========================================
// CORE API TYPES
// ===========================================

// Base API response (from existing client.ts)
// export interface ApiResponse<T = any> {
//   success: boolean;
//   data?: T;
//   message?: string;
//   code?: string;
//   status?: number;
// }

// API error response
// export interface ApiErrorResponse {
//   success: false;
//   data?: null;
//   message: string;
//   code?: string;
//   status: number;
//   details?: Record<string, any>;
// }

// API request options
// export interface ApiRequestOptions {
//   method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
//   headers?: Record<string, string>;
//   body?: any;
//   timeout?: number;
//   retries?: number;
//   cache?: boolean;
//   validateStatus?: (status: number) => boolean;
// }

// ===========================================
// WORKOUT API TYPES
// ===========================================

// Workout API endpoints
// export interface WorkoutApiEndpoints {
//   list: '/workouts';
//   get: '/workouts/:id';
//   create: '/workouts';
//   update: '/workouts/:id';
//   delete: '/workouts/:id';
//   duplicate: '/workouts/:id/duplicate';
//   complete: '/workouts/:id/complete';
//   favorite: '/workouts/:id/favorite';
//   rate: '/workouts/:id/rate';
// }

// Get workouts request
// export interface GetWorkoutsRequest {
//   page?: number;
//   pageSize?: number;
//   search?: string;
//   filters?: WorkoutFilters;
//   sort?: {
//     field: string;
//     direction: 'asc' | 'desc';
//   };
//   include?: ('exercises' | 'metadata' | 'completion_data')[];
// }

// Get workouts response
// export interface GetWorkoutsResponse {
//   workouts: RawWorkoutData[];
//   pagination: {
//     currentPage: number;
//     pageSize: number;
//     totalCount: number;
//     totalPages: number;
//     hasNextPage: boolean;
//     hasPreviousPage: boolean;
//   };
//   filters?: {
//     appliedFilters: WorkoutFilters;
//     availableValues: {
//       difficulty: string[];
//       equipment: string[];
//       workoutType: string[];
//       tags: string[];
//     };
//   };
//   metadata?: {
//     totalExercises: number;
//     averageDuration: number;
//     completionRate: number;
//   };
// }

// Single workout response
// export interface GetWorkoutResponse {
//   workout: RawWorkoutData;
//   exercises: Exercise[];
//   metadata: {
//     totalDuration: number;
//     exerciseCount: number;
//     estimatedCalories?: number;
//     difficulty: string;
//     equipment: string[];
//   };
//   completion?: {
//     isCompleted: boolean;
//     completedAt?: string;
//     duration?: number;
//     rating?: number;
//     notes?: string;
//   };
// }

// ===========================================
// WORKOUT CRUD OPERATIONS
// ===========================================

// Create workout request
// export interface CreateWorkoutRequest {
//   title: string;
//   description?: string;
//   exercises: Exercise[];
//   duration: number;
//   difficulty: string;
//   equipment: string[];
//   workoutType: string;
//   tags?: string[];
//   metadata?: Record<string, any>;
// }

// Update workout request
// export interface UpdateWorkoutRequest {
//   title?: string;
//   description?: string;
//   exercises?: Exercise[];
//   duration?: number;
//   difficulty?: string;
//   equipment?: string[];
//   workoutType?: string;
//   tags?: string[];
//   metadata?: Record<string, any>;
// }

// Workout action responses
// export interface WorkoutActionResponse {
//   success: boolean;
//   workoutId: string | number;
//   message?: string;
//   updatedFields?: string[];
// }

// ===========================================
// COMPLETION AND TRACKING API
// ===========================================

// Complete workout request
// export interface CompleteWorkoutRequest {
//   workoutId: string | number;
//   duration?: number; // Actual time taken
//   notes?: string;
//   exercisesCompleted?: string[]; // Exercise IDs
//   rating?: number;
//   difficulty?: 'easier' | 'as_expected' | 'harder';
// }

// Rate workout request
// export interface RateWorkoutRequest {
//   workoutId: string | number;
//   rating: number; // 1-5 stars
//   review?: string;
//   difficulty?: 'easier' | 'as_expected' | 'harder';
//   wouldRecommend?: boolean;
// }

// Workout statistics response
// export interface WorkoutStatsResponse {
//   totalWorkouts: number;
//   completedWorkouts: number;
//   totalExercises: number;
//   totalDuration: number; // In minutes
//   averageRating: number;
//   favoriteCount: number;
//   recentActivity: {
//     workoutId: string | number;
//     action: 'completed' | 'created' | 'edited' | 'favorited';
//     timestamp: string;
//   }[];
// }

// ===========================================
// SEARCH AND FILTER API
// ===========================================

// Search workouts request
// export interface SearchWorkoutsRequest {
//   query: string;
//   filters?: WorkoutFilters;
//   limit?: number;
//   includeExercises?: boolean;
//   highlightMatches?: boolean;
// }

// Search workouts response
// export interface SearchWorkoutsResponse {
//   results: SearchResult[];
//   suggestions: SearchSuggestion[];
//   totalCount: number;
//   query: string;
//   filters?: WorkoutFilters;
//   executionTime: number; // In milliseconds
// }

// Filter options response
// export interface FilterOptionsResponse {
//   difficulty: { value: string; label: string; count: number }[];
//   equipment: { value: string; label: string; count: number }[];
//   workoutType: { value: string; label: string; count: number }[];
//   tags: { value: string; label: string; count: number }[];
//   durationRange: {
//     min: number;
//     max: number;
//     average: number;
//   };
//   ratingRange: {
//     min: number;
//     max: number;
//     average: number;
//   };
// }

// ===========================================
// AUTHENTICATION API TYPES
// ===========================================
// From authentication sprint plan

// Authentication check response
// export interface AuthCheckResponse {
//   authenticated: boolean;
//   user_id?: number;
//   permissions: string[];
//   nonce?: string;
//   expires_at?: string;
// }

// Authentication refresh request
// export interface AuthRefreshRequest {
//   currentNonce?: string;
//   userId?: number;
// }

// Authentication refresh response
// export interface AuthRefreshResponse {
//   nonce: string;
//   expires_at: string;
//   user_id: number;
//   permissions: string[];
// }

// ===========================================
// ERROR AND RECOVERY API
// ===========================================

// Error report request
// export interface ErrorReportRequest {
//   error: {
//     message: string;
//     stack?: string;
//     code?: string;
//   };
//   context: {
//     url: string;
//     userAgent: string;
//     userId?: string;
//     workoutId?: string;
//     action?: string;
//   };
//   metadata?: Record<string, any>;
//   timestamp: string;
// }

// Health check response
// export interface HealthCheckResponse {
//   status: 'healthy' | 'degraded' | 'unhealthy';
//   version: string;
//   timestamp: string;
//   services: {
//     database: 'healthy' | 'degraded' | 'unhealthy';
//     authentication: 'healthy' | 'degraded' | 'unhealthy';
//     file_storage: 'healthy' | 'degraded' | 'unhealthy';
//   };
//   uptime: number;
//   memory_usage?: number;
// }

// ===========================================
// BATCH OPERATIONS
// ===========================================

// Batch workout request
// export interface BatchWorkoutRequest {
//   action: 'delete' | 'favorite' | 'unfavorite' | 'duplicate' | 'export';
//   workoutIds: (string | number)[];
//   options?: Record<string, any>;
// }

// Batch workout response
// export interface BatchWorkoutResponse {
//   success: boolean;
//   results: {
//     workoutId: string | number;
//     success: boolean;
//     message?: string;
//     error?: string;
//   }[];
//   summary: {
//     total: number;
//     successful: number;
//     failed: number;
//   };
// }

// ===========================================
// EXPORT/IMPORT API
// ===========================================

// Export workout request
// export interface ExportWorkoutRequest {
//   workoutIds: (string | number)[];
//   format: 'json' | 'pdf' | 'csv' | 'txt';
//   includeExercises?: boolean;
//   includeMetadata?: boolean;
//   template?: string;
// }

// Export workout response
// export interface ExportWorkoutResponse {
//   downloadUrl: string;
//   filename: string;
//   fileSize: number;
//   expiresAt: string;
//   format: string;
// }

// ===========================================
// MIGRATION STATUS
// ===========================================
/**
 * API Types Implementation Progress:
 * 
 * Current State:
 * - ✅ Basic ApiResponse types exist in common/api/client.ts
 * - ✅ Comprehensive API type framework planned
 * - ✅ Integration ready for authentication sprint
 * 
 * Week 1, Day 3 (Service Extraction):
 * - ✅ Uncomment core API types
 * - ✅ Implement workout CRUD operation types
 * - ✅ Add search and filter API types
 * 
 * Week 3 (Authentication Sprint):
 * - ✅ Uncomment authentication API types
 * - ✅ Add error reporting and health check types
 * - ✅ Implement recovery API types
 * 
 * Future Enhancements:
 * - Batch operation support
 * - Import/export functionality
 * - Real-time updates via WebSocket
 * - Advanced analytics API
 * - Social features API
 * 
 * Benefits:
 * - Type-safe API calls
 * - Clear API contracts
 * - Better error handling
 * - Consistent response formats
 * - Integration with authentication system
 * 
 * All types are commented out until service implementation to prevent
 * conflicts with existing API client types.
 */ 