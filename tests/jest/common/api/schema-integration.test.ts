/**
 * Schema Integration Tests
 * 
 * Tests to verify that schema definitions work correctly with the AJV validation system
 * and that the endpoint registry functions properly.
 */

import { 
  WORKOUT_REQUEST_SCHEMA,
  WORKOUT_RESPONSE_SCHEMA,
  PROFILE_REQUEST_SCHEMA,
  API_ENDPOINTS,
  EndpointRegistry,
  buildEndpointPath,
  EndpointBuilders
} from '../../../../src/common/api/schemas/endpoints';

import { 
  defaultValidator,
  SchemaRegistry 
} from '../../../../src/common/api/validation/schemaValidator';

import { ResourceType } from '../../../../src/common/api/types/guidelines';

describe('Schema Integration Tests', () => {
  
  describe('Workout Request Schema', () => {
    test('should validate valid workout request', () => {
      const validWorkoutRequest = {
        duration: 30,
        difficulty: 'intermediate',
        goals: 'strength training',
        equipment: ['dumbbells', 'resistance-bands'],
        restrictions: 'knee injury',
        preferences: 'morning workouts'
      };

      const result = defaultValidator.validate(validWorkoutRequest, WORKOUT_REQUEST_SCHEMA);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject workout request with invalid difficulty', () => {
      const invalidWorkoutRequest = {
        duration: 30,
        difficulty: 'expert', // Invalid value
        goals: 'strength training'
      };

      const result = defaultValidator.validate(invalidWorkoutRequest, WORKOUT_REQUEST_SCHEMA);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('must be one of');
    });

    test('should reject workout request with missing required fields', () => {
      const incompleteWorkoutRequest = {
        duration: 30
        // Missing difficulty and goals
      };

      const result = defaultValidator.validate(incompleteWorkoutRequest, WORKOUT_REQUEST_SCHEMA);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const errorMessages = result.errors.map(e => e.message);
      expect(errorMessages.some(msg => msg.includes('difficulty'))).toBe(true);
      expect(errorMessages.some(msg => msg.includes('goals'))).toBe(true);
    });

    test('should reject workout request with invalid duration', () => {
      const invalidDurationRequest = {
        duration: 5, // Too low (minimum is 10)
        difficulty: 'beginner',
        goals: 'cardio'
      };

      const result = defaultValidator.validate(invalidDurationRequest, WORKOUT_REQUEST_SCHEMA);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('must be at least 10');
    });

    test('should perform type coercion on workout request', () => {
      const workoutRequestWithStrings = {
        duration: "45", // String that should be coerced to number
        difficulty: 'advanced',
        goals: 'muscle building'
      };

      const result = defaultValidator.validateAndTransform(workoutRequestWithStrings, WORKOUT_REQUEST_SCHEMA);
      
      expect(result.isValid).toBe(true);
      expect(result.data?.duration).toBe(45);
      expect(typeof result.data?.duration).toBe('number');
    });
  });

  describe('Workout Response Schema', () => {
    test('should validate valid workout response', () => {
      const validWorkoutResponse = {
        id: 123,
        title: 'Full Body Strength Training',
        date: '2023-07-15T14:30:00Z',
        duration: 45,
        difficulty: 'intermediate',
        content: 'Detailed workout instructions...'
      };

      const result = defaultValidator.validate(validWorkoutResponse, WORKOUT_RESPONSE_SCHEMA);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject workout response with invalid date format', () => {
      const invalidDateResponse = {
        id: 123,
        title: 'Test Workout',
        date: 'not-a-date',
        duration: 30,
        difficulty: 'beginner'
      };

      const result = defaultValidator.validate(invalidDateResponse, WORKOUT_RESPONSE_SCHEMA);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('must be a valid date-time');
    });
  });

  describe('Profile Request Schema', () => {
    test('should validate complete profile request', () => {
      const validProfileRequest = {
        fitnessLevel: 'intermediate',
        workoutGoals: ['strength', 'endurance'],
        equipmentAvailable: 'home gym',
        workoutFrequency: 3,
        workoutDuration: 45,
        preferences: {
          darkMode: true,
          metrics: 'metric'
        }
      };

      const result = defaultValidator.validate(validProfileRequest, PROFILE_REQUEST_SCHEMA);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject profile with invalid nested preferences', () => {
      const invalidProfileRequest = {
        fitnessLevel: 'intermediate',
        workoutGoals: ['strength'],
        equipmentAvailable: 'gym',
        workoutFrequency: 3,
        workoutDuration: 45,
        preferences: {
          darkMode: 'yes', // Should be boolean
          metrics: 'pounds' // Should be 'imperial' or 'metric'
        }
      };

      const result = defaultValidator.validate(invalidProfileRequest, PROFILE_REQUEST_SCHEMA);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject profile with empty workout goals array', () => {
      const invalidProfileRequest = {
        fitnessLevel: 'beginner',
        workoutGoals: [], // Empty array (minItems: 1)
        equipmentAvailable: 'bodyweight',
        workoutFrequency: 2,
        workoutDuration: 30,
        preferences: {
          darkMode: false,
          metrics: 'imperial'
        }
      };

      const result = defaultValidator.validate(invalidProfileRequest, PROFILE_REQUEST_SCHEMA);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('must NOT have fewer than 1 items');
    });
  });

  describe('Endpoint Registry', () => {
    test('should retrieve endpoint definitions correctly', () => {
      const generateEndpoint = EndpointRegistry.getEndpoint('GENERATE_WORKOUT');
      
      expect(generateEndpoint).toBeDefined();
      expect(generateEndpoint?.path).toBe('/generate');
      expect(generateEndpoint?.method).toBe('POST');
      expect(generateEndpoint?.requiresAuth).toBe(true);
      expect(generateEndpoint?.requiresWrapping).toBe(true);
      expect(generateEndpoint?.resourceType).toBe(ResourceType.WORKOUT);
    });

    test('should return undefined for unknown endpoints', () => {
      const unknownEndpoint = EndpointRegistry.getEndpoint('UNKNOWN_ENDPOINT');
      
      expect(unknownEndpoint).toBeUndefined();
    });

    test('should filter endpoints by method', () => {
      const postEndpoints = EndpointRegistry.getEndpointsByMethod('POST');
      
      expect(Object.keys(postEndpoints).length).toBeGreaterThan(0);
      Object.values(postEndpoints).forEach(endpoint => {
        expect(endpoint.method).toBe('POST');
      });
    });

    test('should filter endpoints by resource type', () => {
      const workoutEndpoints = EndpointRegistry.getEndpointsByResource(ResourceType.WORKOUT);
      
      expect(Object.keys(workoutEndpoints).length).toBeGreaterThan(0);
      Object.values(workoutEndpoints).forEach(endpoint => {
        expect(endpoint.resourceType).toBe(ResourceType.WORKOUT);
      });
    });

    test('should check wrapping requirements correctly', () => {
      expect(EndpointRegistry.requiresWrapping('GENERATE_WORKOUT')).toBe(true);
      expect(EndpointRegistry.requiresWrapping('GET_WORKOUTS')).toBe(false);
    });

    test('should get resource type correctly', () => {
      expect(EndpointRegistry.getResourceType('GENERATE_WORKOUT')).toBe(ResourceType.WORKOUT);
      expect(EndpointRegistry.getResourceType('UPDATE_PROFILE')).toBe(ResourceType.PROFILE);
    });
  });

  describe('Path Building', () => {
    test('should build simple paths without parameters', () => {
      const path = buildEndpointPath('GENERATE_WORKOUT');
      expect(path).toBe('/generate');
    });

    test('should build paths with parameters', () => {
      const path = buildEndpointPath('GET_WORKOUT', { id: 123 });
      expect(path).toBe('/workouts/123');
    });

    test('should handle string and number parameters', () => {
      const pathWithString = buildEndpointPath('GET_WORKOUT', { id: 'abc-123' });
      const pathWithNumber = buildEndpointPath('GET_WORKOUT', { id: 456 });
      
      expect(pathWithString).toBe('/workouts/abc-123');
      expect(pathWithNumber).toBe('/workouts/456');
    });

    test('should throw error for missing parameters', () => {
      expect(() => {
        buildEndpointPath('GET_WORKOUT'); // Missing required {id} parameter
      }).toThrow('Missing path parameters: {id}');
    });

    test('should throw error for unknown endpoints', () => {
      expect(() => {
        buildEndpointPath('UNKNOWN_ENDPOINT');
      }).toThrow('Unknown endpoint: UNKNOWN_ENDPOINT');
    });
  });

  describe('Endpoint Builders', () => {
    test('should build workout-related paths correctly', () => {
      expect(EndpointBuilders.getWorkout(123)).toBe('/workouts/123');
      expect(EndpointBuilders.updateWorkout('abc')).toBe('/workouts/abc');
      expect(EndpointBuilders.deleteWorkout(456)).toBe('/workouts/456');
      expect(EndpointBuilders.completeWorkout('xyz')).toBe('/workouts/xyz/complete');
      expect(EndpointBuilders.getWorkoutVersions(789)).toBe('/workouts/789/versions');
    });
  });

  describe('Schema Registry Integration', () => {
    beforeEach(() => {
      SchemaRegistry.clear();
    });

    test('should register and use workout schemas', () => {
      SchemaRegistry.registerSchema('workout-request', WORKOUT_REQUEST_SCHEMA);
      SchemaRegistry.registerSchema('workout-response', WORKOUT_RESPONSE_SCHEMA);

      const validRequest = {
        duration: 30,
        difficulty: 'beginner',
        goals: 'weight loss'
      };

      const validResponse = {
        id: 1,
        title: 'Beginner Workout',
        date: '2023-07-15T10:00:00Z',
        duration: 30,
        difficulty: 'beginner'
      };

      const requestResult = SchemaRegistry.validate(validRequest, 'workout-request');
      const responseResult = SchemaRegistry.validate(validResponse, 'workout-response');

      expect(requestResult.isValid).toBe(true);
      expect(responseResult.isValid).toBe(true);
    });

    test('should register and use profile schema', () => {
      SchemaRegistry.registerSchema('profile-request', PROFILE_REQUEST_SCHEMA);

      const validProfile = {
        fitnessLevel: 'advanced',
        workoutGoals: ['strength', 'flexibility'],
        equipmentAvailable: 'full gym',
        workoutFrequency: 5,
        workoutDuration: 60,
        preferences: {
          darkMode: true,
          metrics: 'imperial'
        }
      };

      const result = SchemaRegistry.validate(validProfile, 'profile-request');
      expect(result.isValid).toBe(true);
    });
  });

  describe('API Endpoints Configuration', () => {
    test('should have all required endpoints defined', () => {
      const requiredEndpoints = [
        'GENERATE_WORKOUT',
        'GET_WORKOUTS',
        'GET_WORKOUT',
        'CREATE_WORKOUT',
        'UPDATE_WORKOUT',
        'DELETE_WORKOUT',
        'COMPLETE_WORKOUT',
        'GET_PROFILE',
        'UPDATE_PROFILE'
      ];

      requiredEndpoints.forEach(endpointName => {
        const endpoint = EndpointRegistry.getEndpoint(endpointName);
        expect(endpoint).toBeDefined();
        expect(endpoint?.path).toBeDefined();
        expect(endpoint?.method).toBeDefined();
      });
    });

    test('should have consistent authentication requirements', () => {
      const allEndpoints = EndpointRegistry.getAllEndpoints();
      
      Object.values(allEndpoints).forEach(endpoint => {
        // All endpoints should require authentication
        expect(endpoint.requiresAuth).toBe(true);
      });
    });

    test('should have appropriate wrapping configuration', () => {
      // POST/PUT operations should require wrapping
      expect(EndpointRegistry.requiresWrapping('GENERATE_WORKOUT')).toBe(true);
      expect(EndpointRegistry.requiresWrapping('CREATE_WORKOUT')).toBe(true);
      expect(EndpointRegistry.requiresWrapping('UPDATE_WORKOUT')).toBe(true);
      expect(EndpointRegistry.requiresWrapping('UPDATE_PROFILE')).toBe(true);
      
      // GET operations should not require wrapping
      expect(EndpointRegistry.requiresWrapping('GET_WORKOUTS')).toBe(false);
      expect(EndpointRegistry.requiresWrapping('GET_WORKOUT')).toBe(false);
      expect(EndpointRegistry.requiresWrapping('GET_PROFILE')).toBe(false);
    });
  });
}); 