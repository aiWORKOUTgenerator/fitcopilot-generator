import { generateWorkout } from '../../../src/features/workout-generator/api/workoutApi';
import { apiFetch } from '../../../src/common/api/client';
import * as routes from '../../../src/common/api/routes';

// Mock the apiFetch function
jest.mock('../../../src/common/api/client', () => ({
  apiFetch: jest.fn(),
}));

describe('workoutApi', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('generateWorkout', () => {
    it('should call apiFetch with the correct parameters', async () => {
      // Arrange
      const mockWorkout = {
        title: 'Sample Beginner 30 minute workout',
        sections: [
          {
            name: 'Warm Up',
            duration: 4,
            exercises: [
              {
                name: 'Jumping Jacks',
                duration: '2 minutes',
                description: 'Stand with feet together and arms at sides, then jump to a position with legs spread and arms overhead.',
              },
            ],
          },
          {
            name: 'Main Workout',
            duration: 21,
            exercises: [
              {
                name: 'Push-ups',
                sets: 3,
                reps: 10,
                description: 'Start in a plank position with hands slightly wider than shoulder-width apart.',
              },
            ],
          },
          {
            name: 'Cool Down',
            duration: 5,
            exercises: [
              {
                name: 'Hamstring Stretch',
                duration: '1 minute per leg',
                description: 'Sit on the floor with one leg extended and the other bent.',
              },
            ],
          },
        ],
      };

      (apiFetch as jest.Mock).mockResolvedValue(mockWorkout);

      const params = {
        duration: 30,
        difficulty: 'beginner',
        goals: 'Improve overall fitness',
      } as any;

      // Act
      const result = await generateWorkout(params);

      // Assert
      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(apiFetch).toHaveBeenCalledWith(routes.GENERATE_WORKOUT, {
        method: 'POST',
        body: JSON.stringify(params),
      });
      expect(result).toEqual(mockWorkout);
    });
  });
}); 