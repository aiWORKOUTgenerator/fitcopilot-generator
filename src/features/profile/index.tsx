/**
 * Profile Feature Index
 * Main entry point for the profile feature
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { ProfileProvider } from './context/ProfileContext';
import ProfileFeature from './ProfileFeature';
import { profileApi } from './api/profileApi';

// Import the styles
import './styles/index.css';
import './styles/ProfileFeature.scss';

/**
 * Enhanced debug logging for profile mounting
 */
const debugLog = (message: string, data?: any) => {
  console.log(`🔧 [Profile Mount] ${message}`, data || '');
};

/**
 * Debug function to test the simplified profile API
 */
function debugSimplifiedProfileApi() {
  console.log('🔧 Testing simplified Profile API...');
  
  profileApi.getProfile()
    .then(response => {
      console.log('✅ Profile API Success:', response);
      alert(`✅ Profile Loaded!\n\nName: ${response.data?.firstName} ${response.data?.lastName}\nEmail: ${response.data?.email}\nFitness Level: ${response.data?.fitnessLevel}`);
    })
    .catch(error => {
      console.error('❌ Profile API Error:', error);
      alert(`❌ Profile API Error: ${error.message}`);
    });
}

/**
 * Check if the environment is ready for React mounting
 */
const checkMountingEnvironment = (): { ready: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (typeof window === 'undefined') {
    issues.push('Window object not available');
  }
  
  if (typeof document === 'undefined') {
    issues.push('Document object not available');
  }
  
  if (typeof React === 'undefined') {
    issues.push('React not available');
  }
  
  if (typeof ReactDOM === 'undefined') {
    issues.push('ReactDOM not available');
  }
  
  // Check for WordPress authentication
  const authData = (window as any)?.fitcopilotData;
  if (!authData) {
    issues.push('WordPress authentication data (fitcopilotData) not available');
  } else {
    if (!authData.nonce) {
      issues.push('WordPress nonce not available in fitcopilotData');
    }
    if (!authData.apiBase) {
      issues.push('API base URL not available in fitcopilotData');
    }
  }
  
  return {
    ready: issues.length === 0,
    issues
  };
};

/**
 * Mount profile component to a container with enhanced error handling
 */
const mountProfileComponent = (container: Element, retryCount = 0): boolean => {
  const maxRetries = 3;
  
  try {
    debugLog(`Mounting profile component (attempt ${retryCount + 1}/${maxRetries + 1})`, {
      container: container.tagName,
      containerId: container.id,
      containerClasses: container.className
    });
    
    // Check mounting environment
    const { ready, issues } = checkMountingEnvironment();
    if (!ready) {
      debugLog('Environment not ready for mounting:', issues);
      
      if (retryCount < maxRetries) {
        debugLog(`Retrying mount in 500ms (attempt ${retryCount + 1})`);
        setTimeout(() => mountProfileComponent(container, retryCount + 1), 500);
        return false;
      } else {
        console.error('❌ [Profile Mount] Max retries reached. Environment issues:', issues);
        
        // Show error message in container
        container.innerHTML = `
          <div style="
            background: #fef2f2; 
            border: 1px solid #ef4444; 
            border-radius: 8px; 
            padding: 1rem; 
            color: #dc2626;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          ">
            <h4 style="margin: 0 0 0.5rem 0; font-weight: 600;">Profile Component Failed to Load</h4>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">
              The profile component could not be initialized due to the following issues:
            </p>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem; font-size: 0.8rem;">
              ${issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
            <button onclick="window.location.reload()" style="
              background: #ef4444; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              padding: 0.5rem 1rem; 
              cursor: pointer; 
              font-size: 0.9rem;
              margin-top: 0.5rem;
            ">
              Refresh Page
            </button>
          </div>
        `;
        return false;
      }
    }
    
    // Attempt to mount the React component
    ReactDOM.render(
      <React.StrictMode>
        <ProfileProvider>
          <ProfileFeature />
        </ProfileProvider>
      </React.StrictMode>,
      container
    );
    
    debugLog('✅ Profile component mounted successfully');
    
    // Add a marker to indicate successful mounting
    container.setAttribute('data-profile-mounted', 'true');
    
    return true;
  } catch (error) {
    console.error('❌ [Profile Mount] Error mounting profile component:', error);
    
    if (retryCount < maxRetries) {
      debugLog(`Retrying mount after error in 1000ms (attempt ${retryCount + 1})`);
      setTimeout(() => mountProfileComponent(container, retryCount + 1), 1000);
      return false;
    } else {
      console.error('❌ [Profile Mount] Max retries reached after errors');
      
      // Show error message in container
      container.innerHTML = `
        <div style="
          background: #fef2f2; 
          border: 1px solid #ef4444; 
          border-radius: 8px; 
          padding: 1rem; 
          color: #dc2626;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
          <h4 style="margin: 0 0 0.5rem 0; font-weight: 600;">Profile Component Error</h4>
          <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">
            An error occurred while loading the profile component:
          </p>
          <pre style="
            background: #f9fafb; 
            padding: 0.5rem; 
            border-radius: 4px; 
            font-size: 0.75rem; 
            overflow: auto; 
            margin: 0.5rem 0;
          ">${error instanceof Error ? error.message : 'Unknown error'}</pre>
          <button onclick="window.location.reload()" style="
            background: #ef4444; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            padding: 0.5rem 1rem; 
            cursor: pointer; 
            font-size: 0.9rem;
            margin-top: 0.5rem;
          ">
            Refresh Page
          </button>
        </div>
      `;
      return false;
    }
  }
};

