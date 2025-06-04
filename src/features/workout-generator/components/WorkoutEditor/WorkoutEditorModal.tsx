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
          <WorkoutEditorProvider initialWorkout={editorWorkout}>
            <WorkoutEditor
              onSave={onSave || (async () => { onClose(); })}
              onCancel={onCancel || onClose}
              isNewWorkout={!workout.id}
              isLoading={isSaving}
            />
          </WorkoutEditorProvider>
        </div>
      </div>,
      document.body
    );
  }

  return null;
};

/**
 * Smart wrapper component that connects simplified modal to navigation context
 * Handles all business logic and data fetching
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
    transitionToView 
  } = useNavigation();
  
  // Get workout generator context to access the generated workout
  const { state } = useWorkoutGenerator();
  const generatedWorkout = state.domain.generatedWorkout;
  
  // State for workout data and UI
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load workout data based on navigation context
  useEffect(() => {
    // Reset states when the editor closes
    if (!isEditorOpen) {
      setWorkout(null);
      setError(null);
      return;
    }
    
    // If we have a current workout ID of 'new', use the generated workout
    if (currentWorkoutId === 'new' && generatedWorkout) {
      setWorkout(generatedWorkout);
      return;
    }
    
    // If we have a workout ID but no workout data, fetch it
    if (currentWorkoutId && currentWorkoutId !== 'new') {
      const fetchWorkout = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const fetchedWorkout = await getWorkout(currentWorkoutId);
          setWorkout(fetchedWorkout);
        } catch (err) {
          console.error('Failed to load workout:', err);
          setError('Failed to load workout. Please try again.');
          closeEditor();
        } finally {
          setLoading(false);
        }
      };
      
      fetchWorkout();
    }
  }, [isEditorOpen, currentWorkoutId, generatedWorkout, closeEditor]);

  // Handle save function - the WorkoutEditor now handles saves directly
  const handleSave = async () => {
    // Since WorkoutEditor now handles saves directly, this is just a placeholder
    // The actual save logic is in WorkoutEditor.tsx
    closeEditor();
  };

  // Handle edit transition
  const handleEdit = () => {
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