/**
 * Compliant API Client
 * 
 * Main API client that enforces strict compliance with FitCopilot API Design Guidelines.
 * Integrates validation, transformation, wrapping, and type safety.
 */

import { 
  ApiResponse, 
  ApiErrorCode, 
  CompliantApiRequestOptions,
  ApiClientConfig,
  EndpointDefinition,
  ResourceType
} from '../types/guidelines';
import { EndpointRegistry, buildEndpointPath } from '../schemas/endpoints';
import { SchemaValidator, SchemaRegistry, ValidationResult } from '../validation/schemaValidator';
import { 
  RequestResponseTransformer, 
  ApiError,
  createApiErrorFromResponse 
} from '../transformers/requestTransformer';
import { FieldTransformerFactory } from '../transformers/fieldTransformer';

/**
 * Request configuration for individual API calls
 */
export interface ApiRequestConfig extends Partial<CompliantApiRequestOptions> {
  /** Endpoint name from registry */
  endpoint?: string;
  /** Path parameters for endpoints with placeholders */
  pathParams?: Record<string, string | number>;
  /** Skip validation for this request */
  skipValidation?: boolean;
  /** Skip transformation for this request */
  skipTransformation?: boolean;
}

/**
 * Response information returned with API calls
 */
export interface ApiCallResult<T> {
  /** The response data */
  data: T;
  /** Whether the request was successful */
  success: boolean;
  /** Human-readable message */
  message: string;
  /** Response metadata */
  metadata: {
    endpoint: string;
    duration: number;
    validated: boolean;
    transformed: boolean;
  };
}

/**
 * Default API client configuration
 */
const DEFAULT_CLIENT_CONFIG: ApiClientConfig = {
  baseUrl: '/wp-json/fitcopilot/v1',
  timeout: 180000, // 3 minutes to match backend timeout
  retries: 3,
  validateByDefault: true,
  transformFieldNamesByDefault: true,
  typeCoercionRules: {
    numericStrings: true,
    booleanStrings: true,
    emptyStringToNull: true,
    arrayItemValidation: true
  },
  errorMapping: {}
};

/**
 * Compliant API Client Class
 */
export class CompliantApiClient {
  private config: ApiClientConfig;
  private transformer: RequestResponseTransformer;
  private validator: SchemaValidator;
  private baseHeaders: Record<string, string>;

  constructor(
    config: Partial<ApiClientConfig> = {},
    customTransformer?: FieldTransformerFactory
  ) {
    this.config = { ...DEFAULT_CLIENT_CONFIG, ...config };
    this.transformer = new RequestResponseTransformer(customTransformer);
    this.validator = new SchemaValidator();
    
    // Setup base headers
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add WordPress nonce if available
    if (typeof window !== 'undefined' && (window as any).wpApiSettings?.nonce) {
      this.baseHeaders['X-WP-Nonce'] = (window as any).wpApiSettings.nonce;
    }
  }

  /**
   * Make a compliant API request using endpoint registry
   */
  async request<TRequest, TResponse>(
    endpointName: string,
    data?: TRequest,
    config: ApiRequestConfig = {}
  ): Promise<ApiCallResult<TResponse>> {
    const startTime = Date.now();
    
    // Get endpoint definition
    const endpoint = EndpointRegistry.getEndpoint(endpointName);
    if (!endpoint) {
      throw new Error(`Unknown endpoint: ${endpointName}`);
    }

    // Build the request
    const requestConfig = this.buildRequestConfig(endpoint, data, config);
    const validatedData = await this.validateRequest(data, endpoint, config);
    const transformedData = this.transformRequest(validatedData, endpoint, config);
    
    try {
      // Make the HTTP request
      const response = await this.makeHttpRequest(
        requestConfig.url,
        {
          method: endpoint.method,
          headers: requestConfig.headers,
          body: transformedData ? JSON.stringify(transformedData) : undefined,
          signal: this.createTimeoutSignal(config.timeout)
        }
      );

      // Process the response
      const responseData = await this.processResponse<TResponse>(response, endpoint, config);
      
      return {
        data: responseData,
        success: true,
        message: 'Request completed successfully',
        metadata: {
          endpoint: endpointName,
          duration: Date.now() - startTime,
          validated: !config.skipValidation,
          transformed: !config.skipTransformation
        }
      };

    } catch (error) {
      throw this.handleRequestError(error, endpointName, Date.now() - startTime);
    }
  }

