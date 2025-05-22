import React, { createContext, useContext, useEffect, useState } from 'react';
import { getHashParam, HASH_PARAMS, setHashParam, removeHashParam, setupNavigationHandlers } from './routes';

// Type definitions for the navigation context state
interface NavigationState {
  // Modal state
  isEditorOpen: boolean;
  
  // Currently edited workout ID
  currentWorkoutId: string | null;
  
  // Reference to source of navigation
  referrer: 'generator' | 'library' | null;
  
  // Is the app in a mobile viewport?
  isMobileView: boolean;
  
  // User's preference for editor display mode
  editorPreference: 'modal' | 'page';
}

// Type definitions for the navigation context functions
interface NavigationActions {
  // Open the workout editor
  openEditor: (workoutId: string, options?: { referrer?: 'generator' | 'library' }) => void;
  
  // Close the workout editor
  closeEditor: () => void;
  
  // Set the user's preference for editor display
  setEditorPreference: (preference: 'modal' | 'page') => void;
}

// Combined type for the context value
type NavigationContextValue = NavigationState & NavigationActions;

// Create the context with default values
const NavigationContext = createContext<NavigationContextValue>({
  // Default state values
  isEditorOpen: false,
  currentWorkoutId: null,
  referrer: null,
  isMobileView: false,
  editorPreference: 'modal',
  
  // Default function placeholders
  openEditor: () => {},
  closeEditor: () => {},
  setEditorPreference: () => {},
});

/**
 * Navigation Provider component
 * Manages the navigation state and provides navigation functions
 */
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for the navigation context
  const [state, setState] = useState<NavigationState>({
    isEditorOpen: false,
    currentWorkoutId: null,
    referrer: null,
    isMobileView: false,
    editorPreference: 'modal',
  });
  
  // Check if there's a workout ID in the URL hash, but don't auto-open the editor
  useEffect(() => {
    // Check if the hash contains a workout ID
    const workoutId = getHashParam(HASH_PARAMS.WORKOUT_EDITOR);
    
    if (workoutId) {
      setState(prev => ({
        ...prev,
        // Don't auto-open the editor on page load
        // isEditorOpen: true,
        currentWorkoutId: workoutId,
      }));
    }
    
    // Initialize mobile view detection
    const checkMobileView = () => {
      setState(prev => ({
        ...prev,
        isMobileView: window.innerWidth < 768,
      }));
    };
    
    // Check initially and on window resize
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);
  
  // Set up navigation handlers for browser history events
  useEffect(() => {
    const cleanup = setupNavigationHandlers({
      onOpenModal: (workoutId) => {
        // Only open the modal when explicitly triggered by user action
        // not by direct URL navigation
        setState(prev => ({
          ...prev,
          isEditorOpen: true,
          currentWorkoutId: workoutId,
        }));
      },
      onCloseModal: () => {
        setState(prev => ({
          ...prev,
          isEditorOpen: false,
        }));
      },
    });
    
    return cleanup;
  }, []);
  
  // Function to open the workout editor
  const openEditor = (workoutId: string, options: { referrer?: 'generator' | 'library' } = {}) => {
    // Update the URL hash with the workout ID
    setHashParam(HASH_PARAMS.WORKOUT_EDITOR, workoutId);
    
    // Update the state
    setState(prev => ({
      ...prev,
      isEditorOpen: true,
      currentWorkoutId: workoutId,
      referrer: options.referrer || null,
    }));
  };
  
  // Function to close the workout editor
  const closeEditor = () => {
    // Remove the workout ID from the URL hash
    removeHashParam(HASH_PARAMS.WORKOUT_EDITOR);
    
    // Update the state
    setState(prev => ({
      ...prev,
      isEditorOpen: false,
      // Keep the workout ID in memory for potential re-opening
    }));
  };
  
  // Function to set the user's preference for editor display
  const setEditorPreference = (preference: 'modal' | 'page') => {
    setState(prev => ({
      ...prev,
      editorPreference: preference,
    }));
    
    // Could also persist this to localStorage or user settings
  };
  
  // Create the context value
  const contextValue: NavigationContextValue = {
    ...state,
    openEditor,
    closeEditor,
    setEditorPreference,
  };
  
  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * Hook to use the navigation context
 * @returns The navigation context value
 */
export const useNavigation = () => useContext(NavigationContext);

export default NavigationContext; 