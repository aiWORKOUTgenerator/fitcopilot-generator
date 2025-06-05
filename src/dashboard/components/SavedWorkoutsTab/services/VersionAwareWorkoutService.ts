/**
 * Version-Aware Workout Service
 * 
 * Integrates with the Version History API to ensure workout cards display
 * the most current and accurate workout data with version information.
 */

import { apiFetch } from '../../../../utils/api';

interface WorkoutVersionInfo {
  version: number;
  user_id: number;
  created_at: string;
  change_type: string;
  change_summary: string;
  has_data: boolean;
}

interface VersionHistoryResponse {
  success: boolean;
  message: string;
  data: {
    versions: WorkoutVersionInfo[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

interface EnhancedWorkoutData {
  // Standard workout fields
  id: string | number;
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  exercises: any[];
  equipment: string[];
  
  // Version metadata
  version: number;
  lastModified: string;
  modifiedBy: number;
  changeType: string;
  changeSummary: string;
  
  // Status indicators
  isLatestVersion: boolean;
  hasRecentChanges: boolean;
  staleness: 'fresh' | 'stale' | 'expired';
}

export class VersionAwareWorkoutService {
  /**
   * Fetch workout with version information for accurate card display
   */
  static async fetchWorkoutWithVersion(workoutId: string | number): Promise<EnhancedWorkoutData> {
    try {
      console.log(`[VersionAwareWorkoutService] Fetching workout ${workoutId} with version info`);
      
      // Fetch both workout data and version history in parallel
      const [workoutResponse, versionResponse] = await Promise.all([
        apiFetch<any>({ path: `/wp-json/fitcopilot/v1/workouts/${workoutId}`, method: 'GET' }),
        this.fetchVersionHistory(workoutId)
      ]);
      
      // Get the latest version info (sort by version number to ensure we get the highest)
      const versions = versionResponse.data.versions || [];
      if (versions.length === 0) {
        throw new Error(`No version history found for workout ${workoutId}`);
      }
      
      // Sort versions by version number (descending) to get the latest
      const sortedVersions = versions.sort((a, b) => b.version - a.version);
      const latestVersion = sortedVersions[0];
      const isLatestVersion = true; // We're fetching the latest version
      
      console.log(`[VersionAwareWorkoutService] Latest version for workout ${workoutId}:`, {
        version: latestVersion.version,
        changeType: latestVersion.change_type,
        changeSummary: latestVersion.change_summary,
        createdAt: latestVersion.created_at
      });
      
      // Determine staleness
      const lastModifiedTime = new Date(latestVersion.created_at).getTime();
      const now = Date.now();
      const ageMinutes = (now - lastModifiedTime) / (1000 * 60);
      
      const staleness: 'fresh' | 'stale' | 'expired' = 
        ageMinutes < 15 ? 'fresh' :
        ageMinutes < 60 ? 'stale' : 'expired';
      
      // Check for recent changes (within last 24 hours)
      const hasRecentChanges = ageMinutes < (24 * 60);
      
      // Enhanced data transformation with better exercise handling
      console.log(`[VersionAwareWorkoutService] Raw workout response for ${workoutId}:`, workoutResponse);
      
      // Handle different possible data structures
      let exercises = [];
      let equipment = [];
      let title = 'Untitled Workout';
      let description = '';
      let duration = 30;
      let difficulty = 'intermediate';

      // Handle workout response structure (could be nested in 'data' or direct)
      const workoutData = workoutResponse.data || workoutResponse;
      
      if (workoutData) {
        title = workoutData.title || workoutData.post_title || title;
        description = workoutData.description || workoutData.post_content || workoutData.content || description;
        duration = workoutData.duration || workoutData.workout_duration || duration;
        difficulty = workoutData.difficulty || workoutData.workout_difficulty || difficulty;
        
        // Handle exercises - check multiple possible locations
        exercises = workoutData.exercises || 
                   workoutData.workout_exercises || 
                   workoutData.sections?.flatMap((s: any) => s.exercises || []) ||
                   [];
                   
        // Handle equipment
        equipment = workoutData.equipment || 
                   workoutData.workout_equipment || 
                   workoutData.required_equipment ||
                   [];

        console.log(`[VersionAwareWorkoutService] Extracted data for ${workoutId}:`, {
          title,
          exerciseCount: exercises.length,
          equipmentCount: equipment.length,
          duration,
          difficulty
        });
      }
      
      // Transform to enhanced format
      const enhancedWorkout: EnhancedWorkoutData = {
        id: workoutData.id || workoutResponse.id || workoutId,
        title,
        description,
        duration,
        difficulty,
        exercises,
        equipment,
        
        // Version metadata from API
        version: latestVersion.version,
        lastModified: latestVersion.created_at,
        modifiedBy: latestVersion.user_id,
        changeType: latestVersion.change_type,
        changeSummary: latestVersion.change_summary,
        
        // Status indicators
        isLatestVersion,
        hasRecentChanges,
        staleness
      };
      
      console.log(`[VersionAwareWorkoutService] Enhanced workout data:`, {
        id: enhancedWorkout.id,
        version: enhancedWorkout.version,
        staleness: enhancedWorkout.staleness,
        hasRecentChanges: enhancedWorkout.hasRecentChanges,
        changeSummary: enhancedWorkout.changeSummary
      });
      
      return enhancedWorkout;
      
    } catch (error) {
      console.error(`[VersionAwareWorkoutService] Error fetching workout ${workoutId}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch version history for a workout
   */
  static async fetchVersionHistory(workoutId: string | number): Promise<VersionHistoryResponse> {
    try {
      console.log(`[VersionAwareWorkoutService] Fetching version history for workout ${workoutId}...`);
      
      const response = await apiFetch<VersionHistoryResponse>({ 
        path: `/wp-json/fitcopilot/v1/workouts/${workoutId}/history`, 
        method: 'GET' 
      });
      
      console.log(`[VersionAwareWorkoutService] Version history response for workout ${workoutId}:`, response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch version history');
      }
      
      if (!response.data || !response.data.versions) {
        throw new Error('Invalid version history response structure');
      }
      
      return response;
    } catch (error) {
      console.error(`[VersionAwareWorkoutService] Error fetching version history for workout ${workoutId}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch multiple workouts with version information
   */
  static async fetchWorkoutsWithVersions(workoutIds: (string | number)[]): Promise<EnhancedWorkoutData[]> {
    try {
      console.log(`[VersionAwareWorkoutService] Fetching ${workoutIds.length} workouts with version info`);
      
      // Fetch all workouts in parallel
      const workoutPromises = workoutIds.map(id => this.fetchWorkoutWithVersion(id));
      const workouts = await Promise.all(workoutPromises);
      
      console.log(`[VersionAwareWorkoutService] Successfully fetched ${workouts.length} workouts with versions`);
      return workouts;
      
    } catch (error) {
      console.error(`[VersionAwareWorkoutService] Error fetching multiple workouts:`, error);
      throw error;
    }
  }
  
  /**
   * Check if workout data is stale and needs refresh
   */
  static isWorkoutStale(workout: EnhancedWorkoutData, thresholdMinutes: number = 30): boolean {
    const lastModifiedTime = new Date(workout.lastModified).getTime();
    const now = Date.now();
    const ageMinutes = (now - lastModifiedTime) / (1000 * 60);
    
    return ageMinutes > thresholdMinutes;
  }
  
  /**
   * Get workout freshness indicator for UI display
   */
  static getWorkoutFreshnessIndicator(workout: EnhancedWorkoutData): {
    color: string;
    text: string;
    icon: string;
  } {
    switch (workout.staleness) {
      case 'fresh':
        return {
          color: '#10b981', // green
          text: 'Up to date',
          icon: '✅'
        };
      case 'stale':
        return {
          color: '#f59e0b', // yellow
          text: 'Recently updated',
          icon: '🔄'
        };
      case 'expired':
        return {
          color: '#ef4444', // red
          text: 'May be outdated',
          icon: '⚠️'
        };
    }
  }
} 