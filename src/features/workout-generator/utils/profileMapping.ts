/**
 * Profile to Workout Generator Mapping Service
 * 
 * Maps user profile data to workout generator form context
 */

import { Profile } from '../../profile/types/profile';
import { WorkoutDifficulty } from '../types/workout';

/**
 * Mapped profile data for workout generation context
 */
export interface ProfileToWorkoutMapping {
  fitnessLevel: WorkoutDifficulty;
  goals: string[];
  workoutFrequency: string;
  availableEquipment: string[];
  preferredLocation: string;
  displayData: {
    fitnessLevel: { value: string; display: string; color: string; bgColor: string; icon: string };
    goals: Array<{ value: string; display: string; icon: string }>;
    frequency: { value: string; display: string; suggestedDuration: string };
    equipment: Array<{ value: string; display: string; icon: string }>;
    location: { value: string; display: string; context: string; color: string };
  };
}

/**
 * Map profile fitness level to workout difficulty
 */
export const mapFitnessLevelToDifficulty = (fitnessLevel: string | undefined): WorkoutDifficulty => {
  const mapping: Record<string, WorkoutDifficulty> = {
    'beginner': 'beginner',
    'intermediate': 'intermediate', 
    'advanced': 'advanced'
  };
  return mapping[fitnessLevel || 'beginner'] || 'beginner';
};

/**
 * Map profile goals to workout generator goals
 */
export const mapProfileGoalsToWorkoutGoals = (profileGoals: string[] | undefined): string[] => {
  if (!profileGoals || profileGoals.length === 0) return [];
  
  const goalMapping: Record<string, string> = {
    'weight_loss': 'lose-weight',
    'muscle_building': 'build-muscle',
    'endurance': 'improve-endurance',
    'strength': 'increase-strength',
    'flexibility': 'enhance-flexibility',
    'general_fitness': 'general-fitness',
    'sport_specific': 'sport-specific',
    'rehabilitation': 'general-fitness', // Maps to closest option
    'custom': 'general-fitness' // Maps to closest option
  };
  
  return profileGoals.map(goal => goalMapping[goal] || 'general-fitness');
};

/**
 * Map profile equipment to workout generator equipment
 */
export const mapProfileEquipmentToWorkoutEquipment = (profileEquipment: string[] | undefined): string[] => {
  if (!profileEquipment || profileEquipment.length === 0) return ['none'];
  
  const equipmentMapping: Record<string, string> = {
    'dumbbells': 'dumbbells',
    'kettlebells': 'kettlebells',
    'resistance_bands': 'resistance-bands',
    'pull_up_bar': 'pull-up-bar',
    'yoga_mat': 'yoga-mat',
    'bench': 'bench',
    'barbell': 'barbell',
    'trx': 'trx',
    'medicine_ball': 'medicine-ball',
    'jump_rope': 'jump-rope',
    'stability_ball': 'stability-ball',
    'none': 'none',
    'other': 'none' // Map unknown equipment to bodyweight
  };
  
  const mappedEquipment = profileEquipment
    .map(equipment => equipmentMapping[equipment] || 'none')
    .filter((equipment, index, arr) => arr.indexOf(equipment) === index); // Remove duplicates
  
  return mappedEquipment.length > 0 ? mappedEquipment : ['none'];
};

/**
 * Map workout frequency to suggested duration
 */
export const mapFrequencyToSuggestedDuration = (frequency: string | undefined): { frequency: string; suggestedDuration: string; explanation: string } => {
  const frequencyMapping: Record<string, { frequency: string; suggestedDuration: string; explanation: string }> = {
    '1-2': { 
      frequency: '1-2 times/week',
      suggestedDuration: '45-60 minutes',
      explanation: 'Longer sessions for less frequent workouts'
    },
    '3-4': { 
      frequency: '3-4 times/week',
      suggestedDuration: '30-45 minutes',
      explanation: 'Balanced duration for regular training'
    },
    '5+': { 
      frequency: '5+ times/week',
      suggestedDuration: '15-30 minutes',
      explanation: 'Shorter sessions for frequent training'
    },
    'daily': { 
      frequency: 'Daily',
      suggestedDuration: '15-30 minutes',
      explanation: 'Short daily sessions for consistency'
    },
    'custom': { 
      frequency: 'Custom schedule',
      suggestedDuration: '30 minutes',
      explanation: 'Standard duration recommendation'
    }
  };
  
  return frequencyMapping[frequency || '3-4'] || frequencyMapping['3-4'];
};

/**
 * Get display data for profile values
 */
