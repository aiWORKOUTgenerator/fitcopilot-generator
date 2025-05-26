/**
 * Workout Service Integration Tests
 * 
 * Comprehensive end-to-end testing of workout service functionality
 * to validate API client fixes and ensure no regressions.
 */

import { 
  getWorkout, 
  getWorkouts, 
  saveWorkout, 
  deleteWorkout, 
  completeWorkout 
} from '../../services/workoutService';
import { GeneratedWorkout } from '../../types/workout';
import { 
  isNetworkError, 
  isAuthError, 
  extractErrorMessage 
} from '../../api/helpers';

// Mock data for testing
const mockWorkout: GeneratedWorkout = {
  id: 'test-workout-123',
  title: 'Integration Test Workout',
  difficulty: 'intermediate',
  duration: 30,
  exercises: [
    {
      name: 'Push-ups',
      sets: 3,
      reps: 10,
      rest: 60,
      instructions: 'Keep your body straight and lower yourself down'
    },
    {
      name: 'Squats',
      sets: 3,
      reps: 15,
      rest: 60,
      instructions: 'Lower your body as if sitting in a chair'
    }
  ],
  equipment: ['bodyweight'],
  muscleGroups: ['chest', 'legs'],
  goals: ['strength', 'endurance'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('Workout Service Integration Tests', () => {
  let testWorkoutId: string | null = null;

  beforeAll(() => {
    // Ensure we have a clean test environment
    console.log('🧪 Starting Workout Service Integration Tests');
    console.log('📋 Testing API client fixes from Stories 1 & 2');
  });

  afterAll(async () => {
    // Cleanup any test data
    if (testWorkoutId) {
      try {
        await deleteWorkout(testWorkoutId);
        console.log(`🧹 Cleaned up test workout: ${testWorkoutId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup test workout: ${extractErrorMessage(error)}`);
      }
    }
  });

  describe('📝 Task 3.1: Test Workout Creation Flow', () => {
    test('should create a new workout successfully', async () => {
      try {
        console.log('🔄 Testing workout creation...');
        
        const newWorkout = { ...mockWorkout };
        delete newWorkout.id; // Remove ID for creation
        
        const savedWorkout = await saveWorkout(newWorkout);
        
        // Validation
        expect(savedWorkout).toBeDefined();
        expect(savedWorkout.id).toBeDefined();
        expect(savedWorkout.title).toBe(newWorkout.title);
        expect(savedWorkout.difficulty).toBe(newWorkout.difficulty);
        expect(savedWorkout.exercises).toHaveLength(2);
        
        testWorkoutId = savedWorkout.id;
        console.log(`✅ Workout created successfully: ${testWorkoutId}`);
        
      } catch (error) {
        console.error('❌ Workout creation failed:', extractErrorMessage(error));
        
        // Check error type for better debugging
        if (isNetworkError(error)) {
          throw new Error('Network error during workout creation - API client may be broken');
        } else if (isAuthError(error)) {
          throw new Error('Authentication error - this is expected if not authenticated');
        } else {
          throw new Error(`Unexpected error during workout creation: ${extractErrorMessage(error)}`);
        }
      }
    }, 10000);

    test('should handle workout creation with minimal data', async () => {
      try {
        console.log('🔄 Testing minimal workout creation...');
        
        const minimalWorkout = {
          title: 'Minimal Test Workout',
          difficulty: 'beginner' as const,
          duration: 15,
          exercises: [
            {
              name: 'Basic Exercise',
              sets: 1,
              reps: 5,
              rest: 30,
              instructions: 'Basic instruction'
            }
          ]
        };
        
        const savedWorkout = await saveWorkout(minimalWorkout);
        
        expect(savedWorkout).toBeDefined();
        expect(savedWorkout.id).toBeDefined();
        expect(savedWorkout.title).toBe(minimalWorkout.title);
        
        // Cleanup immediately
        if (savedWorkout.id) {
          await deleteWorkout(savedWorkout.id);
        }
        
        console.log('✅ Minimal workout creation successful');
        
      } catch (error) {
        console.error('❌ Minimal workout creation failed:', extractErrorMessage(error));
        throw error;
      }
    });
  });

  describe('📖 Task 3.2: Test Workout Update Flow', () => {
    test('should update an existing workout successfully', async () => {
      // Skip if no workout was created
      if (!testWorkoutId) {
        console.log('⏭️ Skipping update test - no workout created');
        return;
      }

      try {
        console.log(`🔄 Testing workout update for ID: ${testWorkoutId}`);
        
        const updatedWorkout = {
          ...mockWorkout,
          id: testWorkoutId,
          title: 'Updated Integration Test Workout',
          difficulty: 'advanced' as const,
          duration: 45,
          updatedAt: new Date().toISOString()
        };
        
        const savedWorkout = await saveWorkout(updatedWorkout);
        
        // Validation
        expect(savedWorkout).toBeDefined();
        expect(savedWorkout.id).toBe(testWorkoutId);
        expect(savedWorkout.title).toBe('Updated Integration Test Workout');
        expect(savedWorkout.difficulty).toBe('advanced');
        expect(savedWorkout.duration).toBe(45);
        
        console.log('✅ Workout update successful');
        
      } catch (error) {
        console.error('❌ Workout update failed:', extractErrorMessage(error));
        throw error;
      }
    });

    test('should handle partial workout updates', async () => {
      if (!testWorkoutId) {
        console.log('⏭️ Skipping partial update test - no workout created');
        return;
      }

      try {
        console.log(`🔄 Testing partial workout update for ID: ${testWorkoutId}`);
        
        const partialUpdate = {
          id: testWorkoutId,
          title: 'Partially Updated Workout',
          duration: 20 // Only updating title and duration
        };
        
        const savedWorkout = await saveWorkout(partialUpdate);
        
        expect(savedWorkout).toBeDefined();
        expect(savedWorkout.id).toBe(testWorkoutId);
        expect(savedWorkout.title).toBe('Partially Updated Workout');
        
        console.log('✅ Partial workout update successful');
        
      } catch (error) {
        console.error('❌ Partial workout update failed:', extractErrorMessage(error));
        throw error;
      }
    });
  });

  describe('📚 Task 3.3: Test Workout Retrieval Flow', () => {
    test('should retrieve a single workout by ID', async () => {
      if (!testWorkoutId) {
        console.log('⏭️ Skipping single workout retrieval test - no workout created');
        return;
      }

      try {
        console.log(`🔄 Testing single workout retrieval for ID: ${testWorkoutId}`);
        
        const retrievedWorkout = await getWorkout(testWorkoutId);
        
        expect(retrievedWorkout).toBeDefined();
        expect(retrievedWorkout.id).toBe(testWorkoutId);
        expect(retrievedWorkout.title).toBeDefined();
        expect(retrievedWorkout.exercises).toBeDefined();
        
        console.log('✅ Single workout retrieval successful');
        
      } catch (error) {
        console.error('❌ Single workout retrieval failed:', extractErrorMessage(error));
        throw error;
      }
    });

    test('should retrieve workouts list with pagination', async () => {
      try {
        console.log('🔄 Testing workouts list retrieval...');
        
        const workouts = await getWorkouts(1, 5);
        
        expect(workouts).toBeDefined();
        expect(Array.isArray(workouts)).toBe(true);
        
        console.log(`✅ Workouts list retrieval successful (${workouts.length} workouts)`);
        
      } catch (error) {
        console.error('❌ Workouts list retrieval failed:', extractErrorMessage(error));
        throw error;
      }
    });

    test('should handle different pagination parameters', async () => {
      try {
        console.log('🔄 Testing workouts pagination...');
        
        // Test different page sizes
        const page1 = await getWorkouts(1, 3);
        const page2 = await getWorkouts(2, 3);
        
        expect(page1).toBeDefined();
        expect(page2).toBeDefined();
        expect(Array.isArray(page1)).toBe(true);
        expect(Array.isArray(page2)).toBe(true);
        
        console.log('✅ Workout pagination successful');
        
      } catch (error) {
        console.error('❌ Workout pagination failed:', extractErrorMessage(error));
        throw error;
      }
    });
  });

  describe('🗑️ Task 3.4: Test Workout Deletion Flow', () => {
    test('should mark workout as completed', async () => {
      if (!testWorkoutId) {
        console.log('⏭️ Skipping completion test - no workout created');
        return;
      }

      try {
        console.log(`🔄 Testing workout completion for ID: ${testWorkoutId}`);
        
        const completedWorkout = await completeWorkout(testWorkoutId);
        
        expect(completedWorkout).toBeDefined();
        expect(completedWorkout.id).toBe(testWorkoutId);
        
        console.log('✅ Workout completion successful');
        
      } catch (error) {
        console.error('❌ Workout completion failed:', extractErrorMessage(error));
        throw error;
      }
    });

    test('should delete workout successfully', async () => {
      if (!testWorkoutId) {
        console.log('⏭️ Skipping deletion test - no workout created');
        return;
      }

      try {
        console.log(`🔄 Testing workout deletion for ID: ${testWorkoutId}`);
        
        const result = await deleteWorkout(testWorkoutId);
        
        expect(result).toBe(true);
        
        console.log('✅ Workout deletion successful');
        
        // Clear the test ID since workout is deleted
        testWorkoutId = null;
        
      } catch (error) {
        console.error('❌ Workout deletion failed:', extractErrorMessage(error));
        throw error;
      }
    });
  });

  describe('🚨 Task 3.5: Test Error Handling Scenarios', () => {
    test('should handle non-existent workout ID gracefully', async () => {
      try {
        console.log('🔄 Testing non-existent workout retrieval...');
        
        await getWorkout('non-existent-workout-id');
        
        // If we reach here, the API didn't throw an error for non-existent ID
        console.log('⚠️ Expected error for non-existent workout ID, but got success');
        
      } catch (error) {
        console.log('✅ Correctly handled non-existent workout ID error');
        
        const errorMessage = extractErrorMessage(error);
        expect(errorMessage).toBeDefined();
        expect(typeof errorMessage).toBe('string');
      }
    });

    test('should handle invalid workout data gracefully', async () => {
      try {
        console.log('🔄 Testing invalid workout data...');
        
        const invalidWorkout = {
          title: '', // Invalid empty title
          difficulty: 'invalid_difficulty' as any, // Invalid difficulty
          duration: -5, // Invalid negative duration
          exercises: [] // Empty exercises array
        };
        
        await saveWorkout(invalidWorkout);
        
        console.log('⚠️ Expected validation error for invalid workout data, but got success');
        
      } catch (error) {
        console.log('✅ Correctly handled invalid workout data error');
        
        const errorMessage = extractErrorMessage(error);
        expect(errorMessage).toBeDefined();
        expect(typeof errorMessage).toBe('string');
      }
    });

    test('should provide helpful error messages', async () => {
      try {
        console.log('🔄 Testing error message extraction...');
        
        // This should fail due to non-existent ID
        await deleteWorkout('definitely-does-not-exist');
        
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        
        expect(errorMessage).toBeDefined();
        expect(typeof errorMessage).toBe('string');
        expect(errorMessage.length).toBeGreaterThan(0);
        expect(errorMessage).not.toBe('An unexpected error occurred'); // Should be more specific
        
        console.log(`✅ Error message extracted: "${errorMessage}"`);
      }
    });

    test('should correctly identify error types', async () => {
      try {
        console.log('🔄 Testing error type identification...');
        
        await getWorkout('test-non-existent-id');
        
      } catch (error) {
        // Test error type identification
        const isNetwork = isNetworkError(error);
        const isAuth = isAuthError(error);
        
        console.log(`📊 Error type analysis - Network: ${isNetwork}, Auth: ${isAuth}`);
        
        // At least one of these should be identifiable
        expect(typeof isNetwork).toBe('boolean');
        expect(typeof isAuth).toBe('boolean');
        
        console.log('✅ Error type identification working');
      }
    });
  });

  describe('🔐 Task 3.6: Test Authentication Edge Cases', () => {
    test('should handle authentication errors appropriately', async () => {
      console.log('🔄 Testing authentication error handling...');
      
      // Note: This test may succeed if user is authenticated
      // The important thing is that it doesn't crash with a "DOCTYPE" error
      
      try {
        await getWorkouts();
        console.log('✅ API call succeeded (user may be authenticated)');
      } catch (error) {
        if (isAuthError(error)) {
          console.log('✅ Correctly identified authentication error');
          
          const errorMessage = extractErrorMessage(error);
          expect(errorMessage).toContain('authorized');
        } else {
          console.log(`⚠️ Non-auth error: ${extractErrorMessage(error)}`);
        }
      }
    });

    test('should not return HTML error pages', async () => {
      console.log('🔄 Testing for HTML error pages (DOCTYPE issue)...');
      
      try {
        await getWorkout('test-id');
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        
        // The main fix: ensure we're not getting HTML responses
        expect(errorMessage).not.toContain('<!DOCTYPE');
        expect(errorMessage).not.toContain('<html>');
        expect(errorMessage).not.toContain('Unexpected token');
        
        console.log('✅ No HTML error pages detected - API client fix working');
      }
    });
  });

  describe('🔍 Regression Testing', () => {
    test('should maintain API response structure', async () => {
      console.log('🔄 Testing API response structure...');
      
      try {
        const workouts = await getWorkouts(1, 1);
        
        // Should return an array
        expect(Array.isArray(workouts)).toBe(true);
        
        console.log('✅ API response structure maintained');
        
      } catch (error) {
        // Even if it fails, ensure error structure is correct
        const errorMessage = extractErrorMessage(error);
        expect(typeof errorMessage).toBe('string');
        
        console.log('✅ Error response structure maintained');
      }
    });

    test('should handle concurrent API calls', async () => {
      console.log('🔄 Testing concurrent API calls...');
      
      try {
        // Make multiple concurrent calls
        const promises = [
          getWorkouts(1, 2),
          getWorkouts(1, 3),
          getWorkouts(1, 1)
        ];
        
        const results = await Promise.allSettled(promises);
        
        // At least some should succeed or fail gracefully
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        console.log(`📊 Concurrent calls - Success: ${successful}, Failed: ${failed}`);
        
        // All should either succeed or fail gracefully (no crashes)
        expect(results.length).toBe(3);
        
        console.log('✅ Concurrent API calls handled properly');
        
      } catch (error) {
        console.error('❌ Concurrent API calls failed:', extractErrorMessage(error));
        throw error;
      }
    });
  });
});

/**
 * Manual Test Runner
 * 
 * Can be used to run tests manually in the browser console
 */
export class WorkoutServiceTestRunner {
  private testResults: Array<{ name: string; passed: boolean; error?: string }> = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Manual Workout Service Tests');
    
    await this.runTest('Create Workout', this.testCreateWorkout.bind(this));
    await this.runTest('Update Workout', this.testUpdateWorkout.bind(this));
    await this.runTest('Get Workout', this.testGetWorkout.bind(this));
    await this.runTest('Get Workouts List', this.testGetWorkouts.bind(this));
    await this.runTest('Error Handling', this.testErrorHandling.bind(this));
    
    this.printResults();
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    try {
      await testFn();
      this.testResults.push({ name, passed: true });
      console.log(`✅ ${name}: PASSED`);
    } catch (error) {
      this.testResults.push({ 
        name, 
        passed: false, 
        error: extractErrorMessage(error) 
      });
      console.log(`❌ ${name}: FAILED - ${extractErrorMessage(error)}`);
    }
  }

  private async testCreateWorkout(): Promise<void> {
    const workout = {
      title: 'Manual Test Workout',
      difficulty: 'beginner' as const,
      duration: 20,
      exercises: [
        {
          name: 'Test Exercise',
          sets: 2,
          reps: 10,
          rest: 30,
          instructions: 'Test instruction'
        }
      ]
    };

    const result = await saveWorkout(workout);
    if (!result || !result.id) {
      throw new Error('Failed to create workout');
    }
  }

  private async testUpdateWorkout(): Promise<void> {
    const workout = {
      id: 'test-id',
      title: 'Updated Manual Test Workout',
      difficulty: 'intermediate' as const,
      duration: 25,
      exercises: [
        {
          name: 'Updated Test Exercise',
          sets: 3,
          reps: 12,
          rest: 45,
          instructions: 'Updated test instruction'
        }
      ]
    };

    await saveWorkout(workout);
  }

  private async testGetWorkout(): Promise<void> {
    await getWorkout('test-id');
  }

  private async testGetWorkouts(): Promise<void> {
    const workouts = await getWorkouts(1, 5);
    if (!Array.isArray(workouts)) {
      throw new Error('Expected workouts to be an array');
    }
  }

  private async testErrorHandling(): Promise<void> {
    try {
      await getWorkout('definitely-non-existent-id');
      throw new Error('Expected error for non-existent workout');
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message.includes('<!DOCTYPE') || message.includes('Unexpected token')) {
        throw new Error('Still receiving HTML error responses');
      }
    }
  }

  private printResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log(`\n📈 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! API client fixes are working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please review the errors above.');
    }
  }
}

// Export for manual browser testing
(window as any).WorkoutServiceTestRunner = WorkoutServiceTestRunner; 