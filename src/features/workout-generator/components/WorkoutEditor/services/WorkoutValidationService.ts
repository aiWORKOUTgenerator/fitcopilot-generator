/**
 * Workout Validation Service
 * 
 * Provides real-time validation, caching, and intelligent suggestions
 * for workout data with performance optimization and contextual feedback.
 */

import { 
  ValidationResult, 
  WorkoutValidation, 
  validateWorkout, 
  ValidationRules,
  validateField,
  type ValidationRule
} from '../utils/formValidation';

// Enhanced validation types
export interface FieldSuggestion {
  value: any;
  label: string;
  confidence: number; // 0-1
  reason: string;
  category: 'improvement' | 'alternative' | 'enhancement';
}

export interface EnhancedValidationResult extends ValidationResult {
  suggestions?: FieldSuggestion[];
  severity?: 'error' | 'warning' | 'info';
  helpText?: string;
  contextualInfo?: string;
}

export interface ValidationCache {
  [key: string]: {
    result: EnhancedValidationResult;
    timestamp: number;
    ttl: number;
  };
}

export interface ValidationServiceOptions {
  enableCaching: boolean;
  cacheTimeToLive: number; // milliseconds
  enableSuggestions: boolean;
  contextualValidation: boolean;
}

/**
 * Enhanced workout validation service with caching and suggestions
 */
export class WorkoutValidationService {
  private cache: ValidationCache = {};
  private suggestionProviders: Map<string, (value: any, context?: any) => FieldSuggestion[]> = new Map();
  
  constructor(
    private options: ValidationServiceOptions = {
      enableCaching: true,
      cacheTimeToLive: 5000,
      enableSuggestions: true,
      contextualValidation: true
    }
  ) {
    this.initializeSuggestionProviders();
  }

