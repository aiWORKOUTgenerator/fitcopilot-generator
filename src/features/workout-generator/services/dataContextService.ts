/**
 * Data Context Service
 * 
 * Manages the separation and combination of profile data (static) 
 * and session data (dynamic) for optimal workout generation.
 */

import { 
  ProfileWorkoutData, 
  SessionWorkoutData, 
  WorkoutGenerationContext 
} from '../types/data-architecture';
import { useProfile } from '../../profile/context';
import { SessionSpecificInputs } from '../types/workout';
import { MuscleSelectionData } from '../types/muscle-types';

/**
 * Profile Data Service
 * Handles static, rarely-changing user preferences
 */
export class ProfileDataService {
  /**
   * Extract workout-relevant data from user profile
   */
  static extractWorkoutData(profile: any): ProfileWorkoutData | null {
    if (!profile) return null;

    return {
      fitnessLevel: profile.fitness_level || 'intermediate',
      primaryGoals: profile.preferences?.goals || [],
      ownedEquipment: profile.preferences?.equipment || [],
      healthRestrictions: profile.preferences?.limitations || [],
      
      preferredDurations: {
        minimum: profile.preferences?.min_duration || 15,
        maximum: profile.preferences?.max_duration || 60,
        typical: profile.preferences?.typical_duration || 30
      },
      
      availabilityPattern: {
        weekdays: profile.preferences?.weekday_availability || 30,
        weekends: profile.preferences?.weekend_availability || 45,
        frequency: profile.preferences?.weekly_frequency || 3
      },
      
      musclePreferences: {
        favoriteGroups: profile.preferences?.favorite_muscle_groups || [],
        avoidedGroups: profile.preferences?.avoided_muscle_groups || [],
        lastTargeted: profile.preferences?.last_targeted_muscles || {}
      },
      
      stylePreferences: {
        preferredIntensity: profile.preferences?.preferred_intensity || 3,
        preferredEnvironment: profile.preferences?.preferred_environment || 'mixed',
        workoutTypes: profile.preferences?.workout_types || []
      }
    };
  }

  /**
   * Get muscle group suggestions based on profile goals
   */
  static getMuscleGroupSuggestions(profileData: ProfileWorkoutData, todaysFocus?: string): string[] {
    const goalToMuscleMap: Record<string, string[]> = {
      'lose-weight': ['Core', 'Legs', 'Back'],
      'build-muscle': ['Chest', 'Back', 'Arms'],
      'improve-endurance': ['Legs', 'Core'],
      'increase-strength': ['Chest', 'Back', 'Legs'],
      'enhance-flexibility': ['Core', 'Back'],
      'general-fitness': ['Chest', 'Legs', 'Core']
    };

    // Combine profile goals with today's focus
    const relevantGoals = [...profileData.primaryGoals];
    if (todaysFocus && !relevantGoals.includes(todaysFocus)) {
      relevantGoals.push(todaysFocus);
    }

    const suggestedGroups = new Set<string>();
    relevantGoals.forEach(goal => {
      const muscles = goalToMuscleMap[goal] || [];
      muscles.forEach(muscle => suggestedGroups.add(muscle));
    });

    // Add favorite groups from profile
    profileData.musclePreferences.favoriteGroups.forEach(group => 
      suggestedGroups.add(group)
    );

    return Array.from(suggestedGroups).slice(0, 3);
  }
}

/**
 * Session Data Service  
 * Handles dynamic, frequently-changing workout data
 */
export class SessionDataService {
  private static readonly SESSION_STORAGE_KEY = 'fitcopilot_session_data';
  private static readonly EXPIRATION_HOURS = 24;

