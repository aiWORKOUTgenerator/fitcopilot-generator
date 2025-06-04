/**
 * Workout Formatters Utility
 * 
 * Centralized display formatting functions for workout data.
 * Extracted from components during Week 1 Foundation Sprint.
 */

export class WorkoutFormatters {
  /**
   * Format date for display
   * 
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  static formatDate(dateString: string): string {
    if (!dateString) return 'Unknown Date';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric', 
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.warn('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  }

  /**
   * Format relative date (e.g., "2 days ago")
   * 
   * @param dateString - ISO date string
   * @returns Relative time string
   */
  static formatRelativeDate(dateString: string): string {
    if (!dateString) return 'Unknown time';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      
      return `${Math.floor(diffInDays / 365)} years ago`;
    } catch (error) {
      console.warn('Error formatting relative date:', error, dateString);
      return 'Unknown time';
    }
  }

  /**
   * Format duration for display
   * 
   * @param minutes - Duration in minutes
   * @returns Formatted duration string
   */
  static formatDuration(minutes: number): string {
    if (typeof minutes !== 'number' || minutes < 0) {
      return '0 min';
    }
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${mins}m`;
  }

  /**
   * Format difficulty for display
   * 
   * @param difficulty - Difficulty level
   * @returns Formatted difficulty string
   */
  static formatDifficulty(difficulty: string): string {
    if (typeof difficulty !== 'string') return 'Unknown';
    
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  }

  /**
   * Get difficulty icon
   * 
   * @param difficulty - Difficulty level
   * @returns Icon emoji for difficulty
   */
  static getDifficultyIcon(difficulty: string): string {
    const icons = {
      beginner: '🌱',
      intermediate: '💪', 
      advanced: '🏆'
    };
    return icons[difficulty as keyof typeof icons] || '⭐';
  }

  /**
   * Get difficulty color class
   * 
   * @param difficulty - Difficulty level
   * @returns CSS class name for difficulty color
   */
  static getDifficultyColor(difficulty: string): string {
    const colors = {
      beginner: 'difficulty-beginner',
      intermediate: 'difficulty-intermediate',
      advanced: 'difficulty-advanced'
    };
    return colors[difficulty as keyof typeof colors] || 'difficulty-unknown';
  }

  /**
   * Format exercise count for display
   * 
   * @param count - Number of exercises
   * @returns Formatted exercise count string
   */
  static formatExerciseCount(count: number): string {
    if (typeof count !== 'number' || count < 0) return '0 exercises';
    if (count === 1) return '1 exercise';
    return `${count} exercises`;
  }

  /**
   * Format equipment list for display
   * 
   * @param equipment - Array of equipment names
   * @param maxDisplay - Maximum number of items to display
   * @returns Formatted equipment string
   */
  static formatEquipmentList(equipment: string[], maxDisplay: number = 3): string {
    if (!Array.isArray(equipment) || equipment.length === 0) {
      return 'No equipment';
    }
    
    // Filter out empty strings and duplicates
    const validEquipment = Array.from(new Set(equipment.filter(Boolean)));
    
    if (validEquipment.length === 0) {
      return 'No equipment';
    }
    
    if (validEquipment.length <= maxDisplay) {
      return validEquipment.join(', ');
    }
    
    const displayItems = validEquipment.slice(0, maxDisplay);
    const remainingCount = validEquipment.length - maxDisplay;
    
    return `${displayItems.join(', ')} +${remainingCount} more`;
  }

  /**
   * Format tags list for display
   * 
   * @param tags - Array of tag names
   * @param maxDisplay - Maximum number of tags to display
   * @returns Formatted tags string
   */
  static formatTagsList(tags: string[], maxDisplay: number = 3): string {
    if (!Array.isArray(tags) || tags.length === 0) {
      return '';
    }
    
    // Filter out empty strings and duplicates
    const validTags = Array.from(new Set(tags.filter(Boolean)));
    
    if (validTags.length === 0) {
      return '';
    }
    
    if (validTags.length <= maxDisplay) {
      return validTags.join(', ');
    }
    
    const displayTags = validTags.slice(0, maxDisplay);
    const remainingCount = validTags.length - maxDisplay;
    
    return `${displayTags.join(', ')} +${remainingCount}`;
  }

  /**
   * Format workout type for display
   * 
   * @param workoutType - Workout type string
   * @returns Formatted workout type
   */
  static formatWorkoutType(workoutType: string): string {
    if (typeof workoutType !== 'string') return 'General';
    
    // Convert camelCase or snake_case to proper case
    return workoutType
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to space
      .replace(/_/g, ' ') // snake_case to space
      .replace(/\b\w/g, l => l.toUpperCase()); // capitalize each word
  }

  /**
   * Truncate text for display
   * 
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   * @returns Truncated text with ellipsis if needed
   */
  static truncateText(text: string, maxLength: number = 100): string {
    if (typeof text !== 'string') return '';
    
    if (text.length <= maxLength) return text;
    
    return text.slice(0, maxLength).trim() + '...';
  }

  /**
   * Format completion status
   * 
   * @param isCompleted - Whether workout is completed
   * @param completedAt - Completion date
   * @returns Formatted completion status
   */
  static formatCompletionStatus(isCompleted: boolean, completedAt?: string): string {
    if (!isCompleted) return 'Not completed';
    
    if (completedAt) {
      return `Completed ${this.formatRelativeDate(completedAt)}`;
    }
    
    return 'Completed';
  }

  /**
   * Format rating for display
   * 
   * @param rating - Rating value (1-5)
   * @returns Star rating string
   */
  static formatRating(rating?: number): string {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return '☆☆☆☆☆'; // Empty stars
    }
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  }
} 