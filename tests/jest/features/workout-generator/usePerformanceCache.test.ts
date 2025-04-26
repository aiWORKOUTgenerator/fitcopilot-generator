/**
 * Tests for usePerformanceCache hook
 */
import { renderHook, act } from '@testing-library/react';
import { usePerformanceCache } from '../../../../src/features/workout-generator/hooks/usePerformanceCache';
import { WorkoutFormParams, GeneratedWorkout } from '../../../../src/features/workout-generator/types/workout';

// Mock Date.now for consistent testing
const mockNow = 1625097600000; // July 1, 2021
global.Date.now = jest.fn(() => mockNow);

describe('usePerformanceCache', () => {
  // Sample workout params and data for testing
  const sampleParams: WorkoutFormParams = {
    goals: 'strength',
    difficulty: 'intermediate',
    duration: 30,
    equipment: ['dumbbells', 'bench'],
    restrictions: ''
  };
  
  const sampleWorkout: GeneratedWorkout = {
    title: 'Strength Workout',
    sections: [
      {
        name: 'Warm-up',
        duration: 5,
        exercises: [
          {
            name: 'Jumping Jacks',
            duration: '2 minutes',
            description: 'Jump while raising arms'
          }
        ]
      }
    ]
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return the cache utility functions', () => {
    const { result } = renderHook(() => usePerformanceCache());
    
    expect(result.current).toHaveProperty('getCached');
    expect(result.current).toHaveProperty('setCached');
    expect(result.current).toHaveProperty('clearCache');
    expect(result.current).toHaveProperty('getCacheStats');
    
    expect(typeof result.current.getCached).toBe('function');
    expect(typeof result.current.setCached).toBe('function');
    expect(typeof result.current.clearCache).toBe('function');
    expect(typeof result.current.getCacheStats).toBe('function');
  });
  
  it('should return null for uncached items', () => {
    const { result } = renderHook(() => usePerformanceCache());
    
    // Try to get an item that doesn't exist in cache
    const cached = result.current.getCached(sampleParams);
    
    expect(cached).toBeNull();
  });
  
  it('should cache and retrieve items correctly', () => {
    const { result } = renderHook(() => usePerformanceCache());
    
    // Cache a workout
    act(() => {
      result.current.setCached(sampleParams, sampleWorkout);
    });
    
    // Get the workout from cache
    const cached = result.current.getCached(sampleParams);
    
    // Should return the cached workout
    expect(cached).toEqual(sampleWorkout);
    
    // Check cache stats
    const stats = result.current.getCacheStats();
    expect(stats.size).toBe(1);
  });
  
  it('should handle equipment array order consistently', () => {
    const { result } = renderHook(() => usePerformanceCache());
    
    // Cache with one order of equipment
    act(() => {
      result.current.setCached(sampleParams, sampleWorkout);
    });
    
    // Retrieve with different order of same equipment
    const paramsWithDifferentOrder: WorkoutFormParams = {
      ...sampleParams,
      equipment: ['bench', 'dumbbells'] // Reversed order
    };
    
    const cached = result.current.getCached(paramsWithDifferentOrder);
    
    // Should still find the same workout
    expect(cached).toEqual(sampleWorkout);
  });
  
  it('should respect TTL and return null for expired items', () => {
    // Create a cache with very short TTL (1 second)
    const { result } = renderHook(() => usePerformanceCache({ ttl: 1000 }));
    
    // Cache a workout
    act(() => {
      result.current.setCached(sampleParams, sampleWorkout);
    });
    
    // Advance time by 2 seconds
    const futureTime = mockNow + 2000;
    (Date.now as jest.Mock).mockImplementationOnce(() => futureTime);
    
    // Get the workout from cache - should be expired
    const cached = result.current.getCached(sampleParams);
    
    // Should return null since it's expired
    expect(cached).toBeNull();
  });
  
  it('should remove oldest items when cache reaches max size', () => {
    // Create a cache with max size of 2
    const { result } = renderHook(() => usePerformanceCache({ maxSize: 2 }));
    
    const params1 = { ...sampleParams, goals: 'strength' };
    const params2 = { ...sampleParams, goals: 'endurance' };
    const params3 = { ...sampleParams, goals: 'flexibility' };
    
    const workout1 = { ...sampleWorkout, title: 'Strength Workout' };
    const workout2 = { ...sampleWorkout, title: 'Endurance Workout' };
    const workout3 = { ...sampleWorkout, title: 'Flexibility Workout' };
    
    // Cache first item
    act(() => {
      (Date.now as jest.Mock).mockImplementationOnce(() => mockNow);
      result.current.setCached(params1, workout1);
    });
    
    // Cache second item
    act(() => {
      (Date.now as jest.Mock).mockImplementationOnce(() => mockNow + 100);
      result.current.setCached(params2, workout2);
    });
    
    // At this point, cache has 2 items
    expect(result.current.getCacheStats().size).toBe(2);
    
    // Cache third item - should evict oldest (params1, workout1)
    act(() => {
      (Date.now as jest.Mock).mockImplementationOnce(() => mockNow + 200);
      result.current.setCached(params3, workout3);
    });
    
    // Should now have 2 items, but first one should be gone
    expect(result.current.getCacheStats().size).toBe(2);
    expect(result.current.getCached(params1)).toBeNull();
    expect(result.current.getCached(params2)).toEqual(workout2);
    expect(result.current.getCached(params3)).toEqual(workout3);
  });
  
  it('should clear specific items from cache', () => {
    const { result } = renderHook(() => usePerformanceCache());
    
    // Cache multiple items
    act(() => {
      result.current.setCached(
        { ...sampleParams, goals: 'strength' },
        { ...sampleWorkout, title: 'Strength Workout' }
      );
      
      result.current.setCached(
        { ...sampleParams, goals: 'cardio' },
        { ...sampleWorkout, title: 'Cardio Workout' }
      );
    });
    
    // Should have 2 items
    expect(result.current.getCacheStats().size).toBe(2);
    
    // Clear just the strength workout
    act(() => {
      result.current.clearCache({ ...sampleParams, goals: 'strength' });
    });
    
    // Should now have 1 item
    expect(result.current.getCacheStats().size).toBe(1);
    expect(result.current.getCached({ ...sampleParams, goals: 'strength' })).toBeNull();
    expect(result.current.getCached({ ...sampleParams, goals: 'cardio' })).not.toBeNull();
  });
  
  it('should clear the entire cache', () => {
    const { result } = renderHook(() => usePerformanceCache());
    
    // Cache multiple items
    act(() => {
      result.current.setCached(
        { ...sampleParams, goals: 'strength' },
        { ...sampleWorkout, title: 'Strength Workout' }
      );
      
      result.current.setCached(
        { ...sampleParams, goals: 'cardio' },
        { ...sampleWorkout, title: 'Cardio Workout' }
      );
    });
    
    // Should have 2 items
    expect(result.current.getCacheStats().size).toBe(2);
    
    // Clear the entire cache
    act(() => {
      result.current.clearCache();
    });
    
    // Should now have 0 items
    expect(result.current.getCacheStats().size).toBe(0);
  });
}); 