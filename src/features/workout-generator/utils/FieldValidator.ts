/**
 * Field Validator
 * 
 * Real-time validation and suggestion system for exercise fields.
 * Provides intelligent feedback and auto-correction suggestions.
 */
import { ExerciseDataParser, FieldSuggestion } from './ExerciseDataParser';
import { ParsedExerciseData } from './exerciseParsingPatterns';

export interface FieldValidationResult {
  isValid: boolean;
  hasWarnings: boolean;
  suggestions: FieldSuggestion[];
  issues: string[];
  warnings: string[];
  confidence: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string | number;
  restPeriod?: number;
  notes?: string;
  // New fields for parsing metadata
  originalDescription?: string;
  parsingStatus?: 'parsed' | 'manual' | 'needs_review';
  parsingConfidence?: number;
}

export class FieldValidator {
  /**
   * Validate an entire exercise and provide comprehensive feedback
   */
  static validateExercise(exercise: Exercise): FieldValidationResult {
    const suggestions: FieldSuggestion[] = [];
    const issues: string[] = [];
    const warnings: string[] = [];
    let confidence = 1.0;

    // Check for obvious parsing issues in reps field
    if (exercise.reps && typeof exercise.reps === 'string') {
      const repsText = exercise.reps.toString();
      
      // Check if reps field contains sets information
      const potentialSetsPattern = repsText.match(/(\d+)\s*sets?\s*[x×]\s*(\d+(?:-\d+)?)/i);
      if (potentialSetsPattern) {
        const suggestedSets = parseInt(potentialSetsPattern[1], 10);
        const suggestedReps = potentialSetsPattern[2];
        
        suggestions.push({
          field: 'sets',
          currentValue: exercise.sets,
          suggestedValue: suggestedSets,
          confidence: 0.95,
          reason: `Found "${potentialSetsPattern[0]}" in reps field - extract sets value`,
          source: 'field_analysis'
        });
        
        suggestions.push({
          field: 'reps',
          currentValue: repsText,
          suggestedValue: suggestedReps,
          confidence: 0.95,
          reason: `Extract reps value from combined text`,
          source: 'field_analysis'
        });
        
        confidence = 0.3; // Low confidence due to parsing issue
      }

      // Check for other patterns that might indicate parsing issues
      const containsRestInfo = /(?:rest|second|minute|pause|break)/i.test(repsText);
      if (containsRestInfo && !exercise.restPeriod) {
        const restMatch = repsText.match(/(\d+)\s*(?:seconds?|minutes?|secs?|mins?)/i);
        if (restMatch) {
          const value = parseInt(restMatch[1], 10);
          const isMinutes = /minutes?|mins?/i.test(restMatch[0]);
          
          suggestions.push({
            field: 'restPeriod',
            currentValue: exercise.restPeriod,
            suggestedValue: isMinutes ? value * 60 : value,
            confidence: 0.8,
            reason: `Found rest period "${restMatch[0]}" in reps field`,
            source: 'field_analysis'
          });
        }
      }
    }

    // Validate sets value
    if (exercise.sets !== undefined) {
      if (exercise.sets < 1) {
        issues.push('Sets must be at least 1');
      } else if (exercise.sets === 1 && exercise.reps && typeof exercise.reps === 'string') {
        // Check if this might be a parsing issue where sets defaulted to 1
        const repsText = exercise.reps.toString();
        if (repsText.length > 10 || /sets?|rounds?|circuits?/i.test(repsText)) {
          warnings.push('Sets is 1 but reps field contains complex text - check parsing');
          suggestions.push({
            field: 'sets',
            currentValue: 1,
            suggestedValue: 3,
            confidence: 0.6,
            reason: 'Default sets value may need adjustment for complex exercise',
            source: 'heuristic_analysis'
          });
        }
      } else if (exercise.sets > 20) {
        warnings.push('Sets value is unusually high (>20)');
        
        // Check if sets and reps might be swapped
        if (typeof exercise.reps === 'number' && exercise.reps < 10) {
          suggestions.push({
            field: 'sets',
            currentValue: exercise.sets,
            suggestedValue: exercise.reps,
            confidence: 0.7,
            reason: 'Sets and reps values might be swapped',
            source: 'swap_detection'
          });
          
          suggestions.push({
            field: 'reps',
            currentValue: exercise.reps,
            suggestedValue: exercise.sets,
            confidence: 0.7,
            reason: 'Sets and reps values might be swapped',
            source: 'swap_detection'
          });
        }
      }
    }

    // Validate reps value
    if (exercise.reps !== undefined) {
      if (typeof exercise.reps === 'number') {
        if (exercise.reps < 1) {
          issues.push('Reps must be at least 1');
        } else if (exercise.reps > 100) {
          warnings.push('Reps value is unusually high (>100)');
        }
      } else if (typeof exercise.reps === 'string') {
        const repsStr = exercise.reps.toString().trim();
        
        // Validate rep ranges
        const rangeMatch = repsStr.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          const min = parseInt(rangeMatch[1], 10);
          const max = parseInt(rangeMatch[2], 10);
          
          if (min >= max) {
            issues.push('Rep range minimum must be less than maximum');
          }
          if (max > 100) {
            warnings.push('Rep range maximum is unusually high (>100)');
          }
        } else if (!/^\d+$/.test(repsStr) && !this.isComplexRepsFormat(repsStr)) {
          // Not a simple number or range, might be a parsing issue
          warnings.push('Reps format may contain unparsed exercise data');
          confidence = Math.min(confidence, 0.5);
        }
      }
    }

