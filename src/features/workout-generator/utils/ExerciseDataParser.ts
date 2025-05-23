/**
 * Exercise Data Parser
 * 
 * Main parsing engine for extracting structured exercise data from AI-generated text.
 * Handles complex scenarios like "4 sets x 8 reps per arm" and provides confidence scores.
 */
import { 
  ParsedExerciseData, 
  PatternMatch,
  EXERCISE_PATTERNS, 
  REST_PATTERNS, 
  normalizeText, 
  extractNotes 
} from './exerciseParsingPatterns';

export interface ParsingResult {
  parsed: ParsedExerciseData;
  confidence: number;
  matchedPatterns: string[];
  suggestions: FieldSuggestion[];
  hasIssues: boolean;
}

export interface FieldSuggestion {
  field: 'sets' | 'reps' | 'restPeriod' | 'notes';
  currentValue: any;
  suggestedValue: any;
  confidence: number;
  reason: string;
  source: string;
}

export class ExerciseDataParser {
  /**
   * Parse exercise text and extract structured data
   */
  static parseExerciseText(text: string): ParsingResult {
    if (!text || text.trim().length === 0) {
      return {
        parsed: {},
        confidence: 0,
        matchedPatterns: [],
        suggestions: [],
        hasIssues: false
      };
    }

    const originalText = text.trim();
    const normalizedText = normalizeText(text);
    
    const parsed: ParsedExerciseData = {
      originalText: originalText
    };
    
    const matchedPatterns: string[] = [];
    let totalConfidence = 0;
    let patternCount = 0;

    // Try to match exercise patterns (sets/reps)
    for (const patternMatch of EXERCISE_PATTERNS) {
      const match = normalizedText.match(patternMatch.pattern);
      if (match) {
        const patternResult = patternMatch.parser(match);
        
        // Merge results, prioritizing higher confidence patterns
        Object.keys(patternResult).forEach(key => {
          const typedKey = key as keyof ParsedExerciseData;
          if (patternResult[typedKey] !== undefined) {
            if (!parsed[typedKey] || patternMatch.confidence > (parsed.confidence || 0)) {
              // @ts-ignore - TypeScript being overly strict here
              parsed[typedKey] = patternResult[typedKey];
            }
          }
        });

        matchedPatterns.push(patternMatch.name);
        totalConfidence += patternMatch.confidence;
        patternCount++;
        
        // Break after first high-confidence match to avoid conflicts
        if (patternMatch.confidence >= 0.9) {
          break;
        }
      }
    }

    // Try to match rest period patterns
    for (const restPattern of REST_PATTERNS) {
      const match = normalizedText.match(restPattern.pattern);
      if (match) {
        const restResult = restPattern.parser(match);
        if (restResult.restPeriod) {
          parsed.restPeriod = restResult.restPeriod;
          matchedPatterns.push(restPattern.name);
          totalConfidence += restPattern.confidence;
          patternCount++;
          break; // Only use first rest period match
        }
      }
    }

    // Extract notes from remaining text
    const extractedNotes = extractNotes(originalText, parsed);
    if (extractedNotes && extractedNotes.length > 0) {
      parsed.notes = extractedNotes;
    }

    // Calculate overall confidence
    const confidence = patternCount > 0 ? Math.min(totalConfidence / patternCount, 1.0) : 0;
    parsed.confidence = confidence;

    // Generate suggestions for improvement
    const suggestions = this.generateSuggestions(originalText, parsed);
    
    // Determine if there are issues
    const hasIssues = confidence < 0.7 || suggestions.length > 0;

    return {
      parsed,
      confidence,
      matchedPatterns,
      suggestions,
      hasIssues
    };
  }

