/**
 * Formatters Test Suite
 * 
 * Tests for all formatting functions used in WorkoutSelectionSummary
 * Covers edge cases, null values, and various input types
 */

import {
  formatGoals,
  formatFitnessLevel,
  formatIntensityLevel,
  formatComplexity,
  formatStressLevel,
  formatEnergyLevel,
  formatSleepQuality,
  formatLocation,
  formatRestrictions,
  formatDuration,
  formatCustomNotes,
  formatMuscleGroups,
  formatSelection,
  FORMATTERS
} from '../formatters';

describe('Formatter Functions', () => {
  
  describe('formatGoals', () => {
    it('formats single goal correctly', () => {
      expect(formatGoals('build-strength')).toBe('Build Strength');
      expect(formatGoals('lose_weight')).toBe('Lose Weight');
      expect(formatGoals('increase-endurance')).toBe('Increase Endurance');
    });

    it('formats multiple goals correctly', () => {
      expect(formatGoals(['build-strength', 'lose_weight'])).toBe('Build Strength, Lose Weight');
      expect(formatGoals('build-strength,lose_weight')).toBe('Build Strength, Lose Weight');
    });

    it('handles empty/null values', () => {
      expect(formatGoals('')).toBe('Not specified');
      expect(formatGoals(null)).toBe('Not specified');
      expect(formatGoals(undefined)).toBe('Not specified');
    });
  });

  describe('formatFitnessLevel', () => {
    it('formats known fitness levels', () => {
      expect(formatFitnessLevel('beginner')).toBe('Beginner');
      expect(formatFitnessLevel('intermediate')).toBe('Intermediate');
      expect(formatFitnessLevel('advanced')).toBe('Advanced');
      expect(formatFitnessLevel('expert')).toBe('Expert');
    });

    it('handles case variations', () => {
      expect(formatFitnessLevel('BEGINNER')).toBe('Beginner');
      expect(formatFitnessLevel('Intermediate')).toBe('Intermediate');
    });

    it('handles unknown levels', () => {
      expect(formatFitnessLevel('unknown')).toBe('Unknown');
      expect(formatFitnessLevel('')).toBe('Not specified');
    });
  });

  describe('formatIntensityLevel', () => {
    it('formats valid intensity levels (1-6)', () => {
      expect(formatIntensityLevel(1)).toBe('Light');
      expect(formatIntensityLevel(2)).toBe('Easy');
      expect(formatIntensityLevel(3)).toBe('Moderate');
      expect(formatIntensityLevel(4)).toBe('Hard');
      expect(formatIntensityLevel(5)).toBe('Very Hard');
      expect(formatIntensityLevel(6)).toBe('Extreme');
    });

    it('handles string numbers', () => {
      expect(formatIntensityLevel('3')).toBe('Moderate');
      expect(formatIntensityLevel('6')).toBe('Extreme');
    });

    it('handles invalid values', () => {
      expect(formatIntensityLevel(0)).toBe('Not specified');
      expect(formatIntensityLevel(7)).toBe('Not specified');
      expect(formatIntensityLevel('invalid')).toBe('Not specified');
      expect(formatIntensityLevel(null)).toBe('Not specified');
    });
  });

  describe('formatStressLevel', () => {
    it('formats known stress levels', () => {
      expect(formatStressLevel('low')).toBe('Low stress');
      expect(formatStressLevel('moderate')).toBe('Moderate stress');
      expect(formatStressLevel('high')).toBe('High stress');
      expect(formatStressLevel('very_high')).toBe('Very high stress');
    });

    it('handles unknown stress levels', () => {
      expect(formatStressLevel('unknown_level')).toBe('Unknown_level');
      expect(formatStressLevel('')).toBe('Not specified');
    });
  });

  describe('formatEnergyLevel', () => {
    it('formats known energy levels', () => {
      expect(formatEnergyLevel('low')).toBe('Low energy');
      expect(formatEnergyLevel('moderate')).toBe('Moderate energy');
      expect(formatEnergyLevel('high')).toBe('High energy');
      expect(formatEnergyLevel('very_high')).toBe('Very high energy');
    });

    it('handles unknown energy levels', () => {
      expect(formatEnergyLevel('unknown_level')).toBe('Unknown_level');
      expect(formatEnergyLevel('')).toBe('Not specified');
    });
  });

  describe('formatSleepQuality', () => {
    it('formats known sleep qualities', () => {
      expect(formatSleepQuality('poor')).toBe('Poor sleep');
      expect(formatSleepQuality('fair')).toBe('Fair sleep');
      expect(formatSleepQuality('good')).toBe('Good sleep');
      expect(formatSleepQuality('excellent')).toBe('Excellent sleep');
    });

    it('handles unknown sleep qualities', () => {
      expect(formatSleepQuality('unknown')).toBe('Unknown sleep');
      expect(formatSleepQuality('')).toBe('Not specified');
    });
  });

  describe('formatLocation', () => {
    it('formats known locations', () => {
      expect(formatLocation('home')).toBe('Home');
      expect(formatLocation('gym')).toBe('Gym');
      expect(formatLocation('outdoors')).toBe('Outdoors');
      expect(formatLocation('travel')).toBe('Travel/Hotel');
      expect(formatLocation('office')).toBe('Office');
    });

    it('handles unknown locations', () => {
      expect(formatLocation('unknown')).toBe('Unknown');
      expect(formatLocation('')).toBe('Not specified');
    });
  });

  describe('formatRestrictions', () => {
    it('formats single restriction', () => {
      expect(formatRestrictions('lower-back')).toBe('Lower Back');
      expect(formatRestrictions('knee_injury')).toBe('Knee Injury');
    });

    it('formats multiple restrictions', () => {
      expect(formatRestrictions(['lower-back', 'knee_injury'])).toBe('Lower Back, Knee Injury');
    });

    it('handles empty restrictions', () => {
      expect(formatRestrictions('')).toBe('No restrictions');
      expect(formatRestrictions([])).toBe('No restrictions');
      expect(formatRestrictions(null)).toBe('No restrictions');
    });
  });

  describe('formatDuration', () => {
    it('formats valid durations', () => {
      expect(formatDuration(30)).toBe('30 minutes');
      expect(formatDuration('45')).toBe('45 minutes');
      expect(formatDuration(60)).toBe('60 minutes');
    });

    it('handles invalid durations', () => {
      expect(formatDuration('invalid')).toBe('Not specified');
      expect(formatDuration(null)).toBe('Not specified');
      expect(formatDuration('')).toBe('Not specified');
    });
  });

  describe('formatCustomNotes', () => {
    it('formats normal notes', () => {
      expect(formatCustomNotes('Focus on upper body')).toBe('Focus on upper body');
    });

    it('truncates long notes', () => {
      const longNote = 'This is a very long note that should be truncated because it exceeds the maximum length limit for display purposes';
      const result = formatCustomNotes(longNote);
      expect(result.length).toBeLessThanOrEqual(103); // 100 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('handles empty notes', () => {
      expect(formatCustomNotes('')).toBe('No custom notes');
      expect(formatCustomNotes('   ')).toBe('No custom notes');
      expect(formatCustomNotes(null)).toBe('No custom notes');
    });
  });

  describe('formatMuscleGroups', () => {
    it('formats single muscle group', () => {
      expect(formatMuscleGroups('chest')).toBe('Chest');
      expect(formatMuscleGroups('upper-back')).toBe('Upper Back');
    });

    it('formats multiple muscle groups', () => {
      expect(formatMuscleGroups(['chest', 'arms'])).toBe('Chest, Arms');
      expect(formatMuscleGroups('chest,arms')).toBe('Chest, Arms');
    });

    it('handles empty muscle groups', () => {
      expect(formatMuscleGroups('')).toBe('No specific focus');
      expect(formatMuscleGroups([])).toBe('No specific focus');
    });
  });

  describe('formatSelection (generic formatter)', () => {
    it('routes to specific formatters', () => {
      expect(formatSelection('goals', 'build-strength')).toBe('Build Strength');
      expect(formatSelection('intensity_level', 4)).toBe('Hard');
      expect(formatSelection('duration', 30)).toBe('30 minutes');
    });

    it('handles unknown fields', () => {
      expect(formatSelection('unknown_field', 'test value')).toBe('Test value');
      expect(formatSelection('unknown_field', null)).toBe('Not specified');
      expect(formatSelection('unknown_field', ['a', 'b'])).toBe('a, b');
    });

    it('handles various data types for unknown fields', () => {
      expect(formatSelection('unknown', true)).toBe('Yes');
      expect(formatSelection('unknown', false)).toBe('No');
      expect(formatSelection('unknown', 123)).toBe('123');
      expect(formatSelection('unknown', { key: 'value' })).toBe('[object Object]');
    });
  });

  describe('FORMATTERS registry', () => {
    it('contains all expected formatters', () => {
      const expectedFormatters = [
        'goals',
        'fitness_level',
        'intensity_level',
        'exercise_complexity',
        'stress_level',
        'energy_level',
        'sleep_quality',
        'location',
        'restrictions',
        'duration',
        'custom_notes',
        'primary_muscle_focus'
      ];

      expectedFormatters.forEach(formatter => {
        expect(FORMATTERS).toHaveProperty(formatter);
        expect(typeof FORMATTERS[formatter as keyof typeof FORMATTERS]).toBe('function');
      });
    });

    it('formatters work correctly through registry', () => {
      expect(FORMATTERS.goals('build-strength')).toBe('Build Strength');
      expect(FORMATTERS.intensity_level(4)).toBe('Hard');
      expect(FORMATTERS.duration(30)).toBe('30 minutes');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles null and undefined values across all formatters', () => {
      const testValues = [null, undefined, ''];
      
      Object.values(FORMATTERS).forEach(formatter => {
        testValues.forEach(value => {
          expect(() => formatter(value)).not.toThrow();
          const result = formatter(value);
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        });
      });
    });

    it('handles arrays with empty/null elements', () => {
      expect(formatGoals(['', null, 'build-strength', undefined])).toBe('Build Strength');
      expect(formatRestrictions(['', 'lower-back', null])).toBe('Lower Back');
    });

    it('handles special characters and unicode', () => {
      expect(formatGoals('build-💪-strength')).toBe('Build 💪 Strength');
      expect(formatCustomNotes('Special chars: @#$%')).toBe('Special chars: @#$%');
    });

    it('maintains whitespace correctly', () => {
      expect(formatCustomNotes('  spaced text  ')).toBe('spaced text');
      expect(formatGoals('  build-strength  ')).toBe('Build Strength');
    });
  });
}); 