    // Validate rest period
    if (exercise.restPeriod !== undefined) {
      if (exercise.restPeriod < 0) {
        issues.push('Rest period cannot be negative');
      } else if (exercise.restPeriod > 600) { // > 10 minutes
        warnings.push('Rest period is unusually long (>10 minutes)');
      }
    }

    // Check exercise name for potential data
    if (exercise.name && exercise.name.length > 100) {
      warnings.push('Exercise name is very long - might contain exercise details');
      
      // Try to parse the name for structured data
      const nameParsingResult = ExerciseDataParser.parseExerciseText(exercise.name);
      if (nameParsingResult.confidence > 0.5) {
        suggestions.push({
          field: 'sets',
          currentValue: exercise.sets,
          suggestedValue: nameParsingResult.parsed.sets,
          confidence: nameParsingResult.confidence * 0.8,
          reason: 'Found sets information in exercise name',
          source: 'name_analysis'
        });
        
        if (nameParsingResult.parsed.reps) {
          suggestions.push({
            field: 'reps',
            currentValue: exercise.reps,
            suggestedValue: nameParsingResult.parsed.reps,
            confidence: nameParsingResult.confidence * 0.8,
            reason: 'Found reps information in exercise name',
            source: 'name_analysis'
          });
        }
      }
    }

    // Check for missing required fields
    if (!exercise.sets && !exercise.reps) {
      warnings.push('Exercise is missing both sets and reps values');
      confidence = Math.min(confidence, 0.2);
    }

    return {
      isValid: issues.length === 0,
      hasWarnings: warnings.length > 0,
      suggestions,
      issues,
      warnings,
      confidence
    };
  }

  /**
   * Check if a reps string is a valid complex format
   */
  private static isComplexRepsFormat(repsStr: string): boolean {
    const validPatterns = [
      /^\d+$/, // Simple number
      /^\d+-\d+$/, // Range like "8-12"
      /^max$|^amrap$/i, // Special formats
      /^\d+\+$/i, // "12+" format
      /^to\s+failure$/i // "to failure"
    ];
    
    return validPatterns.some(pattern => pattern.test(repsStr.trim()));
  }

  /**
   * Get suggestions for auto-parsing exercise description
   */
  static getParsingySuggestions(exerciseDescription: string): FieldSuggestion[] {
    if (!exerciseDescription || exerciseDescription.trim().length === 0) {
      return [];
    }

    const parsingResult = ExerciseDataParser.parseExerciseText(exerciseDescription);
    const suggestions: FieldSuggestion[] = [];

    if (parsingResult.confidence > 0.6) {
      if (parsingResult.parsed.sets) {
        suggestions.push({
          field: 'sets',
          currentValue: undefined,
          suggestedValue: parsingResult.parsed.sets,
          confidence: parsingResult.confidence,
          reason: `Auto-parsed from: "${exerciseDescription}"`,
          source: 'auto_parsing'
        });
      }

      if (parsingResult.parsed.reps) {
        suggestions.push({
          field: 'reps',
          currentValue: undefined,
          suggestedValue: parsingResult.parsed.reps,
          confidence: parsingResult.confidence,
          reason: `Auto-parsed from: "${exerciseDescription}"`,
          source: 'auto_parsing'
        });
      }

      if (parsingResult.parsed.restPeriod) {
        suggestions.push({
          field: 'restPeriod',
          currentValue: undefined,
          suggestedValue: parsingResult.parsed.restPeriod,
          confidence: parsingResult.confidence,
          reason: `Auto-parsed rest period from description`,
          source: 'auto_parsing'
        });
      }
    }

    return suggestions;
  }

  /**
   * Apply multiple suggestions at once with conflict resolution
   */
  static applySuggestions(
    exercise: Exercise, 
    suggestionsToApply: FieldSuggestion[]
  ): Exercise {
    const updated = { ...exercise };

    // Sort suggestions by confidence (highest first)
    const sortedSuggestions = [...suggestionsToApply].sort((a, b) => b.confidence - a.confidence);

    // Apply suggestions, avoiding conflicts
    const appliedFields = new Set<string>();
    
    for (const suggestion of sortedSuggestions) {
      if (!appliedFields.has(suggestion.field)) {
        // @ts-ignore - TypeScript being overly strict with dynamic field access
        updated[suggestion.field] = suggestion.suggestedValue;
        appliedFields.add(suggestion.field);
        
        // Update parsing status
        updated.parsingStatus = 'parsed';
        updated.parsingConfidence = Math.max(
          updated.parsingConfidence || 0,
          suggestion.confidence
        );
      }
    }

    return updated;
  }
}

export default FieldValidator; 