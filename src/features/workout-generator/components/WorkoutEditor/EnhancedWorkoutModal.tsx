/**
 * Enhanced Workout Modal Component
 * 
 * Premium workout display modal with improved UX, better layout, and enhanced actions.
 * Features full-screen modal, print functionality, save options, sharing capabilities,
 * and smooth transition to edit mode.
 */
import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Save, Share2, Download, Edit3, Clock, Target, Dumbbell, Loader } from 'lucide-react';
import Button from '../../../../components/ui/Button/Button';
import { GeneratedWorkout, WorkoutSection, Exercise } from '../../types/workout';
import './EnhancedWorkoutModal.scss';

interface EnhancedWorkoutModalProps {
  /** The workout to display */
  workout: GeneratedWorkout;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback for saving the workout */
  onSave?: () => Promise<void>;
  /** Callback for editing the workout */
  onEdit?: () => void;
  /** Whether save operation is in progress */
  isSaving?: boolean;
  /** Post ID if this is a saved workout */
  postId?: number;
  /** Whether edit transition is in progress */
  isTransitioning?: boolean;
}

/**
 * Enhanced Workout Modal with premium UX and smooth edit transitions
 */
export const EnhancedWorkoutModal: React.FC<EnhancedWorkoutModalProps> = ({
  workout,
  isOpen,
  onClose,
  onSave,
  onEdit,
  isSaving = false,
  postId,
  isTransitioning = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
      // Reset edit loading state when modal closes
      setIsEditLoading(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isEditLoading && !isTransitioning) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isEditLoading, isTransitioning]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current && !isEditLoading && !isTransitioning) {
      onClose();
    }
  };

  // Enhanced edit handler with loading state and better UX
  const handleEdit = async () => {
    if (!onEdit || isEditLoading || isTransitioning) return;
    
    try {
      setIsEditLoading(true);
      
      // Add visual feedback with a slight delay for better UX
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Add shimmer effect to the button
      const editButton = document.querySelector('.edit-btn');
      if (editButton) {
        editButton.classList.add('loading');
      }
      
      // Call the edit callback
      onEdit();
      
      // Additional delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error('Failed to open edit modal:', error);
      // TODO: Show error toast notification
      // For now, we'll just log the error and reset the loading state
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => {
        setIsEditLoading(false);
        const editButton = document.querySelector('.edit-btn');
        if (editButton) {
          editButton.classList.remove('loading');
        }
      }, 100);
    }
  };

  // Print functionality
  const handlePrint = () => {
    const printContent = contentRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${workout.title} - Workout Plan</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .workout-header { margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .workout-title { font-size: 28px; font-weight: bold; margin: 0 0 10px 0; }
            .workout-meta { display: flex; gap: 20px; font-size: 14px; color: #666; }
            .workout-section { margin-bottom: 30px; }
            .section-header { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
            .section-name { font-size: 20px; font-weight: 600; margin: 0; }
            .section-duration { color: #666; font-size: 14px; }
            .exercise { margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px; }
            .exercise-name { font-size: 16px; font-weight: 600; margin: 0 0 8px 0; }
            .exercise-details { font-size: 14px; color: #666; margin-bottom: 8px; }
            .exercise-description { font-size: 14px; line-height: 1.5; }
            @media print {
              body { margin: 0; padding: 15px; }
              .workout-header { page-break-after: avoid; }
              .workout-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="workout-header">
            <h1 class="workout-title">${workout.title}</h1>
            <div class="workout-meta">
              <span>📅 Generated: ${new Date().toLocaleDateString()}</span>
              <span>⏱️ Duration: ${workout.sections.reduce((total, section) => total + section.duration, 0)} minutes</span>
              <span>🎯 Sections: ${workout.sections.length}</span>
            </div>
          </div>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: workout.title,
      text: `Check out this workout: ${workout.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      const workoutText = `${workout.title}\n\n${workout.sections.map(section => 
        `${section.name} (${section.duration} min)\n${section.exercises.map(exercise => 
          `• ${exercise.name}: ${'sets' in exercise ? exercise.sets : exercise.duration}`
        ).join('\n')}`
      ).join('\n\n')}`;
      
      await navigator.clipboard.writeText(workoutText);
      // TODO: Show toast notification
    }
  };

  // Download as PDF (placeholder)
  const handleDownload = () => {
    // TODO: Implement PDF generation
    console.log('Download PDF functionality to be implemented');
  };

  // Calculate workout stats
  const totalDuration = workout.sections.reduce((total, section) => total + section.duration, 0);
  const totalExercises = workout.sections.reduce((total, section) => total + section.exercises.length, 0);

  // Render exercise based on type
  const renderExercise = (exercise: Exercise, index: number) => {
    const isTimeBased = 'duration' in exercise;
    
    return (
      <div key={`${exercise.name}-${index}`} className="exercise-item">
        <div className="exercise-header">
          <h4 className="exercise-name">{exercise.name}</h4>
          <div className="exercise-details">
            {isTimeBased ? (
              <span className="exercise-duration">
                <Clock size={14} />
                {exercise.duration}
              </span>
            ) : (
              <span className="exercise-sets">
                <Dumbbell size={14} />
                {exercise.sets} reps
              </span>
            )}
          </div>
        </div>
        <p className="exercise-description">{exercise.description}</p>
      </div>
    );
  };

  // Render workout section
  const renderSection = (section: WorkoutSection, index: number) => {
    const isActive = activeSection === section.name;
    
    return (
      <div key={section.name} className={`workout-section ${isActive ? 'active' : ''}`}>
        <div 
          className="section-header"
          onClick={() => setActiveSection(isActive ? null : section.name)}
        >
          <div className="section-info">
            <h3 className="section-name">{section.name}</h3>
            <div className="section-meta">
              <span className="section-duration">
                <Clock size={16} />
                {section.duration} min
              </span>
              <span className="section-exercises">
                <Target size={16} />
                {section.exercises.length} exercises
              </span>
            </div>
          </div>
          <div className="section-toggle">
            <span className={`toggle-icon ${isActive ? 'expanded' : ''}`}>▼</span>
          </div>
        </div>
        
        <div className={`section-content ${isActive ? 'expanded' : ''}`}>
          <div className="exercises-list">
            {section.exercises.map((exercise, exerciseIndex) => 
              renderExercise(exercise, exerciseIndex)
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className={`enhanced-workout-modal ${isVisible ? 'visible' : ''} ${isTransitioning ? 'transitioning' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className="modal-content">
        {/* Modal Header */}
        <header className="modal-header">
          <div className="header-content">
            <div className="workout-info">
              <h1 className="workout-title">{workout.title}</h1>
              <div className="workout-stats">
                <span className="stat">
                  <Clock size={16} />
                  {totalDuration} min
                </span>
                <span className="stat">
                  <Target size={16} />
                  {totalExercises} exercises
                </span>
                <span className="stat">
                  <Dumbbell size={16} />
                  {workout.sections.length} sections
                </span>
              </div>
            </div>
            
            <div className="header-actions">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  disabled={isEditLoading || isTransitioning || isSaving}
                  className={`edit-btn ${isEditLoading ? 'loading' : ''} ${isTransitioning ? 'transitioning' : ''}`}
                  aria-label={
                    isEditLoading 
                      ? 'Opening editor...' 
                      : isTransitioning 
                        ? 'Transitioning to editor...'
                        : 'Edit workout'
                  }
                  aria-describedby={isEditLoading ? 'edit-loading-status' : undefined}
                >
                  {isEditLoading ? (
                    <>
                      <Loader size={16} className="spin" />
                      <span className="edit-btn__text">Opening...</span>
                      <div className="edit-btn__progress" aria-hidden="true"></div>
                    </>
                  ) : isTransitioning ? (
                    <>
                      <Loader size={16} className="spin" />
                      <span className="edit-btn__text">Loading...</span>
                    </>
                  ) : (
                    <>
                      <Edit3 size={16} />
                      <span className="edit-btn__text">Edit</span>
                    </>
                  )}
                </Button>
              )}
              
              {/* Hidden status for screen readers */}
              {isEditLoading && (
                <div 
                  id="edit-loading-status" 
                  className="sr-only" 
                  aria-live="polite"
                  aria-atomic="true"
                >
                  Opening workout editor, please wait...
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isEditLoading || isTransitioning}
                className="close-btn"
                aria-label="Close modal"
              >
                <X size={16} />
                <span className="close-btn__text">Close</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Modal Body */}
        <main className="modal-body">
          <div ref={contentRef} className="workout-content">
            {workout.sections.map((section, index) => renderSection(section, index))}
          </div>
        </main>

        {/* Modal Footer */}
        <footer className="modal-footer">
          <div className="footer-actions">
            <div className="primary-actions">
              {onSave && (
                <Button
                  variant="gradient"
                  size="md"
                  onClick={onSave}
                  isLoading={isSaving}
                  disabled={isEditLoading || isTransitioning}
                  className="save-btn"
                  aria-label={isSaving ? 'Saving workout...' : 'Save workout'}
                >
                  <Save size={18} />
                  {postId ? 'Update Workout' : 'Save Workout'}
                </Button>
              )}
            </div>
            
            <div className="secondary-actions">
              <Button
                variant="outline"
                size="md"
                onClick={handlePrint}
                disabled={isEditLoading || isTransitioning}
                className="print-btn"
                aria-label="Print workout"
              >
                <Printer size={18} />
                Print
              </Button>
              
              <Button
                variant="outline"
                size="md"
                onClick={handleShare}
                disabled={isEditLoading || isTransitioning}
                className="share-btn"
                aria-label="Share workout"
              >
                <Share2 size={18} />
                Share
              </Button>
              
              <Button
                variant="outline"
                size="md"
                onClick={handleDownload}
                disabled={isEditLoading || isTransitioning}
                className="download-btn"
                aria-label="Download as PDF"
              >
                <Download size={18} />
                PDF
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EnhancedWorkoutModal; 