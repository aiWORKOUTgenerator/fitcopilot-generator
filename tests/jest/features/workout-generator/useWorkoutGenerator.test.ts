/**
 * Tests for useWorkoutGenerator hook
 */
import { renderHook, act } from '@testing-library/react';
import { useWorkoutGenerator as useWorkoutGeneratorHook } from '../../../../src/features/workout-generator/hooks/useWorkoutGenerator';
import { useWorkoutGenerator as useWorkoutGeneratorContext } from '../../../../src/features/workout-generator/context/WorkoutGeneratorContext';
import { useErrorHandler } from '../../../../src/features/workout-generator/hooks/useErrorHandler';
import { usePerformanceCache } from '../../../../src/features/workout-generator/hooks/usePerformanceCache';

// Mock all dependencies
jest.mock('../../../../src/features/workout-generator/context/WorkoutGeneratorContext', () => ({
  useWorkoutGenerator: jest.fn()
}));

jest.mock('../../../../src/features/workout-generator/hooks/useErrorHandler', () => ({
  useErrorHandler: jest.fn()
}));

jest.mock('../../../../src/features/workout-generator/hooks/usePerformanceCache', () => ({
  usePerformanceCache: jest.fn()
}));

// Create mock implementations
const mockDispatch = jest.fn();
const mockGenerateWorkout = jest.fn();
const mockHandleError = jest.fn();
const mockGetCached = jest.fn();
const mockSetCached = jest.fn();

