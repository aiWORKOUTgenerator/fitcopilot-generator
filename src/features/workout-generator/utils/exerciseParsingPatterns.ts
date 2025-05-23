/**
 * Exercise Parsing Patterns
 * 
 * Comprehensive regex patterns for extracting structured exercise data
 * from AI-generated text descriptions.
 */

export interface ParsedExerciseData {
  sets?: number;
  reps?: string | number;
  restPeriod?: number;
  notes?: string;
  originalText?: string;
  confidence?: number;
}

export interface PatternMatch {
  pattern: RegExp;
  name: string;
  confidence: number;
  parser: (match: RegExpMatchArray) => Partial<ParsedExerciseData>;
}

/**
 * Core parsing patterns ordered by specificity and confidence
 */
export const EXERCISE_PATTERNS: PatternMatch[] = [
  // "4 sets x 8 reps per arm" - High confidence, very specific
  {
    pattern: /(\d+)\s*sets?\s*[x×]\s*(\d+(?:-\d+)?)\s*reps?(?:\s+per\s+\w+)?/i,
    name: 'SETS_X_REPS_DETAILED',
    confidence: 0.95,
    parser: (match) => ({
      sets: parseInt(match[1], 10),
      reps: match[2],
      notes: match[0].includes('per') ? match[0] : undefined
    })
  },
  
  // "3 sets of 8-12 reps" - High confidence
  {
    pattern: /(\d+)\s*sets?\s*of\s*(\d+(?:-\d+)?)\s*reps?/i,
    name: 'SETS_OF_REPS',
    confidence: 0.9,
    parser: (match) => ({
      sets: parseInt(match[1], 10),
      reps: match[2]
    })
  },
  
  // "Perform 4 rounds of 8 repetitions" - High confidence
  {
    pattern: /(?:perform\s+)?(\d+)\s*(?:rounds?|circuits?)\s*of\s*(\d+)\s*(?:repetitions?|reps?)/i,
    name: 'ROUNDS_FORMAT',
    confidence: 0.85,
    parser: (match) => ({
      sets: parseInt(match[1], 10),
      reps: parseInt(match[2], 10)
    })
  },
  
  // "3×12" or "3x12" - Medium confidence, could be ambiguous
  {
    pattern: /^(\d+)\s*[x×]\s*(\d+(?:-\d+)?)$/,
    name: 'SHORT_FORMAT',
    confidence: 0.8,
    parser: (match) => ({
      sets: parseInt(match[1], 10),
      reps: match[2]
    })
  },
  
  // "Do 4 sets, 8-12 reps each" - Medium confidence
  {
    pattern: /(?:do\s+)?(\d+)\s*sets?,\s*(\d+(?:-\d+)?)\s*reps?\s*each/i,
    name: 'SETS_COMMA_REPS',
    confidence: 0.75,
    parser: (match) => ({
      sets: parseInt(match[1], 10),
      reps: match[2]
    })
  },
  
  // "4 sets" alone - Lower confidence, only sets
  {
    pattern: /(\d+)\s*sets?(?!\s*[x×of])/i,
    name: 'SETS_ONLY',
    confidence: 0.6,
    parser: (match) => ({
      sets: parseInt(match[1], 10)
    })
  },
  
  // "8-12 reps" alone - Lower confidence, only reps
  {
    pattern: /(\d+(?:-\d+)?)\s*reps?(?!\s*per)/i,
    name: 'REPS_ONLY',
    confidence: 0.6,
    parser: (match) => ({
      reps: match[1]
    })
  }
];

/**
 * Rest period patterns
 */
export const REST_PATTERNS: PatternMatch[] = [
  // "Rest 60 seconds" or "60 second rest"
  {
    pattern: /(?:rest\s+)?(\d+)\s*(?:seconds?|secs?|s)(?:\s+rest)?/i,
    name: 'REST_SECONDS',
    confidence: 0.9,
    parser: (match) => ({
      restPeriod: parseInt(match[1], 10)
    })
  },
  
  // "1 minute rest" or "rest 1 minute"
  {
    pattern: /(?:rest\s+)?(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)(?:\s+rest)?/i,
    name: 'REST_MINUTES',
    confidence: 0.85,
    parser: (match) => ({
      restPeriod: Math.round(parseFloat(match[1]) * 60)
    })
  },
  
  // "30-60 seconds rest"
  {
    pattern: /(\d+)-(\d+)\s*(?:seconds?|secs?|s)\s*rest/i,
    name: 'REST_RANGE',
    confidence: 0.7,
    parser: (match) => ({
      restPeriod: Math.round((parseInt(match[1], 10) + parseInt(match[2], 10)) / 2)
    })
  }
];

/**
 * Exercise instruction keywords that indicate additional notes
 */
export const INSTRUCTION_KEYWORDS = [
  'per arm', 'per leg', 'per side', 'each arm', 'each leg', 'each side',
  'alternating', 'hold', 'pause', 'slow', 'controlled', 'explosive',
  'tempo', 'form', 'technique', 'focus on', 'keep', 'maintain',
  'squeeze', 'contract', 'stretch', 'full range', 'partial',
  'isometric', 'static', 'dynamic', 'pulsing', 'drop set',
  'superset', 'circuit', 'AMRAP', 'EMOM', 'tabata'
];

/**
 * Clean and normalize text for parsing
 */
export const normalizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/[""'']/g, '"') // Normalize quotes
    .replace(/–—/g, '-') // Normalize dashes
    .toLowerCase();
};

/**
 * Extract additional context/notes from text
 */
export const extractNotes = (text: string, parsedData: ParsedExerciseData): string => {
  const normalizedText = text.toLowerCase();
  const notes: string[] = [];
  
  // Check for instruction keywords
  INSTRUCTION_KEYWORDS.forEach(keyword => {
    if (normalizedText.includes(keyword)) {
      // Extract the phrase containing this keyword
      const regex = new RegExp(`[^.!?]*${keyword}[^.!?]*`, 'i');
      const match = text.match(regex);
      if (match && !notes.includes(match[0].trim())) {
        notes.push(match[0].trim());
      }
    }
  });
  
  // If we found structured data, remove it from the original text to get remaining notes
  if (parsedData.sets || parsedData.reps) {
    let remainingText = text;
    
    // Remove matched patterns
    EXERCISE_PATTERNS.forEach(pattern => {
      remainingText = remainingText.replace(pattern.pattern, '');
    });
    
    REST_PATTERNS.forEach(pattern => {
      remainingText = remainingText.replace(pattern.pattern, '');
    });
    
    remainingText = remainingText.trim().replace(/\s+/g, ' ');
    
    if (remainingText && remainingText.length > 3) {
      notes.unshift(remainingText);
    }
  }
  
  return notes.join('. ').trim();
};

export default {
  EXERCISE_PATTERNS,
  REST_PATTERNS,
  INSTRUCTION_KEYWORDS,
  normalizeText,
  extractNotes
}; 