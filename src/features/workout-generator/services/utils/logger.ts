/**
 * Configurable Logger Utility
 * 
 * Provides configurable logging with different levels and environment-based controls.
 * Replaces excessive console.log statements throughout the codebase.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  prefix: string;
  includeTimestamp: boolean;
  includeStackTrace: boolean;
}

class Logger {
  private config: LoggerConfig = {
    level: 'info',
    enabled: process.env.NODE_ENV === 'development',
    prefix: '[WorkoutService]',
    includeTimestamp: true,
    includeStackTrace: false
  };

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  /**
   * Configure logger settings
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if logging is enabled for the given level
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return this.levels[level] >= this.levels[this.config.level];
  }

  /**
   * Format log message with prefix and timestamp
   */
  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];
    
    if (this.config.includeTimestamp) {
      parts.push(new Date().toISOString());
    }
    
    parts.push(this.config.prefix);
    parts.push(`[${level.toUpperCase()}]`);
    parts.push(message);
    
    return parts.join(' ');
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    
    const formattedMessage = this.formatMessage('debug', message);
    
    if (data !== undefined) {
      console.debug(formattedMessage, data);
    } else {
      console.debug(formattedMessage);
    }
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;
    
    const formattedMessage = this.formatMessage('info', message);
    
    if (data !== undefined) {
      console.info(formattedMessage, data);
    } else {
      console.info(formattedMessage);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;
    
    const formattedMessage = this.formatMessage('warn', message);
    
    if (data !== undefined) {
      console.warn(formattedMessage, data);
    } else {
      console.warn(formattedMessage);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: any): void {
    if (!this.shouldLog('error')) return;
    
    const formattedMessage = this.formatMessage('error', message);
    
    if (error !== undefined) {
      if (error instanceof Error) {
        console.error(formattedMessage, {
          message: error.message,
          stack: this.config.includeStackTrace ? error.stack : undefined
        });
      } else {
        console.error(formattedMessage, error);
      }
    } else {
      console.error(formattedMessage);
    }
  }

  /**
   * Create a scoped logger with custom prefix
   */
  scope(prefix: string): Logger {
    const scopedLogger = new Logger();
    scopedLogger.configure({
      ...this.config,
      prefix: `${this.config.prefix}:${prefix}`
    });
    return scopedLogger;
  }

  /**
   * Temporarily enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Set logging level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }
}

// Create default logger instance
export const logger = new Logger();

// Configure based on environment
if (typeof window !== 'undefined' && window.location?.search?.includes('debug=true')) {
  logger.configure({ 
    level: 'debug', 
    enabled: true,
    includeStackTrace: true 
  });
}

// Export logger class for custom instances
export { Logger }; 