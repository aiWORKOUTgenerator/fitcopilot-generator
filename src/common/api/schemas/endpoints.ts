/**
 * API Endpoint Schema Definitions
 * 
 * These schemas define the exact structure and validation rules
 * for all API endpoints according to the design guidelines.
 */

import { 
  EndpointDefinition, 
  ResourceType,
  WorkoutRequest,
  WorkoutResponse,
  ProfileRequest,
  ProfileResponse
} from '../types/guidelines';

/**
 * JSON Schema for Workout Request Validation
 */
export const WORKOUT_REQUEST_SCHEMA = {
  type: 'object',
  required: ['duration', 'difficulty', 'goals'],
  properties: {
    duration: {
      type: 'number',
      minimum: 10,
      maximum: 120,
      description: 'Workout duration in minutes'
    },
    difficulty: {
      type: 'string',
      enum: ['beginner', 'intermediate', 'advanced'],
      description: 'Difficulty level'
    },
    equipment: {
      type: 'array',
      items: { type: 'string' },
      description: 'Available equipment'
    },
    goals: {
      type: 'string',
      minLength: 1,
      description: 'Workout goals'
    },
    restrictions: {
      type: 'string',
      description: 'Physical restrictions or limitations'
    },
    preferences: {
      type: 'string', 
      description: 'Additional preferences'
    }
  },
  additionalProperties: false
};

/**
 * JSON Schema for Workout Response Validation
 */
export const WORKOUT_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['id', 'title', 'date', 'duration', 'difficulty'],
  properties: {
    id: { type: 'number' },
    title: { type: 'string', minLength: 1 },
    date: { type: 'string', format: 'date-time' },
    duration: { type: 'number', minimum: 1 },
    difficulty: {
      type: 'string',
      enum: ['beginner', 'intermediate', 'advanced']
    },
    content: { type: 'string' }
  },
  additionalProperties: false
};

/**
 * JSON Schema for Profile Request Validation
 */
export const PROFILE_REQUEST_SCHEMA = {
  type: 'object',
  required: ['fitnessLevel', 'workoutGoals', 'equipmentAvailable', 'workoutFrequency'],
  properties: {
    fitnessLevel: {
      type: 'string',
      enum: ['beginner', 'intermediate', 'advanced']
    },
    workoutGoals: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1
    },
    equipmentAvailable: {
      type: 'string',
      minLength: 1
    },
    workoutFrequency: {
      type: 'number',
      minimum: 1,
      maximum: 7
    },
    preferences: {
      type: 'object',
      properties: {
        darkMode: { type: 'boolean' },
        metrics: {
          type: 'string',
          enum: ['imperial', 'metric']
        }
      },
      required: ['darkMode', 'metrics'],
      additionalProperties: false
    }
  },
  additionalProperties: false
};

/**
 * API Endpoint Definitions
 * Each endpoint specifies its exact requirements and behavior
 */
