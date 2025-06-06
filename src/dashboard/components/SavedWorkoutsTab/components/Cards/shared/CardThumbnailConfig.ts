/**
 * CardThumbnail Configuration Utility
 * 
 * Provides predefined configurations for different use cases and scenarios.
 * Ensures backward compatibility and easy migration paths.
 */

export interface CardThumbnailDisplayConfig {
  fallbackMode?: 'title' | 'type' | 'description' | 'emoji' | 'auto';
  showTypeIndicator?: boolean;
  showProcessedIndicator?: boolean;
  enableTooltips?: boolean;
  maxTitleLength?: number;
  customFallbackText?: string;
}

export interface CardThumbnailErrorContext {
  workout: any;
  config: CardThumbnailDisplayConfig;
  error: any;
}

export type CardThumbnailErrorHandler = (error: string, context: CardThumbnailErrorContext) => void;

// 🚀 STORY 3.2: Predefined configuration presets
export const CARD_THUMBNAIL_PRESETS = {
  /**
   * Default modern configuration - prioritizes titles with smart fallbacks
   */
  DEFAULT: {
    fallbackMode: 'auto' as const,
    showTypeIndicator: true,
    showProcessedIndicator: true,
    enableTooltips: true,
    maxTitleLength: 100,
    customFallbackText: null
  },

  /**
   * Legacy emoji mode - maintains backward compatibility
   */
  LEGACY_EMOJI: {
    fallbackMode: 'emoji' as const,
    showTypeIndicator: false,
    showProcessedIndicator: false,
    enableTooltips: true,
    maxTitleLength: 50,
    customFallbackText: null
  },

  /**
   * Title-only mode - shows only workout titles
   */
  TITLE_ONLY: {
    fallbackMode: 'title' as const,
    showTypeIndicator: false,
    showProcessedIndicator: false,
    enableTooltips: true,
    maxTitleLength: 80,
    customFallbackText: 'Untitled Workout'
  },

  /**
   * Type-focused mode - emphasizes workout types
   */
  TYPE_FOCUSED: {
    fallbackMode: 'type' as const,
    showTypeIndicator: true,
    showProcessedIndicator: false,
    enableTooltips: true,
    maxTitleLength: 60,
    customFallbackText: null
  },

  /**
   * Minimal mode - reduces visual clutter
   */
  MINIMAL: {
    fallbackMode: 'auto' as const,
    showTypeIndicator: false,
    showProcessedIndicator: false,
    enableTooltips: false,
    maxTitleLength: 50,
    customFallbackText: null
  },

  /**
   * Debug mode - shows all indicators for development
   */
  DEBUG: {
    fallbackMode: 'auto' as const,
    showTypeIndicator: true,
    showProcessedIndicator: true,
    enableTooltips: true,
    maxTitleLength: 200,
    customFallbackText: null
  }
} as const;

// 🚀 STORY 3.2: Configuration validation and sanitization
export class CardThumbnailConfigManager {
  /**
   * Validates and sanitizes configuration options
   */
  static validateConfig(config: Partial<CardThumbnailDisplayConfig>): CardThumbnailDisplayConfig {
    const validatedConfig: CardThumbnailDisplayConfig = {
      fallbackMode: this.validateFallbackMode(config.fallbackMode),
      showTypeIndicator: this.validateBoolean(config.showTypeIndicator, true),
      showProcessedIndicator: this.validateBoolean(config.showProcessedIndicator, true),
      enableTooltips: this.validateBoolean(config.enableTooltips, true),
      maxTitleLength: this.validateMaxLength(config.maxTitleLength),
      customFallbackText: this.validateCustomFallback(config.customFallbackText)
    };

    return validatedConfig;
  }

  /**
   * Merges user config with preset defaults
   */
  static mergeWithPreset(
    preset: keyof typeof CARD_THUMBNAIL_PRESETS,
    userConfig: Partial<CardThumbnailDisplayConfig> = {}
  ): CardThumbnailDisplayConfig {
    const baseConfig = CARD_THUMBNAIL_PRESETS[preset];
    const mergedConfig = { ...baseConfig, ...userConfig };
    return this.validateConfig(mergedConfig);
  }

