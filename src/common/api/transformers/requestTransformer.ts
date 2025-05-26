/**
 * Request/Response Wrapper Engine
 * 
 * Handles automatic wrapping/unwrapping of requests and responses
 * according to the API design guidelines format specifications.
 */

import { 
  ApiResponse, 
  ApiErrorResponse, 
  ApiSuccessResponse,
  WrappedRequest, 
  ResourceType,
  ApiErrorCode,
  HTTP_STATUS_TO_ERROR_CODE,
  isApiResponse,
  isApiErrorResponse,
  isApiSuccessResponse
} from '../types/guidelines';
import { 
  transformRequestForBackend, 
  transformResponseFromBackend,
  FieldTransformerFactory 
} from './fieldTransformer';

/**
 * Request wrapping configuration
 */
export interface RequestWrapperConfig {
  resourceType: ResourceType | string;
  transformFieldNames?: boolean;
  preserveFields?: string[];
}

/**
 * Response unwrapping configuration
 */
export interface ResponseUnwrapperConfig {
  transformFieldNames?: boolean;
  preserveFields?: string[];
  validateStructure?: boolean;
}

/**
 * Wrap request data according to API design guidelines
 */
export function wrapRequest<T>(
  data: T, 
  config: RequestWrapperConfig
): WrappedRequest<T, string> {
  const { resourceType, transformFieldNames = true, preserveFields = [] } = config;
  
  // Transform field names if requested
  const transformedData = transformFieldNames 
    ? transformRequestForBackend(data, preserveFields)
    : data;
  
  // Create wrapped format: { resourceType: data }
  return {
    [resourceType]: transformedData
  } as WrappedRequest<T, string>;
}

/**
 * Unwrap request data for processing
 */
export function unwrapRequest<T>(
  wrappedData: WrappedRequest<T, string>,
  expectedResourceType: string
): T {
  const resourceData = wrappedData[expectedResourceType];
  
  if (!resourceData) {
    throw new Error(`Expected resource type '${expectedResourceType}' not found in request`);
  }
  
  return resourceData;
}

/**
 * Transform raw response into standardized API response format
 */
export function wrapResponse<T>(
  data: T | null,
  success: boolean,
  message: string,
  errorCode?: ApiErrorCode
): ApiResponse<T> {
  if (!success && errorCode) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      data: null,
      message,
      code: errorCode
    };
    return errorResponse as ApiResponse<T>;
  }
  
  const successResponse: ApiSuccessResponse<T> = {
    success: true,
    data: data as T,
    message
  };
  return successResponse as ApiResponse<T>;
}

/**
 * Unwrap and validate API response
 */
