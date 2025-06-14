/**
 * Version-Aware Card Meta Component
 * 
 * Enhanced meta component that displays workout version information,
 * data freshness, and recent changes for accurate workout card display.
 */
import React from 'react';
import { Clock, Target, GitBranch, AlertCircle, CheckCircle } from 'lucide-react';
import { VersionAwareWorkoutService } from '../../../services/VersionAwareWorkoutService';

interface EnhancedWorkoutData {
  id: string | number;
  title: string;
  description: string;
  duration: number;
  // PHASE 5: New fitness-specific fields
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  intensity_level?: number;
  exercise_complexity?: 'basic' | 'moderate' | 'advanced';
  // BACKWARD COMPATIBILITY: Keep difficulty field during transition
  difficulty: 'beginner' | 'intermediate' | 'advanced';
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

interface VersionAwareCardMetaProps {
  workout: EnhancedWorkoutData;
  viewMode: 'grid' | 'list';
  showDescription?: boolean;
  showVersionInfo?: boolean;
  showDebugInfo?: boolean;
}

// PHASE 5: Enhanced fitness-specific configuration
const FITNESS_LEVEL_CONFIG = {
  beginner: { 
    icon: '🟢', 
    color: 'green', 
    label: 'Beginner',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    textColor: '#10b981',
    description: 'New to fitness'
  },
  intermediate: { 
    icon: '🟡', 
    color: 'yellow', 
    label: 'Intermediate',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    textColor: '#f59e0b',
    description: '6+ months experience'
  },
  advanced: { 
    icon: '🔴', 
    color: 'red', 
    label: 'Advanced',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    textColor: '#ef4444',
    description: '2+ years experience'
  }
};

// PHASE 5: Intensity level configuration
const INTENSITY_CONFIG = {
  1: { icon: '💤', label: 'Very Light', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
  2: { icon: '🚶', label: 'Light', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  3: { icon: '💪', label: 'Moderate', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  4: { icon: '🔥', label: 'High', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
  5: { icon: '⚡', label: 'Maximum', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
};

// PHASE 5: Exercise complexity configuration
const COMPLEXITY_CONFIG = {
  basic: { icon: '⚙️', label: 'Basic', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  moderate: { icon: '🔧', label: 'Moderate', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  advanced: { icon: '🛠️', label: 'Advanced', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
};

/**
 * VersionAwareCardMeta Component - Displays workout metadata with version info
 */
export const VersionAwareCardMeta: React.FC<VersionAwareCardMetaProps> = ({
  workout,
  viewMode,
  showDescription = true,
  showVersionInfo = true,
  showDebugInfo = false
}) => {
  const difficultyConfig = FITNESS_LEVEL_CONFIG[workout.difficulty];
  const exerciseCount = Array.isArray(workout.exercises) ? workout.exercises.length : 0;
  
  // PHASE 5: Get fitness-specific configurations with fallback logic
  const fitnessLevel = workout.fitness_level || workout.difficulty || 'intermediate';
  const intensityLevel = workout.intensity_level || 3;
  const exerciseComplexity = workout.exercise_complexity || 'moderate';
  
  const fitnessLevelConfig = FITNESS_LEVEL_CONFIG[fitnessLevel];
  const intensityConfig = INTENSITY_CONFIG[intensityLevel as keyof typeof INTENSITY_CONFIG];
  const complexityConfig = COMPLEXITY_CONFIG[exerciseComplexity];
  
  // Get version freshness indicator
  const freshnessIndicator = VersionAwareWorkoutService.getWorkoutFreshnessIndicator(workout);
  
  // Format last modified time
  const formatLastModified = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 24 * 60) return `${Math.floor(diffMinutes / 60)}h ago`;
    if (diffMinutes < 7 * 24 * 60) return `${Math.floor(diffMinutes / (24 * 60))}d ago`;
    
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }).format(date);
  };

  return (
    <div className="version-aware-workout-meta">
      {/* PHASE 5: Enhanced Primary Meta Badges with Fitness-Specific Parameters */}
      <div className="meta-badges">
        {/* Fitness Level Badge */}
        <span 
          className="fitness-level-badge"
          style={{ 
            backgroundColor: fitnessLevelConfig.bgColor,
            color: fitnessLevelConfig.textColor 
          }}
          title={`Fitness Level: ${fitnessLevelConfig.label} - ${fitnessLevelConfig.description}`}
        >
          <span className="fitness-level-icon">{fitnessLevelConfig.icon}</span>
          {fitnessLevelConfig.label}
        </span>
        
        {/* Intensity Level Badge */}
        <span 
          className="intensity-level-badge"
          style={{ 
            backgroundColor: intensityConfig.bgColor,
            color: intensityConfig.color 
          }}
          title={`Today's Intensity: ${intensityConfig.label} (${intensityLevel}/5)`}
        >
          <span className="intensity-level-icon">{intensityConfig.icon}</span>
          {intensityLevel}/5
        </span>
        
        {/* Exercise Complexity Badge */}
        <span 
          className="exercise-complexity-badge"
          style={{ 
            backgroundColor: complexityConfig.bgColor,
            color: complexityConfig.color 
          }}
          title={`Exercise Complexity: ${complexityConfig.label}`}
        >
          <span className="exercise-complexity-icon">{complexityConfig.icon}</span>
          {complexityConfig.label}
        </span>
        
        {/* Version Info Badge */}
        {showVersionInfo && (
          <span 
            className="version-badge"
            style={{
              backgroundColor: freshnessIndicator.color + '20',
              color: freshnessIndicator.color,
              border: `1px solid ${freshnessIndicator.color}40`
            }}
            title={`Version ${workout.version} • ${freshnessIndicator.text} • ${workout.changeSummary}`}
          >
            <GitBranch size={12} />
            v{workout.version}
            <span className="freshness-icon" style={{ marginLeft: '4px' }}>
              {freshnessIndicator.icon}
            </span>
          </span>
        )}

        {/* Debug Badge - Show workout ID and staleness */}
        {showDebugInfo && (
          <span className="workout-debug-badge" style={{ 
            backgroundColor: 'rgba(156, 163, 175, 0.1)', 
            color: '#6b7280',
            fontSize: '0.75rem',
            padding: '2px 6px'
          }}>
            ID: {workout.id} • {workout.staleness}
          </span>
        )}
      </div>

      {/* Meta Stats */}
      <div className="meta-stats">
        <div className="stat-item">
          <Clock size={14} />
          <span>{workout.duration} min</span>
        </div>
        <div className="stat-item">
          <Target size={14} />
          <span>{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}</span>
        </div>
        
        {/* Version Stats */}
        {showVersionInfo && (
          <div className="stat-item version-stat">
            {workout.hasRecentChanges ? (
              <AlertCircle size={14} color={freshnessIndicator.color} />
            ) : (
              <CheckCircle size={14} color={freshnessIndicator.color} />
            )}
            <span style={{ color: freshnessIndicator.color }}>
              {formatLastModified(workout.lastModified)}
            </span>
          </div>
        )}
      </div>

      {/* Recent Changes Indicator */}
      {showVersionInfo && workout.hasRecentChanges && (
        <div className="recent-changes-indicator" style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '0.75rem',
          marginTop: '4px'
        }}>
          <span style={{ color: '#92400e' }}>
            📝 Recent {workout.changeType}: {workout.changeSummary}
          </span>
        </div>
      )}

      {/* Workout Description (Grid mode only) */}
      {showDescription && viewMode === 'grid' && workout.description && (
        <p className="workout-description">{workout.description}</p>
      )}

      {/* Equipment Tags */}
      {workout.equipment.length > 0 && (
        <div className="equipment-tags">
          {workout.equipment.slice(0, 3).map((eq, index) => (
            <span key={index} className="equipment-tag">
              {eq}
            </span>
          ))}
          {workout.equipment.length > 3 && (
            <span className="equipment-more">
              +{workout.equipment.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Data Quality Warning with Refresh Button */}
      {workout.staleness === 'expired' && (
        <div className="data-quality-warning" style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '0.75rem',
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} color="#dc2626" />
            <span style={{ color: '#dc2626' }}>
              This workout data may be outdated. Click to refresh.
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              console.log(`🔄 Refreshing individual workout ${workout.id}`);
              // Trigger refresh event that parent can listen to
              window.dispatchEvent(new CustomEvent('refreshWorkout', { 
                detail: { workoutId: workout.id } 
              }));
            }}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              padding: '2px 6px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="Refresh this workout"
          >
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default VersionAwareCardMeta; 