  /**
   * Extract session data from form inputs and muscle selection
   */
  static extractSessionData(
    sessionInputs: SessionSpecificInputs,
    muscleSelection: MuscleSelectionData
  ): SessionWorkoutData {
    return {
      muscleTargeting: {
        selectedGroups: muscleSelection.selectedGroups.map(g => g.toString()),
        specificMuscles: Object.fromEntries(
          Object.entries(muscleSelection.selectedMuscles || {}).map(([k, v]) => [k, v || []])
        ),
        primaryFocus: muscleSelection.selectedGroups[0]?.toString(),
        selectionSummary: this.generateMuscleSelectionSummary(muscleSelection)
      },
      
      timeAvailable: sessionInputs.timeConstraintsToday || sessionInputs.availableTime || 30,
      energyLevel: sessionInputs.energyLevel || 3,
      todaysFocus: sessionInputs.todaysFocus || 'general-fitness',
      intensityLevel: sessionInputs.dailyIntensityLevel || 3,
      equipmentToday: sessionInputs.equipmentAvailableToday || [],
      environmentToday: sessionInputs.environment || 'home',
      
      physicalState: {
        soreness: sessionInputs.currentSoreness || [],
        sleepQuality: sessionInputs.sleepQuality || 3,
        stressLevel: sessionInputs.moodLevel || 3,
        healthRestrictionsToday: sessionInputs.healthRestrictionsToday || []
      },
      
      customization: {
        specificRequest: sessionInputs.specificRequest,
        avoidToday: [],
        emphasizeToday: []
      }
    };
  }

  /**
   * Save session data to sessionStorage with expiration
   */
  static saveSessionData(sessionData: SessionWorkoutData): void {
    const dataWithExpiration = {
      data: sessionData,
      timestamp: Date.now(),
      expiresAt: Date.now() + (this.EXPIRATION_HOURS * 60 * 60 * 1000)
    };

    try {
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(dataWithExpiration));
    } catch (error) {
      console.warn('[SessionDataService] Failed to save session data:', error);
    }
  }

  /**
   * Load session data from sessionStorage (if not expired)
   */
  static loadSessionData(): SessionWorkoutData | null {
    try {
      const stored = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      // Check expiration
      if (Date.now() > parsed.expiresAt) {
        this.clearSessionData();
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('[SessionDataService] Failed to load session data:', error);
      return null;
    }
  }

  /**
   * Clear expired or invalid session data
   */
  static clearSessionData(): void {
    try {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    } catch (error) {
      console.warn('[SessionDataService] Failed to clear session data:', error);
    }
  }

  /**
   * Generate human-readable muscle selection summary
   */
  private static generateMuscleSelectionSummary(muscleSelection: MuscleSelectionData): string {
    const groupCount = muscleSelection.selectedGroups.length;
    if (groupCount === 0) return 'No muscle groups selected';
    
    const groupNames = muscleSelection.selectedGroups.map(g => g.toString());
    const specificMuscleCount = Object.values(muscleSelection.selectedMuscles || {})
      .flat().length;

    let summary = groupNames.join(', ');
    if (specificMuscleCount > 0) {
      summary += ` (${specificMuscleCount} specific muscles)`;
    }

    return summary;
  }
}

/**
 * Workout Context Service
 * Combines profile and session data for workout generation
 */
export class WorkoutContextService {
  /**
   * Create complete workout generation context
   */
  static createWorkoutContext(
    profileData: ProfileWorkoutData,
    sessionData: SessionWorkoutData
  ): WorkoutGenerationContext {
    return {
      profile: profileData,
      session: sessionData,
      computed: this.computeEffectiveValues(profileData, sessionData)
    };
  }

  /**
   * Compute effective values by combining profile and session data
   */
  private static computeEffectiveValues(
    profile: ProfileWorkoutData,
    session: SessionWorkoutData
  ) {
    return {
      // Session time overrides profile preferences
      effectiveDuration: session.timeAvailable || profile.preferredDurations.typical,
      
      // Equipment available today (intersection of owned + available)
      effectiveEquipment: session.equipmentToday.length > 0 
        ? session.equipmentToday.filter(eq => profile.ownedEquipment.includes(eq))
        : profile.ownedEquipment,
      
      // Combine profile restrictions with today's additions
      effectiveRestrictions: [
        ...profile.healthRestrictions,
        ...session.physicalState.healthRestrictionsToday
      ],
      
      // Get muscle suggestions based on profile + today's focus
      suggestedMuscles: ProfileDataService.getMuscleGroupSuggestions(
        profile, 
        session.todaysFocus
      ),
      
      // Adjust intensity based on energy, sleep, and stress
      adjustedIntensity: this.calculateAdjustedIntensity(profile, session)
    };
  }