  /**
   * Generate suggestions for improving parsed data
   */
  static generateSuggestions(originalText: string, parsed: ParsedExerciseData): FieldSuggestion[] {
    const suggestions: FieldSuggestion[] = [];
    const normalizedText = normalizeText(originalText);

    // Check if sets/reps might be swapped or malformed
    if (parsed.sets && parsed.reps) {
      // If sets seems unusually high (>20) and reps low (<5), suggest swap
      if (parsed.sets > 20 && typeof parsed.reps === 'number' && parsed.reps < 5) {
        suggestions.push({
          field: 'sets',
          currentValue: parsed.sets,
          suggestedValue: parsed.reps,
          confidence: 0.8,
          reason: 'Sets value seems unusually high, consider swapping with reps',
          source: 'heuristic_analysis'
        });
        
        suggestions.push({
          field: 'reps',
          currentValue: parsed.reps,
          suggestedValue: parsed.sets,
          confidence: 0.8,
          reason: 'Reps value seems unusually low, consider swapping with sets',
          source: 'heuristic_analysis'
        });
      }
    }

    // Check if all data went to reps field when it should be parsed
    if (!parsed.sets && parsed.reps && typeof parsed.reps === 'string') {
      const repsText = parsed.reps.toString();
      
      // Look for sets indicators in the reps field
      const setsInReps = repsText.match(/(\d+)\s*sets?\s*[x×]\s*(\d+(?:-\d+)?)/i);
      if (setsInReps) {
        suggestions.push({
          field: 'sets',
          currentValue: 1,
          suggestedValue: parseInt(setsInReps[1], 10),
          confidence: 0.9,
          reason: 'Found sets information in reps field',
          source: 'pattern_detection'
        });
        
        suggestions.push({
          field: 'reps',
          currentValue: repsText,
          suggestedValue: setsInReps[2],
          confidence: 0.9,
          reason: 'Extract reps from combined sets/reps text',
          source: 'pattern_detection'
        });
      }
    }

    // Check for missing sets when we have clear reps
    if (!parsed.sets && parsed.reps && !normalizedText.includes('amrap') && !normalizedText.includes('max')) {
      // Most exercises should have sets, suggest a default
      suggestions.push({
        field: 'sets',
        currentValue: undefined,
        suggestedValue: 3,
        confidence: 0.6,
        reason: 'Most exercises have multiple sets, consider adding a sets value',
        source: 'default_suggestion'
      });
    }

    // Check for rest period extraction opportunities
    if (!parsed.restPeriod && (normalizedText.includes('rest') || normalizedText.includes('second') || normalizedText.includes('minute'))) {
      // Try to extract rest period more aggressively
      const restMatch = normalizedText.match(/(\d+)\s*(?:seconds?|minutes?|secs?|mins?)/);
      if (restMatch) {
        const value = parseInt(restMatch[1], 10);
        const isMinutes = normalizedText.includes('minute');
        
        suggestions.push({
          field: 'restPeriod',
          currentValue: undefined,
          suggestedValue: isMinutes ? value * 60 : value,
          confidence: 0.7,
          reason: `Found rest period: ${value} ${isMinutes ? 'minutes' : 'seconds'}`,
          source: 'text_analysis'
        });
      }
    }

    return suggestions;
  }

  /**
   * Validate parsed exercise data and provide feedback
   */
  static validateParsedData(parsed: ParsedExerciseData): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check sets
    if (parsed.sets !== undefined) {
      if (parsed.sets < 1) {
        issues.push('Sets must be at least 1');
      } else if (parsed.sets > 50) {
        warnings.push('Sets value seems unusually high (>50)');
      }
    }

    // Check reps
    if (parsed.reps !== undefined) {
      if (typeof parsed.reps === 'number' && parsed.reps < 1) {
        issues.push('Reps must be at least 1');
      } else if (typeof parsed.reps === 'string') {
        // Validate rep ranges like "8-12"
        const rangeMatch = parsed.reps.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          const min = parseInt(rangeMatch[1], 10);
          const max = parseInt(rangeMatch[2], 10);
          if (min >= max) {
            issues.push('Rep range minimum must be less than maximum');
          }
          if (max > 100) {
            warnings.push('Rep range maximum seems unusually high (>100)');
          }
        } else if (!/^\d+$/.test(parsed.reps)) {
          warnings.push('Reps format not recognized, ensure it\'s a number or range (e.g., "8-12")');
        }
      }
    }

    // Check rest period
    if (parsed.restPeriod !== undefined) {
      if (parsed.restPeriod < 0) {
        issues.push('Rest period cannot be negative');
      } else if (parsed.restPeriod > 600) { // > 10 minutes
        warnings.push('Rest period seems unusually long (>10 minutes)');
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Apply parsing suggestions to update exercise data
   */
  static applySuggestion(
    currentData: ParsedExerciseData, 
    suggestion: FieldSuggestion
  ): ParsedExerciseData {
    const updated = { ...currentData };
    
    // @ts-ignore - TypeScript being overly strict with dynamic field access
    updated[suggestion.field] = suggestion.suggestedValue;
    
    // Update confidence based on applied suggestion
    const newConfidence = Math.min((updated.confidence || 0) + (suggestion.confidence * 0.1), 1.0);
    updated.confidence = newConfidence;

    return updated;
  }

  /**
   * Convert parsed data back to text representation for display
   */
  static formatParsedData(parsed: ParsedExerciseData): string {
    const parts: string[] = [];

    if (parsed.sets && parsed.reps) {
      if (typeof parsed.reps === 'string' && parsed.reps.includes('-')) {
        parts.push(`${parsed.sets} sets × ${parsed.reps} reps`);
      } else {
        parts.push(`${parsed.sets} sets × ${parsed.reps} reps`);
      }
    } else if (parsed.sets) {
      parts.push(`${parsed.sets} sets`);
    } else if (parsed.reps) {
      parts.push(`${parsed.reps} reps`);
    }

    if (parsed.restPeriod) {
      if (parsed.restPeriod >= 60) {
        const minutes = Math.floor(parsed.restPeriod / 60);
        const seconds = parsed.restPeriod % 60;
        if (seconds > 0) {
          parts.push(`${minutes}:${seconds.toString().padStart(2, '0')} rest`);
        } else {
          parts.push(`${minutes} min rest`);
        }
      } else {
        parts.push(`${parsed.restPeriod}s rest`);
      }
    }

    if (parsed.notes) {
      parts.push(parsed.notes);
    }

    return parts.join(', ');
  }
}

export default ExerciseDataParser; 