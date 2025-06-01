/**
 * WorkoutValidator Service Tests
 * 
 * Comprehensive unit tests for workout data validation logic.
 * Part of Week 1 Foundation Sprint - Service Testing.
 */

import { WorkoutValidator } from '../WorkoutValidator';

describe('WorkoutValidator', () => {
  describe('isValidWorkout', () => {
    it('validates workout with id and title', () => {
      const workout = { id: 1, title: 'Valid Workout' };
      
      expect(WorkoutValidator.isValidWorkout(workout)).toBe(true);
    });

    it('validates workout with post_id and post_title', () => {
      const workout = { post_id: 1, post_title: 'Valid Workout' };
      
      expect(WorkoutValidator.isValidWorkout(workout)).toBe(true);
    });

    it('rejects workout without id', () => {
      const workout = { title: 'No ID Workout' };
      
      expect(WorkoutValidator.isValidWorkout(workout)).toBe(false);
    });

    it('rejects workout without title', () => {
      const workout = { id: 1 };
      
      expect(WorkoutValidator.isValidWorkout(workout)).toBe(false);
    });

    it('rejects null/undefined input', () => {
      expect(WorkoutValidator.isValidWorkout(null)).toBe(false);
      expect(WorkoutValidator.isValidWorkout(undefined)).toBe(false);
    });

    it('rejects non-object input', () => {
      expect(WorkoutValidator.isValidWorkout('string')).toBe(false);
      expect(WorkoutValidator.isValidWorkout(123)).toBe(false);
    });
  });

  describe('validateWorkout', () => {
    it('validates complete workout successfully', () => {
      const workout = {
        id: 1,
        title: 'Complete Workout',
        description: 'A complete workout description',
        duration: 45,
        difficulty: 'intermediate',
        created_at: '2023-05-31T14:20:09Z'
      };
      
      const result = WorkoutValidator.validateWorkout(workout);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('identifies missing required fields', () => {
      const workout = {};
      
      const result = WorkoutValidator.validateWorkout(workout);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Workout must have an id or post_id');
      expect(result.errors).toContain('Workout must have a title or post_title');
    });

    it('handles null/undefined input', () => {
      const result1 = WorkoutValidator.validateWorkout(null);
      const result2 = WorkoutValidator.validateWorkout(undefined);
      
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Workout is null, undefined, or not an object');
      expect(result2.isValid).toBe(false);
    });

    it('warns about empty title', () => {
      const workout = { id: 1, title: '   ' };
      
      const result = WorkoutValidator.validateWorkout(workout);
      
      expect(result.warnings).toContain('Workout title is empty');
    });

    it('warns about very long title', () => {
      const workout = { id: 1, title: 'A'.repeat(250) };
      
      const result = WorkoutValidator.validateWorkout(workout);
      
      expect(result.warnings).toContain('Workout title is very long (>200 characters)');
    });

    it('validates duration correctly', () => {
      const workout1 = { id: 1, title: 'Test', duration: -5 };
      const workout2 = { id: 2, title: 'Test', duration: 500 };
      const workout3 = { id: 3, title: 'Test', duration: '30' };
      
      const result1 = WorkoutValidator.validateWorkout(workout1);
      const result2 = WorkoutValidator.validateWorkout(workout2);
      const result3 = WorkoutValidator.validateWorkout(workout3);
      
      expect(result1.warnings).toContain('Workout duration cannot be negative');
      expect(result2.warnings).toContain('Workout duration seems very long (>8 hours)');
      expect(result3.warnings).toContain('Workout duration should be a number');
    });

    it('validates difficulty levels', () => {
      const workout = { id: 1, title: 'Test', difficulty: 'expert' };
      
      const result = WorkoutValidator.validateWorkout(workout);
      
      expect(result.warnings).toContain('Invalid difficulty level: expert. Valid options: beginner, intermediate, advanced');
    });

    it('validates date formats', () => {
      const workout = { 
        id: 1, 
        title: 'Test', 
        created_at: 'invalid-date',
        post_date: '2023-13-45'
      };
      
      const result = WorkoutValidator.validateWorkout(workout);
      
      expect(result.warnings).toContain('Invalid date format in field: created_at');
      expect(result.warnings).toContain('Invalid date format in field: post_date');
    });
  });

  describe('isValidExercise', () => {
    it('validates exercise with name and sets', () => {
      const exercise = { name: 'Push-ups', sets: 3, reps: 10 };
      
      expect(WorkoutValidator.isValidExercise(exercise)).toBe(true);
    });

    it('validates exercise with name and duration', () => {
      const exercise = { name: 'Running', duration: '30 minutes' };
      
      expect(WorkoutValidator.isValidExercise(exercise)).toBe(true);
    });

    it('rejects exercise without name', () => {
      const exercise = { sets: 3, reps: 10 };
      
      expect(WorkoutValidator.isValidExercise(exercise)).toBe(false);
    });

    it('rejects exercise with empty name', () => {
      const exercise = { name: '   ', sets: 3 };
      
      expect(WorkoutValidator.isValidExercise(exercise)).toBe(false);
    });

    it('rejects exercise without sets, reps, or duration', () => {
      const exercise = { name: 'Exercise' };
      
      expect(WorkoutValidator.isValidExercise(exercise)).toBe(false);
    });

    it('rejects null/undefined input', () => {
      expect(WorkoutValidator.isValidExercise(null)).toBe(false);
      expect(WorkoutValidator.isValidExercise(undefined)).toBe(false);
    });
  });

  describe('validateExercises', () => {
    it('validates array of valid exercises', () => {
      const exercises = [
        { name: 'Push-ups', sets: 3, reps: 10 },
        { name: 'Running', duration: '30 minutes' }
      ];
      
      const result = WorkoutValidator.validateExercises(exercises);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('warns about empty exercise array', () => {
      const result = WorkoutValidator.validateExercises([]);
      
      expect(result.warnings).toContain('Workout has no exercises');
    });

    it('rejects non-array input', () => {
      const result = WorkoutValidator.validateExercises('not-array' as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Exercises must be an array');
    });

    it('identifies invalid exercises', () => {
      const exercises = [
        { name: 'Valid Exercise', sets: 3 },
        { sets: 3 }, // Missing name
        { name: 'No reps/sets/duration' }
      ];
      
      const result = WorkoutValidator.validateExercises(exercises);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Exercise 2 is invalid or missing required fields');
      expect(result.errors).toContain('Exercise 3 is invalid or missing required fields');
    });

    it('warns about exercises with invalid values', () => {
      const exercises = [
        { name: 'Exercise 1', sets: -1, reps: 10 },
        { name: 'Exercise 2', sets: 3, reps: 0 }
      ];
      
      const result = WorkoutValidator.validateExercises(exercises);
      
      expect(result.warnings).toContain('Exercise 1 (Exercise 1) has invalid sets value');
      expect(result.warnings).toContain('Exercise 2 (Exercise 2) has invalid reps value');
    });
  });

  describe('isValidWorkoutData', () => {
    it('validates JSON string with exercises', () => {
      const workoutData = JSON.stringify({
        exercises: [{ name: 'Push-ups', sets: 3 }]
      });
      
      expect(WorkoutValidator.isValidWorkoutData(workoutData)).toBe(true);
    });

    it('validates object with sections', () => {
      const workoutData = {
        sections: [{ name: 'Warm-up', exercises: [] }]
      };
      
      expect(WorkoutValidator.isValidWorkoutData(workoutData)).toBe(true);
    });

    it('rejects invalid JSON string', () => {
      const workoutData = 'invalid json{';
      
      expect(WorkoutValidator.isValidWorkoutData(workoutData)).toBe(false);
    });

    it('rejects object without exercises or sections', () => {
      const workoutData = { title: 'Test' };
      
      expect(WorkoutValidator.isValidWorkoutData(workoutData)).toBe(false);
    });
  });

  describe('isValidEquipment', () => {
    it('validates array of equipment strings', () => {
      const equipment = ['dumbbells', 'barbell', 'resistance bands'];
      
      expect(WorkoutValidator.isValidEquipment(equipment)).toBe(true);
    });

    it('rejects non-array input', () => {
      expect(WorkoutValidator.isValidEquipment('dumbbells')).toBe(false);
    });

    it('rejects array with non-string items', () => {
      const equipment = ['dumbbells', 123, 'barbell'];
      
      expect(WorkoutValidator.isValidEquipment(equipment)).toBe(false);
    });

    it('rejects array with empty strings', () => {
      const equipment = ['dumbbells', '', 'barbell'];
      
      expect(WorkoutValidator.isValidEquipment(equipment)).toBe(false);
    });
  });

  describe('isValidTags', () => {
    it('validates array of tag strings', () => {
      const tags = ['strength', 'upper body', 'beginner'];
      
      expect(WorkoutValidator.isValidTags(tags)).toBe(true);
    });

    it('rejects non-array input', () => {
      expect(WorkoutValidator.isValidTags('strength')).toBe(false);
    });

    it('rejects array with non-string items', () => {
      const tags = ['strength', 123, 'cardio'];
      
      expect(WorkoutValidator.isValidTags(tags)).toBe(false);
    });

    it('rejects array with empty strings', () => {
      const tags = ['strength', '   ', 'cardio'];
      
      expect(WorkoutValidator.isValidTags(tags)).toBe(false);
    });
  });

  describe('isValidDateString', () => {
    it('validates valid date strings', () => {
      expect(WorkoutValidator.isValidDateString('2023-05-31T14:20:09Z')).toBe(true);
      expect(WorkoutValidator.isValidDateString('2023-05-31')).toBe(true);
      expect(WorkoutValidator.isValidDateString('May 31, 2023')).toBe(true);
    });

    it('rejects invalid date strings', () => {
      expect(WorkoutValidator.isValidDateString('invalid-date')).toBe(false);
      expect(WorkoutValidator.isValidDateString('2023-13-45')).toBe(false);
    });

    it('rejects very old dates', () => {
      expect(WorkoutValidator.isValidDateString('1800-01-01')).toBe(false);
    });

    it('rejects non-string input', () => {
      expect(WorkoutValidator.isValidDateString(123)).toBe(false);
      expect(WorkoutValidator.isValidDateString(new Date())).toBe(false);
    });
  });

  describe('isValidRating', () => {
    it('validates ratings 1-5', () => {
      expect(WorkoutValidator.isValidRating(1)).toBe(true);
      expect(WorkoutValidator.isValidRating(3)).toBe(true);
      expect(WorkoutValidator.isValidRating(5)).toBe(true);
    });

    it('rejects ratings outside 1-5 range', () => {
      expect(WorkoutValidator.isValidRating(0)).toBe(false);
      expect(WorkoutValidator.isValidRating(6)).toBe(false);
    });

    it('rejects decimal ratings', () => {
      expect(WorkoutValidator.isValidRating(3.5)).toBe(false);
    });

    it('rejects non-number input', () => {
      expect(WorkoutValidator.isValidRating('3')).toBe(false);
      expect(WorkoutValidator.isValidRating(null)).toBe(false);
    });
  });

  describe('checkDataCorruption', () => {
    it('identifies malformed workout_data JSON', () => {
      const workout = { workout_data: 'invalid json{' };
      
      const issues = WorkoutValidator.checkDataCorruption(workout);
      
      expect(issues).toContain('workout_data contains invalid JSON');
    });

    it('identifies missing exercise data', () => {
      const workout = { id: 1, title: 'Test' };
      
      const issues = WorkoutValidator.checkDataCorruption(workout);
      
      expect(issues).toContain('No exercise data found in any expected location');
    });

    it('identifies inconsistent IDs', () => {
      const workout = { id: 1, post_id: 2, title: 'Test' };
      
      const issues = WorkoutValidator.checkDataCorruption(workout);
      
      expect(issues).toContain('Inconsistent ID values between id and post_id');
    });

    it('identifies inconsistent titles', () => {
      const workout = { 
        id: 1, 
        title: 'Title 1', 
        post_title: 'Title 2' 
      };
      
      const issues = WorkoutValidator.checkDataCorruption(workout);
      
      expect(issues).toContain('Inconsistent title values between title and post_title');
    });

    it('identifies future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const workout = { 
        id: 1, 
        title: 'Test',
        created_at: futureDate.toISOString()
      };
      
      const issues = WorkoutValidator.checkDataCorruption(workout);
      
      expect(issues).toContain('Created date is in the future');
    });

    it('returns empty array for clean workout', () => {
      const workout = {
        id: 1,
        title: 'Clean Workout',
        exercises: [{ name: 'Push-ups', sets: 3 }],
        created_at: '2023-05-31T14:20:09Z'
      };
      
      const issues = WorkoutValidator.checkDataCorruption(workout);
      
      expect(issues).toHaveLength(0);
    });
  });

  describe('sanitizeWorkout', () => {
    it('sanitizes invalid tags array', () => {
      const workout = { 
        id: 1, 
        title: 'Test',
        tags: ['valid', 123, '', 'another valid'] 
      };
      
      const result = WorkoutValidator.sanitizeWorkout(workout);
      
      expect(result.tags).toEqual([]);
    });

    it('sanitizes invalid equipment array', () => {
      const workout = { 
        id: 1, 
        title: 'Test',
        equipment: ['dumbbells', null, 'barbell'] 
      };
      
      const result = WorkoutValidator.sanitizeWorkout(workout);
      
      expect(result.equipment).toEqual([]);
    });

    it('sanitizes invalid rating', () => {
      const workout = { 
        id: 1, 
        title: 'Test',
        rating: 7 
      };
      
      const result = WorkoutValidator.sanitizeWorkout(workout);
      
      expect(result.rating).toBeUndefined();
    });

    it('sanitizes boolean fields', () => {
      const workout = { 
        id: 1, 
        title: 'Test',
        isCompleted: 'true',
        isFavorite: 1
      };
      
      const result = WorkoutValidator.sanitizeWorkout(workout);
      
      expect(result.isCompleted).toBe(true);
      expect(result.isFavorite).toBe(true);
    });

    it('preserves valid data', () => {
      const workout = {
        id: 1,
        title: 'Valid Workout',
        tags: ['strength', 'upper body'],
        equipment: ['dumbbells', 'barbell'],
        rating: 4,
        isCompleted: false
      };
      
      const result = WorkoutValidator.sanitizeWorkout(workout);
      
      expect(result.tags).toEqual(['strength', 'upper body']);
      expect(result.equipment).toEqual(['dumbbells', 'barbell']);
      expect(result.rating).toBe(4);
      expect(result.isCompleted).toBe(false);
    });

    it('handles null/undefined input', () => {
      expect(WorkoutValidator.sanitizeWorkout(null)).toBe(null);
      expect(WorkoutValidator.sanitizeWorkout(undefined)).toBe(null);
    });
  });
}); 