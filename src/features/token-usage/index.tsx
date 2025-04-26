import React from 'react';
import { render } from 'react-dom';
import TokenUsage from './TokenUsage';

// Define global namespace for our app
declare global {
  interface Window {
    fitCopilotTokenUsage?: {
      initTokenUsage: (elementId: string) => void;
      version: string;
    };
    fitcopilotTokenUsage?: any; // For the localized data from PHP
  }
}

// Version of the token usage module
const VERSION = '1.0.0';

/**
 * Initialize the Token Usage component
 * 
 * This function will render the Token Usage component into the provided DOM element.
 */
export const initTokenUsage = (elementId: string): void => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.error('Token Usage initialization failed: Not in browser environment');
    return;
  }

  // Log app startup
  console.info(`FitCopilot Token Usage v${VERSION} initializing...`);
  
  // Find container element
  const containerElement = document.getElementById(elementId);
  
  if (!containerElement) {
    console.error(`Element with ID "${elementId}" not found. Cannot initialize Token Usage.`);
    return;
  }
  
  // Log environment info for debugging
  console.info(`React version: ${React.version}`);
  console.info(`Container element: ${elementId}`);
  console.info(`User agent: ${navigator.userAgent}`);
  
  // Add diagnostic data attributes
  containerElement.dataset.tokenUsageVersion = VERSION;
  containerElement.dataset.initialized = new Date().toISOString();
  
  try {
    // Render the component
    render(<TokenUsage />, containerElement);
    console.info('✅ Token Usage React component rendered successfully');
    
    // Dispatch success event for external integrations
    const successEvent = new CustomEvent('fitcopilot:token-usage-ready', {
      detail: { version: VERSION, elementId }
    });
    window.dispatchEvent(successEvent);
  } catch (error) {
    console.error('Error rendering Token Usage component:', error);
    
    // Create fallback content on error
    containerElement.innerHTML = `
      <div class="token-usage-error">
        <h2>Token Usage Tracker</h2>
        <p>There was an error loading the Token Usage Tracker. Please refresh the page or contact support.</p>
        <details>
          <summary>Technical Details</summary>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
        </details>
      </div>
    `;
    
    // Dispatch error event for external monitoring
    const errorEvent = new CustomEvent('fitcopilot:token-usage-error', {
      detail: { error, version: VERSION }
    });
    window.dispatchEvent(errorEvent);
  }
};

// Make initialization function globally available
window.fitCopilotTokenUsage = {
  initTokenUsage,
  version: VERSION
};

// Auto-initialize if the container element exists
document.addEventListener('DOMContentLoaded', () => {
  console.info('DOMContentLoaded event in token-usage/index.tsx');
  const tokenUsageRoot = document.getElementById('fitcopilot-token-usage-root');
  
  if (tokenUsageRoot) {
    console.info('Found root element, initializing Token Usage');
    initTokenUsage('fitcopilot-token-usage-root');
  } else {
    // Not necessarily an error, as the element might be added later or initialized manually
    console.info('Root element #fitcopilot-token-usage-root not found in DOM');
  }
}); 