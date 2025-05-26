/**
 * FitCopilot API Design Guidelines - Compliant API Client
 * 
 * This module provides a complete implementation of the FitCopilot API Design Guidelines
 * with strict compliance enforcement through:
 * 
 * - ✅ Automatic request/response validation
 * - ✅ Field name transformation (camelCase ↔ snake_case)
 * - ✅ Request wrapping ({ resourceType: data })
 * - ✅ Standardized response format ({ success, data, message, code? })
 * - ✅ Type safety with compile-time validation
 * - ✅ Proper error mapping and handling
 * 
 * @example
 * ```typescript
 * import { apiClient } from '@/common/api';
 * 
 * // Fully compliant workout generation
 * const result = await apiClient.generateWorkout({
 *   duration: 30,
 *   difficulty: 'intermediate',
 *   equipment: ['dumbbells'],
 *   goals: 'strength training'
 * });
 * 
 * // Automatic validation, transformation, and wrapping applied
 * console.log(result.data); // Response data with camelCase fields
 * ```
 */

// Core Types and Interfaces
export {
  // Response Types
  ApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiErrorCode,
  HTTP_STATUS_TO_ERROR_CODE,
  
  // Request Types  
  WrappedRequest,
  DirectRequest,
  ApiRequestData,
  CompliantApiRequestOptions,
  
  // Configuration Types
  ApiClientConfig,
  TypeCoercionRules,
  
  // Resource Types
  ResourceType,
  WorkoutRequest,
  WorkoutResponse,
  ProfileRequest,
  ProfileResponse,
  
  // Validation Types
  ValidationResult,
  ValidationError,
  
  // Endpoint Types
  EndpointDefinition,
  
  // Type Guards
  isApiResponse,
  isApiErrorResponse,
  isApiSuccessResponse
} from './types/guidelines';

// Schema Definitions and Registry
export {
  // Schema Constants
  WORKOUT_REQUEST_SCHEMA,
  WORKOUT_RESPONSE_SCHEMA,
  PROFILE_REQUEST_SCHEMA,
  API_ENDPOINTS,
  
  // Registry Classes
  EndpointRegistry,
  
  // Utility Functions
  buildEndpointPath,
  EndpointBuilders
} from './schemas/endpoints';

// Field Transformation
export {
  // Core Transformation Functions
  camelToSnakeCase,
  snakeToCamelCase,
  transformKeysToSnakeCase,
  transformKeysToCamelCase,
  transformRequestForBackend,
  transformResponseFromBackend,
  
  // Advanced Transformation
  TransformOptions,
  transformFieldNames,
  smartTransform,
  
  // Factory and Constants
  FieldTransformerFactory,
  wordPressFieldTransformer,
  COMMON_PRESERVE_FIELDS,
  getCombinedPreserveFields
} from './transformers/fieldTransformer';

// Request/Response Processing
export {
  // Wrapper Functions
  wrapRequest,
  unwrapRequest,
  wrapResponse,
  unwrapResponse,
  
  // Configuration Interfaces
  RequestWrapperConfig,
  ResponseUnwrapperConfig,
  
  // Transformer Class
  RequestResponseTransformer,
  
  // Error Handling
  ApiError,
  createApiErrorFromResponse,
  
  // Utility Objects
  RequestUtils,
  ResponseUtils
} from './transformers/requestTransformer';

// Validation Engine
export {
  // Validator Classes
  SchemaValidator,
  ApiValidators,
  SchemaRegistry,
  
  // Configuration
  ValidationConfig,
  DEFAULT_VALIDATION_CONFIG,
  
  // Utility Functions
  ValidationUtils
} from './validation/schemaValidator';

// Main API Client
export {
  // Primary Client
  CompliantApiClient,
  ApiClient,
  
  // Configuration Interfaces
  ApiRequestConfig,
  ApiCallResult,
  
  // Client Instances and Factories
  apiClient,
  createWordPressApiClient
} from './client/compliantApiClient';

