/**
 * Utils Module Exports
 * 
 * Centralized exports for all utility functions.
 */
export { 
  logger, 
  Logger,
  type LogLevel,
  type LoggerConfig
} from './logger';

export { 
  resolveWorkoutId, 
  isValidWorkoutId, 
  normalizeWorkoutId, 
  extractNumericId, 
  idsEqual,
  type IdResolution
} from './idResolver'; 