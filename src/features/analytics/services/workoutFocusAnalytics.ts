/**
 * Workout Focus Analytics Service
 * 
 * Frontend service for tracking workout focus selections and retrieving analytics data.
 * Integrates with the PHP WorkoutFocusTracking backend for indefinite caching.
 */

import { apiFetch } from '../../../common/api/client';

export interface WorkoutFocusSelection {
  focus: string;
  timestamp: number;
  context?: Record<string, any>;
  cached_since?: string;
}

export interface WorkoutFocusAnalytics {
  total_selections: number;
  focus_distribution: Record<string, {
    count: number;
    percentage: number;
  }>;
  recent_selections: WorkoutFocusSelection[];
  trends: Record<string, {
    recent_count: number;
    previous_count: number;
    change_percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  most_popular: string | null;
  analysis_date: string;
}

export interface WorkoutFocusContext {
  source?: 'workout-generator' | 'profile' | 'dashboard';
  step?: string;
  previous_focus?: string;
  session_id?: string;
  [key: string]: any;
}

class WorkoutFocusAnalyticsService {
  private static instance: WorkoutFocusAnalyticsService;
  private lastSelection: WorkoutFocusSelection | null = null;
  private analyticsCache: WorkoutFocusAnalytics | null = null;
  private cacheExpiry: number = 0;

  private constructor() {}

  public static getInstance(): WorkoutFocusAnalyticsService {
    if (!WorkoutFocusAnalyticsService.instance) {
      WorkoutFocusAnalyticsService.instance = new WorkoutFocusAnalyticsService();
    }
    return WorkoutFocusAnalyticsService.instance;
  }

  /**
   * Track a workout focus selection
   * 
   * @param focus - The workout focus type
   * @param context - Additional context data
   * @returns Promise with tracking result
   */
  public async trackWorkoutFocus(
    focus: string, 
    context: WorkoutFocusContext = {}
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Add session context
      const enrichedContext = {
        ...context,
        source: context.source || 'workout-generator',
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        session_id: this.getSessionId()
      };

      const response = await apiFetch<{
        success: boolean;
        message: string;
        data: {
          focus: string;
          cached_until: string;
        };
      }>('/analytics/workout-focus', {
        method: 'POST',
        body: JSON.stringify({
          focus,
          context: enrichedContext
        })
      });

      if (response.success) {
        // Update local cache
        this.lastSelection = {
          focus,
          timestamp: Date.now(),
          context: enrichedContext
        };

        // Clear analytics cache to force refresh
        this.analyticsCache = null;
        this.cacheExpiry = 0;

        // Log success for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('[WorkoutFocusAnalytics] Tracked focus:', focus, enrichedContext);
        }
      }

      return response;
    } catch (error) {
      console.error('[WorkoutFocusAnalytics] Failed to track focus:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get the last workout focus selection
   * 
   * @param forceRefresh - Force refresh from server
   * @returns Promise with last selection data
   */
  public async getLastWorkoutFocus(
    forceRefresh: boolean = false
  ): Promise<WorkoutFocusSelection | null> {
    try {
      // Return cached if available and not forcing refresh
      if (!forceRefresh && this.lastSelection) {
        return this.lastSelection;
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await apiFetch<{
          success: boolean;
          message: string;
          data: WorkoutFocusSelection | null;
        }>('/analytics/workout-focus/last', {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response && response.success && response.data) {
          this.lastSelection = response.data;
          return response.data;
        }

        // If response is null or unsuccessful, return null gracefully
        return null;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Handle specific error types
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            console.warn('[WorkoutFocusAnalytics] Request timeout for last focus');
          } else {
            console.warn('[WorkoutFocusAnalytics] Fetch error for last focus:', fetchError.message);
          }
        }
        
        // Return null instead of throwing to prevent infinite loops
        return null;
      }
    } catch (error) {
      console.error('[WorkoutFocusAnalytics] Failed to get last focus:', error);
      // Always return null on error to prevent infinite loops
      return null;
    }
  }

  /**
   * Get workout focus analytics
   * 
   * @param forceRefresh - Force refresh from server
   * @returns Promise with analytics data
   */
  public async getWorkoutFocusAnalytics(
    forceRefresh: boolean = false
  ): Promise<WorkoutFocusAnalytics | null> {
    try {
      // Check cache first (5 minute cache)
      const now = Date.now();
      if (!forceRefresh && this.analyticsCache && now < this.cacheExpiry) {
        return this.analyticsCache;
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await apiFetch<{
          success: boolean;
          message: string;
          data: WorkoutFocusAnalytics;
        }>('/analytics/workout-focus/stats', {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response && response.success && response.data) {
          this.analyticsCache = response.data;
          this.cacheExpiry = now + (5 * 60 * 1000); // 5 minutes
          return response.data;
        }

        return null;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Handle specific error types
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            console.warn('[WorkoutFocusAnalytics] Request timeout for analytics');
          } else {
            console.warn('[WorkoutFocusAnalytics] Fetch error for analytics:', fetchError.message);
          }
        }
        
        return null;
      }
    } catch (error) {
      console.error('[WorkoutFocusAnalytics] Failed to get analytics:', error);
      return null;
    }
  }

  /**
   * Check if user has a previous workout focus selection
   * 
   * @returns Promise with boolean result
   */
  public async hasPreviousSelection(): Promise<boolean> {
    const lastSelection = await this.getLastWorkoutFocus();
    return lastSelection !== null;
  }

  /**
   * Get the most popular workout focus for the user
   * 
   * @returns Promise with most popular focus or null
   */
  public async getMostPopularFocus(): Promise<string | null> {
    const analytics = await this.getWorkoutFocusAnalytics();
    return analytics?.most_popular || null;
  }

  /**
   * Get focus trends for the user
   * 
   * @returns Promise with trends data
   */
  public async getFocusTrends(): Promise<WorkoutFocusAnalytics['trends'] | null> {
    const analytics = await this.getWorkoutFocusAnalytics();
    return analytics?.trends || null;
  }

  /**
   * Clear local cache (useful for testing or forced refresh)
   */
  public clearCache(): void {
    this.lastSelection = null;
    this.analyticsCache = null;
    this.cacheExpiry = 0;
  }

  /**
   * Get or generate session ID for tracking
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('fitcopilot_session_id');
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('fitcopilot_session_id', sessionId);
    }
    
    return sessionId;
  }

  /**
   * Validate workout focus value
   * 
   * @param focus - Focus value to validate
   * @returns boolean indicating if focus is valid
   */
  public static isValidFocus(focus: string): boolean {
    const validFocuses = [
      'fat-burning',
      'muscle-building', 
      'endurance',
      'strength',
      'flexibility',
      'general-fitness'
    ];
    
    return validFocuses.includes(focus);
  }

  /**
   * Get human-readable focus label
   * 
   * @param focus - Focus value
   * @returns Human-readable label
   */
  public static getFocusLabel(focus: string): string {
    const labels: Record<string, string> = {
      'fat-burning': 'Fat Burning',
      'muscle-building': 'Muscle Building',
      'endurance': 'Endurance',
      'strength': 'Strength',
      'flexibility': 'Flexibility',
      'general-fitness': 'General Fitness'
    };
    
    return labels[focus] || focus;
  }
}

// Export singleton instance
export const workoutFocusAnalytics = WorkoutFocusAnalyticsService.getInstance();

// Export class for testing
export { WorkoutFocusAnalyticsService }; 