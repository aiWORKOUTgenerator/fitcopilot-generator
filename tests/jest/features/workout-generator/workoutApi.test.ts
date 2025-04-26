/**
 * Tests for workout API client
 */
import { workoutApi } from '../../../../src/features/workout-generator/api/workoutApi';
import * as apiRequest from '../../../../src/features/workout-generator/hooks/useApiRequest';

// Mock the useApiRequest hook
jest.mock('../../../../src/features/workout-generator/hooks/useApiRequest', () => ({
  __esModule: true,
  useApiRequest: jest.fn()
}));

// Mock request function and other state from useApiRequest
const mockRequestFn = jest.fn();
const mockAbortFn = jest.fn();
const mockResetFn = jest.fn();

// Setup mock response for useApiRequest
beforeEach(() => {
  jest.clearAllMocks();
  (apiRequest.useApiRequest as jest.Mock).mockReturnValue({
    request: mockRequestFn,
    abort: mockAbortFn,
    reset: mockResetFn,
    data: null,
    error: null,
    isLoading: false,
    abortController: null
  });
});

describe('workoutApi', () => {
  describe('useGenerateWorkout', () => {
    it('should call request with correct parameters', async () => {
      // Setup successful response
      const mockWorkout = { id: 1, title: 'Test Workout' };
      mockRequestFn.mockResolvedValueOnce(mockWorkout);
      
      // Call the hook
      const { generateWorkout, isLoading, workout, error } = workoutApi.useGenerateWorkout();
      
      // Check initial state
      expect(isLoading).toBe(false);
      expect(workout).toBeNull();
      expect(error).toBeNull();
      
      // Setup workout parameters
      const params = {
        duration: 30,
        goal: 'strength',
        equipment: ['dumbbells']
      };
      
      // Call the generate function
      const result = await generateWorkout(params);
      
      // Verify request was called with correct URL and parameters
      expect(mockRequestFn).toHaveBeenCalledWith({
        url: '/wp-json/fitcopilot/v1/generate',
        options: {
          method: 'POST',
          body: JSON.stringify(params)
        },
        handleUnauthorized: true
      });
      
      // Verify correct data was returned
      expect(result).toEqual(mockWorkout);
    });
    
    it('should handle errors correctly', async () => {
      // Setup error response
      const mockError = { code: 'WG_500', message: 'Server error' };
      mockRequestFn.mockResolvedValueOnce(null);
      
      // Mock the hook state to include an error
      (apiRequest.useApiRequest as jest.Mock).mockReturnValue({
        request: mockRequestFn,
        abort: mockAbortFn,
        reset: mockResetFn,
        data: null,
        error: mockError,
        isLoading: false,
        abortController: null
      });
      
      // Call the hook
      const { generateWorkout, error } = workoutApi.useGenerateWorkout();
      
      // Verify error state
      expect(error).toEqual(mockError);
      
      // Call the generate function
      const result = await generateWorkout({ duration: 30, goal: 'strength' });
      
      // Verify null result is returned on error
      expect(result).toBeNull();
    });
    
    it('should provide abort functionality', () => {
      // Call the hook
      const { abortRequest } = workoutApi.useGenerateWorkout();
      
      // Call abort
      abortRequest();
      
      // Verify abort was called
      expect(mockAbortFn).toHaveBeenCalled();
    });
  });
  
  describe('useGetWorkouts', () => {
    it('should call request with correct parameters', async () => {
      // Setup successful response
      const mockWorkouts = [
        { id: 1, title: 'Workout 1' },
        { id: 2, title: 'Workout 2' }
      ];
      mockRequestFn.mockResolvedValueOnce(mockWorkouts);
      
      // Call the hook
      const { fetchWorkouts, isLoading, workouts, error } = workoutApi.useGetWorkouts();
      
      // Check initial state
      expect(isLoading).toBe(false);
      expect(workouts).toBeNull();
      expect(error).toBeNull();
      
      // Call the fetch function
      const result = await fetchWorkouts();
      
      // Verify request was called with correct URL and parameters
      expect(mockRequestFn).toHaveBeenCalledWith({
        url: '/wp-json/fitcopilot/v1/workouts',
        options: { method: 'GET' },
        handleUnauthorized: true
      });
      
      // Verify correct data was returned
      expect(result).toEqual(mockWorkouts);
    });
  });
  
  describe('useGetWorkout', () => {
    it('should call request with correct parameters', async () => {
      // Setup successful response
      const mockWorkout = { id: 1, title: 'Test Workout' };
      mockRequestFn.mockResolvedValueOnce(mockWorkout);
      
      // Call the hook
      const { fetchWorkout, isLoading, workout, error } = workoutApi.useGetWorkout();
      
      // Check initial state
      expect(isLoading).toBe(false);
      expect(workout).toBeNull();
      expect(error).toBeNull();
      
      // Call the fetch function
      const result = await fetchWorkout(1);
      
      // Verify request was called with correct URL and parameters
      expect(mockRequestFn).toHaveBeenCalledWith({
        url: '/wp-json/fitcopilot/v1/workouts/1',
        options: { method: 'GET' },
        handleUnauthorized: true
      });
      
      // Verify correct data was returned
      expect(result).toEqual(mockWorkout);
    });
  });
  
  describe('useSaveWorkout', () => {
    it('should call request with correct parameters for update', async () => {
      // Setup successful response
      const mockWorkout = { id: 1, title: 'Updated Workout' };
      mockRequestFn.mockResolvedValueOnce(mockWorkout);
      
      // Call the hook
      const { saveWorkout, isLoading, workout, error } = workoutApi.useSaveWorkout();
      
      // Check initial state
      expect(isLoading).toBe(false);
      expect(workout).toBeNull();
      expect(error).toBeNull();
      
      // Setup workout data
      const workoutData = { 
        id: 1, 
        title: 'Updated Workout',
        note: 'This is a test'
      };
      
      // Call the save function
      const result = await saveWorkout(workoutData);
      
      // Verify request was called with correct URL and parameters
      expect(mockRequestFn).toHaveBeenCalledWith({
        url: '/wp-json/fitcopilot/v1/workouts/1',
        options: {
          method: 'PUT',
          body: JSON.stringify(workoutData)
        },
        handleUnauthorized: true
      });
      
      // Verify correct data was returned
      expect(result).toEqual(mockWorkout);
    });
  });
  
  describe('useCompleteWorkout', () => {
    it('should call request with correct parameters', async () => {
      // Setup successful response
      const mockResponse = { success: true };
      mockRequestFn.mockResolvedValueOnce(mockResponse);
      
      // Call the hook
      const { completeWorkout, isLoading, response, error } = workoutApi.useCompleteWorkout();
      
      // Check initial state
      expect(isLoading).toBe(false);
      expect(response).toBeNull();
      expect(error).toBeNull();
      
      // Setup completion data
      const completionData = { 
        rating: 4, 
        note: 'Good workout'
      };
      
      // Call the complete function
      const result = await completeWorkout(1, completionData);
      
      // Verify request was called with correct URL and parameters
      expect(mockRequestFn).toHaveBeenCalledWith({
        url: '/wp-json/fitcopilot/v1/workouts/1/complete',
        options: {
          method: 'POST',
          body: JSON.stringify(completionData)
        },
        handleUnauthorized: true
      });
      
      // Verify correct data was returned
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('useGetProfile', () => {
    it('should call request with correct parameters', async () => {
      // Setup successful response
      const mockProfile = { 
        user_id: 1, 
        fitness_level: 'intermediate',
        preferences: { goals: ['strength'], equipment: ['dumbbells'] }
      };
      mockRequestFn.mockResolvedValueOnce(mockProfile);
      
      // Call the hook
      const { fetchProfile, isLoading, profile, error } = workoutApi.useGetProfile();
      
      // Check initial state
      expect(isLoading).toBe(false);
      expect(profile).toBeNull();
      expect(error).toBeNull();
      
      // Call the fetch function
      const result = await fetchProfile();
      
      // Verify request was called with correct URL and parameters
      expect(mockRequestFn).toHaveBeenCalledWith({
        url: '/wp-json/fitcopilot/v1/profile',
        options: { method: 'GET' },
        handleUnauthorized: true
      });
      
      // Verify correct data was returned
      expect(result).toEqual(mockProfile);
    });
  });
  
  describe('useUpdateProfile', () => {
    it('should call request with correct parameters', async () => {
      // Setup successful response
      const mockProfile = { 
        user_id: 1, 
        fitness_level: 'advanced',
        preferences: { goals: ['endurance'], equipment: ['dumbbells'] }
      };
      mockRequestFn.mockResolvedValueOnce(mockProfile);
      
      // Call the hook
      const { updateProfile, isLoading, profile, error } = workoutApi.useUpdateProfile();
      
      // Check initial state
      expect(isLoading).toBe(false);
      expect(profile).toBeNull();
      expect(error).toBeNull();
      
      // Setup profile data
      const profileData = { 
        fitness_level: 'advanced',
        preferences: { goals: ['endurance'], equipment: ['dumbbells'] }
      };
      
      // Call the update function
      const result = await updateProfile(profileData);
      
      // Verify request was called with correct URL and parameters
      expect(mockRequestFn).toHaveBeenCalledWith({
        url: '/wp-json/fitcopilot/v1/profile',
        options: {
          method: 'PUT',
          body: JSON.stringify(profileData)
        },
        handleUnauthorized: true
      });
      
      // Verify correct data was returned
      expect(result).toEqual(mockProfile);
    });
  });
}); 