  /**
   * Convenience methods for common operations
   */

  /**
   * Generate workout
   */
  async generateWorkout<T, R>(data: T): Promise<ApiCallResult<R>> {
    return this.request<T, R>('GENERATE_WORKOUT', data);
  }

  /**
   * Get workouts list
   */
  async getWorkouts<T>(): Promise<ApiCallResult<T[]>> {
    return this.request<undefined, T[]>('GET_WORKOUTS');
  }

  /**
   * Get specific workout
   */
  async getWorkout<T>(id: string | number): Promise<ApiCallResult<T>> {
    return this.request<undefined, T>('GET_WORKOUT', undefined, {
      pathParams: { id }
    });
  }

  /**
   * Update workout
   */
  async updateWorkout<T, R>(id: string | number, data: T): Promise<ApiCallResult<R>> {
    return this.request<T, R>('UPDATE_WORKOUT', data, {
      pathParams: { id }
    });
  }

  /**
   * Delete workout
   */
  async deleteWorkout(id: string | number): Promise<ApiCallResult<void>> {
    return this.request<undefined, void>('DELETE_WORKOUT', undefined, {
      pathParams: { id }
    });
  }

  /**
   * Complete workout
   */
  async completeWorkout<T, R>(id: string | number, data?: T): Promise<ApiCallResult<R>> {
    return this.request<T, R>('COMPLETE_WORKOUT', data, {
      pathParams: { id }
    });
  }

  /**
   * Get user profile
   */
  async getProfile<T>(): Promise<ApiCallResult<T>> {
    return this.request<undefined, T>('GET_PROFILE');
  }

  /**
   * Update user profile
   */
  async updateProfile<T, R>(data: T): Promise<ApiCallResult<R>> {
    return this.request<T, R>('UPDATE_PROFILE', data);
  }

  /**
   * Build request configuration
   */
  private buildRequestConfig(
    endpoint: EndpointDefinition,
    data: any,
    config: ApiRequestConfig
  ): { url: string; headers: Record<string, string> } {
    // Build URL with path parameters
    const path = config.pathParams 
      ? buildEndpointPath(config.endpoint || '', config.pathParams)
      : endpoint.path;
    
    const url = `${this.config.baseUrl}${path}`;

    // Merge headers
    const headers = {
      ...this.baseHeaders,
      ...(config.headers || {})
    };

    return { url, headers };
  }

  /**
   * Validate request data
   */
  private async validateRequest<T>(
    data: T,
    endpoint: EndpointDefinition,
    config: ApiRequestConfig
  ): Promise<T> {
    // Skip validation if disabled
    if (config.skipValidation || !this.config.validateByDefault || !endpoint.requestSchema) {
      return data;
    }

    const result = this.validator.validate(data, endpoint.requestSchema);
    
    if (!result.isValid) {
      const validationError = new ApiError(
        'Request validation failed',
        ApiErrorCode.VALIDATION_ERROR,
        { validation_errors: this.formatValidationErrors(result) }
      );
      throw validationError;
    }

    return data;
  }

  /**
   * Transform request data
   */
  private transformRequest<T>(
    data: T,
    endpoint: EndpointDefinition,
    config: ApiRequestConfig
  ): any {
    // Skip transformation if disabled
    if (config.skipTransformation || !endpoint.transformFieldNames) {
      return data;
    }

    // Handle wrapping and transformation
    const shouldWrap = endpoint.requiresWrapping;
    const resourceType = endpoint.resourceType;

    return this.transformer.prepareRequest(data, resourceType, shouldWrap);
  }

