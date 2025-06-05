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

const DIFFICULTY_CONFIG = {
  beginner: { 
    icon: '🟢', 
    color: 'green', 
    label: 'Beginner',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    textColor: '#10b981'
  },
  intermediate: { 
    icon: '🟡', 
    color: 'yellow', 
    label: 'Intermediate',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    textColor: '#f59e0b'
  },
  advanced: { 
    icon: '🔴', 
    color: 'red', 
    label: 'Advanced',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    textColor: '#ef4444'
  }
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
  const difficultyConfig = DIFFICULTY_CONFIG[workout.difficulty];
  const exerciseCount = Array.isArray(workout.exercises) ? workout.exercises.length : 0;
  
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
      {/* Primary Meta Badges */}
      <div className="meta-badges">
        <span 
          className="difficulty-badge"
          style={{ 
            backgroundColor: difficultyConfig.bgColor,
            color: difficultyConfig.textColor 
          }}
        >
          <span className="difficulty-icon">{difficultyConfig.icon}</span>
          {difficultyConfig.label}
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