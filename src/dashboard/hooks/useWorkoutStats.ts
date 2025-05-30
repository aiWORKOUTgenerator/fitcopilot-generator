/**
 * Workout Statistics Hook
 * 
 * Provides calculated workout statistics from workout data and user profile.
 * Used for dashboard header and other stat displays.
 */
import { useMemo } from 'react';

export interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  recentActivity: number;
  averageWorkoutDuration: number;
  thisWeekWorkouts: number;
  thisMonthWorkouts: number;
}

interface UseWorkoutStatsOptions {
  workouts: any[];
  profile: any;
}

/**
 * Hook for calculating workout statistics
 */
export const useWorkoutStats = ({ workouts, profile }: UseWorkoutStatsOptions): WorkoutStats => {
  return useMemo(() => {
    if (!Array.isArray(workouts) || workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalMinutes: 0,
        currentStreak: 0,
        weeklyGoal: profile?.weeklyGoal || profile?.workoutFrequency || 3,
        weeklyProgress: 0,
        recentActivity: 0,
        averageWorkoutDuration: 0,
        thisWeekWorkouts: 0,
        thisMonthWorkouts: 0
      };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter workouts by time periods
    const thisWeekWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.created_at || workout.createdAt);
      return workoutDate >= oneWeekAgo && workoutDate <= now;
    });

    const thisMonthWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.created_at || workout.createdAt);
      return workoutDate >= oneMonthAgo && workoutDate <= now;
    });

    const recentWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.created_at || workout.createdAt);
      return workoutDate >= oneDayAgo && workoutDate <= now;
    });

    // Calculate total minutes
    const totalMinutes = workouts.reduce((total, workout) => {
      return total + (workout.duration || 30); // Default to 30 minutes if not specified
    }, 0);

    // Calculate average workout duration
    const averageWorkoutDuration = workouts.length > 0 
      ? Math.round(totalMinutes / workouts.length) 
      : 0;

    // Calculate current streak (simplified - consecutive days with workouts)
    // This is a basic implementation; a more sophisticated version would check actual consecutive days
    const currentStreak = Math.min(thisWeekWorkouts.length, 7);

    // Weekly goal from profile or default
    const weeklyGoal = profile?.weeklyGoal || profile?.workoutFrequency || 3;

    // Weekly progress percentage
    const weeklyProgress = weeklyGoal > 0 
      ? Math.min((thisWeekWorkouts.length / weeklyGoal) * 100, 100) 
      : 0;

    return {
      totalWorkouts: workouts.length,
      totalMinutes,
      currentStreak,
      weeklyGoal,
      weeklyProgress,
      recentActivity: recentWorkouts.length,
      averageWorkoutDuration,
      thisWeekWorkouts: thisWeekWorkouts.length,
      thisMonthWorkouts: thisMonthWorkouts.length
    };
  }, [workouts, profile]);
};

/**
 * Hook for getting motivational insights based on workout stats
 */
export const useWorkoutInsights = (stats: WorkoutStats): string => {
  return useMemo(() => {
    if (stats.weeklyProgress >= 100) {
      return "🎉 Amazing! You've crushed your weekly goal!";
    } else if (stats.weeklyProgress >= 80) {
      return `💪 Great progress! You're ${Math.round(stats.weeklyProgress)}% to your weekly goal`;
    } else if (stats.currentStreak >= 3) {
      return `🔥 Keep the momentum! ${stats.currentStreak} day streak going strong`;
    } else if (stats.totalWorkouts > 0) {
      return "🌟 Every workout counts! Keep building your fitness journey";
    }
    return "🚀 Ready to start your fitness journey? Let's go!";
  }, [stats]);
};

export default useWorkoutStats; 