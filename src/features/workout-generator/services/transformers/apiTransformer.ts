/**
 * API Request/Response Transformer
 * 
 * Handles transformation of data for API communication.
 * Extracted from workoutService.ts for better separation of concerns.
 */
import { logger } from '../utils/logger';

/**
 * Transform workout data for API generation request
 */
export function transformForGeneration(formData: any): any {
  logger.debug('Transforming form data for workout generation API', {
    hasFormData: !!formData,
    formDataKeys: formData ? Object.keys(formData) : []
  });

  // Basic transformation for generation request
  const apiRequest = {
    ...formData,
    // Ensure required fields have defaults
    difficulty: formData.difficulty || 'intermediate',
    duration: formData.duration || 30,
    // Add any additional API-specific formatting here
  };

  logger.debug('Generation API request prepared', {
    difficulty: apiRequest.difficulty,
    duration: apiRequest.duration,
    hasSessionInputs: !!apiRequest.sessionInputs
  });

  return apiRequest;
}

/**
 * Transform API response for frontend consumption
 */
export function transformApiResponse(apiResponse: any): any {
  logger.debug('Transforming API response for frontend', {
    hasResponse: !!apiResponse,
    responseKeys: apiResponse ? Object.keys(apiResponse) : []
  });

  if (!apiResponse) {
    throw new Error('No API response provided for transformation');
  }

  // Handle different API response formats
  let transformedResponse = apiResponse;

  // If response is wrapped in a data property
  if (apiResponse.data && typeof apiResponse.data === 'object') {
    transformedResponse = apiResponse.data;
  }

  // If response has success/error structure
  if (apiResponse.success !== undefined) {
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'API request failed');
    }
    transformedResponse = apiResponse.data || apiResponse;
  }

  logger.debug('API response transformation completed', {
    hasTransformedData: !!transformedResponse,
    transformedKeys: transformedResponse ? Object.keys(transformedResponse) : []
  });

  return transformedResponse;
} 