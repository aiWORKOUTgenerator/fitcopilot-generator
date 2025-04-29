/**
 * ResponseParser Unit Tests
 *
 * Tests the ResponseParser utility that handles AI responses including:
 * - JSON parsing from raw text
 * - Error handling for invalid responses
 * - Validation of workout structures
 * - Extraction of workout data from different AI response formats
 */

import { parseAIResponse } from '../responseParser';
import type { Workout } from '../../types';

describe('ResponseParser', () => {
  describe('parseAIResponse', () => {
    test('successfully parses valid JSON response', () => {
      const validResponse = `
        {
          "workout": {
            "name": "Full Body HIIT",
            "description": "High-intensity interval training focusing on full body",
            "duration": 30,
            "difficulty": "intermediate",
            "equipment": ["dumbbells", "mat"],
            "exercises": [
              {
                "name": "Push-ups",
                "sets": 3,
                "reps": 15,
                "duration": 0,
                "rest": 30,
                "description": "Standard push-ups"
              },
              {
                "name": "Squats",
                "sets": 3,
                "reps": 20,
                "duration": 0,
                "rest": 30,
                "description": "Bodyweight squats"
              }
            ],
            "cooldown": [
              {
                "name": "Stretching",
                "duration": 300,
                "description": "Full body stretching routine"
              }
            ]
          }
        }`;

      const result = parseAIResponse(validResponse);
      
      expect(result).toBeDefined();
      expect(result.workout).toBeDefined();
      expect(result.workout.name).toBe('Full Body HIIT');
      expect(result.workout.exercises.length).toBe(2);
      expect(result.workout.cooldown.length).toBe(1);
    });
    
    test('correctly parses response with markdown code blocks', () => {
      const markdownResponse = `
        Here's a great workout routine for you:

        \`\`\`json
        {
          "workout": {
            "name": "Cardio Blast",
            "description": "High energy cardio workout",
            "duration": 25,
            "difficulty": "beginner",
            "equipment": ["none"],
            "exercises": [
              {
                "name": "Jumping Jacks",
                "sets": 1,
                "reps": 0,
                "duration": 60,
                "rest": 20,
                "description": "Standard jumping jacks"
              }
            ],
            "cooldown": []
          }
        }
        \`\`\`

        Enjoy your workout!
      `;

      const result = parseAIResponse(markdownResponse);
      
      expect(result).toBeDefined();
      expect(result.workout.name).toBe('Cardio Blast');
      expect(result.workout.equipment).toEqual(['none']);
      expect(result.workout.exercises[0].name).toBe('Jumping Jacks');
    });
    
    test('handles multiple JSON blocks and extracts the first valid workout', () => {
      const multipleBlocksResponse = `
        I've created two different workouts for you to choose from:

        First option:
        \`\`\`json
        {
          "workout": {
            "name": "Morning Energizer",
            "description": "Quick morning routine",
            "duration": 15,
            "difficulty": "beginner",
            "equipment": ["none"],
            "exercises": [
              {
                "name": "Bodyweight Lunges",
                "sets": 2,
                "reps": 10,
                "duration": 0,
                "rest": 30,
                "description": "Alternating lunges"
              }
            ],
            "cooldown": []
          }
        }
        \`\`\`

        Second option:
        \`\`\`json
        {
          "workout": {
            "name": "Evening Relaxer",
            "description": "Gentle evening workout",
            "duration": 20,
            "difficulty": "beginner",
            "equipment": ["mat"],
            "exercises": [
              {
                "name": "Gentle Stretches",
                "sets": 1,
                "reps": 0,
                "duration": 300,
                "rest": 0,
                "description": "Full body stretches"
              }
            ],
            "cooldown": []
          }
        }
        \`\`\`
      `;

      const result = parseAIResponse(multipleBlocksResponse);
      
      expect(result).toBeDefined();
      expect(result.workout.name).toBe('Morning Energizer');
    });
    
    test('recovers from JSON with minor syntax errors', () => {
      const minorErrorResponse = `
        {
          "workout": {
            "name": "Strength Builder",
            "description": "Focus on building strength",
            "duration": 45,
            "difficulty": "advanced",
            "equipment": ["dumbbells", "barbell", "bench"],
            "exercises": [
              {
                "name": "Bench Press",
                "sets": 4,
                "reps": 8,
                "duration": 0,
                "rest": 90,
                "description": "Barbell bench press"
              },
              {
                "name": "Deadlifts",
                "sets": 3,
                "reps": 10,
                "duration": 0,
                "rest": 120,
                "description": "Standard deadlifts"
              }
            ],
            "cooldown": []
          }
        }`;

      // Introduce a minor error (extra comma)
      const corruptedResponse = minorErrorResponse.replace('"bench"],', '"bench"],,,');
      
      const result = parseAIResponse(corruptedResponse);
      
      expect(result).toBeDefined();
      expect(result.workout.name).toBe('Strength Builder');
      expect(result.workout.exercises.length).toBe(2);
    });
    
    test('throws error for completely invalid JSON', () => {
      const invalidResponse = 'This is not JSON at all';
      
      expect(() => parseAIResponse(invalidResponse)).toThrow(/Failed to parse AI response/);
    });
    
    test('validates workout structure and reports missing required fields', () => {
      const incompleteResponse = `
        {
          "workout": {
            "name": "Incomplete Workout",
            "description": "Missing required fields",
            "exercises": []
          }
        }`;
      
      expect(() => parseAIResponse(incompleteResponse)).toThrow(/Invalid workout structure/);
    });
    
    test('handles alternative response structures and normalizes them', () => {
      const alternativeResponse = `
        {
          "name": "Alternative Structure",
          "description": "Different JSON structure",
          "duration": 30,
          "difficulty": "intermediate",
          "equipment": ["resistance bands"],
          "exercises": [
            {
              "name": "Band Pulls",
              "sets": 3,
              "reps": 15,
              "duration": 0,
              "rest": 30,
              "description": "Pull with resistance bands"
            }
          ],
          "cooldown": []
        }`;
      
      const result = parseAIResponse(alternativeResponse);
      
      expect(result).toBeDefined();
      expect(result.workout.name).toBe('Alternative Structure');
      expect(result.workout.equipment).toEqual(['resistance bands']);
    });
    
    test('extracts workout from nested objects', () => {
      const nestedResponse = `
        {
          "response": {
            "data": {
              "workout": {
                "name": "Nested Workout",
                "description": "Deeply nested in response",
                "duration": 20,
                "difficulty": "beginner",
                "equipment": ["none"],
                "exercises": [
                  {
                    "name": "Sit-ups",
                    "sets": 3,
                    "reps": 10,
                    "duration": 0,
                    "rest": 30,
                    "description": "Basic sit-ups"
                  }
                ],
                "cooldown": []
              }
            }
          }
        }`;
      
      const result = parseAIResponse(nestedResponse);
      
      expect(result).toBeDefined();
      expect(result.workout.name).toBe('Nested Workout');
      expect(result.workout.exercises[0].name).toBe('Sit-ups');
    });
    
    test('correctly validates exercise structure within workout', () => {
      const invalidExercisesResponse = `
        {
          "workout": {
            "name": "Invalid Exercises",
            "description": "Workout with invalid exercise structure",
            "duration": 30,
            "difficulty": "intermediate",
            "equipment": ["none"],
            "exercises": [
              {
                "name": "Invalid Exercise",
                "sets": "not a number",
                "reps": "also not a number"
              }
            ],
            "cooldown": []
          }
        }`;
      
      expect(() => parseAIResponse(invalidExercisesResponse)).toThrow(/Invalid exercise structure/);
    });
    
    test('handles response with extra fields gracefully', () => {
      const extraFieldsResponse = `
        {
          "workout": {
            "name": "Extra Fields Workout",
            "description": "Contains extra fields",
            "duration": 40,
            "difficulty": "intermediate",
            "equipment": ["kettlebell"],
            "exercises": [
              {
                "name": "Kettlebell Swings",
                "sets": 3,
                "reps": 15,
                "duration": 0,
                "rest": 45,
                "description": "Standard kettlebell swings",
                "extraField1": "should be ignored",
                "extraField2": 123
              }
            ],
            "cooldown": [],
            "extraWorkoutField": "should be ignored",
            "anotherExtraField": [1, 2, 3]
          }
        }`;
      
      const result = parseAIResponse(extraFieldsResponse);
      
      expect(result).toBeDefined();
      expect(result.workout.name).toBe('Extra Fields Workout');
      // @ts-ignore - Testing absence of extra fields
      expect(result.workout.extraWorkoutField).toBeUndefined();
      // @ts-ignore - Testing absence of extra fields in exercises
      expect(result.workout.exercises[0].extraField1).toBeUndefined();
    });
    
    test('validates cooldown exercises structure', () => {
      const invalidCooldownResponse = `
        {
          "workout": {
            "name": "Invalid Cooldown",
            "description": "Workout with invalid cooldown",
            "duration": 30,
            "difficulty": "beginner",
            "equipment": ["none"],
            "exercises": [
              {
                "name": "Jumping Jacks",
                "sets": 3,
                "reps": 20,
                "duration": 0,
                "rest": 15,
                "description": "Standard jumping jacks"
              }
            ],
            "cooldown": [
              {
                "name": "Invalid Cooldown",
                "invalidField": "value"
              }
            ]
          }
        }`;
      
      expect(() => parseAIResponse(invalidCooldownResponse)).toThrow(/Invalid cooldown exercise/);
    });
    
    test('converts string number values to actual numbers', () => {
      const stringNumbersResponse = `
        {
          "workout": {
            "name": "String Numbers",
            "description": "Contains numbers as strings",
            "duration": "25",
            "difficulty": "intermediate",
            "equipment": ["dumbbells"],
            "exercises": [
              {
                "name": "Bicep Curls",
                "sets": "3",
                "reps": "12",
                "duration": "0",
                "rest": "60",
                "description": "Dumbbell bicep curls"
              }
            ],
            "cooldown": []
          }
        }`;
      
      const result = parseAIResponse(stringNumbersResponse);
      
      expect(result).toBeDefined();
      expect(typeof result.workout.duration).toBe('number');
      expect(result.workout.duration).toBe(25);
      expect(typeof result.workout.exercises[0].sets).toBe('number');
      expect(result.workout.exercises[0].sets).toBe(3);
    });
  });
}); 