/**
 * Enhanced Dashboard Header Component
 * 
 * Premium dashboard header with dynamic user context, workout statistics,
 * quick action buttons, and responsive design. Features glass morphism styling
 * and real-time data updates.
 */
import React, { useState } from 'react';
import { Plus, Target, Clock, TrendingUp, Settings, User, Zap } from 'lucide-react';
import Button from '../../../components/ui/Button/Button';
import { WorkoutStatsCard } from './WorkoutStatsCard';
import { QuickActionButton } from './QuickActionButton';
import { useProfile } from '../../../features/profile/context';
import { useWorkoutContext } from '../../../features/workout-generator/context/WorkoutContext';
import { useWorkoutStats, useWorkoutInsights } from '../../hooks/useWorkoutStats';
import { TabType } from '../TabSystem/TabContainer';
import './EnhancedHeader.scss';

export type QuickActionType = 'generate' | 'library' | 'profile' | 'settings';

interface EnhancedDashboardHeaderProps {
  /** Active tab for contextual display */
  activeTab: TabType;
  /** Quick action callback */
  onQuickAction: (action: QuickActionType) => void;
  /** Tab switching callback */
  onTabSwitch?: (tab: TabType) => void;
  /** Refresh callback */
  onRefresh?: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Get contextual greeting based on time and user data
 */
const getContextualGreeting = (userName: string, recentActivity: number, weeklyProgress: number, currentStreak: number): string => {
  const hour = new Date().getHours();
  let timeGreeting = '';
  
  if (hour < 12) {
    timeGreeting = 'Good morning';
  } else if (hour < 17) {
    timeGreeting = 'Good afternoon';
  } else {
    timeGreeting = 'Good evening';
  }
  
  // Add motivational context based on stats
  if (recentActivity > 0) {
    return `${timeGreeting}, ${userName}! 💪`;
  } else if (weeklyProgress >= 80) {
    return `${timeGreeting}, ${userName}! 🔥`;
  } else if (currentStreak >= 3) {
    return `${timeGreeting}, ${userName}! ⚡`;
  }
  
  return `${timeGreeting}, ${userName}!`;
};

/**
 * Get contextual subtitle based on active tab and stats
 */
const getContextualSubtitle = (activeTab: TabType, totalWorkouts: number, weeklyProgress: number): string => {
  switch (activeTab) {
    case 'profile':
      if (totalWorkouts === 0) {
        return 'Complete your profile to get personalized workout recommendations';
      }
      return 'Manage your fitness profile and track your progress';
      
    case 'saved-workouts':
      if (totalWorkouts === 0) {
        return 'Generate your first workout to get started';
      }
      return `You have ${totalWorkouts} saved workout${totalWorkouts !== 1 ? 's' : ''}`;
      
    case 'register':
      return 'Set up your fitness profile to get started with personalized workouts';
      
    default:
      if (weeklyProgress >= 100) {
        return "Amazing! You've reached your weekly goal 🎉";
      } else if (weeklyProgress >= 50) {
        return `Great progress! You're ${Math.round(weeklyProgress)}% to your weekly goal`;
      }
      return 'Your personalized fitness dashboard';
  }
};

/**
 * Enhanced Dashboard Header Component
 */
export const EnhancedDashboardHeader: React.FC<EnhancedDashboardHeaderProps> = ({
  activeTab,
  onQuickAction,
  onTabSwitch,
  onRefresh,
  isLoading = false
}) => {
  const { profile } = useProfile();
  const { workouts } = useWorkoutContext();
  const [showStats, setShowStats] = useState(true);
  
  // Calculate stats using the custom hook
  const stats = useWorkoutStats({ workouts: workouts || [], profile });
  const insightMessage = useWorkoutInsights(stats);
  
  // Get user name from profile
  const userName = profile?.username || profile?.name || 'User';
  
  // Generate contextual content
  const greeting = getContextualGreeting(userName, stats.recentActivity, stats.weeklyProgress, stats.currentStreak);
  const subtitle = getContextualSubtitle(activeTab, stats.totalWorkouts, stats.weeklyProgress);
  
  // Handle quick actions
  const handleQuickAction = (action: QuickActionType) => {
    switch (action) {
      case 'generate':
        // Scroll to generator section or switch to appropriate tab
        document.querySelector('.dashboard-generator-section')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
        break;
      case 'library':
        onTabSwitch?.('saved-workouts');
        break;
      case 'profile':
        onTabSwitch?.('profile');
        break;
      default:
        break;
    }
    onQuickAction(action);
  };
  
  return (
    <header className="enhanced-dashboard-header">
      <div className="header-container">
        {/* Main Header Content */}
        <div className="header-main">
          <div className="header-intro">
            <h1 className="dashboard-title">
              {greeting}
            </h1>
            <p className="dashboard-subtitle">
              {subtitle}
            </p>
          </div>
          
          {/* Quick Stats - Desktop Only */}
          {showStats && (
            <div className="quick-stats desktop-only">
              <WorkoutStatsCard
                icon={<Target size={20} />}
                value={stats.totalWorkouts}
                label="Workouts"
                trend={stats.recentActivity > 0 ? 'up' : 'neutral'}
                compact
              />
              <WorkoutStatsCard
                icon={<Clock size={20} />}
                value={`${Math.round(stats.totalMinutes / 60)}h`}
                label="Exercise Time"
                trend={stats.weeklyProgress > 50 ? 'up' : 'neutral'}
                compact
              />
              <WorkoutStatsCard
                icon={<TrendingUp size={20} />}
                value={`${Math.round(stats.weeklyProgress)}%`}
                label="Weekly Goal"
                trend={stats.weeklyProgress >= 80 ? 'up' : stats.weeklyProgress >= 50 ? 'neutral' : 'down'}
                compact
              />
            </div>
          )}
        </div>
        
        {/* Header Actions */}
        <div className="header-actions">
          {/* Quick Action Buttons */}
          <div className="quick-actions">
            <QuickActionButton
              icon={<Plus size={18} />}
              label="Generate"
              onClick={() => handleQuickAction('generate')}
              variant="primary"
              tooltip="Generate new workout"
            />
            <QuickActionButton
              icon={<Target size={18} />}
              label="Library"
              onClick={() => handleQuickAction('library')}
              variant="secondary"
              tooltip="View saved workouts"
              className="mobile-hidden"
            />
            <QuickActionButton
              icon={<User size={18} />}
              label="Profile"
              onClick={() => handleQuickAction('profile')}
              variant="secondary"
              tooltip="Manage profile"
              className="desktop-only"
            />
          </div>
          
          {/* Settings & Refresh */}
          <div className="utility-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="refresh-btn"
              aria-label="Refresh dashboard"
            >
              <Zap size={16} className={isLoading ? 'spinning' : ''} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Stats Bar */}
      <div className="mobile-stats mobile-only">
        <div className="stats-scroll">
          <WorkoutStatsCard
            icon={<Target size={16} />}
            value={stats.totalWorkouts}
            label="Workouts"
            compact
            mobile
          />
          <WorkoutStatsCard
            icon={<Clock size={16} />}
            value={`${Math.round(stats.totalMinutes / 60)}h`}
            label="Time"
            compact
            mobile
          />
          <WorkoutStatsCard
            icon={<TrendingUp size={16} />}
            value={`${Math.round(stats.weeklyProgress)}%`}
            label="Goal"
            trend={stats.weeklyProgress >= 80 ? 'up' : 'neutral'}
            compact
            mobile
          />
        </div>
      </div>
    </header>
  );
};

export default EnhancedDashboardHeader; 