export function unwrapResponse<T>(
  response: unknown,
  config: ResponseUnwrapperConfig = {}
): T {
  const { transformFieldNames = true, preserveFields = [], validateStructure = true } = config;
  
  // Validate response structure if requested
  if (validateStructure && !isApiResponse(response)) {
    throw new Error('Invalid API response format: missing required fields (success, data, message)');
  }
  
  const apiResponse = response as ApiResponse<T>;
  
  // Handle error responses
  if (isApiErrorResponse(apiResponse)) {
    throw new ApiError(
      apiResponse.message,
      apiResponse.code,
      apiResponse.data
    );
  }
  
  // Handle success responses
  if (isApiSuccessResponse(apiResponse)) {
    const responseData = apiResponse.data;
    
    // Transform field names if requested
    if (transformFieldNames && responseData) {
      return transformResponseFromBackend(responseData, preserveFields);
    }
    
    return responseData;
  }
  
  throw new Error('Invalid API response: neither success nor error format');
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly data?: any;
  
  constructor(message: string, code: ApiErrorCode, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
  
  /**
   * Check if error is of specific type
   */
  isType(code: ApiErrorCode): boolean {
    return this.code === code;
  }
  
  /**
   * Get validation errors if this is a validation error
   */
  getValidationErrors(): Record<string, string> | undefined {
    if (this.code === ApiErrorCode.VALIDATION_ERROR && this.data?.validation_errors) {
      return this.data.validation_errors;
    }
    return undefined;
  }
}

/**
 * Create API error from HTTP response
 */
export function createApiErrorFromResponse(
  status: number,
  responseText: string,
  responseJson?: any
): ApiError {
  const errorCode = HTTP_STATUS_TO_ERROR_CODE[status] || ApiErrorCode.SERVER_ERROR;
  
  // If we have structured error response, use it
  if (responseJson && isApiErrorResponse(responseJson)) {
    return new ApiError(responseJson.message, responseJson.code, responseJson.data);
  }
  
  // Create generic error from HTTP status
  const message = getDefaultErrorMessage(status, responseText);
  return new ApiError(message, errorCode);
}

/**
 * Get default error message for HTTP status
 */
function getDefaultErrorMessage(status: number, responseText: string): string {
  const genericMessages: Record<number, string> = {
    400: 'Bad request: The request was invalid',
    401: 'Authentication required: Please log in',
    403: 'Access denied: You do not have permission for this action',
    404: 'Not found: The requested resource does not exist',
    422: 'Validation failed: Please check your input',
    429: 'Rate limit exceeded: Please try again later',
    500: 'Server error: Something went wrong on our end'
  };
  
  return genericMessages[status] || `HTTP ${status}: ${responseText}`;
}

/**
 * Request/Response transformer with automatic wrapping/unwrapping
 */
export class RequestResponseTransformer {
  private fieldTransformer: FieldTransformerFactory;
  
  constructor(fieldTransformer?: FieldTransformerFactory) {
    this.fieldTransformer = fieldTransformer || FieldTransformerFactory.forWordPress();
  }
  
  /**
   * Prepare request for sending to backend
   */
  prepareRequest<T>(
    data: T,
    resourceType?: ResourceType | string,
    shouldWrap: boolean = true
  ): T | WrappedRequest<T, string> {
    // Transform field names to backend format
    const transformedData = this.fieldTransformer.transformToBackend(data);
    
    // Wrap if required and resourceType provided
    if (shouldWrap && resourceType) {
      return wrapRequest(transformedData, { 
        resourceType,
        transformFieldNames: false // Already transformed
      });
    }
    
    return transformedData;
  }
  
  /**
   * Process response from backend
   */
  processResponse<T>(response: unknown, validateStructure: boolean = true): T {
    return unwrapResponse<T>(response, {
      transformFieldNames: true,
      preserveFields: this.fieldTransformer['preserveFields'],
      validateStructure
    });
  }
  
  /**
   * Create success response
   */
  createSuccessResponse<T>(data: T, message: string): ApiSuccessResponse<T> {
    return wrapResponse(data, true, message) as ApiSuccessResponse<T>;
  }
  
  /**
   * Create error response
   */
  createErrorResponse(message: string, code: ApiErrorCode, data?: any): ApiErrorResponse {
    return wrapResponse(null, false, message, code) as ApiErrorResponse;
  }
}

/**
 * Default transformer instance (lazy initialization)
 */
let _defaultTransformer: RequestResponseTransformer | null = null;

export const defaultTransformer = {
  getInstance(): RequestResponseTransformer {
    if (!_defaultTransformer) {
      _defaultTransformer = new RequestResponseTransformer();
    }
    return _defaultTransformer;
  },
  
  // Proxy methods to the lazy instance
  prepareRequest<T>(
    data: T,
    resourceType?: ResourceType | string,
    shouldWrap: boolean = true
  ): T | WrappedRequest<T, string> {
    return this.getInstance().prepareRequest(data, resourceType, shouldWrap);
  },
  
  processResponse<T>(response: unknown, validateStructure: boolean = true): T {
    const instance = this.getInstance();
    return instance.processResponse<T>(response, validateStructure);
  },
  
  createSuccessResponse<T>(data: T, message: string): ApiSuccessResponse<T> {
    return this.getInstance().createSuccessResponse(data, message);
  },
  
  createErrorResponse(message: string, code: ApiErrorCode, data?: any): ApiErrorResponse {
    return this.getInstance().createErrorResponse(message, code, data);
  }
};

/**
 * Utility functions for common transformations
 */
export const RequestUtils = {
  /**
   * Prepare workout generation request
   */
  prepareWorkoutRequest<T>(data: T): WrappedRequest<T, 'workout'> {
    return wrapRequest(data, { 
      resourceType: ResourceType.WORKOUT,
      transformFieldNames: true
    });
  },
  
  /**
   * Prepare profile update request
   */
  prepareProfileRequest<T>(data: T): WrappedRequest<T, 'profile'> {
    return wrapRequest(data, { 
      resourceType: ResourceType.PROFILE,
      transformFieldNames: true
    });
  },
  
  /**
   * Prepare completion request
   */
  prepareCompletionRequest<T>(data: T): WrappedRequest<T, 'completion'> {
    return wrapRequest(data, { 
      resourceType: ResourceType.COMPLETION,
      transformFieldNames: true
    });
  }
};

/**
 * Response utilities
 */
export const ResponseUtils = {
  /**
   * Check if response indicates success
   */
  isSuccess(response: unknown): boolean {
    return isApiResponse(response) && response.success === true;
  },
  
  /**
   * Check if response indicates error
   */
  isError(response: unknown): boolean {
    return isApiResponse(response) && response.success === false;
  },
  
  /**
   * Extract error information from response
   */
  getErrorInfo(response: unknown): { message: string; code?: string; data?: any } | null {
    if (isApiErrorResponse(response)) {
      return {
        message: response.message,
        code: response.code,
        data: response.data
      };
    }
    return null;
  },
  
  /**
   * Extract success data from response
   */
  getSuccessData<T>(response: unknown): T | null {
    if (isApiSuccessResponse<T>(response)) {
      return response.data;
    }
    return null;
  }
}; 