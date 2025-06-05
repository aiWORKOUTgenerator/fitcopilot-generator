/**
 * Simplified Workout Editor Modal - Pure UI Component
 * 
 * This component is now a simple modal wrapper that:
 * - Receives workout data as props
 * - Handles only modal UI behavior (open/close, accessibility)
 * - Passes through save/cancel functions
 * - Has zero business logic or data fetching
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GeneratedWorkout } from '../../types/workout';
import { WorkoutEditorProvider } from './WorkoutEditorContext';
import WorkoutEditor from './WorkoutEditor';
import { convertToEditorFormat } from '../../types/editor';
import { EnhancedWorkoutModal } from './EnhancedWorkoutModal';
import { useNavigation } from '../../navigation/NavigationContext';
import { useWorkoutGenerator } from '../../context';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { getWorkout } from '../../services/workoutService';
import './workoutEditor.scss';

interface WorkoutEditorModalProps {
  // Modal state
  isOpen: boolean;
  mode: 'view' | 'edit';
  isTransitioning?: boolean;
  
  // Workout data
  workout: GeneratedWorkout | null;
  isLoading?: boolean;
  error?: string | null;
  
  // Functions
  onClose: () => void;
  onEdit?: () => void;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
  
  // Optional settings
  isSaving?: boolean;
}

/**
 * Pure UI modal wrapper for workout editing
 */
