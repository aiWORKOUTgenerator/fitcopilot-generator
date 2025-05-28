import React, { createContext, useContext, useEffect, useState } from 'react';
import { getHashParam, HASH_PARAMS, setHashParam, removeHashParam, setupNavigationHandlers } from './routes';

// Type definitions for the enhanced navigation context state
interface NavigationState {
  // Modal states - supporting dual modal system
  isEditorOpen: boolean;        // EnhancedWorkoutModal (view mode)
  isEditModalOpen: boolean;     // WorkoutEditorModal (edit mode)
  
  // Currently edited workout ID
  currentWorkoutId: string | null;
  
  // Reference to source of navigation
  referrer: 'generator' | 'library' | null;
  
  // Is the app in a mobile viewport?
  isMobileView: boolean;
  
  // User's preference for editor display mode
  editorPreference: 'modal' | 'page';
  
  // Current modal mode for better UX management
  modalMode: 'closed' | 'view' | 'edit';
  
  // Track if we're transitioning between modals
  isTransitioning: boolean;
}

// Type definitions for the enhanced navigation context functions
interface NavigationActions {
  // Open the workout editor (view mode)
  openEditor: (workoutId: string, options?: { referrer?: 'generator' | 'library' }) => void;
  
  // Close the workout editor (both view and edit modes)
  closeEditor: () => void;
  
  // Open the edit modal (from view mode)
  openEditModal: () => void;
  
  // Close the edit modal (return to view mode)
  closeEditModal: () => void;
  
  // Transition from view to edit mode
  transitionToEdit: () => void;
  
  // Transition from edit to view mode
  transitionToView: () => void;
  
  // Set the user's preference for editor display
  setEditorPreference: (preference: 'modal' | 'page') => void;
}

// Combined type for the context value
type NavigationContextValue = NavigationState & NavigationActions;

// Create the context with default values
const NavigationContext = createContext<NavigationContextValue>({
  // Default state values
  isEditorOpen: false,
  isEditModalOpen: false,
  currentWorkoutId: null,
  referrer: null,
  isMobileView: false,
  editorPreference: 'modal',
  modalMode: 'closed',
  isTransitioning: false,
  
  // Default function placeholders
  openEditor: () => {},
  closeEditor: () => {},
  openEditModal: () => {},
  closeEditModal: () => {},
  transitionToEdit: () => {},
  transitionToView: () => {},
  setEditorPreference: () => {},
});

/**
 * Enhanced Navigation Provider component
 * Manages dual modal state and provides smooth transition functions
 */
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for the enhanced navigation context
  const [state, setState] = useState<NavigationState>({
    isEditorOpen: false,
    isEditModalOpen: false,
    currentWorkoutId: null,
    referrer: null,
    isMobileView: false,
    editorPreference: 'modal',
    modalMode: 'closed',
    isTransitioning: false,
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
          modalMode: 'view',
        }));
      },
      onCloseModal: () => {
        setState(prev => ({
          ...prev,
          isEditorOpen: false,
          isEditModalOpen: false,
          modalMode: 'closed',
          isTransitioning: false,
        }));
      },
    });
    
    return cleanup;
  }, []);
  
  // Function to open the workout editor (view mode)
  const openEditor = (workoutId: string, options: { referrer?: 'generator' | 'library' } = {}) => {
    // Update the URL hash with the workout ID
    setHashParam(HASH_PARAMS.WORKOUT_EDITOR, workoutId);
    
    // Update the state to open view modal
    setState(prev => ({
      ...prev,
      isEditorOpen: true,
      isEditModalOpen: false,
      currentWorkoutId: workoutId,
      referrer: options.referrer || null,
      modalMode: 'view',
      isTransitioning: false,
    }));
  };
  
  // Function to close the workout editor (both view and edit modes)
  const closeEditor = () => {
    // Remove the workout ID from the URL hash
    removeHashParam(HASH_PARAMS.WORKOUT_EDITOR);
    
    // Update the state to close all modals
    setState(prev => ({
      ...prev,
      isEditorOpen: false,
      isEditModalOpen: false,
      modalMode: 'closed',
      isTransitioning: false,
      // Keep the workout ID in memory for potential re-opening
    }));
  };
  
  // Function to open the edit modal (from view mode)
  const openEditModal = () => {
    setState(prev => ({
      ...prev,
      isEditModalOpen: true,
      modalMode: 'edit',
      isTransitioning: false,
    }));
  };
  
  // Function to close the edit modal (return to view mode)
  const closeEditModal = () => {
    setState(prev => ({
      ...prev,
      isEditModalOpen: false,
      modalMode: 'view',
      isTransitioning: false,
    }));
  };
  
  // Function to transition from view to edit mode with smooth animation
  const transitionToEdit = () => {
    setState(prev => ({
      ...prev,
      isTransitioning: true,
    }));
    
    // Use a small delay to ensure smooth transition
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isEditModalOpen: true,
        modalMode: 'edit',
        isTransitioning: false,
      }));
    }, 150); // Small delay for smooth transition
  };
  
  // Function to transition from edit to view mode with smooth animation
  const transitionToView = () => {
    setState(prev => ({
      ...prev,
      isTransitioning: true,
    }));
    
    // Use a small delay to ensure smooth transition
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isEditModalOpen: false,
        modalMode: 'view',
        isTransitioning: false,
      }));
    }, 150); // Small delay for smooth transition
  };
  
  // Function to set the user's preference for editor display
  const setEditorPreference = (preference: 'modal' | 'page') => {
    setState(prev => ({
      ...prev,
      editorPreference: preference,
    }));
    
    // Could also persist this to localStorage or user settings
    try {
      localStorage.setItem('workout-editor-preference', preference);
    } catch (error) {
      console.warn('Failed to save editor preference to localStorage:', error);
    }
  };
  
  // Load editor preference from localStorage on mount
  useEffect(() => {
    try {
      const savedPreference = localStorage.getItem('workout-editor-preference') as 'modal' | 'page';
      if (savedPreference && (savedPreference === 'modal' || savedPreference === 'page')) {
        setState(prev => ({
          ...prev,
          editorPreference: savedPreference,
        }));
      }
    } catch (error) {
      console.warn('Failed to load editor preference from localStorage:', error);
    }
  }, []);
  
  // Create the enhanced context value
  const contextValue: NavigationContextValue = {
    ...state,
    openEditor,
    closeEditor,
    openEditModal,
    closeEditModal,
    transitionToEdit,
    transitionToView,
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