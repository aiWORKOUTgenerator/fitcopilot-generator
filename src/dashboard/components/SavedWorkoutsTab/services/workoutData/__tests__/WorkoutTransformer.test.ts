/**
 * WorkoutTransformer Service Tests
 * 
 * Comprehensive unit tests for workout data transformation logic.
 * Part of Week 1 Foundation Sprint - Service Testing.
 */

import { WorkoutTransformer } from '../WorkoutTransformer';

describe('WorkoutTransformer', () => {
  describe('transformForDisplay', () => {
    it('transforms valid workout data correctly', () => {
      const mockWorkout = {
        id: 218,
        title: 'Test Workout',
        description: 'A test workout description',
        duration: 45,
        difficulty: 'intermediate',
        workout_data: JSON.stringify({
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 10, equipment: 'none' },
            { name: 'Squats', sets: 3, reps: 15, equipment: 'none' }
          ]
        }),
        post_date: '2023-05-31T14:20:09',
        post_modified: '2023-06-01T10:15:00'
      };
      
      const result = WorkoutTransformer.transformForDisplay(mockWorkout);
      
      expect(result.id).toBe(218);
      expect(result.title).toBe('Test Workout');
      expect(result.description).toBe('A test workout description');
      expect(result.duration).toBe(45);
      expect(result.difficulty).toBe('intermediate');
      expect(result.exercises).toHaveLength(2);
      expect(result.exercises[0].name).toBe('Push-ups');
      expect(result.equipment).toEqual(['none']);
      expect(result.workoutType).toBe('General');
    });

    it('handles missing workout_data gracefully', () => {
      const mockWorkout = { 
        id: 1, 
        title: 'Empty Workout',
        description: 'No exercises'
      };
      
      const result = WorkoutTransformer.transformForDisplay(mockWorkout);
      
      expect(result.id).toBe(1);
      expect(result.title).toBe('Empty Workout');
      expect(result.exercises).toHaveLength(0);
      expect(result.equipment).toHaveLength(0);
      expect(result.workoutType).toBe('General');
    });

    it('handles corrupted JSON data', () => {
      const mockWorkout = { 
        id: 1, 
        title: 'Corrupted Workout',
        workout_data: 'invalid json{'
      };
      
      const result = WorkoutTransformer.transformForDisplay(mockWorkout);
      
      expect(result.id).toBe(1);
      expect(result.title).toBe('Corrupted Workout');
      expect(result.exercises).toHaveLength(0);
      expect(result.equipment).toHaveLength(0);
    });

    it('extracts exercises from sections', () => {
      const mockWorkout = {
        id: 2,
        title: 'Sectioned Workout',
        workout_data: JSON.stringify({
          sections: [
            {
              name: 'Warm-up',
              exercises: [
                { name: 'Jumping Jacks', duration: '30s', equipment: 'none' }
              ]
            },
            {
              name: 'Main Set',
              exercises: [
                { name: 'Bench Press', sets: 4, reps: 8, equipment: 'barbell' },
                { name: 'Squats', sets: 4, reps: 12, equipment: 'barbell' }
              ]
            }
          ]
        })
      };
      
      const result = WorkoutTransformer.transformForDisplay(mockWorkout);
      
      expect(result.exercises).toHaveLength(3);
      expect(result.equipment).toContain('barbell');
      expect(result.workoutType).toBe('Strength');
    });

    it('handles WordPress post format', () => {
      const mockWorkout = {
        post_id: 123,
        post_title: 'WordPress Workout',
        post_content: 'WordPress description',
        post_date: '2023-05-31T14:20:09',
        post_modified: '2023-06-01T10:15:00',
        exercises: [
          { name: 'Running', duration: '20 minutes', equipment: 'treadmill' }
        ]
      };
      
      const result = WorkoutTransformer.transformForDisplay(mockWorkout);
      
      expect(result.id).toBe(123);
      expect(result.title).toBe('WordPress Workout');
      expect(result.description).toBe('WordPress description');
      expect(result.createdAt).toBe('2023-05-31T14:20:09');
      expect(result.lastModified).toBe('2023-06-01T10:15:00');
      expect(result.workoutType).toBe('Cardio');
    });

    it('handles null/undefined input', () => {
      const result1 = WorkoutTransformer.transformForDisplay(null);
      const result2 = WorkoutTransformer.transformForDisplay(undefined);
      
      expect(result1.title).toBe('Error Loading Workout');
      expect(result2.title).toBe('Error Loading Workout');
      expect(result1.exercises).toHaveLength(0);
      expect(result2.exercises).toHaveLength(0);
    });

    it('handles invalid input types', () => {
      const result1 = WorkoutTransformer.transformForDisplay('string');
      const result2 = WorkoutTransformer.transformForDisplay(123);
      
      expect(result1.title).toBe('Error Loading Workout');
      expect(result2.title).toBe('Error Loading Workout');
    });

    it('sets default values for missing fields', () => {
      const mockWorkout = {
        id: 1
        // Missing most fields
      };
      
      const result = WorkoutTransformer.transformForDisplay(mockWorkout);
      
      expect(result.title).toBe('Untitled Workout');
      expect(result.description).toBe('');
      expect(result.duration).toBe(30);
      expect(result.difficulty).toBe('intermediate');
      expect(result.isCompleted).toBe(false);
      expect(result.isFavorite).toBe(false);
    });
  });

  describe('extractEquipmentFromExercises', () => {
    it('extracts equipment from exercise array', () => {
      const exercises = [
        { name: 'Push-ups', equipment: 'none' },
        { name: 'Dumbbell Press', equipment: 'dumbbells' },
        { name: 'Pull-ups', equipment: ['pull_up_bar', 'resistance_bands'] }
      ];
      
      const result = WorkoutTransformer.extractEquipmentFromExercises(exercises);
      
      expect(result).toContain('none');
      expect(result).toContain('dumbbells');
      expect(result).toContain('pull_up_bar');
      expect(result).toContain('resistance_bands');
      expect(result).toHaveLength(4);
    });

    it('handles exercises with no equipment', () => {
      const exercises = [
        { name: 'Push-ups' },
        { name: 'Sit-ups' }
      ];
      
      const result = WorkoutTransformer.extractEquipmentFromExercises(exercises);
      
      expect(result).toHaveLength(0);
    });

    it('handles invalid input', () => {
      const result1 = WorkoutTransformer.extractEquipmentFromExercises(null as any);
      const result2 = WorkoutTransformer.extractEquipmentFromExercises('invalid' as any);
      
      expect(result1).toHaveLength(0);
      expect(result2).toHaveLength(0);
    });

    it('filters out empty equipment values', () => {
      const exercises = [
        { name: 'Test', equipment: ['dumbbells', '', null, 'barbell'] }
      ];
      
      const result = WorkoutTransformer.extractEquipmentFromExercises(exercises);
      
      expect(result).toEqual(['dumbbells', 'barbell']);
    });
  });

  describe('deriveWorkoutTypeFromExercises', () => {
    it('identifies cardio workouts', () => {
      const exercises = [
        { name: 'Running' },
        { name: 'Cycling' },
        { name: 'Cardio intervals' }
      ];
      
      const result = WorkoutTransformer.deriveWorkoutTypeFromExercises(exercises);
      
      expect(result).toBe('Cardio');
    });

    it('identifies strength workouts', () => {
      const exercises = [
        { name: 'Bench Press' },
        { name: 'Weight lifting' },
        { name: 'Strength training' }
      ];
      
      const result = WorkoutTransformer.deriveWorkoutTypeFromExercises(exercises);
      
      expect(result).toBe('Strength');
    });

    it('identifies flexibility workouts', () => {
      const exercises = [
        { name: 'Yoga poses' },
        { name: 'Stretching routine' },
        { name: 'Flexibility training' }
      ];
      
      const result = WorkoutTransformer.deriveWorkoutTypeFromExercises(exercises);
      
      expect(result).toBe('Flexibility');
    });

    it('defaults to General for unknown types', () => {
      const exercises = [
        { name: 'Some exercise' },
        { name: 'Another exercise' }
      ];
      
      const result = WorkoutTransformer.deriveWorkoutTypeFromExercises(exercises);
      
      expect(result).toBe('General');
    });

    it('handles empty exercise array', () => {
      const result = WorkoutTransformer.deriveWorkoutTypeFromExercises([]);
      
      expect(result).toBe('General');
    });

    it('handles invalid input', () => {
      const result1 = WorkoutTransformer.deriveWorkoutTypeFromExercises(null as any);
      const result2 = WorkoutTransformer.deriveWorkoutTypeFromExercises('invalid' as any);
      
      expect(result1).toBe('General');
      expect(result2).toBe('General');
    });
  });

  describe('transformMultipleForDisplay', () => {
    it('transforms array of workouts', () => {
      const mockWorkouts = [
        { id: 1, title: 'Workout 1' },
        { id: 2, title: 'Workout 2' },
        { id: 3, title: 'Workout 3' }
      ];
      
      const result = WorkoutTransformer.transformMultipleForDisplay(mockWorkouts);
      
      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('Workout 1');
      expect(result[1].title).toBe('Workout 2');
      expect(result[2].title).toBe('Workout 3');
    });

    it('handles empty array', () => {
      const result = WorkoutTransformer.transformMultipleForDisplay([]);
      
      expect(result).toHaveLength(0);
    });

    it('handles invalid input', () => {
      const result1 = WorkoutTransformer.transformMultipleForDisplay(null as any);
      const result2 = WorkoutTransformer.transformMultipleForDisplay('invalid' as any);
      
      expect(result1).toHaveLength(0);
      expect(result2).toHaveLength(0);
    });
  });

  describe('isValidWorkout', () => {
    it('validates workout with id and title', () => {
      const workout = { id: 1, title: 'Valid Workout' };
      
      expect(WorkoutTransformer.isValidWorkout(workout)).toBe(true);
    });

    it('validates workout with post_id and post_title', () => {
      const workout = { post_id: 1, post_title: 'Valid Workout' };
      
      expect(WorkoutTransformer.isValidWorkout(workout)).toBe(true);
    });

    it('rejects workout without id', () => {
      const workout = { title: 'No ID Workout' };
      
      expect(WorkoutTransformer.isValidWorkout(workout)).toBe(false);
    });

    it('rejects workout without title', () => {
      const workout = { id: 1 };
      
      expect(WorkoutTransformer.isValidWorkout(workout)).toBe(false);
    });

    it('rejects null/undefined input', () => {
      expect(WorkoutTransformer.isValidWorkout(null)).toBe(false);
      expect(WorkoutTransformer.isValidWorkout(undefined)).toBe(false);
    });

    it('rejects non-object input', () => {
      expect(WorkoutTransformer.isValidWorkout('string')).toBe(false);
      expect(WorkoutTransformer.isValidWorkout(123)).toBe(false);
    });
  });

  describe('createDefaultWorkout', () => {
    it('creates workout with safe default values', () => {
      const result = WorkoutTransformer.createDefaultWorkout();
      
      expect(result.title).toBe('Error Loading Workout');
      expect(result.description).toBe('There was an error loading this workout data.');
      expect(result.duration).toBe(30);
      expect(result.difficulty).toBe('intermediate');
      expect(result.exercises).toHaveLength(0);
      expect(result.equipment).toHaveLength(0);
      expect(result.tags).toHaveLength(0);
      expect(result.isCompleted).toBe(false);
      expect(result.isFavorite).toBe(false);
      expect(result.workoutType).toBe('General');
    });

    it('creates workout with unique ID', () => {
      const result1 = WorkoutTransformer.createDefaultWorkout();
      const result2 = WorkoutTransformer.createDefaultWorkout();
      
      expect(result1.id).not.toBe(result2.id);
      expect(typeof result1.id).toBe('string');
      expect(result1.id.toString().startsWith('error-')).toBe(true);
    });

    it('creates workout with valid dates', () => {
      const result = WorkoutTransformer.createDefaultWorkout();
      
      expect(new Date(result.created_at)).toBeInstanceOf(Date);
      expect(new Date(result.updated_at)).toBeInstanceOf(Date);
      expect(new Date(result.createdAt)).toBeInstanceOf(Date);
      expect(new Date(result.lastModified)).toBeInstanceOf(Date);
    });
  });
}); 