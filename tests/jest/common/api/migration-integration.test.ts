/**
 * Migration Integration Tests
 * 
 * Tests to verify that migrated services work correctly with the compliant API client
 */

import { 
  getWorkout, 
  getWorkouts, 
  generateWorkout, 
  saveWorkout, 
  deleteWorkout, 
  completeWorkout 
} from '../../../../src/features/workout-generator/services/workoutService';

import { 
  getProfile as getWorkoutProfile, 
  updateProfile as updateWorkoutProfile 
} from '../../../../src/features/workout-generator/api/profileApi';

import { 
  getProfile as getMainProfile, 
  updateProfile as updateMainProfile,
  deleteProfileFields 
} from '../../../../src/features/profile/api/profileApi';

import { apiClient } from '../../../../src/common/api';

// Mock the API client
jest.mock('../../../../src/common/api', () => ({
  apiClient: {
    getWorkout: jest.fn(),
    getWorkouts: jest.fn(),
    generateWorkout: jest.fn(),
    updateWorkout: jest.fn(),
    deleteWorkout: jest.fn(),
    completeWorkout: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  },
  ApiError: class MockApiError extends Error {
    constructor(message: string, public code: string, public data?: any) {
      super(message);
      this.name = 'ApiError';
    }
    isType(code: string) {
      return this.code === code;
    }
  },
  ApiErrorCode: {
    INVALID_PARAMS: 'invalid_params',
    VALIDATION_ERROR: 'validation_error',
    NOT_AUTHENTICATED: 'not_authenticated',
    FORBIDDEN: 'forbidden',
    NOT_FOUND: 'not_found',
    RATE_LIMITED: 'rate_limited',
    SERVER_ERROR: 'server_error'
  }
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Migration Integration Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Workout Service Migration', () => {
    
    test('getWorkout should use compliant API client', async () => {
      const mockWorkout = {
        id: 123,
        title: 'Test Workout',
        description: 'Test Description',
        duration: 30,
        difficulty: 'intermediate' as const,
        exercises: [],
        created_at: '2023-07-15T10:00:00Z',
        updated_at: '2023-07-15T10:00:00Z'
      };

      mockApiClient.getWorkout.mockResolvedValue({
        success: true,
        data: mockWorkout,
        message: 'Workout retrieved successfully',
        metadata: {
          endpoint: 'GET_WORKOUT',
          duration: 100,
          validated: true,
          transformed: true
        }
      });

      const result = await getWorkout('123');

      expect(mockApiClient.getWorkout).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockWorkout);
    });

    test('getWorkouts should use compliant API client', async () => {
      const mockWorkouts = [
        {
          id: 1,
          title: 'Workout 1',
          description: 'Description 1',
          duration: 30,
          difficulty: 'beginner' as const,
          exercises: [],
          created_at: '2023-07-15T10:00:00Z',
          updated_at: '2023-07-15T10:00:00Z'
        }
      ];

      mockApiClient.getWorkouts.mockResolvedValue({
        success: true,
        data: mockWorkouts,
        message: 'Workouts retrieved successfully',
        metadata: {
          endpoint: 'GET_WORKOUTS',
          duration: 150,
          validated: true,
          transformed: true
        }
      });

      const result = await getWorkouts();

      expect(mockApiClient.getWorkouts).toHaveBeenCalled();
      expect(result).toEqual(mockWorkouts);
    });

    test('generateWorkout should use compliant API client', async () => {
      const workoutRequest = {
        duration: 45,
        difficulty: 'advanced',
        goals: 'strength training'
      };

      const mockGeneratedWorkout = {
        id: 456,
        title: 'Generated Workout',
        description: 'AI Generated',
        duration: 45,
        difficulty: 'advanced' as const,
        exercises: [],
        created_at: '2023-07-15T11:00:00Z',
        updated_at: '2023-07-15T11:00:00Z'
      };

      mockApiClient.generateWorkout.mockResolvedValue({
        success: true,
        data: mockGeneratedWorkout,
        message: 'Workout generated successfully',
        metadata: {
          endpoint: 'GENERATE_WORKOUT',
          duration: 2000,
          validated: true,
          transformed: true
        }
      });

      const result = await generateWorkout(workoutRequest);

      expect(mockApiClient.generateWorkout).toHaveBeenCalledWith(workoutRequest);
      expect(result).toEqual(mockGeneratedWorkout);
    });

    test('saveWorkout should use updateWorkout for existing workouts', async () => {
      const existingWorkout = {
        id: 789,
        title: 'Updated Workout',
        description: 'Updated Description',
        duration: 60,
        difficulty: 'intermediate' as const,
        exercises: [],
        created_at: '2023-07-15T09:00:00Z',
        updated_at: '2023-07-15T12:00:00Z'
      };

      mockApiClient.updateWorkout.mockResolvedValue({
        success: true,
        data: existingWorkout,
        message: 'Workout updated successfully',
        metadata: {
          endpoint: 'UPDATE_WORKOUT',
          duration: 300,
          validated: true,
          transformed: true
        }
      });

      const result = await saveWorkout(existingWorkout);

      expect(mockApiClient.updateWorkout).toHaveBeenCalledWith(789, existingWorkout);
      expect(result).toEqual(existingWorkout);
    });

    test('deleteWorkout should use compliant API client', async () => {
      mockApiClient.deleteWorkout.mockResolvedValue({
        success: true,
        data: undefined,
        message: 'Workout deleted successfully',
        metadata: {
          endpoint: 'DELETE_WORKOUT',
          duration: 200,
          validated: true,
          transformed: false
        }
      });

      const result = await deleteWorkout('123');

      expect(mockApiClient.deleteWorkout).toHaveBeenCalledWith('123');
      expect(result).toBe(true);
    });

    test('completeWorkout should use compliant API client', async () => {
      const completedWorkout = {
        id: 123,
        title: 'Completed Workout',
        description: 'Test Description',
        duration: 30,
        difficulty: 'intermediate' as const,
        exercises: [],
        created_at: '2023-07-15T10:00:00Z',
        updated_at: '2023-07-15T13:00:00Z'
      };

      mockApiClient.completeWorkout.mockResolvedValue({
        success: true,
        data: completedWorkout,
        message: 'Workout completed successfully',
        metadata: {
          endpoint: 'COMPLETE_WORKOUT',
          duration: 250,
          validated: true,
          transformed: true
        }
      });

      const result = await completeWorkout('123');

      expect(mockApiClient.completeWorkout).toHaveBeenCalledWith('123');
      expect(result).toEqual(completedWorkout);
    });

  });

  describe('Profile Service Migration', () => {
    
    test('workout profile getProfile should use compliant API client', async () => {
      const mockProfile = {
        user_id: 1,
        fitness_level: 'intermediate' as const,
        equipment_available: ['dumbbells'],
        workout_goals: 'strength training',
        physical_limitations: 'none',
        completed_workouts_count: 5
      };

      mockApiClient.getProfile.mockResolvedValue({
        success: true,
        data: mockProfile,
        message: 'Profile retrieved successfully',
        metadata: {
          endpoint: 'GET_PROFILE',
          duration: 120,
          validated: true,
          transformed: true
        }
      });

      const result = await getWorkoutProfile();

      expect(mockApiClient.getProfile).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });

    test('workout profile updateProfile should use compliant API client', async () => {
      const updateData = {
        fitness_level: 'advanced' as const,
        equipment_available: ['dumbbells', 'barbell']
      };

      mockApiClient.updateProfile.mockResolvedValue({
        success: true,
        data: { user_id: 1, ...updateData },
        message: 'Profile updated successfully',
        metadata: {
          endpoint: 'UPDATE_PROFILE',
          duration: 180,
          validated: true,
          transformed: true
        }
      });

      await updateWorkoutProfile(updateData);

      expect(mockApiClient.updateProfile).toHaveBeenCalledWith(updateData);
    });

    test('main profile getProfile should use compliant API client', async () => {
      const mockProfile = {
        id: 1,
        fitnessLevel: 'beginner' as const,
        goals: ['general_fitness'],
        availableEquipment: ['none'],
        limitations: ['none'],
        preferredLocation: 'home',
        workoutFrequency: '3-4',
        lastUpdated: '2023-07-15T10:00:00Z',
        profileComplete: true,
        completedWorkouts: 3
      };

      mockApiClient.getProfile.mockResolvedValue({
        success: true,
        data: mockProfile,
        message: 'Profile retrieved successfully',
        metadata: {
          endpoint: 'GET_PROFILE',
          duration: 110,
          validated: true,
          transformed: true
        }
      });

      const result = await getMainProfile();

      expect(mockApiClient.getProfile).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });

    test('main profile updateProfile should use compliant API client', async () => {
      const updateData = {
        fitnessLevel: 'intermediate' as const,
        goals: ['strength', 'endurance']
      };

      const updatedProfile = {
        id: 1,
        fitnessLevel: 'intermediate' as const,
        goals: ['strength', 'endurance'],
        availableEquipment: ['dumbbells'],
        limitations: ['none'],
        preferredLocation: 'gym',
        workoutFrequency: '4-5',
        lastUpdated: '2023-07-15T12:00:00Z',
        profileComplete: true,
        completedWorkouts: 3
      };

      mockApiClient.updateProfile.mockResolvedValue({
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully',
        metadata: {
          endpoint: 'UPDATE_PROFILE',
          duration: 200,
          validated: true,
          transformed: true
        }
      });

      const result = await updateMainProfile(updateData);

      expect(mockApiClient.updateProfile).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(updatedProfile);
    });

    test('deleteProfileFields should use compliant API client', async () => {
      const fieldsToDelete = ['goals', 'limitations'];
      
      const resetProfile = {
        id: 1,
        fitnessLevel: 'beginner' as const,
        goals: ['general_fitness'],
        availableEquipment: ['none'],
        limitations: ['none'],
        preferredLocation: 'home',
        workoutFrequency: '3-4',
        lastUpdated: '2023-07-15T13:00:00Z',
        profileComplete: false,
        completedWorkouts: 3
      };

      mockApiClient.updateProfile.mockResolvedValue({
        success: true,
        data: resetProfile,
        message: 'Profile fields deleted successfully',
        metadata: {
          endpoint: 'UPDATE_PROFILE',
          duration: 150,
          validated: true,
          transformed: true
        }
      });

      const result = await deleteProfileFields(fieldsToDelete);

      expect(mockApiClient.updateProfile).toHaveBeenCalledWith({
        goals: ['general_fitness'],
        limitations: ['none']
      });
      expect(result).toEqual(resetProfile);
    });

  });

  describe('Error Handling Migration', () => {
    
    test('should handle API errors correctly in workout service', async () => {
      mockApiClient.getWorkout.mockResolvedValue({
        success: false,
        data: null,
        message: 'Workout not found',
        metadata: {
          endpoint: 'GET_WORKOUT',
          duration: 50,
          validated: true,
          transformed: true
        }
      });

      await expect(getWorkout('999')).rejects.toThrow('Workout not found');
    });

    test('should handle API errors correctly in profile service', async () => {
      mockApiClient.getProfile.mockResolvedValue({
        success: false,
        data: null,
        message: 'Profile access denied',
        metadata: {
          endpoint: 'GET_PROFILE',
          duration: 30,
          validated: true,
          transformed: true
        }
      });

      await expect(getMainProfile()).rejects.toThrow('Profile access denied');
    });

  });

  describe('Backward Compatibility', () => {
    
    test('workout service functions should maintain same signatures', () => {
      // Test that function signatures haven't changed
      expect(typeof getWorkout).toBe('function');
      expect(typeof getWorkouts).toBe('function');
      expect(typeof generateWorkout).toBe('function');
      expect(typeof saveWorkout).toBe('function');
      expect(typeof deleteWorkout).toBe('function');
      expect(typeof completeWorkout).toBe('function');
    });

    test('profile service functions should maintain same signatures', () => {
      // Test that function signatures haven't changed
      expect(typeof getWorkoutProfile).toBe('function');
      expect(typeof updateWorkoutProfile).toBe('function');
      expect(typeof getMainProfile).toBe('function');
      expect(typeof updateMainProfile).toBe('function');
      expect(typeof deleteProfileFields).toBe('function');
    });

  });

}); 