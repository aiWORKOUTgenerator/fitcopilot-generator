/**
 * WorkoutValidator Service
 * 
 * Handles validation of workout data structures and integrity checks.
 * Part of Week 1 Foundation Sprint - extracted validation logic.
 */

// Import types (using existing DisplayWorkout interface from WorkoutGrid for now)
interface DisplayWorkout {
  id: string | number;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: any[];
  created_at: string;
  updated_at: string;
  workoutType: string;
  equipment: string[];
  isCompleted: boolean;
  completedAt?: string;
  tags: string[];
  createdAt: string; // For backward compatibility
  lastModified: string; // For backward compatibility
  isFavorite?: boolean;
  rating?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class WorkoutValidator {
  /**
   * Validate if a workout has the minimum required data
   * 
   * @param workout - Workout object to validate
   * @returns True if workout has minimum required data
   */
  static isValidWorkout(workout: any): boolean {
    if (!workout || typeof workout !== 'object') {
      return false;
    }
    
    const hasId = !!(workout.id || workout.post_id);
    const hasTitle = !!(workout.title || workout.post_title);
    
    return hasId && hasTitle;
  }

  /**
   * Comprehensive workout validation with detailed feedback
   * 
   * @param workout - Workout object to validate
   * @returns Validation result with errors and warnings
   */
  static validateWorkout(workout: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic existence check
    if (!workout || typeof workout !== 'object') {
      return {
        isValid: false,
        errors: ['Workout is null, undefined, or not an object'],
        warnings: []
      };
    }

    // Required fields validation
    if (!workout.id && !workout.post_id) {
      errors.push('Workout must have an id or post_id');
    }

    if (!workout.title && !workout.post_title) {
      errors.push('Workout must have a title or post_title');
    }

    // Title validation
    const title = workout.title || workout.post_title;
    if (title && typeof title === 'string') {
      if (title.trim().length === 0) {
        warnings.push('Workout title is empty');
      } else if (title.length > 200) {
        warnings.push('Workout title is very long (>200 characters)');
      }
    }

    // Duration validation
    if (workout.duration !== undefined) {
      if (typeof workout.duration !== 'number') {
        warnings.push('Workout duration should be a number');
      } else if (workout.duration < 0) {
        warnings.push('Workout duration cannot be negative');
      } else if (workout.duration > 480) { // 8 hours
        warnings.push('Workout duration seems very long (>8 hours)');
      }
    }

    // Difficulty validation
    if (workout.difficulty !== undefined) {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      if (!validDifficulties.includes(workout.difficulty)) {
        warnings.push(`Invalid difficulty level: ${workout.difficulty}. Valid options: ${validDifficulties.join(', ')}`);
      }
    }

    // Date validation
    const dateFields = ['created_at', 'updated_at', 'post_date', 'post_modified', 'date', 'modified'];
    dateFields.forEach(field => {
      if (workout[field] && !this.isValidDateString(workout[field])) {
        warnings.push(`Invalid date format in field: ${field}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate exercise data structure
   * 
   * @param exercise - Exercise object to validate
   * @returns True if exercise has valid structure
   */
  static isValidExercise(exercise: any): boolean {
    if (!exercise || typeof exercise !== 'object') {
      return false;
    }
    
    const hasName = typeof exercise.name === 'string' && exercise.name.trim().length > 0;
    const hasActivity = exercise.hasOwnProperty('sets') || exercise.hasOwnProperty('duration') || exercise.hasOwnProperty('reps');
    
    return hasName && hasActivity;
  }

  /**
   * Validate workout_data JSON structure
   * 
   * @param workoutData - Workout data to validate (string or object)
   * @returns True if workout data is valid JSON structure
   */
  static isValidWorkoutData(workoutData: any): boolean {
    try {
      const parsed = typeof workoutData === 'string' 
        ? JSON.parse(workoutData) 
        : workoutData;
      return !!(parsed && (parsed.exercises || parsed.sections));
    } catch {
      return false;
    }
  }

  /**
   * Validate exercises array
   * 
   * @param exercises - Array of exercises to validate
   * @returns Validation result for exercises
   */
  static validateExercises(exercises: any[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(exercises)) {
      return {
        isValid: false,
        errors: ['Exercises must be an array'],
        warnings: []
      };
    }

    if (exercises.length === 0) {
      warnings.push('Workout has no exercises');
    }

    exercises.forEach((exercise, index) => {
      if (!this.isValidExercise(exercise)) {
        errors.push(`Exercise ${index + 1} is invalid or missing required fields`);
      } else {
        // Additional exercise validation
        if (!exercise.name || exercise.name.trim().length === 0) {
          errors.push(`Exercise ${index + 1} has no name`);
        }
        
        if (!exercise.sets && !exercise.duration && !exercise.reps) {
          warnings.push(`Exercise ${index + 1} (${exercise.name}) has no sets, reps, or duration specified`);
        }

        if (exercise.hasOwnProperty('sets') && (typeof exercise.sets !== 'number' || exercise.sets < 1)) {
          warnings.push(`Exercise ${index + 1} (${exercise.name}) has invalid sets value`);
        }

        if (exercise.hasOwnProperty('reps') && (typeof exercise.reps !== 'number' || exercise.reps < 1)) {
          warnings.push(`Exercise ${index + 1} (${exercise.name}) has invalid reps value`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate equipment array
   * 
   * @param equipment - Equipment array to validate
   * @returns True if equipment array is valid
   */
  static isValidEquipment(equipment: any): boolean {
    if (!Array.isArray(equipment)) return false;
    
    return equipment.every(item => 
      typeof item === 'string' && item.trim().length > 0
    );
  }

  /**
   * Validate tags array
   * 
   * @param tags - Tags array to validate
   * @returns True if tags array is valid
   */
  static isValidTags(tags: any): boolean {
    if (!Array.isArray(tags)) return false;
    
    return tags.every(tag => 
      typeof tag === 'string' && tag.trim().length > 0
    );
  }

  /**
   * Check if a string is a valid date
   * 
   * @param dateString - Date string to validate
   * @returns True if valid date string
   */
  static isValidDateString(dateString: any): boolean {
    if (typeof dateString !== 'string') return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.getFullYear() > 1900;
  }

  /**
   * Validate rating value
   * 
   * @param rating - Rating to validate
   * @returns True if rating is valid (1-5)
   */
  static isValidRating(rating: any): boolean {
    return typeof rating === 'number' && 
           rating >= 1 && 
           rating <= 5 && 
           Number.isInteger(rating);
  }

  /**
   * Check for potential data corruption issues
   * 
   * @param workout - Workout to check for corruption
   * @returns Array of corruption indicators
   */
  static checkDataCorruption(workout: any): string[] {
    const issues: string[] = [];

    // Check for malformed workout_data
    if (workout.workout_data && typeof workout.workout_data === 'string') {
      try {
        JSON.parse(workout.workout_data);
      } catch {
        issues.push('workout_data contains invalid JSON');
      }
    }

    // Check for missing critical data
    if (!workout.exercises && !workout.workout_data && !workout.sections) {
      issues.push('No exercise data found in any expected location');
    }

    // Check for inconsistent IDs
    if (workout.id && workout.post_id && workout.id !== workout.post_id) {
      issues.push('Inconsistent ID values between id and post_id');
    }

    // Check for inconsistent titles
    if (workout.title && workout.post_title && workout.title !== workout.post_title) {
      issues.push('Inconsistent title values between title and post_title');
    }

    // Check for future dates
    const now = new Date();
    const createdDate = new Date(workout.created_at || workout.post_date || '');
    if (createdDate > now) {
      issues.push('Created date is in the future');
    }

    return issues;
  }

  /**
   * Sanitize workout data by removing invalid entries
   * 
   * @param workout - Workout to sanitize
   * @returns Sanitized workout data
   */
  static sanitizeWorkout(workout: any): any {
    if (!workout || typeof workout !== 'object') {
      return null;
    }

    const sanitized = { ...workout };

    // Sanitize arrays
    if (sanitized.tags && !this.isValidTags(sanitized.tags)) {
      sanitized.tags = [];
    }

    if (sanitized.equipment && !this.isValidEquipment(sanitized.equipment)) {
      sanitized.equipment = [];
    }

    // Sanitize rating
    if (sanitized.rating && !this.isValidRating(sanitized.rating)) {
      delete sanitized.rating;
    }

    // Sanitize boolean fields
    if (sanitized.isCompleted !== undefined) {
      sanitized.isCompleted = Boolean(sanitized.isCompleted);
    }

    if (sanitized.isFavorite !== undefined) {
      sanitized.isFavorite = Boolean(sanitized.isFavorite);
    }

    return sanitized;
  }
}

export default WorkoutValidator; 