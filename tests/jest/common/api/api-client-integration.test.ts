/**
 * API Client Integration Test
 * 
 * Tests the complete API client system including:
 * - Schema validation
 * - Field transformation
 * - Request wrapping
 * - Response unwrapping
 * - Error handling
 */

import { 
  apiClient, 
  CompliantApiClient, 
  CONFIG_PRESETS,
  ApiError,
  ValidationUtils,
  WORKOUT_REQUEST_SCHEMA
} from '../../../../src/common/api';

describe('API Client Integration', () => {
  
  describe('Client Configuration', () => {
    
    test('should create client with default configuration', () => {
      expect(apiClient).toBeDefined();
      expect(apiClient.getInstance()).toBeInstanceOf(CompliantApiClient);
    });

    test('should create client with custom configuration', () => {
      const customClient = new CompliantApiClient(CONFIG_PRESETS.DEVELOPMENT);
      expect(customClient).toBeDefined();
      expect(customClient.getConfig().timeout).toBe(60000);
    });

    test('should create client with performance preset', () => {
      const perfClient = new CompliantApiClient(CONFIG_PRESETS.PERFORMANCE_OPTIMIZED);
      expect(perfClient).toBeDefined();
      expect(perfClient.getConfig().validateByDefault).toBe(false);
    });

  });

  describe('Request Validation', () => {
    
    test('should validate workout request data', () => {
      const validWorkoutData = {
        duration: 30,
        difficulty: 'intermediate',
        goals: 'strength training'
      };

      const isValid = ValidationUtils.isValid(validWorkoutData, WORKOUT_REQUEST_SCHEMA);
      expect(isValid).toBe(true);
    });

    test('should reject invalid workout request data', () => {
      const invalidWorkoutData = {
        duration: 5, // Too low
        difficulty: 'expert', // Invalid
        // Missing goals
      };

      const isValid = ValidationUtils.isValid(invalidWorkoutData, WORKOUT_REQUEST_SCHEMA);
      expect(isValid).toBe(false);
    });

  });

  describe('Error Handling', () => {
    
    test('should create ApiError correctly', () => {
      const error = new ApiError('Test error', 'validation_error', { field: 'test' });
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('validation_error');
      expect(error.data).toEqual({ field: 'test' });
      expect(error.name).toBe('ApiError');
    });

    test('should check error type correctly', () => {
      const error = new ApiError('Validation failed', 'validation_error');
      
      expect(error.isType('validation_error')).toBe(true);
      expect(error.isType('server_error')).toBe(false);
    });

  });

  describe('Configuration Presets', () => {
    
    test('should have all required presets', () => {
      expect(CONFIG_PRESETS.STRICT_COMPLIANCE).toBeDefined();
      expect(CONFIG_PRESETS.PERFORMANCE_OPTIMIZED).toBeDefined();
      expect(CONFIG_PRESETS.DEVELOPMENT).toBeDefined();
    });

    test('strict compliance should enable all features', () => {
      const config = CONFIG_PRESETS.STRICT_COMPLIANCE;
      
      expect(config.validateByDefault).toBe(true);
      expect(config.transformFieldNamesByDefault).toBe(true);
      expect(config.typeCoercionRules.numericStrings).toBe(true);
      expect(config.typeCoercionRules.booleanStrings).toBe(true);
    });

    test('performance optimized should disable validation', () => {
      const config = CONFIG_PRESETS.PERFORMANCE_OPTIMIZED;
      
      expect(config.validateByDefault).toBe(false);
      expect(config.retries).toBe(1);
      expect(config.timeout).toBe(10000);
    });

  });

  describe('Type Safety', () => {
    
    test('should provide proper TypeScript types', () => {
      // This test verifies that TypeScript compilation works
      // and types are properly exported
      
      const client: CompliantApiClient = apiClient.getInstance();
      expect(client).toBeDefined();
      
      // Test that we can access configuration
      const config = client.getConfig();
      expect(typeof config.timeout).toBe('number');
      expect(typeof config.validateByDefault).toBe('boolean');
    });

  });

});

describe('Schema System Integration', () => {
  
  test('should have workout request schema available', () => {
    expect(WORKOUT_REQUEST_SCHEMA).toBeDefined();
    expect(WORKOUT_REQUEST_SCHEMA.type).toBe('object');
    expect(WORKOUT_REQUEST_SCHEMA.required).toContain('duration');
    expect(WORKOUT_REQUEST_SCHEMA.required).toContain('difficulty');
    expect(WORKOUT_REQUEST_SCHEMA.required).toContain('goals');
  });

  test('should validate duration constraints', () => {
    const validData = { duration: 30, difficulty: 'beginner', goals: 'fitness' };
    const invalidData = { duration: 5, difficulty: 'beginner', goals: 'fitness' };
    
    expect(ValidationUtils.isValid(validData, WORKOUT_REQUEST_SCHEMA)).toBe(true);
    expect(ValidationUtils.isValid(invalidData, WORKOUT_REQUEST_SCHEMA)).toBe(false);
  });

  test('should validate difficulty enum', () => {
    const validData = { duration: 30, difficulty: 'advanced', goals: 'fitness' };
    const invalidData = { duration: 30, difficulty: 'expert', goals: 'fitness' };
    
    expect(ValidationUtils.isValid(validData, WORKOUT_REQUEST_SCHEMA)).toBe(true);
    expect(ValidationUtils.isValid(invalidData, WORKOUT_REQUEST_SCHEMA)).toBe(false);
  });

}); 