  /**
   * Make HTTP request with retries
   */
  private async makeHttpRequest(
    url: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (retryCount < this.config.retries) {
        // Wait before retry with exponential backoff
        await this.delay(Math.pow(2, retryCount) * 1000);
        return this.makeHttpRequest(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Process API response
   */
  private async processResponse<T>(
    response: Response,
    endpoint: EndpointDefinition,
    config: ApiRequestConfig
  ): Promise<T> {
    let responseData: any;
    
    try {
      responseData = await response.json();
    } catch (error) {
      throw new ApiError(
        'Invalid JSON response from server',
        ApiErrorCode.SERVER_ERROR
      );
    }

    // Process through transformer
    try {
      return this.transformer.processResponse<T>(responseData);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Failed to process server response',
        ApiErrorCode.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  /**
   * Handle request errors
   */
  private handleRequestError(error: any, endpoint: string, duration: number): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    // Handle fetch errors
    if (error.name === 'AbortError') {
      return new ApiError(
        `Request timeout after ${this.config.timeout}ms`,
        ApiErrorCode.SERVER_ERROR
      );
    }

    // Handle network errors
    if (error.message?.includes('Failed to fetch')) {
      return new ApiError(
        'Network error: Unable to reach server',
        ApiErrorCode.SERVER_ERROR
      );
    }

    // Generic error
    return new ApiError(
      error.message || 'An unexpected error occurred',
      ApiErrorCode.SERVER_ERROR,
      { endpoint, duration, originalError: error }
    );
  }

  /**
   * Format validation errors for API response
   */
  private formatValidationErrors(result: ValidationResult): Record<string, string> {
    return result.errors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Create timeout signal
   */
  private createTimeoutSignal(timeout?: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout || this.config.timeout);
    return controller.signal;
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update client configuration
   */
  updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiClientConfig {
    return { ...this.config };
  }
}

/**
 * Default client instance (lazy initialization)
 */
let _apiClient: CompliantApiClient | null = null;

export const apiClient = {
  getInstance(): CompliantApiClient {
    if (!_apiClient) {
      _apiClient = new CompliantApiClient();
    }
    return _apiClient;
  },
  
  // Proxy all methods to the lazy instance
  async generateWorkout<T, R>(data: T): Promise<ApiCallResult<R>> {
    const instance = this.getInstance();
    return instance.generateWorkout<T, R>(data);
  },
  
  async getWorkouts<T>(): Promise<ApiCallResult<T[]>> {
    const instance = this.getInstance();
    return instance.getWorkouts<T>();
  },
  
  async getWorkout<T>(id: string | number): Promise<ApiCallResult<T>> {
    const instance = this.getInstance();
    return instance.getWorkout<T>(id);
  },
  
  async updateWorkout<T, R>(id: string | number, data: T): Promise<ApiCallResult<R>> {
    const instance = this.getInstance();
    return instance.updateWorkout<T, R>(id, data);
  },
  
  async deleteWorkout(id: string | number): Promise<ApiCallResult<void>> {
    const instance = this.getInstance();
    return instance.deleteWorkout(id);
  },
  
  async completeWorkout<T, R>(id: string | number, data?: T): Promise<ApiCallResult<R>> {
    const instance = this.getInstance();
    return instance.completeWorkout<T, R>(id, data);
  },
  
  async getProfile<T>(): Promise<ApiCallResult<T>> {
    const instance = this.getInstance();
    return instance.getProfile<T>();
  },
  
  async updateProfile<T, R>(data: T): Promise<ApiCallResult<R>> {
    const instance = this.getInstance();
    return instance.updateProfile<T, R>(data);
  },
  
  updateConfig(config: Partial<ApiClientConfig>): void {
    this.getInstance().updateConfig(config);
  },
  
  getConfig(): ApiClientConfig {
    return this.getInstance().getConfig();
  }
};

/**
 * Create configured client for WordPress
 */
export function createWordPressApiClient(config?: Partial<ApiClientConfig>): CompliantApiClient {
  return new CompliantApiClient(config, FieldTransformerFactory.forWordPress());
}

/**
 * Export client factory for custom configurations
 */
export { CompliantApiClient as ApiClient }; 