  /**
   * Validate entire workout with caching and enhanced feedback
   */
  public validateWorkoutEnhanced(workout: any): WorkoutValidation & {
    suggestions: { [field: string]: FieldSuggestion[] };
    contextualInfo: string[];
  } {
    const cacheKey = this.generateCacheKey('workout', workout);
    
    // Check cache first
    if (this.options.enableCaching) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached as any;
      }
    }

    // Perform validation
    const baseValidation = validateWorkout(workout);
    const suggestions: { [field: string]: FieldSuggestion[] } = {};
    const contextualInfo: string[] = [];

    // Add suggestions for each field
    if (this.options.enableSuggestions) {
      suggestions.title = this.getSuggestions('title', workout.title, workout);
      suggestions.duration = this.getSuggestions('duration', workout.duration, workout);
      suggestions.difficulty = this.getSuggestions('difficulty', workout.difficulty, workout);
      
      // Exercise-level suggestions
      if (workout.exercises) {
        workout.exercises.forEach((exercise: any, index: number) => {
          suggestions[`exercise_${index}_name`] = this.getSuggestions('exerciseName', exercise.name, { exercise, workout });
          suggestions[`exercise_${index}_sets`] = this.getSuggestions('exerciseSets', exercise.sets, { exercise, workout });
          suggestions[`exercise_${index}_reps`] = this.getSuggestions('exerciseReps', exercise.reps, { exercise, workout });
        });
      }
    }

    // Add contextual information
    if (this.options.contextualValidation) {
      contextualInfo.push(...this.generateContextualInfo(workout));
    }

    const result = {
      ...baseValidation,
      suggestions,
      contextualInfo
    };

    // Cache the result
    if (this.options.enableCaching) {
      this.setCachedResult(cacheKey, result);
    }

    return result;
  }

  /**
   * Validate a single field with enhanced feedback
   */
  public validateFieldEnhanced(
    fieldName: string, 
    value: any, 
    context?: any
  ): EnhancedValidationResult {
    const cacheKey = this.generateCacheKey(fieldName, value, context);
    
    // Check cache
    if (this.options.enableCaching) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Get validation rule
    const rule = this.getValidationRule(fieldName);
    if (!rule) {
      return { isValid: true };
    }

    // Perform validation
    const baseResult = rule(value, context);
    
    // Enhanced result with suggestions and help text
    const enhancedResult: EnhancedValidationResult = {
      ...baseResult,
      severity: this.determineSeverity(baseResult),
      suggestions: this.options.enableSuggestions ? this.getSuggestions(fieldName, value, context) : [],
      helpText: this.getHelpText(fieldName, baseResult),
      contextualInfo: this.getContextualInfo(fieldName, value, context)
    };

    // Cache the result
    if (this.options.enableCaching) {
      this.setCachedResult(cacheKey, enhancedResult);
    }

    return enhancedResult;
  }

  /**
   * Get suggestions for a specific field
   */
  public getSuggestions(fieldName: string, value: any, context?: any): FieldSuggestion[] {
    const provider = this.suggestionProviders.get(fieldName);
    if (!provider) return [];

    try {
      return provider(value, context).slice(0, 5); // Limit to 5 suggestions
    } catch (error) {
      console.warn(`Error generating suggestions for ${fieldName}:`, error);
      return [];
    }
  }

  /**
   * Clear validation cache
   */
  public clearCache(pattern?: string): void {
    if (pattern) {
      Object.keys(this.cache).forEach(key => {
        if (key.includes(pattern)) {
          delete this.cache[key];
        }
      });
    } else {
      this.cache = {};
    }
  }

  /**
   * Update validation options
   */
  public updateOptions(newOptions: Partial<ValidationServiceOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    if (!newOptions.enableCaching) {
      this.clearCache();
    }
  }

  // Private methods

  private initializeSuggestionProviders(): void {
    // Title suggestions
    this.suggestionProviders.set('title', (value: string, context) => {
      const suggestions: FieldSuggestion[] = [];
      
      if (!value || value.length < 10) {
        suggestions.push({
          value: this.generateWorkoutTitle(context?.difficulty, context?.duration),
          label: 'Auto-generate descriptive title',
          confidence: 0.8,
          reason: 'Based on workout difficulty and duration',
          category: 'improvement'
        });
      }
      
      if (value && value.toLowerCase() === value) {
        suggestions.push({
          value: this.capitalizeTitle(value),
          label: 'Capitalize title',
          confidence: 0.9,
          reason: 'Proper capitalization improves readability',
          category: 'enhancement'
        });
      }
      
      return suggestions;
    });

    // Duration suggestions
    this.suggestionProviders.set('duration', (value: number, context) => {
      const suggestions: FieldSuggestion[] = [];
      
      if (value && context?.difficulty === 'beginner' && value > 45) {
        suggestions.push({
          value: 30,
          label: '30 minutes (recommended for beginners)',
          confidence: 0.7,
          reason: 'Shorter workouts are better for beginners',
          category: 'improvement'
        });
      }
      
      if (value && value % 5 !== 0) {
        const roundedValue = Math.round(value / 5) * 5;
        suggestions.push({
          value: roundedValue,
          label: `${roundedValue} minutes (rounded)`,
          confidence: 0.6,
          reason: 'Round numbers are easier to remember',
          category: 'enhancement'
        });
      }
      
      return suggestions;
    });

    // Exercise name suggestions
    this.suggestionProviders.set('exerciseName', (value: string, context) => {
      const suggestions: FieldSuggestion[] = [];
      
      if (value && !this.hasProperForm(value)) {
        suggestions.push({
          value: this.suggestProperForm(value),
          label: 'Standardized exercise name',
          confidence: 0.8,
          reason: 'Using standard names improves clarity',
          category: 'improvement'
        });
      }
      
      return suggestions;
    });

    // Sets suggestions
    this.suggestionProviders.set('exerciseSets', (value: number, context) => {
      const suggestions: FieldSuggestion[] = [];
      
      if (context?.exercise?.reps && typeof context.exercise.reps === 'number') {
        const totalVolume = value * context.exercise.reps;
        
        if (totalVolume > 100) {
          suggestions.push({
            value: Math.max(1, Math.floor(100 / context.exercise.reps)),
            label: 'Reduce sets for high volume',
            confidence: 0.7,
            reason: 'High volume may lead to fatigue',
            category: 'improvement'
          });
        }
      }
      
      return suggestions;
    });

    // Add more providers as needed...
  }

  private getValidationRule(fieldName: string): ValidationRule | null {
    const ruleMap: { [key: string]: () => ValidationRule } = {
      title: ValidationRules.workoutTitle,
      duration: ValidationRules.workoutDuration,
      difficulty: ValidationRules.workoutDifficulty,
      exerciseName: ValidationRules.exerciseName,
      exerciseSets: ValidationRules.exerciseSets,
      exerciseReps: ValidationRules.exerciseReps,
      exerciseRestPeriod: ValidationRules.exerciseRestPeriod
    };

    const ruleFactory = ruleMap[fieldName];
    return ruleFactory ? ruleFactory() : null;
  }

  private determineSeverity(result: ValidationResult): 'error' | 'warning' | 'info' {
    if (!result.isValid) return 'error';
    if (result.warning) return 'warning';
    return 'info';
  }

  private getHelpText(fieldName: string, result: ValidationResult): string {
    const helpTexts: { [key: string]: string } = {
      title: 'Choose a descriptive name that reflects the workout type and difficulty',
      duration: 'Consider your fitness level and available time when setting duration',
      difficulty: 'Select difficulty based on your current fitness level and experience',
      exerciseName: 'Use clear, standard exercise names for better understanding',
      exerciseSets: 'Number of sets should match your fitness goals and capacity',
      exerciseReps: 'Repetitions can be a number or description (e.g., "8-12" or "30 seconds")',
      exerciseRestPeriod: 'Rest periods help with recovery between sets'
    };

    return helpTexts[fieldName] || '';
  }

  private getContextualInfo(fieldName: string, value: any, context?: any): string {
    // Generate contextual information based on field and workout context
    if (fieldName === 'duration' && context?.exercises?.length) {
      const exerciseCount = context.exercises.length;
      const avgTimePerExercise = value / exerciseCount;
      return `Approximately ${avgTimePerExercise.toFixed(1)} minutes per exercise`;
    }
    
    return '';
  }

  private generateContextualInfo(workout: any): string[] {
    const info: string[] = [];
    
    if (workout.exercises?.length) {
      const totalSets = workout.exercises.reduce((sum: number, ex: any) => sum + (ex.sets || 0), 0);
      info.push(`Total sets: ${totalSets}`);
      
      const avgSetsPerExercise = totalSets / workout.exercises.length;
      if (avgSetsPerExercise > 4) {
        info.push('High set count may increase workout duration');
      }
    }
    
    return info;
  }

  private generateCacheKey(type: string, value: any, context?: any): string {
    const valueHash = JSON.stringify(value);
    const contextHash = context ? JSON.stringify(context) : '';
    return `${type}_${btoa(valueHash + contextHash).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  private getCachedResult(key: string): EnhancedValidationResult | null {
    const cached = this.cache[key];
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      delete this.cache[key];
      return null;
    }
    
    return cached.result;
  }

  private setCachedResult(key: string, result: any): void {
    this.cache[key] = {
      result,
      timestamp: Date.now(),
      ttl: this.options.cacheTimeToLive
    };
  }

  // Utility methods for suggestions
  private generateWorkoutTitle(difficulty?: string, duration?: number): string {
    const templates = [
      `${difficulty?.charAt(0).toUpperCase()}${difficulty?.slice(1)} ${duration}-Minute Workout`,
      `Total Body ${difficulty?.charAt(0).toUpperCase()}${difficulty?.slice(1)} Training`,
      `${duration}-Min ${difficulty?.charAt(0).toUpperCase()}${difficulty?.slice(1)} Session`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private capitalizeTitle(title: string): string {
    return title.replace(/\b\w/g, l => l.toUpperCase());
  }

  private hasProperForm(exerciseName: string): boolean {
    // Simple check for proper exercise name formatting
    return /^[A-Z]/.test(exerciseName) && exerciseName.includes(' ');
  }

  private suggestProperForm(exerciseName: string): string {
    // Simple suggestion for proper exercise name formatting
    return exerciseName
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
} 