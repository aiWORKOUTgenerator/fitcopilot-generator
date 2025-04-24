/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message?: string;
  code?: ApiErrorCode;
}

/**
 * API error codes
 */
export type ApiErrorCode = 
  | 'validation_error'
  | 'ai_service_error'
  | 'unauthorized'
  | 'not_found'
  | 'server_error' 
  | 'unknown_error';

/**
 * Pagination information
 */
export interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Paginated response with items and pagination info
 */
export interface PaginatedResponse<T> extends PaginationInfo {
  items: T[];
} 