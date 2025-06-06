/**
 * Card Thumbnail Component
 * 
 * Generates workout thumbnails with workout titles displayed prominently.
 * Updated to show titles instead of emojis for better workout identification.
 */
import React, { useMemo } from 'react';
import { Play, Edit3, Zap, Target, Heart, Dumbbell, Timer, Users } from 'lucide-react';

interface CardThumbnailProps {
  workout: {
    id: string | number;
    workoutType: string;
    title: string;
    // Optional additional fields for fallback strategies
    description?: string;
    category?: string;
    duration?: string;
    difficulty?: string;
  };
  showActions?: boolean;
  isSelectionMode?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  // 🚀 STORY 3.2: Configuration options
  displayConfig?: {
    fallbackMode?: 'title' | 'type' | 'description' | 'emoji' | 'auto';
    showTypeIndicator?: boolean;
    showProcessedIndicator?: boolean;
    enableTooltips?: boolean;
    maxTitleLength?: number;
    customFallbackText?: string;
  };
  // 🚀 STORY 3.2: Error handling
  onDisplayError?: (error: string, context: any) => void;
}

/**
 * CardThumbnail Component - Displays workout title prominently in colored header
 * 🚀 PERFORMANCE: Memoized for optimal rendering performance
 */
export const CardThumbnail: React.FC<CardThumbnailProps> = React.memo(({
  workout,
  showActions = false,
  isSelectionMode = false,
  onSelect,
  onEdit,
  displayConfig = {},
  onDisplayError
}) => {
  // 🚀 PERFORMANCE: Memoize expensive calculations
  const config = useMemo(() => ({
    fallbackMode: displayConfig.fallbackMode || 'auto',
    showTypeIndicator: displayConfig.showTypeIndicator !== false,
    showProcessedIndicator: displayConfig.showProcessedIndicator !== false,
    enableTooltips: displayConfig.enableTooltips !== false,
    maxTitleLength: displayConfig.maxTitleLength || 100,
    customFallbackText: displayConfig.customFallbackText || null,
    ...displayConfig
  }), [displayConfig]);

  // 🚀 PERFORMANCE: Memoize thumbnail color calculation
  const thumbnailColor = useMemo(() => {
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    return colors[workout.id.toString().length % colors.length];
  }, [workout.id]);

  // 🚀 PERFORMANCE: Simplified thumbnail data (color now memoized above)
  const getThumbnailData = () => {
    return { color: thumbnailColor };
  };

  const { color } = getThumbnailData();
  
  // 🚀 STORY 3.2: Comprehensive fallback strategy system
  const getFallbackContent = (): { content: string; source: string; emoji?: string } => {
    try {
      // Custom fallback text takes highest priority
      if (config.customFallbackText) {
        return { content: config.customFallbackText, source: 'custom' };
      }

      switch (config.fallbackMode) {
        case 'title':
          if (workout.title && workout.title.trim()) {
            return { content: workout.title.trim(), source: 'title' };
          }
          break;
          
        case 'type':
          if (workout.workoutType && workout.workoutType !== 'General') {
            return { content: `${workout.workoutType} Workout`, source: 'type' };
          }
          break;
          
        case 'description':
          if (workout.description && workout.description.trim()) {
            const shortDesc = workout.description.trim().substring(0, 40);
            return { content: shortDesc + (workout.description.length > 40 ? '...' : ''), source: 'description' };
          }
          break;
          
        case 'emoji':
          return { 
            content: '',
            source: 'emoji',
            emoji: getWorkoutTypeEmoji(workout.workoutType)
          };
          
        case 'auto':
        default:
          // Intelligent auto-fallback sequence
          if (workout.title && workout.title.trim() && workout.title.trim() !== 'Untitled') {
            return { content: workout.title.trim(), source: 'title' };
          }
          
          if (workout.workoutType && workout.workoutType !== 'General') {
            const typeDisplay = formatWorkoutType(workout.workoutType);
            return { content: `${typeDisplay} Workout`, source: 'type' };
          }
          
          if (workout.category && workout.category !== 'General') {
            return { content: `${workout.category} Session`, source: 'category' };
          }
          
          if (workout.description && workout.description.trim()) {
            const shortDesc = workout.description.trim().substring(0, 30);
            return { content: shortDesc + '...', source: 'description' };
          }
          
          // Final fallback based on workout characteristics
          if (workout.duration) {
            return { content: `${workout.duration} Workout`, source: 'duration' };
          }
          
          if (workout.difficulty) {
            return { content: `${workout.difficulty} Training`, source: 'difficulty' };
          }
          
          // Ultimate fallback
          return { content: 'Workout Session', source: 'ultimate' };
      }
      
      // If specified mode fails, fall back to auto mode
      return getFallbackContentAuto();
      
    } catch (error) {
      console.warn('CardThumbnail fallback error:', error);
      onDisplayError?.('Failed to generate fallback content', { workout, config, error });
      return { content: 'Training Session', source: 'error' };
    }
  };

  const getFallbackContentAuto = (): { content: string; source: string } => {
    if (workout.workoutType && workout.workoutType !== 'General') {
      return { content: `${formatWorkoutType(workout.workoutType)} Workout`, source: 'type' };
    }
    return { content: 'Workout Session', source: 'ultimate' };
  };

  const formatWorkoutType = (type: string): string => {
    if (!type) return 'General';
    
    // Handle special cases
    const specialCases: Record<string, string> = {
      'hiit': 'HIIT',
      'liss': 'LISS', 
      'wod': 'WOD',
      'crossfit': 'CrossFit',
      'pilates': 'Pilates',
      'yoga': 'Yoga'
    };
    
    const lowerType = type.toLowerCase();
    if (specialCases[lowerType]) {
      return specialCases[lowerType];
    }
    
    // Capitalize first letter of each word
    return type.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getWorkoutTypeEmoji = (workoutType: string): string => {
    const type = workoutType?.toLowerCase() || '';
    
    if (type.includes('strength') || type.includes('weights')) return '🏋️';
    if (type.includes('cardio') || type.includes('running')) return '🏃';
    if (type.includes('yoga') || type.includes('flexibility')) return '🧘';
    if (type.includes('hiit') || type.includes('intense')) return '⚡';
    if (type.includes('dance') || type.includes('zumba')) return '💃';
    if (type.includes('swimming')) return '🏊';
    if (type.includes('cycling') || type.includes('bike')) return '🚴';
    if (type.includes('boxing') || type.includes('martial')) return '🥊';
    
    return '💪'; // Default fitness emoji
  };
  
  // Advanced text processing for workout titles
  const processWorkoutTitle = (title: string): { display: string; original: string; processed: boolean; source: string } => {
    // 🚀 STORY 3.2: Enhanced fallback integration
    if (!title || title.trim() === '' || title.trim().toLowerCase() === 'untitled') {
      const fallback = getFallbackContent();
      return {
        display: fallback.content || 'Workout Session',
        original: title || '',
        processed: true,
        source: fallback.source
      };
    }

    // Validate title length against configuration
    if (title.length > config.maxTitleLength) {
      const truncated = title.substring(0, config.maxTitleLength - 3) + '...';
      onDisplayError?.('Title exceeds maximum length', { 
        title, 
        maxLength: config.maxTitleLength,
        truncated 
      });
      
      return {
        display: truncated,
        original: title,
        processed: true,
        source: 'truncated'
      };
    }

    let processed = title.trim();
    let wasProcessed = false;

    // Remove common test/development patterns
    const testPatterns = [
      /\(Test Version \d+\)/gi,
      /\(Test \d+\)/gi,
      /\(Version \d+\.\d+\)/gi,
      /\(V\d+\)/gi,
      /\(Draft\)/gi,
      /\(WIP\)/gi,
      /\(Work in Progress\)/gi,
      /\[TEST\]/gi,
      /\[DRAFT\]/gi
    ];

    testPatterns.forEach(pattern => {
      if (pattern.test(processed)) {
        processed = processed.replace(pattern, '').trim();
        wasProcessed = true;
      }
    });

    // Clean up common workout naming patterns
    const cleanupPatterns = [
      { pattern: /^\d+[\.\-\s]+minute\s+/gi, replacement: '' }, // Remove "15 - Minute " patterns
      { pattern: /^\d+[\.\-\s]*min\s+/gi, replacement: '' }, // Remove "15 - Min " patterns
      { pattern: /^\d+[\.\-\s]+/, replacement: '' }, // Remove other leading numbers
      { pattern: /^minute\s+/gi, replacement: '' }, // Remove standalone "Minute " at start
      { pattern: /^min\s+/gi, replacement: '' }, // Remove standalone "Min " at start
      { pattern: /\s+\-\s*$/, replacement: '' }, // Remove trailing dashes
      { pattern: /\s*\|\s*$/, replacement: '' }, // Remove trailing pipes
      { pattern: /\s{2,}/g, replacement: ' ' }, // Normalize spaces
      { pattern: /[\-_]{2,}/g, replacement: ' - ' } // Normalize separators
    ];

    cleanupPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(processed)) {
        processed = processed.replace(pattern, replacement).trim();
        wasProcessed = true;
      }
    });

    // Handle common workout abbreviations
    const abbreviationMap = {
      'HIIT': 'High Intensity',
      'LISS': 'Low Intensity',
      'WOD': 'Workout of the Day',
      'AMRAP': 'As Many Rounds As Possible',
      'EMOM': 'Every Minute on the Minute',
      'RFT': 'Rounds For Time',
      'LB': 'Lower Body',
      'UB': 'Upper Body',
      'FB': 'Full Body'
    };

    // Expand abbreviations when they appear as whole words
    Object.entries(abbreviationMap).forEach(([abbr, expansion]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      if (regex.test(processed)) {
        processed = processed.replace(regex, expansion);
        wasProcessed = true;
      }
    });

    // Ensure proper capitalization
    processed = processed
      .split(' ')
      .map(word => {
        // Don't capitalize small connector words unless they're the first word
        const smallWords = ['and', 'or', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
        if (smallWords.includes(word.toLowerCase()) && word !== processed.split(' ')[0]) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');

    // Final validation and fallback
    const finalDisplay = processed || getFallbackContent().content;
    
    return {
      display: finalDisplay,
      original: title,
      processed: wasProcessed || (finalDisplay !== title),
      source: finalDisplay === title ? 'original' : wasProcessed ? 'processed' : 'fallback'
    };
  };

  // 🚀 STORY 3.2: Process title with enhanced fallback support
  const titleData = processWorkoutTitle(workout.title);
  const displayTitle = titleData.display;
  const isTextTruncated = displayTitle.length > 50; // Approximate truncation threshold
  
  // 🚀 STORY 3.2: Handle emoji fallback mode
  const fallbackContent = getFallbackContent();
  const shouldShowEmoji = config.fallbackMode === 'emoji' || (titleData.source === 'ultimate' && fallbackContent.emoji);
  const emojiToShow = shouldShowEmoji ? fallbackContent.emoji : null;

  // Workout type indicator logic
  const getWorkoutTypeIcon = (workoutType: string) => {
    const type = workoutType?.toLowerCase() || '';
    
    if (type.includes('hiit') || type.includes('high intensity')) {
      return <Zap size={12} className="workout-type-icon" />;
    }
    if (type.includes('strength') || type.includes('weights') || type.includes('lifting')) {
      return <Dumbbell size={12} className="workout-type-icon" />;
    }
    if (type.includes('cardio') || type.includes('running') || type.includes('cycling')) {
      return <Heart size={12} className="workout-type-icon" />;
    }
    if (type.includes('circuit') || type.includes('crossfit') || type.includes('functional')) {
      return <Target size={12} className="workout-type-icon" />;
    }
    if (type.includes('timed') || type.includes('interval') || type.includes('emom')) {
      return <Timer size={12} className="workout-type-icon" />;
    }
    if (type.includes('group') || type.includes('partner') || type.includes('team')) {
      return <Users size={12} className="workout-type-icon" />;
    }
    
    return null;
  };

  // 🚀 STORY 3.2: Respect configuration for indicators
  const showWorkoutTypeIndicator = config.showTypeIndicator && 
    workout.workoutType && 
    workout.workoutType !== 'General' && 
    !shouldShowEmoji;
  const workoutIcon = showWorkoutTypeIndicator ? getWorkoutTypeIcon(workout.workoutType) : null;

  const handleActionClick = (action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="workout-thumbnail-container">
      <div 
        className="workout-thumbnail"
        style={{ backgroundColor: thumbnailColor }}
        data-has-tooltip={isTextTruncated}
      >
        <div className="thumbnail-title-container">
          <div className="thumbnail-content">
            {/* 🚀 STORY 3.2: Conditional rendering based on display mode */}
            {shouldShowEmoji && emojiToShow ? (
              <span 
                className="thumbnail-emoji"
                title={`${workout.workoutType || 'General'} workout`}
                data-fallback-source={titleData.source}
              >
                {emojiToShow}
              </span>
            ) : (
              <span 
                className={`thumbnail-title ${titleData.processed ? 'processed' : ''} ${titleData.source ? 'source-' + titleData.source : ''}`}
                title={config.enableTooltips && (isTextTruncated || titleData.original !== displayTitle) ? titleData.original : undefined}
                data-original-title={titleData.original}
                data-display-title={displayTitle}
                data-fallback-source={titleData.source}
              >
                {displayTitle}
              </span>
            )}
            
            <div className="thumbnail-indicators">
              {config.showProcessedIndicator && titleData.processed && titleData.source !== 'original' && (
                <span 
                  className="title-processed-indicator" 
                  title={`Automatically formatted (${titleData.source})`}
                >
                  ✨
                </span>
              )}
              {workoutIcon && (
                <span className="workout-type-indicator" title={`${workout.workoutType} workout`}>
                  {workoutIcon}
                </span>
              )}
              {/* 🚀 STORY 3.2: Debug indicator for fallback source */}
              {process.env.NODE_ENV === 'development' && titleData.source !== 'original' && (
                <span 
                  className="debug-source-indicator" 
                  title={`Source: ${titleData.source}`}
                >
                  🐛
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions Overlay */}
      {showActions && !isSelectionMode && (
        <div className="quick-actions-overlay">
          <button
            className="quick-action-btn primary"
            onClick={(e) => handleActionClick(onSelect, e)}
            title="View Workout"
          >
            <Play size={16} />
          </button>
          <button
            className="quick-action-btn secondary"
            onClick={(e) => handleActionClick(onEdit, e)}
            title="Edit Workout"
          >
            <Edit3 size={14} />
          </button>
        </div>
      )}
    </div>
  );
});

export default CardThumbnail; 