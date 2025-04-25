import React from 'react';
import { render } from 'react-dom';
import APITracker from './APITracker';

/**
 * Initialize the API Tracker
 * 
 * This function will render the API Tracker into the provided DOM element.
 */
export const initAPITracker = (elementId: string): void => {
  const containerElement = document.getElementById(elementId);
  
  if (!containerElement) {
    console.error(`Element with ID "${elementId}" not found. Cannot initialize API Tracker.`);
    return;
  }
  
  // Log info about the environment
  console.log('Initializing API Tracker with React', React.version);
  console.log('Container element:', containerElement);
  
  try {
    // Render the component
    render(<APITracker />, containerElement);
    console.log('API Tracker React component rendered successfully');
  } catch (error) {
    console.error('Error rendering API Tracker component:', error);
  }
};

// Make initialization function globally available
// Preserve any existing properties from PHP localization
if (window.fitcopilotApiTracker) {
  (window.fitcopilotApiTracker as any).initAPITracker = initAPITracker;
} else {
  window.fitcopilotApiTracker = { nonce: '', initAPITracker } as any;
}

// Auto-initialize if the container element exists
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event in index.tsx');
  const apiTrackerRoot = document.getElementById('fitcopilot-api-tracker-root');
  
  if (apiTrackerRoot) {
    console.log('Found root element, initializing API Tracker');
    initAPITracker('fitcopilot-api-tracker-root');
  } else {
    console.error('Root element #fitcopilot-api-tracker-root not found');
  }
}); 