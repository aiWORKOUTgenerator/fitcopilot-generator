import React from 'react';
import { render } from 'react-dom';
import TokenUsage from './TokenUsage';

// Define global namespace for our app
declare global {
  interface Window {
    fitCopilotTokenUsage?: {
      initTokenUsage: (elementId: string) => void;
    };
    fitcopilotTokenUsage?: any; // For the localized data from PHP
  }
}

/**
 * Initialize the Token Usage component
 * 
 * This function will render the Token Usage component into the provided DOM element.
 */
export const initTokenUsage = (elementId: string): void => {
  const containerElement = document.getElementById(elementId);
  
  if (!containerElement) {
    console.error(`Element with ID "${elementId}" not found. Cannot initialize Token Usage.`);
    return;
  }
  
  // Log info about the environment
  console.log('Initializing Token Usage with React', React.version);
  console.log('Container element:', containerElement);
  
  try {
    // Render the component
    render(<TokenUsage />, containerElement);
    console.log('Token Usage React component rendered successfully');
  } catch (error) {
    console.error('Error rendering Token Usage component:', error);
  }
};

// Make initialization function globally available
window.fitCopilotTokenUsage = {
  initTokenUsage
};

// Auto-initialize if the container element exists
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event in token-usage/index.tsx');
  const tokenUsageRoot = document.getElementById('fitcopilot-token-usage-root');
  
  if (tokenUsageRoot) {
    console.log('Found root element, initializing Token Usage');
    initTokenUsage('fitcopilot-token-usage-root');
  } else {
    console.error('Root element #fitcopilot-token-usage-root not found');
  }
}); 