export const API_ENDPOINTS: Record<string, EndpointDefinition> = {
  // Workout Generation
  GENERATE_WORKOUT: {
    path: '/generate',
    method: 'POST',
    requiresAuth: true,
    requiresWrapping: true,
    resourceType: ResourceType.WORKOUT,
    requestSchema: WORKOUT_REQUEST_SCHEMA,
    responseSchema: WORKOUT_RESPONSE_SCHEMA,
    transformFieldNames: true
  },

  // Workout CRUD Operations  
  GET_WORKOUTS: {
    path: '/workouts',
    method: 'GET',
    requiresAuth: true,
    requiresWrapping: false,
    transformFieldNames: true
  },

  GET_WORKOUT: {
    path: '/workouts/{id}',
    method: 'GET', 
    requiresAuth: true,
    requiresWrapping: false,
    responseSchema: WORKOUT_RESPONSE_SCHEMA,
    transformFieldNames: true
  },

  CREATE_WORKOUT: {
    path: '/workouts',
    method: 'POST',
    requiresAuth: true,
    requiresWrapping: true,
    resourceType: ResourceType.WORKOUT,
    requestSchema: WORKOUT_REQUEST_SCHEMA,
    responseSchema: WORKOUT_RESPONSE_SCHEMA,
    transformFieldNames: true
  },

  UPDATE_WORKOUT: {
    path: '/workouts/{id}',
    method: 'PUT',
    requiresAuth: true,
    requiresWrapping: true,
    resourceType: ResourceType.WORKOUT,
    requestSchema: WORKOUT_REQUEST_SCHEMA,
    responseSchema: WORKOUT_RESPONSE_SCHEMA,
    transformFieldNames: true
  },

  DELETE_WORKOUT: {
    path: '/workouts/{id}',
    method: 'DELETE',
    requiresAuth: true,
    requiresWrapping: false,
    transformFieldNames: false
  },

  COMPLETE_WORKOUT: {
    path: '/workouts/{id}/complete',
    method: 'POST',
    requiresAuth: true,
    requiresWrapping: true,
    resourceType: ResourceType.COMPLETION,
    transformFieldNames: true
  },

  // Profile Operations
  GET_PROFILE: {
    path: '/profile',
    method: 'GET',
    requiresAuth: true,
    requiresWrapping: false,
    transformFieldNames: true
  },

  UPDATE_PROFILE: {
    path: '/profile',
    method: 'PUT',
    requiresAuth: true,
    requiresWrapping: true,
    resourceType: ResourceType.PROFILE,
    requestSchema: PROFILE_REQUEST_SCHEMA,
    transformFieldNames: true
  },

  // Version History Operations
  GET_WORKOUT_VERSIONS: {
    path: '/workouts/{id}/versions',
    method: 'GET',
    requiresAuth: true,
    requiresWrapping: false,
    transformFieldNames: true
  }
};

/**
 * Endpoint Registry for Dynamic Access
 */
export class EndpointRegistry {
  private static endpoints = API_ENDPOINTS;

  static getEndpoint(name: string): EndpointDefinition | undefined {
    return this.endpoints[name];
  }

  static getAllEndpoints(): Record<string, EndpointDefinition> {
    return { ...this.endpoints };
  }

  static getEndpointsByMethod(method: string): Record<string, EndpointDefinition> {
    return Object.fromEntries(
      Object.entries(this.endpoints)
        .filter(([, endpoint]) => endpoint.method === method)
    );
  }

  static getEndpointsByResource(resourceType: ResourceType): Record<string, EndpointDefinition> {
    return Object.fromEntries(
      Object.entries(this.endpoints)
        .filter(([, endpoint]) => endpoint.resourceType === resourceType)
    );
  }

  static requiresWrapping(endpointName: string): boolean {
    const endpoint = this.getEndpoint(endpointName);
    return endpoint?.requiresWrapping ?? false;
  }

  static getResourceType(endpointName: string): ResourceType | undefined {
    const endpoint = this.getEndpoint(endpointName);
    return endpoint?.resourceType;
  }
}

/**
 * Path Parameter Utilities
 */
export function buildEndpointPath(endpointName: string, params: Record<string, string | number> = {}): string {
  const endpoint = EndpointRegistry.getEndpoint(endpointName);
  if (!endpoint) {
    throw new Error(`Unknown endpoint: ${endpointName}`);
  }

  let path = endpoint.path;
  
  // Replace path parameters like {id} with actual values
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`{${key}}`, String(value));
  });

  // Validate that all parameters were replaced
  const remainingParams = path.match(/\{[^}]+\}/g);
  if (remainingParams) {
    throw new Error(`Missing path parameters: ${remainingParams.join(', ')} for endpoint ${endpointName}`);
  }

  return path;
}

/**
 * Export commonly used endpoint builders
 */
export const EndpointBuilders = {
  getWorkout: (id: string | number) => buildEndpointPath('GET_WORKOUT', { id }),
  updateWorkout: (id: string | number) => buildEndpointPath('UPDATE_WORKOUT', { id }),
  deleteWorkout: (id: string | number) => buildEndpointPath('DELETE_WORKOUT', { id }),
  completeWorkout: (id: string | number) => buildEndpointPath('COMPLETE_WORKOUT', { id }),
  getWorkoutVersions: (id: string | number) => buildEndpointPath('GET_WORKOUT_VERSIONS', { id })
}; 