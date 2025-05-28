/**
 * Premium Fitness Statistics Component
 * 
 * Enhanced fitness stats display with animations, progress rings, and premium styling.
 * Features glass morphism design, animated counters, and motivational insights.
 */
import React, { useState, useEffect, useRef } from 'react';
import './FitnessStats.scss';

interface FitnessStatsProps {
  completedWorkouts: number;
  currentStreak: number;
  totalMinutesExercised: number;
  weeklyGoal?: number;
  className?: string;
}

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  unit?: string;
  progress?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
  formatValue?: (value: number) => string;
}

/**
 * Animated counter hook for smooth number transitions
 */
const useAnimatedCounter = (endValue: number, duration: number = 1000, delay: number = 0) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) return;

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const animatedValue = Math.floor(endValue * easeOutCubic);
        
        setCurrentValue(animatedValue);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [endValue, duration, delay]);

  return { value: currentValue, isAnimating };
};

/**
 * Individual stat card with premium styling and animations
 */
const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  unit = '',
  progress,
  trend,
  trendValue,
  delay = 0,
  formatValue
}) => {
  const { value: animatedValue, isAnimating } = useAnimatedCounter(value, 1200, delay);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const displayValue = formatValue ? formatValue(animatedValue) : animatedValue;
  const progressPercentage = progress || 0;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendClass = () => {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      default: return 'trend-neutral';
    }
  };

  return (
    <div className={`fitness-stat-card ${isVisible ? 'visible' : ''}`}>
      <div className="stat-card-inner">
        {/* Progress Ring Background */}
        {progress !== undefined && (
          <div className="progress-ring-container">
            <svg className="progress-ring" width="120" height="120">
              <circle
                className="progress-ring-background"
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                opacity="0.1"
              />
              <circle
                className="progress-ring-progress"
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - progressPercentage / 100)}`}
                style={{
                  transition: 'stroke-dashoffset 1.5s ease-out',
                  transitionDelay: `${delay + 300}ms`
                }}
              />
            </svg>
          </div>
        )}

        {/* Icon */}
        <div className="stat-icon">
          <span className="icon-emoji">{icon}</span>
        </div>

        {/* Value */}
        <div className="stat-value">
          <span className={`value-number ${isAnimating ? 'animating' : ''}`}>
            {displayValue}
          </span>
          {unit && <span className="value-unit">{unit}</span>}
        </div>

        {/* Label */}
        <div className="stat-label">{label}</div>

        {/* Trend Indicator */}
        {trend && trendValue && (
          <div className={`stat-trend ${getTrendClass()}`}>
            <span className="trend-icon">{getTrendIcon()}</span>
            <span className="trend-value">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main Fitness Statistics Component
 */
export const FitnessStats: React.FC<FitnessStatsProps> = ({
  completedWorkouts,
  currentStreak,
  totalMinutesExercised,
  weeklyGoal = 5,
  className = ''
}) => {
  const formatMinutesToHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${remainingMinutes}m`;
  };

  // Calculate progress and trends
  const weeklyProgress = Math.min((completedWorkouts / weeklyGoal) * 100, 100);
  const streakProgress = Math.min((currentStreak / 7) * 100, 100); // 7-day streak goal
  const timeProgress = Math.min((totalMinutesExercised / 150) * 100, 100); // 150 min weekly goal

  // Generate motivational insight
  const getMotivationalInsight = () => {
    if (weeklyProgress >= 100) {
      return "🎉 Amazing! You've crushed your weekly goal!";
    } else if (weeklyProgress >= 80) {
      return `💪 Great progress! You're ${Math.round(weeklyProgress)}% to your weekly goal`;
    } else if (currentStreak >= 3) {
      return `🔥 Keep the momentum! ${currentStreak} day streak going strong`;
    } else if (completedWorkouts > 0) {
      return "🌟 Every workout counts! Keep building your fitness journey";
    }
    return "🚀 Ready to start your fitness journey? Let's go!";
  };

  return (
    <div className={`fitness-stats-premium ${className}`}>
      {/* Header */}
      <div className="stats-header">
        <h3 className="stats-title">Fitness Statistics</h3>
        <div className="stats-insight">
          <span className="insight-text">{getMotivationalInsight()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="🏋️"
          value={completedWorkouts}
          label="Workouts Completed"
          progress={weeklyProgress}
          trend={completedWorkouts > 0 ? 'up' : 'neutral'}
          trendValue={weeklyProgress >= 100 ? 'Goal reached!' : `${Math.round(weeklyProgress)}% to goal`}
          delay={0}
        />

        <StatCard
          icon="🔥"
          value={currentStreak}
          label="Day Streak"
          progress={streakProgress}
          trend={currentStreak >= 3 ? 'up' : currentStreak > 0 ? 'neutral' : 'neutral'}
          trendValue={currentStreak >= 7 ? 'Week complete!' : `${7 - currentStreak} days to week`}
          delay={200}
        />

        <StatCard
          icon="⏱️"
          value={totalMinutesExercised}
          label="Exercise Time"
          progress={timeProgress}
          trend={totalMinutesExercised > 0 ? 'up' : 'neutral'}
          trendValue={`${Math.round(timeProgress)}% of weekly target`}
          delay={400}
          formatValue={formatMinutesToHours}
        />
      </div>

      {/* Achievement Badges */}
      {(completedWorkouts >= 10 || currentStreak >= 7 || totalMinutesExercised >= 300) && (
        <div className="achievement-badges">
          <div className="badges-header">
            <span className="badges-title">🏆 Achievements</span>
          </div>
          <div className="badges-grid">
            {completedWorkouts >= 10 && (
              <div className="achievement-badge">
                <span className="badge-icon">💪</span>
                <span className="badge-text">Workout Warrior</span>
              </div>
            )}
            {currentStreak >= 7 && (
              <div className="achievement-badge">
                <span className="badge-icon">🔥</span>
                <span className="badge-text">Week Streak</span>
              </div>
            )}
            {totalMinutesExercised >= 300 && (
              <div className="achievement-badge">
                <span className="badge-icon">⏰</span>
                <span className="badge-text">Time Master</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessStats; 