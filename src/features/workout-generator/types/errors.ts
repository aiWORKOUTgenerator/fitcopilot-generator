/**
 * Error types for workout generation
 */

/**
 * Represents an error that occurred during workout generation
 */
export interface GenerationError {
  /** Error message */
  message: string;
  
  /** Error code for more specific handling */
  code?: string;
  
  /** Original error object (if available) */
  originalError?: unknown;
} 