export const getProfileDisplayData = (profile: Profile): ProfileToWorkoutMapping['displayData'] => {
  // Fitness Level Display - matching existing difficulty badge format
  const fitnessLevelConfig: Record<string, { icon: string; color: string; bgColor: string; label: string }> = {
    'beginner': { 
      icon: '🟢', 
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      label: 'Beginner'
    },
    'intermediate': { 
      icon: '🟡', 
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      label: 'Intermediate'
    },
    'advanced': { 
      icon: '🔴', 
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      label: 'Advanced'
    }
  };
  
  const fitnessLevel = profile.fitnessLevel || 'beginner';
  const levelConfig = fitnessLevelConfig[fitnessLevel];
  
  // Goals Display  
  const goalIcons: Record<string, string> = {
    'weight_loss': '📉',
    'muscle_building': '💪',
    'endurance': '❤️',
    'strength': '⚡',
    'flexibility': '🤸',
    'general_fitness': '🎯',
    'sport_specific': '🏆',
    'rehabilitation': '🏥',
    'custom': '⚙️'
  };
  
  const goalLabels: Record<string, string> = {
    'weight_loss': 'Weight Loss',
    'muscle_building': 'Build Muscle',
    'endurance': 'Improve Endurance',
    'strength': 'Increase Strength',
    'flexibility': 'Enhance Flexibility',
    'general_fitness': 'General Fitness',
    'sport_specific': 'Sport-Specific',
    'rehabilitation': 'Rehabilitation',
    'custom': 'Custom Goal'
  };
  
  // Equipment Display
  const equipmentIcons: Record<string, string> = {
    'dumbbells': '🏋️',
    'kettlebells': '⚫',
    'resistance_bands': '⚡',
    'pull_up_bar': '📊',
    'yoga_mat': '🧘',
    'bench': '🪑',
    'barbell': '➖',
    'trx': '🔗',
    'medicine_ball': '⚽',
    'jump_rope': '🪢',
    'stability_ball': '⚪',
    'none': '❌',
    'other': '📦'
  };
  
  const equipmentLabels: Record<string, string> = {
    'dumbbells': 'Dumbbells',
    'kettlebells': 'Kettlebells', 
    'resistance_bands': 'Resistance Bands',
    'pull_up_bar': 'Pull-up Bar',
    'yoga_mat': 'Yoga Mat',
    'bench': 'Bench',
    'barbell': 'Barbell',
    'trx': 'TRX/Suspension',
    'medicine_ball': 'Medicine Ball',
    'jump_rope': 'Jump Rope',
    'stability_ball': 'Stability Ball',
    'none': 'No Equipment',
    'other': 'Other Equipment'
  };
  
  // Location Display
  const locationData: Record<string, { display: string; context: string; color: string }> = {
    'home': {
      display: 'Home Workouts',
      context: 'Space-efficient exercises',
      color: '#10b981'
    },
    'gym': {
      display: 'Gym Training',
      context: 'Full equipment access',
      color: '#3b82f6'
    },
    'outdoors': {
      display: 'Outdoor Activities',
      context: 'Fresh air workouts',
      color: '#f59e0b'
    },
    'anywhere': {
      display: 'Flexible Location',
      context: 'Adaptable exercises',
      color: '#8b5cf6'
    },
    'travel': {
      display: 'Travel Workouts',
      context: 'Portable exercises',
      color: '#8b5cf6'
    }
  };
  
  const location = profile.preferredLocation || 'home';
  
  return {
    fitnessLevel: {
      value: fitnessLevel,
      display: levelConfig.label,
      color: levelConfig.color,
      bgColor: levelConfig.bgColor,
      icon: levelConfig.icon
    },
    goals: (profile.goals || []).map(goal => ({
      value: goal,
      display: goalLabels[goal] || goal,
      icon: goalIcons[goal] || '🎯'
    })),
    frequency: (() => {
      const freqData = mapFrequencyToSuggestedDuration(profile.workoutFrequency);
      return {
        value: profile.workoutFrequency || '3-4',
        display: freqData.frequency,
        suggestedDuration: freqData.suggestedDuration
      };
    })(),
    equipment: (profile.availableEquipment || ['none']).map(equipment => ({
      value: equipment,
      display: equipmentLabels[equipment] || equipment,
      icon: equipmentIcons[equipment] || '📦'
    })),
    location: {
      value: location,
      display: locationData[location]?.display || 'Home Workouts',
      context: locationData[location]?.context || 'Space-efficient exercises',
      color: locationData[location]?.color || '#10b981'
    }
  };
};

/**
 * Main mapping function that converts profile to workout context
 */
export const mapProfileToWorkoutContext = (profile: Profile | null): ProfileToWorkoutMapping | null => {
  if (!profile) return null;
  
  return {
    fitnessLevel: mapFitnessLevelToDifficulty(profile.fitnessLevel),
    goals: mapProfileGoalsToWorkoutGoals(profile.goals),
    workoutFrequency: profile.workoutFrequency || '3-4',
    availableEquipment: mapProfileEquipmentToWorkoutEquipment(profile.availableEquipment),
    preferredLocation: profile.preferredLocation || 'home',
    displayData: getProfileDisplayData(profile)
  };
};

/**
 * Check if profile has sufficient data for workout generation
 */
export const isProfileSufficientForWorkout = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  return Boolean(
    profile.fitnessLevel &&
    profile.goals && profile.goals.length > 0 &&
    profile.availableEquipment && profile.availableEquipment.length > 0
  );
};

/**
 * Get profile completeness percentage for display
 */
export const getProfileCompletenessPercentage = (profile: Profile | null): number => {
  if (!profile) return 0;
  
  const fields = [
    profile.fitnessLevel,
    profile.goals?.length,
    profile.workoutFrequency,
    profile.availableEquipment?.length,
    profile.preferredLocation
  ];
  
  const completedFields = fields.filter(field => Boolean(field)).length;
  return Math.round((completedFields / fields.length) * 100);
}; 