  /**
   * Creates a migration-safe configuration from legacy props
   */
  static createLegacyCompatibleConfig(legacyProps: {
    showEmoji?: boolean;
    showTitle?: boolean;
    enableProcessing?: boolean;
  }): CardThumbnailDisplayConfig {
    if (legacyProps.showEmoji) {
      return CARD_THUMBNAIL_PRESETS.LEGACY_EMOJI;
    }
    
    if (legacyProps.showTitle === false) {
      return CARD_THUMBNAIL_PRESETS.TYPE_FOCUSED;
    }

    const config = { ...CARD_THUMBNAIL_PRESETS.DEFAULT };
    if (legacyProps.enableProcessing === false) {
      config.showProcessedIndicator = false;
    }

    return config;
  }

  // Private validation methods
  private static validateFallbackMode(mode?: string): 'title' | 'type' | 'description' | 'emoji' | 'auto' {
    const validModes = ['title', 'type', 'description', 'emoji', 'auto'];
    return validModes.includes(mode as string) ? mode as any : 'auto';
  }

  private static validateBoolean(value?: boolean, defaultValue: boolean = false): boolean {
    return typeof value === 'boolean' ? value : defaultValue;
  }

  private static validateMaxLength(length?: number): number {
    if (typeof length !== 'number' || length < 10 || length > 1000) {
      return 100; // Default safe length
    }
    return Math.floor(length);
  }

  private static validateCustomFallback(text?: string | null): string | null {
    if (typeof text === 'string' && text.trim().length > 0 && text.length <= 50) {
      return text.trim();
    }
    return null;
  }
}

// 🚀 STORY 3.2: Helper utilities for common scenarios
export const CardThumbnailUtils = {
  /**
   * Creates error handler that logs to console with context
   */
  createConsoleErrorHandler(): CardThumbnailErrorHandler {
    return (error: string, context: CardThumbnailErrorContext) => {
      console.warn(`CardThumbnail Error: ${error}`, {
        workoutId: context.workout?.id,
        workoutTitle: context.workout?.title,
        config: context.config,
        error: context.error
      });
    };
  },

  /**
   * Creates error handler that sends to analytics/monitoring
   */
  createAnalyticsErrorHandler(analyticsCallback: (event: string, data: any) => void): CardThumbnailErrorHandler {
    return (error: string, context: CardThumbnailErrorContext) => {
      analyticsCallback('card_thumbnail_error', {
        error,
        workoutId: context.workout?.id,
        workoutType: context.workout?.workoutType,
        fallbackMode: context.config.fallbackMode,
        timestamp: new Date().toISOString()
      });
    };
  },

  /**
   * Detects if a workout needs special handling
   */
  needsSpecialHandling(workout: any): boolean {
    return !workout.title || 
           workout.title.trim() === '' || 
           workout.title.toLowerCase().includes('untitled') ||
           workout.title.length > 200;
  },

  /**
   * Suggests optimal configuration based on workout data
   */
  suggestOptimalConfig(workout: any): keyof typeof CARD_THUMBNAIL_PRESETS {
    if (!workout.title || workout.title.trim() === '') {
      return workout.workoutType ? 'TYPE_FOCUSED' : 'LEGACY_EMOJI';
    }
    
    if (workout.title.length > 100) {
      return 'MINIMAL';
    }
    
    if (workout.description && workout.description.length > 0) {
      return 'DEFAULT';
    }
    
    return 'TITLE_ONLY';
  }
};

// 🚀 STORY 3.2: Type guards for runtime validation
export const CardThumbnailTypeGuards = {
  isValidWorkout(workout: any): boolean {
    return workout && 
           typeof workout === 'object' && 
           (typeof workout.id === 'string' || typeof workout.id === 'number') &&
           typeof workout.workoutType === 'string';
  },

  isValidConfig(config: any): config is CardThumbnailDisplayConfig {
    if (!config || typeof config !== 'object') return false;
    
    const { fallbackMode, showTypeIndicator, showProcessedIndicator, enableTooltips, maxTitleLength } = config;
    
    return (
      (!fallbackMode || ['title', 'type', 'description', 'emoji', 'auto'].includes(fallbackMode)) &&
      (!showTypeIndicator || typeof showTypeIndicator === 'boolean') &&
      (!showProcessedIndicator || typeof showProcessedIndicator === 'boolean') &&
      (!enableTooltips || typeof enableTooltips === 'boolean') &&
      (!maxTitleLength || (typeof maxTitleLength === 'number' && maxTitleLength > 0))
    );
  }
};

// 🚀 STORY 3.2: Default export for easy importing
export default {
  PRESETS: CARD_THUMBNAIL_PRESETS,
  ConfigManager: CardThumbnailConfigManager,
  Utils: CardThumbnailUtils,
  TypeGuards: CardThumbnailTypeGuards
}; 