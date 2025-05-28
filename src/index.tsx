/**
 * FitCopilot Workout Generator
 * 
 * Main entry point for the plugin's frontend
 */

import './styles.scss';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkoutGeneratorFeature } from './features/workout-generator/WorkoutGeneratorFeature';
import { ProfileFeature } from './features/profile';
import Dashboard from './dashboard/Dashboard';

// Import shortcodes
import './shortcodes/color-system-demo';

/**
 * Debug logging function
 */
function debugLog(message: string): void {
  console.log('[FitCopilot] ' + message);
}

// Track initialization state to prevent double initialization
let isInitialized = false;

/**
 * Initialize the application
 */
function initializeApp(): void {
  // Early return if already initialized
  if (isInitialized) {
    debugLog('Application already initialized, skipping...');
    return;
  }
  
  debugLog('Initializing FitCopilot Workout Generator...');
  
  // Find the container where our app should be mounted
  const container = document.getElementById('fitcopilot-generator-root');
  
  if (!container) {
    debugLog('Error: Mount container #fitcopilot-generator-root not found in DOM');
    return;
  }
  
  // Set initialization flag before React rendering
  isInitialized = true;
  
  debugLog('Mount container found');
  
  try {
    debugLog('Creating React root...');
    const root = createRoot(container);
    
    debugLog('Rendering dashboard component...');
    root.render(<Dashboard />);
    
    debugLog('Dashboard mounted successfully!');
  } catch (error) {
    debugLog('Error mounting React application: ' + (error instanceof Error ? error.message : String(error)));
    console.error(error);
  }
}

// Make initialize function globally available for manual initialization
(window as any).initializeApp = initializeApp;

/**
 * Initialize the application when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  debugLog('DOMContentLoaded event fired');
  // Small delay to avoid race conditions
  setTimeout(initializeApp, 10);
});

// Also try to initialize if the document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  debugLog('Document already loaded, initializing immediately...');
  // Larger delay for already-loaded documents
  setTimeout(initializeApp, 50);
} 