describe('useWorkoutGenerator', () => {
  // Setup mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the context
    (useWorkoutGeneratorContext as jest.Mock).mockReturnValue({
      state: {
        ui: {
          status: 'idle',
          loading: false,
          errorMessage: null
        },
        domain: {
          formValues: {},
          generatedWorkout: null
        }
      },
      dispatch: mockDispatch,
      generateWorkout: mockGenerateWorkout
    });
    
    // Mock error handler
    (useErrorHandler as jest.Mock).mockReturnValue({
      handleError: mockHandleError
    });
    
    // Mock performance cache
    (usePerformanceCache as jest.Mock).mockReturnValue({
      getCached: mockGetCached,
      setCached: mockSetCached
    });
  });
  
  it('should return the correct initial state', () => {
    // Render the hook
    const { result } = renderHook(() => useWorkoutGeneratorHook());
    
    // Check the returned values
    expect(result.current).toEqual(expect.objectContaining({
      status: 'idle',
      loading: false,
      error: null,
      workout: null,
      formValues: {},
      isGenerating: false,
      isCompleted: false,
      hasError: false
    }));
    
    // Verify functions are returned
    expect(typeof result.current.startGeneration).toBe('function');
    expect(typeof result.current.resetGenerator).toBe('function');
  });
  
  it('should reset generator when resetGenerator is called', () => {
    // Render the hook
    const { result } = renderHook(() => useWorkoutGeneratorHook());
    
    // Call resetGenerator
    act(() => {
      result.current.resetGenerator();
    });
    
    // Verify dispatch was called with the correct action
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESET_GENERATOR' });
  });
  
  describe('startGeneration function', () => {
    it('should use cached result when available', async () => {
      // Mock a cached workout
      const mockCachedWorkout = {
        title: 'Cached Workout',
        sections: []
      };
      
      mockGetCached.mockReturnValue(mockCachedWorkout);
      
      // Render the hook
      const { result } = renderHook(() => useWorkoutGeneratorHook());
      
      // Call startGeneration
      let returnedWorkout;
      await act(async () => {
        returnedWorkout = await result.current.startGeneration({
          goals: 'strength',
          difficulty: 'intermediate',
          duration: 30
        });
      });
      
      // Verify cache was checked with complete params
      expect(mockGetCached).toHaveBeenCalledWith(expect.objectContaining({
        goals: 'strength',
        difficulty: 'intermediate',
        duration: 30
      }));
      
      // Verify dispatch was called to update state
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_STEP', payload: 'submitting' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_RESULT', payload: mockCachedWorkout });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_STEP', payload: 'completed' });
      
      // Verify generateWorkout was not called
      expect(mockGenerateWorkout).not.toHaveBeenCalled();
      
      // Verify the returned workout
      expect(returnedWorkout).toBe(mockCachedWorkout);
    });
    
    it('should generate a new workout when no cache is available', async () => {
      // Mock no cache hit
      mockGetCached.mockReturnValue(null);
      
      // Mock successful workout generation
      const mockGeneratedWorkout = {
        title: 'Generated Workout',
        sections: []
      };
      mockGenerateWorkout.mockResolvedValue(mockGeneratedWorkout);
      
      // Render the hook
      const { result } = renderHook(() => useWorkoutGeneratorHook());
      
      // Call startGeneration
      let returnedWorkout;
      await act(async () => {
        returnedWorkout = await result.current.startGeneration({
          goals: 'strength',
          difficulty: 'intermediate',
          duration: 30
        });
      });
      
      // Verify cache was checked
      expect(mockGetCached).toHaveBeenCalled();
      
      // Verify dispatch was called to update state
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_STEP', payload: 'submitting' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_STEP', payload: 'generating' });
      
      // Verify generateWorkout was called with right params
      expect(mockGenerateWorkout).toHaveBeenCalledWith(expect.objectContaining({
        goals: 'strength',
        difficulty: 'intermediate',
        duration: 30
      }));
      
      // Verify successful result was cached
      expect(mockSetCached).toHaveBeenCalledWith(
        expect.any(Object),
        mockGeneratedWorkout
      );
      
      // Verify the returned workout
      expect(returnedWorkout).toBe(mockGeneratedWorkout);
    });
    
    it('should handle errors during generation', async () => {
      // Mock no cache hit
      mockGetCached.mockReturnValue(null);
      
      // Mock error in generation
      const mockError = new Error('API Error');
      mockGenerateWorkout.mockRejectedValue(mockError);
      
      // Render the hook
      const { result } = renderHook(() => useWorkoutGeneratorHook());
      
      // Call startGeneration and expect it to throw
      await expect(async () => {
        await act(async () => {
          await result.current.startGeneration({
            goals: 'strength',
            difficulty: 'intermediate',
            duration: 30
          });
        });
      }).rejects.toThrow();
      
      // Verify error was handled
      expect(mockHandleError).toHaveBeenCalledWith(
        mockError,
        expect.objectContaining({
          componentName: 'useWorkoutGenerator',
          action: 'startGeneration'
        })
      );
      
      // Verify dispatch was called to set error state
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_STEP', payload: 'error' });
    });
    
    it('should set default values for missing workout parameters', async () => {
      // Mock no cache hit
      mockGetCached.mockReturnValue(null);
      
      // Mock successful workout generation
      mockGenerateWorkout.mockResolvedValue({ title: 'Test Workout', sections: [] });
      
      // Render the hook
      const { result } = renderHook(() => useWorkoutGeneratorHook());
      
      // Call startGeneration with minimal params
      await act(async () => {
        await result.current.startGeneration({
          // Only provide goals
          goals: 'strength'
        });
      });
      
      // Verify generateWorkout was called with default values for missing params
      expect(mockGenerateWorkout).toHaveBeenCalledWith(expect.objectContaining({
        goals: 'strength',
        difficulty: 'intermediate', // Default
        duration: 30,               // Default
        equipment: [],              // Default
        restrictions: ''            // Default
      }));
    });
  });
  
  describe('state mapping', () => {
    it('should correctly map isGenerating state', () => {
      // Test submitting state
      (useWorkoutGeneratorContext as jest.Mock).mockReturnValue({
        state: {
          ui: { status: 'submitting', loading: true, errorMessage: null },
          domain: { formValues: {}, generatedWorkout: null }
        },
        dispatch: mockDispatch,
        generateWorkout: mockGenerateWorkout
      });
      
      let { result } = renderHook(() => useWorkoutGeneratorHook());
      expect(result.current.isGenerating).toBe(true);
      
      // Test generating state
      (useWorkoutGeneratorContext as jest.Mock).mockReturnValue({
        state: {
          ui: { status: 'generating', loading: true, errorMessage: null },
          domain: { formValues: {}, generatedWorkout: null }
        },
        dispatch: mockDispatch,
        generateWorkout: mockGenerateWorkout
      });
      
      result = renderHook(() => useWorkoutGeneratorHook()).result;
      expect(result.current.isGenerating).toBe(true);
      
      // Test idle state
      (useWorkoutGeneratorContext as jest.Mock).mockReturnValue({
        state: {
          ui: { status: 'idle', loading: false, errorMessage: null },
          domain: { formValues: {}, generatedWorkout: null }
        },
        dispatch: mockDispatch,
        generateWorkout: mockGenerateWorkout
      });
      
      result = renderHook(() => useWorkoutGeneratorHook()).result;
      expect(result.current.isGenerating).toBe(false);
    });
    
    it('should correctly map isCompleted state', () => {
      // Test completed state
      (useWorkoutGeneratorContext as jest.Mock).mockReturnValue({
        state: {
          ui: { status: 'completed', loading: false, errorMessage: null },
          domain: { 
            formValues: {}, 
            generatedWorkout: { title: 'Test Workout', sections: [] } 
          }
        },
        dispatch: mockDispatch,
        generateWorkout: mockGenerateWorkout
      });
      
      const { result } = renderHook(() => useWorkoutGeneratorHook());
      expect(result.current.isCompleted).toBe(true);
      expect(result.current.workout).toEqual({ title: 'Test Workout', sections: [] });
    });
    
    it('should correctly map hasError state', () => {
      // Test error state
      (useWorkoutGeneratorContext as jest.Mock).mockReturnValue({
        state: {
          ui: { 
            status: 'error', 
            loading: false, 
            errorMessage: 'Something went wrong' 
          },
          domain: { formValues: {}, generatedWorkout: null }
        },
        dispatch: mockDispatch,
        generateWorkout: mockGenerateWorkout
      });
      
      const { result } = renderHook(() => useWorkoutGeneratorHook());
      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe('Something went wrong');
    });
  });
}); 