const WorkoutEditorModalUI: React.FC<WorkoutEditorModalProps> = ({
  isOpen,
  mode,
  isTransitioning = false,
  workout,
  isLoading = false,
  error = null,
  onClose,
  onEdit,
  onSave,
  onCancel,
  isSaving = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle modal visibility
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      document.body.style.overflow = '';
      
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;
    
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(focusableSelector);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Show loading state
  if (isLoading && !workout) {
    return createPortal(
      <div 
        ref={modalRef}
        className="workout-editor-modal__overlay visible"
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
        aria-labelledby="loading-title"
      >
        <div className="workout-editor-modal__content">
          <div className="workout-editor-loading">
            <div className="loading-spinner"></div>
            <span id="loading-title">Loading workout...</span>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Show error state
  if (error) {
    return createPortal(
      <div 
        ref={modalRef}
        className="workout-editor-modal__overlay visible"
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
        aria-labelledby="error-title"
      >
        <div className="workout-editor-modal__content">
          <div className="workout-editor-error">
            <h2 id="error-title">Error</h2>
            <div className="error-message">{error}</div>
            <button onClick={onClose} className="error-close-button">
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Show transition state
  if (isTransitioning) {
    return createPortal(
      <div className="modal-transition-overlay">
        <div className="transition-spinner"></div>
      </div>,
      document.body
    );
  }

  // Must have workout to proceed
  if (!workout) {
    return null;
  }

  // Convert workout for editor
  const editorWorkout = convertToEditorFormat(workout, workout.id ? Number(workout.id) : undefined);

  // Render view mode
  if (mode === 'view') {
    return createPortal(
      <EnhancedWorkoutModal
        workout={workout}
        isOpen={true}
        onClose={onClose}
        onSave={onSave || (async () => { onClose(); })}
        onEdit={onEdit || (() => {})}
        isSaving={isSaving}
        isTransitioning={isTransitioning}
        postId={workout.id ? Number(workout.id) : undefined}
      />,
      document.body
    );
  }

  // Render edit mode
  if (mode === 'edit') {
    return createPortal(
      <div 
        ref={modalRef}
        className="workout-editor-modal__overlay visible"
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
        aria-labelledby="workout-editor-title"
      >
        <div 
          className="workout-editor-modal__content workout-editor-modal__content--adaptive"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          aria-busy={isSaving}
        >


          <div className="workout-editor-modal__editor-area">
            <WorkoutEditorProvider initialWorkout={editorWorkout}>
              <WorkoutEditor
                onSave={onSave || (async () => { onClose(); })}
                onCancel={onCancel || onClose}
                isNewWorkout={!workout.id}
                isLoading={isSaving}
              />
            </WorkoutEditorProvider>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return null;
};

/**
 * Smart wrapper component that connects simplified modal to navigation context
 * Handles all business logic and data fetching with robust versioning support
 */
const WorkoutEditorModal: React.FC = () => {
  // Navigation context for modal state management
  const { 
    isEditorOpen, 
    isEditModalOpen, 
    currentWorkoutId, 
    modalMode,
    isTransitioning,
    closeEditor,
    transitionToEdit,
    transitionToView,
    updateCurrentWorkoutId
  } = useNavigation();
  
  // Get workout generator context to access the generated workout
  const { state } = useWorkoutGenerator();
  const generatedWorkout = state.domain.generatedWorkout;
  
  // 🚀 TASK 1.1.1: Inject WorkoutContext for automatic grid refresh
  const { updateWorkoutAndRefresh } = useWorkoutContext();
  
  // State for workout data and UI
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Simplified: No complex version conflict detection needed
  // The fix is simple: always fetch fresh data when user clicks Edit
  
  // UNIFIED DATA FETCHING: Always fetch latest data from server
  // This ensures user ALWAYS sees the most recent version, regardless of modal mode or previous data
  useEffect(() => {
    // Reset states when the editor closes
    if (!isEditorOpen) {
      setWorkout(null);
      setError(null);
      return;
    }
    
    // REMOVED: Since workouts are auto-saved during generation, we never have 'new' IDs
    // All generated workouts get real IDs immediately from the backend
    
    // CRITICAL FIX: ALWAYS fetch fresh data when modal opens OR when transitioning to edit
    // This handles both initial open AND edit transitions with a single data path
    if (currentWorkoutId && currentWorkoutId !== 'new') {
      const fetchLatestData = async () => {
        const isEditMode = modalMode === 'edit';
        const reason = isEditMode ? 'User clicked Edit - ensuring fresh data' : 'Modal opened - loading workout';
        
        console.log('[WorkoutEditorModal] 🔄 FETCHING LATEST DATA:', {
          id: currentWorkoutId,
          mode: modalMode,
          currentCachedVersion: workout?.version,
          title: workout?.title,
          reason: reason,
          isInitialLoad: !workout,
          isEditTransition: isEditMode && workout,
          timestamp: new Date().toISOString()
        });
        
        setLoading(true);
        setError(null);
        
        try {
          // ALWAYS fetch fresh data from server - this guarantees latest version
          const latestWorkout = await getWorkout(currentWorkoutId);
          
          console.log('[WorkoutEditorModal] ✅ LATEST DATA LOADED:', {
            id: latestWorkout.id,
            title: latestWorkout.title,
            version: latestWorkout.version,
            previousVersion: workout?.version,
            versionChanged: workout ? latestWorkout.version !== workout.version : false,
            versionDiff: workout ? `${workout.version} → ${latestWorkout.version}` : `new_load → ${latestWorkout.version}`,
            mode: modalMode,
            exerciseCount: latestWorkout.exercises?.length || 0,
            timestamp: new Date().toISOString()
          });
          
          // Update with fresh data - this ensures user sees latest version
          setWorkout(latestWorkout);
          
        } catch (error) {
          console.error('[WorkoutEditorModal] ❌ Failed to fetch latest workout data:', error);
          
          if (error instanceof Error) {
            if (error.message.includes('404')) {
              setError('Workout not found. It may have been deleted.');
              closeEditor();
            } else if (error.message.includes('403')) {
              setError('You do not have permission to edit this workout.');
              closeEditor();
            } else {
              setError('Failed to load latest workout data. Please try again.');
            }
          } else {
            setError('An unexpected error occurred. Please try again.');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchLatestData();
    }
  }, [isEditorOpen, currentWorkoutId, modalMode, generatedWorkout, closeEditor]); // Include modalMode to trigger on edit transitions

  // 🚀 TASK 1.1.2: Use WorkoutContext for automatic grid refresh
  const handleSave = async (savedWorkout?: any) => {
    try {
      console.log('[WorkoutEditorModal] 🚀 Using updateWorkoutAndRefresh for save operation:', {
        currentWorkoutId: currentWorkoutId,
        savedWorkoutId: savedWorkout?.postId || savedWorkout?.id,
        wasNewWorkout: currentWorkoutId === 'new',
        title: savedWorkout?.title
      });
      
      // CRITICAL: Update navigation context if this was a new workout
      if (currentWorkoutId === 'new' && savedWorkout?.postId) {
        console.log('[WorkoutEditorModal] 🔄 Updating navigation context: new → ' + savedWorkout.postId);
        updateCurrentWorkoutId(savedWorkout.postId.toString());
      }
      
      // 🚀 NEW: Use WorkoutContext to save and automatically refresh the grid
      // This ensures data consistency between modal and grid
      const workoutToSave = {
        id: savedWorkout?.postId || savedWorkout?.id,
        ...savedWorkout
      };
      
      console.log('[WorkoutEditorModal] 🔄 Triggering grid refresh via context...');
      await updateWorkoutAndRefresh(workoutToSave);
      
      console.log('[WorkoutEditorModal] ✅ Save and refresh completed successfully');
      
      // Close the editor after successful save and refresh
      closeEditor();
    } catch (error) {
      console.error('[WorkoutEditorModal] ❌ Save with refresh failed:', error);
      setError('Failed to save workout and refresh grid. Please try again.');
    }
  };

  // Handle edit transition with enhanced logging
  const handleEdit = () => {
    console.log('[WorkoutEditorModal] Transitioning to edit mode:', {
      workoutId: currentWorkoutId,
      currentVersion: workout?.version,
      title: workout?.title,
      timestamp: new Date().toISOString()
    });
    
    transitionToEdit();
  };

  // Determine which modal mode to show
  const isOpen = isEditorOpen || isEditModalOpen;
  const mode: 'view' | 'edit' = modalMode === 'edit' ? 'edit' : 'view';

  return (
    <WorkoutEditorModalUI
      isOpen={isOpen}
      mode={mode}
      isTransitioning={isTransitioning}
      workout={workout}
      isLoading={loading}
      error={error}
      onClose={closeEditor}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={closeEditor}
      isSaving={isSaving}
    />
  );
};

export default WorkoutEditorModal; 