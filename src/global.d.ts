/**
 * Global type definitions for WordPress
 */

interface Window {
  /** WordPress API settings */
  wpApiSettings?: {
    /** Nonce for REST API requests */
    nonce: string;
    /** Root URL of the WordPress REST API */
    root: string;
  };
  
  /** Analytics nonce */
  wgAnalyticsNonce?: string;
  
  /** Workout Generator plugin settings */
  workoutGeneratorSettings?: {
    /** Base URL of the plugin */
    baseUrl: string;
    /** Current user ID */
    userId: number;
    /** Whether the user is logged in */
    isLoggedIn: boolean;
  };

  /** Workout Generator plugin API settings */
  workoutGenerator?: {
    /** Nonce for REST API requests */
    nonce: string;
    /** Base URL of the plugin */
    baseUrl?: string;
    /** User data */
    userData?: {
      id: number;
      [key: string]: any;
    };
  };

  /** Analytics tracking function */
  trackEvent?: (eventName: string, eventProperties?: Record<string, any>) => void;
} 