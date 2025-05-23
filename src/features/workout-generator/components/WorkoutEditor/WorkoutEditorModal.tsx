/**
 * Workout Editor Modal
 * 
 * Accessible modal container for the workout editor with
 * proper focus management, keyboard navigation, and intelligent sizing
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GeneratedWorkout } from '../../types/workout';
import { WorkoutEditorProvider } from './WorkoutEditorContext';
import WorkoutEditor from './WorkoutEditor';
import { convertToEditorFormat } from '../../types/editor';
import { convertToGeneratedWorkout } from '../../services/workoutEditorService';
import { useNavigation } from '../../navigation/NavigationContext';
import { useDimensionObserver } from '../../../../components/ui/hooks/useContentResize';
import './workoutEditor.scss';

interface WorkoutEditorModalProps {
  /**
   * The workout to edit
   */
  workout: GeneratedWorkout;
  
  /**
   * Optional post ID if the workout is already saved
   */
  postId?: number;
  
  /**
   * Callback when the workout is saved
   */
  onSave: (workout: GeneratedWorkout) => void;
}

/**
 * Modal component for the workout editor with intelligent sizing
 */
const WorkoutEditorModal: React.FC<WorkoutEditorModalProps> = ({
  workout,
  postId,
  onSave
}) => {
  // Use navigation context for modal state management
  const { closeEditor } = useNavigation();
  
  // Convert the workout to editor format
  const editorWorkout = convertToEditorFormat(workout, postId);
  
  // Track loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Track modal content dimensions for intelligent sizing
  const [contentHeight, setContentHeight] = useState(0);
  const [modalDimensions, setModalDimensions] = useState({ width: 0, height: 0 });
  
  // Refs for modal elements
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Set up dimension observer for content
  const { observe: observeContent, disconnect: disconnectContentObserver } = useDimensionObserver(
    (dimensions) => {
      setModalDimensions(dimensions);
      
      // Calculate optimal modal height based on content and viewport
      const viewportHeight = window.innerHeight;
      const maxModalHeight = viewportHeight * 0.95; // Use 95% of viewport height max
      const minModalHeight = Math.min(400, viewportHeight * 0.5); // Minimum 400px or 50% of viewport
      
      // Determine if we need scrolling
      const optimalHeight = Math.max(minModalHeight, Math.min(dimensions.height + 100, maxModalHeight));
      setContentHeight(optimalHeight);
    },
    200 // Debounce for performance
  );
  
  // Store the previously focused element when the modal opens
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    // Focus the modal when it opens
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    return () => {
      // Restore focus when the modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, []);
  
  // Set up content observation for intelligent sizing
  useEffect(() => {
    if (modalContentRef.current) {
      observeContent(modalContentRef.current);
    }
    
    return () => {
      disconnectContentObserver();
    };
  }, [observeContent, disconnectContentObserver]);
  
  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeEditor();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeEditor]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Trap focus within the modal
  useEffect(() => {
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(focusableSelector);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // If shift+tab and focus is on first element, move to last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } 
      // If tab and focus is on last element, move to first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Handle window resize for responsive modal sizing
  useEffect(() => {
    const handleWindowResize = () => {
      if (modalContentRef.current) {
        observeContent(modalContentRef.current);
      }
    };
    
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [observeContent]);

  // Function to handle saving
  const handleSave = async (updatedWorkout: any) => {
    try {
      setIsLoading(true);
      
      // Convert from editor format back to GeneratedWorkout format
      const generatedWorkout = convertToGeneratedWorkout(updatedWorkout);
      
      // Pass to parent component for saving
      await onSave(generatedWorkout);
      
      // Close the editor modal after save
      closeEditor();
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle cancel
  const handleCancel = () => {
    closeEditor();
  };

  // Calculate modal content styles based on dimensions
  const modalContentStyle: React.CSSProperties = {
    height: contentHeight > 0 ? `${contentHeight}px` : 'auto',
    maxHeight: '95vh',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
  };

  return createPortal(
    <div 
      className="workout-editor-modal__overlay" 
      onClick={closeEditor}
      aria-modal="true"
      role="dialog"
      aria-labelledby="workout-editor-title"
    >
      <div 
        ref={modalRef}
        className="workout-editor-modal__content workout-editor-modal__content--adaptive"
        style={modalContentStyle}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1} // Make the modal container focusable but not in tab order
        aria-busy={isLoading}
      >
        <div 
          ref={modalContentRef}
          className="workout-editor-modal__inner-content"
        >
          <WorkoutEditorProvider initialWorkout={editorWorkout}>
            <WorkoutEditor
              onSave={handleSave}
              onCancel={handleCancel}
              isNewWorkout={!postId}
              isLoading={isLoading}
            />
          </WorkoutEditorProvider>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WorkoutEditorModal; 