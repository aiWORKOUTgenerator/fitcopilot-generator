/**
 * Profile Feature Index
 * Main entry point for the profile feature
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { ProfileProvider } from './context/ProfileContext';
import ProfileFeature from './ProfileFeature';

// Import the styles
import './styles/index.css';

/**
 * Initialize the Profile feature by mounting it to DOM nodes with 'data-fitcopilot-profile' attribute
 */
document.addEventListener('DOMContentLoaded', () => {
  const profileContainers = document.querySelectorAll('[data-fitcopilot-profile]');
  
  if (profileContainers.length > 0) {
    profileContainers.forEach(container => {
      ReactDOM.render(
        <React.StrictMode>
          <ProfileProvider>
            <ProfileFeature />
          </ProfileProvider>
        </React.StrictMode>,
        container
      );
    });
  }
}); 