  /**
   * Calculate adjusted intensity based on current physical state
   */
  private static calculateAdjustedIntensity(
    profile: ProfileWorkoutData,
    session: SessionWorkoutData
  ): number {
    let baseIntensity = session.intensityLevel || profile.stylePreferences.preferredIntensity;
    
    // Adjust based on energy level
    if (session.energyLevel <= 2) baseIntensity = Math.max(1, baseIntensity - 1);
    if (session.energyLevel >= 4) baseIntensity = Math.min(5, baseIntensity + 1);
    
    // Adjust based on sleep quality
    if (session.physicalState.sleepQuality <= 2) baseIntensity = Math.max(1, baseIntensity - 1);
    
    // Adjust based on stress level
    if (session.physicalState.stressLevel >= 4) baseIntensity = Math.max(1, baseIntensity - 1);
    
    // Adjust based on soreness
    if (session.physicalState.soreness.length >= 3) baseIntensity = Math.max(1, baseIntensity - 1);
    
    return Math.max(1, Math.min(5, baseIntensity));
  }

  /**
   * Format context for OpenAI API
   */
  static formatForAPI(context: WorkoutGenerationContext): any {
    return {
      // Core workout parameters
      duration: context.computed.effectiveDuration,
      difficulty: context.profile.fitnessLevel,
      equipment: context.computed.effectiveEquipment,
      goals: context.session.todaysFocus,
      restrictions: context.computed.effectiveRestrictions.join(', ') || 'none',
      intensity: context.computed.adjustedIntensity,
      
      // Profile context for AI
      profile_goals: context.profile.primaryGoals,
      profile_preferences: context.profile.stylePreferences,
      
      // Session-specific inputs
      sessionInputs: {
        ...context.session.physicalState,
        focusArea: context.session.muscleTargeting.selectedGroups,
        environment: context.session.environmentToday,
        muscleTargeting: context.session.muscleTargeting
      },
      
      // Muscle targeting (multiple formats for backward compatibility)
      muscleTargeting: context.session.muscleTargeting,
      targetMuscleGroups: context.session.muscleTargeting.selectedGroups,
      specificMuscles: context.session.muscleTargeting.specificMuscles,
      primaryFocus: context.session.muscleTargeting.primaryFocus
    };
  }
}

/**
 * React Hook for Data Context Management
 */
export function useWorkoutDataContext() {
  const { state: profileState } = useProfile();
  
  /**
   * Create workout context from current profile and session data
   */
  const createContext = (
    sessionInputs: SessionSpecificInputs,
    muscleSelection: MuscleSelectionData
  ): WorkoutGenerationContext | null => {
    // Extract profile data
    const profileData = ProfileDataService.extractWorkoutData(profileState.profile);
    if (!profileData) return null;
    
    // Extract session data
    const sessionData = SessionDataService.extractSessionData(sessionInputs, muscleSelection);
    
    // Save session data for persistence
    SessionDataService.saveSessionData(sessionData);
    
    // Create combined context
    return WorkoutContextService.createWorkoutContext(profileData, sessionData);
  };

  /**
   * Get muscle group suggestions based on profile
   */
  const getMuscleGroupSuggestions = (todaysFocus?: string): string[] => {
    const profileData = ProfileDataService.extractWorkoutData(profileState.profile);
    if (!profileData) return [];
    
    return ProfileDataService.getMuscleGroupSuggestions(profileData, todaysFocus);
  };

  return {
    createContext,
    getMuscleGroupSuggestions,
    profileLoading: profileState.loading,
    profileError: profileState.error,
    hasProfile: !!profileState.profile
  };
} 