// Default instances (single exports to avoid conflicts)
export { defaultValidator } from './validation/schemaValidator';
export { defaultTransformer } from './transformers/requestTransformer';
export { apiClient as default } from './client/compliantApiClient';

/**
 * Version Information
 */
export const API_CLIENT_VERSION = '1.0.0';
export const COMPLIANCE_LEVEL = 'STRICT';
export const SUPPORTED_GUIDELINES_VERSION = '1.0';

/**
 * Feature Flags
 */
export const FEATURES = {
  AUTOMATIC_VALIDATION: true,
  FIELD_NAME_TRANSFORMATION: true,
  REQUEST_WRAPPING: true,
  RESPONSE_UNWRAPPING: true,
  TYPE_COERCION: true,
  ERROR_MAPPING: true,
  RETRY_LOGIC: true,
  TIMEOUT_HANDLING: true
} as const;

/**
 * Configuration Presets
 */
export const CONFIG_PRESETS = {
  /**
   * Full compliance with all features enabled (default)
   */
  STRICT_COMPLIANCE: {
    validateByDefault: true,
    transformFieldNamesByDefault: true,
    typeCoercionRules: {
      numericStrings: true,
      booleanStrings: true,
      emptyStringToNull: true,
      arrayItemValidation: true
    },
    timeout: 30000,
    retries: 3
  },
  
  /**
   * Performance-optimized with minimal validation
   */
  PERFORMANCE_OPTIMIZED: {
    validateByDefault: false,
    transformFieldNamesByDefault: true,
    typeCoercionRules: {
      numericStrings: false,
      booleanStrings: false,
      emptyStringToNull: false,
      arrayItemValidation: false
    },
    timeout: 10000,
    retries: 1
  },
  
  /**
   * Development mode with verbose error reporting
   */
  DEVELOPMENT: {
    validateByDefault: true,
    transformFieldNamesByDefault: true,
    typeCoercionRules: {
      numericStrings: true,
      booleanStrings: true,
      emptyStringToNull: true,
      arrayItemValidation: true
    },
    timeout: 60000,
    retries: 0 // Fail fast in development
  }
} as const;

/**
 * Migration Helpers
 * 
 * For projects migrating from the previous API helper functions
 */
export const MigrationHelpers = {
  /**
   * Create a client that mimics the old API helper behavior
   */
  createLegacyCompatibleClient() {
    return new CompliantApiClient({
      ...CONFIG_PRESETS.STRICT_COMPLIANCE,
      // Maintain backward compatibility
      validateByDefault: false // Legacy mode didn't validate
    });
  },
  
  /**
   * Gradually enable features for migration
   */
  createMigrationClient(enabledFeatures: Partial<typeof FEATURES>) {
    return new CompliantApiClient({
      validateByDefault: enabledFeatures.AUTOMATIC_VALIDATION ?? false,
      transformFieldNamesByDefault: enabledFeatures.FIELD_NAME_TRANSFORMATION ?? true,
      // Other features can be gradually enabled
    });
  }
};

/**
 * Type Helpers for Better DX
 */

// Helper type for extracting response type from API methods
export type ApiMethodResponse<T> = T extends (...args: any[]) => Promise<ApiCallResult<infer R>> 
  ? R 
  : never;

// Helper type for extracting request type from API methods  
export type ApiMethodRequest<T> = T extends (data: infer R, ...args: any[]) => any 
  ? R 
  : never;

/**
 * Runtime Validation Helpers
 */
export const RuntimeChecks = {
  /**
   * Verify the client is properly configured
   */
  validateClientConfiguration(client: CompliantApiClient): boolean {
    const config = client.getConfig();
    return !!(config.baseUrl && config.timeout > 0);
  },
  
  /**
   * Check if all required dependencies are available
   */
  checkDependencies(): { available: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (typeof fetch === 'undefined') {
      missing.push('fetch');
    }
    
    if (typeof AbortController === 'undefined') {
      missing.push('AbortController');
    }
    
    return {
      available: missing.length === 0,
      missing
    };
  }
};

// Import for local usage in this file
import { CompliantApiClient, ApiCallResult } from './client/compliantApiClient'; 