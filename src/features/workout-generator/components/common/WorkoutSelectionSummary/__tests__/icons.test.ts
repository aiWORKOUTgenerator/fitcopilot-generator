/**
 * Icons Test Suite
 * 
 * Tests for icon helper functions used in WorkoutSelectionSummary
 * Covers dynamic icon selection and static icon mappings
 */

import {
  getStressIcon,
  getEnergyIcon,
  getSleepIcon,
  getLocationIcon,
  getIntensityIcon,
  getFitnessLevelIcon,
  getGoalsIcon,
  getSelectionIcon,
  getCategoryIcon,
  STATIC_SELECTION_ICONS,
  DYNAMIC_SELECTION_ICONS,
  CATEGORY_ICONS
} from '../icons';

describe('Icon Helper Functions', () => {
  
  describe('getStressIcon', () => {
    it('returns correct icons for stress levels', () => {
      expect(getStressIcon('low')).toBe('😌');
      expect(getStressIcon('moderate')).toBe('😐');
      expect(getStressIcon('high')).toBe('😰');
      expect(getStressIcon('very_high')).toBe('🤯');
    });

    it('handles case variations', () => {
      expect(getStressIcon('LOW')).toBe('😌');
      expect(getStressIcon('Moderate')).toBe('😐');
    });

    it('handles invalid/empty values', () => {
      expect(getStressIcon('')).toBe('❓');
      expect(getStressIcon(null)).toBe('❓');
      expect(getStressIcon('unknown')).toBe('😐'); // fallback
    });
  });

  describe('getEnergyIcon', () => {
    it('returns correct icons for energy levels', () => {
      expect(getEnergyIcon('low')).toBe('🔋');
      expect(getEnergyIcon('moderate')).toBe('⚡');
      expect(getEnergyIcon('high')).toBe('🔥');
      expect(getEnergyIcon('very_high')).toBe('⚡🔥');
    });

    it('handles case variations', () => {
      expect(getEnergyIcon('HIGH')).toBe('🔥');
      expect(getEnergyIcon('Very_High')).toBe('⚡🔥');
    });

    it('handles invalid/empty values', () => {
      expect(getEnergyIcon('')).toBe('❓');
      expect(getEnergyIcon(null)).toBe('❓');
      expect(getEnergyIcon('unknown')).toBe('⚡'); // fallback
    });
  });

  describe('getSleepIcon', () => {
    it('returns correct icons for sleep quality', () => {
      expect(getSleepIcon('poor')).toBe('😴');
      expect(getSleepIcon('fair')).toBe('😪');
      expect(getSleepIcon('good')).toBe('😊');
      expect(getSleepIcon('excellent')).toBe('🌟');
    });

    it('handles case variations', () => {
      expect(getSleepIcon('GOOD')).toBe('😊');
      expect(getSleepIcon('Excellent')).toBe('🌟');
    });

    it('handles invalid/empty values', () => {
      expect(getSleepIcon('')).toBe('❓');
      expect(getSleepIcon('unknown')).toBe('😴'); // fallback
    });
  });

  describe('getLocationIcon', () => {
    it('returns correct icons for locations', () => {
      expect(getLocationIcon('home')).toBe('🏠');
      expect(getLocationIcon('gym')).toBe('🏋️‍♂️');
      expect(getLocationIcon('outdoors')).toBe('🌳');
      expect(getLocationIcon('travel')).toBe('✈️');
      expect(getLocationIcon('office')).toBe('🏢');
    });

    it('handles case variations', () => {
      expect(getLocationIcon('HOME')).toBe('🏠');
      expect(getLocationIcon('Gym')).toBe('🏋️‍♂️');
    });

    it('handles invalid/empty values', () => {
      expect(getLocationIcon('')).toBe('❓');
      expect(getLocationIcon('unknown')).toBe('📍'); // fallback
    });
  });

  describe('getIntensityIcon', () => {
    it('returns correct icons for intensity levels (1-6)', () => {
      expect(getIntensityIcon(1)).toBe('🚶');
      expect(getIntensityIcon(2)).toBe('🏃‍♀️');
      expect(getIntensityIcon(3)).toBe('💪');
      expect(getIntensityIcon(4)).toBe('🔥');
      expect(getIntensityIcon(5)).toBe('💥');
      expect(getIntensityIcon(6)).toBe('⚡');
    });

    it('handles string numbers', () => {
      expect(getIntensityIcon('3')).toBe('💪');
      expect(getIntensityIcon('6')).toBe('⚡');
    });

    it('handles invalid values', () => {
      expect(getIntensityIcon(0)).toBe('❓');
      expect(getIntensityIcon(7)).toBe('🔥'); // fallback
      expect(getIntensityIcon('invalid')).toBe('❓');
      expect(getIntensityIcon(null)).toBe('❓');
    });
  });

  describe('getFitnessLevelIcon', () => {
    it('returns correct icons for fitness levels', () => {
      expect(getFitnessLevelIcon('beginner')).toBe('🟢');
      expect(getFitnessLevelIcon('intermediate')).toBe('🟡');
      expect(getFitnessLevelIcon('advanced')).toBe('🔴');
      expect(getFitnessLevelIcon('expert')).toBe('🟣');
    });

    it('handles case variations', () => {
      expect(getFitnessLevelIcon('BEGINNER')).toBe('🟢');
      expect(getFitnessLevelIcon('Advanced')).toBe('🔴');
    });

    it('handles invalid/empty values', () => {
      expect(getFitnessLevelIcon('')).toBe('❓');
      expect(getFitnessLevelIcon('unknown')).toBe('🟡'); // fallback
    });
  });

  describe('getGoalsIcon', () => {
    it('returns specific icons based on goal keywords', () => {
      expect(getGoalsIcon('build-strength')).toBe('💪');
      expect(getGoalsIcon('increase-muscle')).toBe('💪');
      expect(getGoalsIcon('cardio-fitness')).toBe('❤️');
      expect(getGoalsIcon('endurance-training')).toBe('❤️');
      expect(getGoalsIcon('lose-weight')).toBe('⚖️');
      expect(getGoalsIcon('weight-loss')).toBe('⚖️');
      expect(getGoalsIcon('flexibility-training')).toBe('🤸‍♀️');
      expect(getGoalsIcon('stretch-routine')).toBe('🤸‍♀️');
      expect(getGoalsIcon('balance-improvement')).toBe('⚖️');
      expect(getGoalsIcon('mobility-work')).toBe('🔄');
    });

    it('handles arrays of goals', () => {
      expect(getGoalsIcon(['build-strength', 'cardio'])).toBe('💪'); // prioritizes first match
      expect(getGoalsIcon(['general', 'cardio-fitness'])).toBe('❤️');
    });

    it('returns default icon for unrecognized goals', () => {
      expect(getGoalsIcon('unknown-goal')).toBe('🎯');
      expect(getGoalsIcon(['random', 'goal'])).toBe('🎯');
    });

    it('handles empty/null values', () => {
      expect(getGoalsIcon('')).toBe('❓');
      expect(getGoalsIcon(null)).toBe('❓');
      expect(getGoalsIcon([])).toBe('❓');
    });
  });

  describe('getSelectionIcon', () => {
    it('routes to dynamic icon functions', () => {
      expect(getSelectionIcon('stress_level', 'high')).toBe('😰');
      expect(getSelectionIcon('energy_level', 'low')).toBe('🔋');
      expect(getSelectionIcon('intensity_level', 4)).toBe('🔥');
    });

    it('returns static icons', () => {
      expect(getSelectionIcon('custom_notes', 'any')).toBe('📝');
      expect(getSelectionIcon('restrictions', 'any')).toBe('🚫');
    });

    it('returns fallback icon for unknown fields', () => {
      expect(getSelectionIcon('unknown_field', 'any')).toBe('📊');
    });
  });

  describe('getCategoryIcon', () => {
    it('returns correct category icons', () => {
      expect(getCategoryIcon('workout-setup')).toBeDefined();
      expect(getCategoryIcon('fitness-level')).toBeDefined();
      expect(getCategoryIcon('daily-state')).toBeDefined();
      expect(getCategoryIcon('restrictions')).toBeDefined();
      expect(getCategoryIcon('environment')).toBeDefined();
    });

    it('returns fallback icon for unknown category', () => {
      expect(getCategoryIcon('unknown-category')).toBeDefined();
    });
  });

  describe('Icon Registries', () => {
    it('STATIC_SELECTION_ICONS contains expected entries', () => {
      expect(STATIC_SELECTION_ICONS).toHaveProperty('duration');
      expect(STATIC_SELECTION_ICONS).toHaveProperty('custom_notes');
      expect(STATIC_SELECTION_ICONS).toHaveProperty('restrictions');
      expect(STATIC_SELECTION_ICONS).toHaveProperty('exercise_complexity');
      expect(STATIC_SELECTION_ICONS).toHaveProperty('primary_muscle_focus');
    });

    it('DYNAMIC_SELECTION_ICONS contains expected functions', () => {
      expect(DYNAMIC_SELECTION_ICONS).toHaveProperty('stress_level');
      expect(DYNAMIC_SELECTION_ICONS).toHaveProperty('energy_level');
      expect(DYNAMIC_SELECTION_ICONS).toHaveProperty('sleep_quality');
      expect(DYNAMIC_SELECTION_ICONS).toHaveProperty('location');
      expect(DYNAMIC_SELECTION_ICONS).toHaveProperty('intensity_level');
      expect(DYNAMIC_SELECTION_ICONS).toHaveProperty('fitness_level');
      expect(DYNAMIC_SELECTION_ICONS).toHaveProperty('goals');

      // All should be functions
      Object.values(DYNAMIC_SELECTION_ICONS).forEach(iconFunction => {
        expect(typeof iconFunction).toBe('function');
      });
    });

    it('CATEGORY_ICONS contains all expected categories', () => {
      expect(CATEGORY_ICONS).toHaveProperty('workout-setup');
      expect(CATEGORY_ICONS).toHaveProperty('fitness-level');
      expect(CATEGORY_ICONS).toHaveProperty('daily-state');
      expect(CATEGORY_ICONS).toHaveProperty('restrictions');
      expect(CATEGORY_ICONS).toHaveProperty('environment');
    });
  });

  describe('Error Handling', () => {
    it('all icon functions handle null/undefined gracefully', () => {
      const iconFunctions = [
        getStressIcon,
        getEnergyIcon,
        getSleepIcon,
        getLocationIcon,
        getFitnessLevelIcon,
        getGoalsIcon
      ];

      iconFunctions.forEach(iconFunction => {
        expect(() => iconFunction(null)).not.toThrow();
        expect(() => iconFunction(undefined)).not.toThrow();
        expect(() => iconFunction('')).not.toThrow();
        
        // Should return some kind of icon (string)
        expect(typeof iconFunction(null)).toBe('string');
        expect(iconFunction(null).length).toBeGreaterThan(0);
      });
    });

    it('getIntensityIcon handles non-numeric values', () => {
      expect(() => getIntensityIcon('not a number')).not.toThrow();
      expect(() => getIntensityIcon({})).not.toThrow();
      expect(() => getIntensityIcon([])).not.toThrow();
      
      expect(typeof getIntensityIcon('not a number')).toBe('string');
    });

    it('all icon functions return strings', () => {
      // Test with various invalid inputs
      const testInputs = [null, undefined, '', 'invalid', 999, {}, []];
      
      testInputs.forEach(input => {
        expect(typeof getStressIcon(input)).toBe('string');
        expect(typeof getEnergyIcon(input)).toBe('string');
        expect(typeof getSleepIcon(input)).toBe('string');
        expect(typeof getLocationIcon(input)).toBe('string');
        expect(typeof getFitnessLevelIcon(input)).toBe('string');
        expect(typeof getGoalsIcon(input)).toBe('string');
        expect(typeof getIntensityIcon(input)).toBe('string');
      });
    });
  });

  describe('Icon Consistency', () => {
    it('returns consistent icons for same input', () => {
      // Test that functions are deterministic
      expect(getStressIcon('high')).toBe(getStressIcon('high'));
      expect(getEnergyIcon('low')).toBe(getEnergyIcon('low'));
      expect(getIntensityIcon(3)).toBe(getIntensityIcon(3));
    });

    it('different inputs return different icons (where expected)', () => {
      expect(getStressIcon('low')).not.toBe(getStressIcon('high'));
      expect(getEnergyIcon('low')).not.toBe(getEnergyIcon('high'));
      expect(getIntensityIcon(1)).not.toBe(getIntensityIcon(6));
    });
  });
}); 