/**
 * Initialize profile components with enhanced discovery and mounting
 */
const initializeProfileComponents = () => {
  debugLog('Starting profile component initialization...');
  
  // Look for containers to mount profile components
  const profileContainers = document.querySelectorAll('[data-fitcopilot-profile]');
  
  debugLog(`Found ${profileContainers.length} profile container(s)`);
  
  if (profileContainers.length === 0) {
    debugLog('⚠️ No profile containers found. This is expected if not on the admin dashboard.');
    return;
  }
  
  // Attempt to mount components in each container
  let successfulMounts = 0;
  profileContainers.forEach((container, index) => {
    debugLog(`Processing container ${index + 1}:`, {
      element: container.tagName,
      id: container.id,
      classes: container.className,
      hasExistingContent: container.innerHTML.trim().length > 0
    });
    
    // Skip if already mounted
    if (container.hasAttribute('data-profile-mounted')) {
      debugLog(`Container ${index + 1} already has profile mounted, skipping`);
      successfulMounts++;
      return;
    }
    
    // Mount the component
    if (mountProfileComponent(container)) {
      successfulMounts++;
    }
  });
  
  debugLog(`Profile initialization complete: ${successfulMounts}/${profileContainers.length} successful mounts`);
};

/**
 * Enhanced initialization with multiple entry points
 */
const enhancedInitialization = () => {
  debugLog('Enhanced initialization starting...');
  
  // Check current document state
  const readyState = document.readyState;
  debugLog(`Document ready state: ${readyState}`);
  
  if (readyState === 'loading') {
    debugLog('Document still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initializeProfileComponents);
  } else {
    debugLog('Document already loaded, initializing immediately...');
    // Add small delay to ensure other scripts have loaded
    setTimeout(initializeProfileComponents, 100);
  }
  
  // Also listen for the load event as a backup
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      debugLog('Window load event fired, checking for unmounted containers...');
      setTimeout(initializeProfileComponents, 200);
    });
  }
};

// Global function to manually trigger initialization (for debugging)
if (typeof window !== 'undefined') {
  (window as any).initializeProfileComponents = initializeProfileComponents;
  (window as any).debugProfileMount = () => {
    const { ready, issues } = checkMountingEnvironment();
    console.log('🔧 Profile Mount Environment Check:', {
      ready,
      issues,
      containers: document.querySelectorAll('[data-fitcopilot-profile]').length,
      auth: (window as any)?.fitcopilotData
    });
  };
  
  debugLog('Debug functions available: window.initializeProfileComponents(), window.debugProfileMount()');
}

// Mount debug function to window for easy testing
(window as any).debugSimplifiedProfileApi = debugSimplifiedProfileApi;

// Start the enhanced initialization process
enhancedInitialization(); 