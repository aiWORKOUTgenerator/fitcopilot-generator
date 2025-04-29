/**
 * FitCopilot Workout Generator
 * 
 * Main entry point for the plugin's frontend
 */

import './styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkoutGeneratorFeature } from './features/workout-generator/WorkoutGeneratorFeature';

/**
 * Debug logging function
 */
function debugLog(message: string): void {
  console.log('[FitCopilot] ' + message);
}

// ENHANCEMENT: Track initialization state to prevent double initialization
// This is a global flag to ensure we only initialize once
let isInitialized = false;

/**
 * Initialize the application
 */
function initializeApp(): void {
  // ENHANCEMENT: Early return if already initialized
  // This prevents multiple initializations that can cause abort conflicts
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
  
  // ENHANCEMENT: Set initialization flag before React rendering
  // This ensures we capture the initialized state even if an error occurs
  isInitialized = true;
  
  debugLog('Mount container found');
  
  try {
    debugLog('Creating React root...');
    const root = createRoot(container);
    
    debugLog('Rendering workout generator component...');
    root.render(<WorkoutGeneratorFeature />);
    
    debugLog('Workout generator mounted successfully!');
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
  // ENHANCEMENT: Small delay to avoid race conditions
  // This prevents potential initialization conflicts
  setTimeout(initializeApp, 10);
});

// Also try to initialize if the document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  debugLog('Document already loaded, initializing immediately...');
  // ENHANCEMENT: Larger delay for already-loaded documents
  // This ensures DOM is fully processed before initialization
  setTimeout(initializeApp, 50);
} 