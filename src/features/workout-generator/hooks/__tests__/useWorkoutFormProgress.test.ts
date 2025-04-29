/**
 * Tests for useWorkoutFormProgress hook
 * 
 * Verifies form progress management, request state tracking and progress simulation
 */
import { renderHook, act } from '@testing-library/react-hooks';
import { useWorkoutFormProgress } from '../useWorkoutFormProgress';

describe('useWorkoutFormProgress', () => {
  const DEFAULT_CONFIG = {
    steps: ['equipment', 'profile', 'preferences'],
    requestInitiatedStep: 'preferences',
    requestCompletedStep: 'results'
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('should initialize with correct default values', () => {
    // Act
    const { result } = renderHook(() => useWorkoutFormProgress(DEFAULT_CONFIG));

    // Assert
    expect(result.current.currentStep).toBe('equipment');
    expect(result.current.isRequestActive).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.formCompletionPercentage).toBe(0);
  });

  test('should advance to next step correctly', () => {
    // Arrange
    const { result } = renderHook(() => useWorkoutFormProgress(DEFAULT_CONFIG));

    // Act
    act(() => {
      result.current.goToNextStep();
    });

    // Assert
    expect(result.current.currentStep).toBe('profile');
    expect(result.current.formCompletionPercentage).toBe(33); // 1/3 of the way
  });

  test('should calculate form completion percentage correctly', () => {
    // Arrange
    const { result } = renderHook(() => useWorkoutFormProgress(DEFAULT_CONFIG));

    // Act - Go to the second step
    act(() => {
      result.current.goToNextStep();
    });

    // Assert
    expect(result.current.formCompletionPercentage).toBe(33); // 1/3 completed

    // Act - Go to the third step
    act(() => {
      result.current.goToNextStep();
    });

    // Assert
    expect(result.current.formCompletionPercentage).toBe(67); // 2/3 completed

    // Act - Complete the form
    act(() => {
      result.current.goToResults();
    });

    // Assert
    expect(result.current.formCompletionPercentage).toBe(100); // Fully completed
  });

  test('should go to specific step correctly', () => {
    // Arrange
    const { result } = renderHook(() => useWorkoutFormProgress(DEFAULT_CONFIG));

    // Act
    act(() => {
      result.current.goToStep('preferences');
    });

    // Assert
    expect(result.current.currentStep).toBe('preferences');
  });

  test('should track request active state correctly', () => {
    // Arrange
    const { result } = renderHook(() => useWorkoutFormProgress(DEFAULT_CONFIG));

    // Act - Go to the request step
    act(() => {
      result.current.goToStep('preferences');
    });

    // Act - Start the request
    act(() => {
      result.current.startRequest();
    });

    // Assert
    expect(result.current.isRequestActive).toBe(true);
    expect(result.current.progress).toBe(0);

    // Act - Complete the request
    act(() => {
      result.current.completeRequest();
    });

    // Assert
    expect(result.current.isRequestActive).toBe(false);
    expect(result.current.currentStep).toBe('results');
    expect(result.current.progress).toBe(100);
  });

  test('should cancel request correctly', () => {
    // Arrange
    const { result } = renderHook(() => useWorkoutFormProgress(DEFAULT_CONFIG));

    // Act - Go to the request step and start a request
    act(() => {
      result.current.goToStep('preferences');
      result.current.startRequest();
    });

    // Assert - Request should be active
    expect(result.current.isRequestActive).toBe(true);

    // Act - Cancel the request
    act(() => {
      result.current.cancelRequest();
    });

    // Assert
    expect(result.current.isRequestActive).toBe(false);
    expect(result.current.progress).toBe(0);
    // Should stay on the same step
    expect(result.current.currentStep).toBe('preferences');
  });

  test('should simulate progress correctly during active request', () => {
    // Arrange
    const { result } = renderHook(() => useWorkoutFormProgress({
      ...DEFAULT_CONFIG,
      simulatedProgressConfig: {
        initialJumpMs: 500,
        initialJumpValue: 10,
        incrementIntervalMs: 1000,
        incrementValue: 5,
        maxProgress: 90
      }
    }));

    // Act - Start a request
    act(() => {
      result.current.goToStep('preferences');
      result.current.startRequest();
    });

    // Assert - Initial state
    expect(result.current.progress).toBe(0);

    // Act - Initial jump
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Assert - After initial jump
    expect(result.current.progress).toBe(10);

    // Act - First interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Assert - After first interval
    expect(result.current.progress).toBe(15);

    // Act - Several more intervals
    act(() => {
      jest.advanceTimersByTime(5000); // 5 more increments
    });

    // Assert - Should not exceed maxProgress
    expect(result.current.progress).toBe(40); // 10 + (5 * 6) = 40

    // Act - Many more intervals to attempt exceeding maxProgress
    act(() => {
      jest.advanceTimersByTime(20000);
    });

    // Assert - Should stop at maxProgress
    expect(result.current.progress).toBe(90); // Capped at maxProgress
  });

  test('should stop progress simulation when request completes', () => {
    // Arrange
    const { result } = renderHook(() => useWorkoutFormProgress(DEFAULT_CONFIG));

    // Act - Start a request
    act(() => {
      result.current.goToStep('preferences');
      result.current.startRequest();
    });

    // Act - Initial progress
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Get the current progress
    const progressBeforeComplete = result.current.progress;

    // Act - Complete the request
    act(() => {
      result.current.completeRequest();
    });

    // Assert
    expect(result.current.progress).toBe(100);

    // Act - Try to advance time more
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Assert - Progress should remain at 100
    expect(result.current.progress).toBe(100);
  });

  test('should reset form state correctly', () => {
    // Arrange
    const { result } = renderHook(() => useWorkoutFormProgress(DEFAULT_CONFIG));

    // Act - Advance through form and start request
    act(() => {
      result.current.goToStep('preferences');
      result.current.startRequest();
      jest.advanceTimersByTime(2000); // Some progress simulation
    });

    // Assert - Mid-request state
    expect(result.current.isRequestActive).toBe(true);
    expect(result.current.progress).toBeGreaterThan(0);

    // Act - Reset the form
    act(() => {
      result.current.resetForm();
    });

    // Assert - Should be back to initial state
    expect(result.current.currentStep).toBe('equipment');
    expect(result.current.isRequestActive).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.formCompletionPercentage).toBe(0);
  });

  test('should calculate overall progress correctly during request', () => {
    // Arrange
    const { result } = renderHook(() => useWorkoutFormProgress(DEFAULT_CONFIG));

    // Act - Go to request step and start request
    act(() => {
      result.current.goToStep('preferences');
      result.current.startRequest();
    });

    // Act - Progress to 50%
    act(() => {
      // Directly set progress for predictable test
      result.current.updateProgress(50);
    });

    // Assert - Overall progress should be form progress + a portion of the request progress
    // Form is 67% complete (2/3 steps), request is 50% complete
    // Overall should be 67% + (33% * 0.5) = about 83%
    expect(result.current.overallProgress).toBeCloseTo(83, 0);
  });
}); 