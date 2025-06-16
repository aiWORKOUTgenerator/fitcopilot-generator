/**
 * WorkoutDisplay Component
 * 
 * Clean, semantic workout display that replaces the over-engineered 5-format system.
 * Enhanced with user selections summary to show how WorkoutGeneratorGrid choices influenced AI generation.
 * Focuses on readability, accessibility, and performance.
 * 
 * @component
 */
import React from 'react';
import { GeneratedWorkout, WorkoutSection, Exercise } from '../../types/workout';
import { Button } from '../../../../components/ui';
import { PrinterIcon, Share2, Copy } from 'lucide-react';
import { WorkoutSelectionSummary } from '../common/WorkoutSelectionSummary';
import './WorkoutDisplay.scss';

interface WorkoutDisplayProps {
  /** The workout data to display */
  workout: GeneratedWorkout;
  /** Display variant */
  variant?: 'default' | 'compact';
  /** Optional CSS class name */
  className?: string;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Whether to show user selections summary */
  showSelections?: boolean;
  /** Callback for action button clicks */
  onAction?: (action: string, data?: any) => void;
}

/**
 * Clean, accessible workout display component with enhanced selections summary
 */
const WorkoutDisplay: React.FC<WorkoutDisplayProps> = ({
  workout,
  variant = 'default',
  className = '',
  showActions = false,
  showSelections = true,
  onAction,
}) => {
  
  const handlePrint = () => {
    window.print();
    onAction?.('print', { workout });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: workout.title,
          text: `Check out my workout: ${workout.title}`,
          url: window.location.href,
        });
        onAction?.('share', { workout, method: 'native' });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback for browsers without Web Share API
      onAction?.('share', { workout, method: 'fallback' });
    }
  };

  const handleCopy = async () => {
    const workoutText = generateWorkoutText(workout);
    try {
      await navigator.clipboard.writeText(workoutText);
      onAction?.('copy', { workout, text: workoutText });
    } catch (error) {
      console.error('Failed to copy workout text');
    }
  };

  const renderExercise = (exercise: Exercise, index: number) => {
    const isTimedExercise = 'duration' in exercise;
    const isRepsExercise = 'sets' in exercise;

    return (
      <div key={`exercise-${index}`} className="workout-display__exercise">
        <h4 className="workout-display__exercise-name">
          {exercise.name}
        </h4>
        
        <div className="workout-display__exercise-details">
          {isRepsExercise && (
            <span className="workout-display__exercise-metric">
              {exercise.sets} sets × {exercise.reps} reps
            </span>
          )}
          {isTimedExercise && (
            <span className="workout-display__exercise-metric">
              {exercise.duration}
            </span>
          )}
        </div>
        
        {exercise.description && (
          <p className="workout-display__exercise-description">
            {exercise.description}
          </p>
        )}
        
        {(exercise as any).tips && (exercise as any).tips.length > 0 && (
          <div className="workout-display__exercise-tips">
            <strong>Tips:</strong>
            <ul>
              {(exercise as any).tips.map((tip: string, tipIndex: number) => (
                <li key={tipIndex}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: WorkoutSection, index: number) => {
    return (
      <section key={`section-${index}`} className="workout-display__section">
        <header className="workout-display__section-header">
          <h3 className="workout-display__section-name">
            {section.name}
          </h3>
          {section.duration && (
            <span className="workout-display__section-duration">
              {section.duration} min
            </span>
          )}
        </header>
        
        <div className="workout-display__exercises">
          {section.exercises.map((exercise, exerciseIndex) => 
            renderExercise(exercise, exerciseIndex)
          )}
        </div>
      </section>
    );
  };



  return (
    <article 
      className={`
        workout-display 
        workout-display--${variant}
        ${className}
      `}
      role="main"
      aria-labelledby="workout-title"
    >
      <header className="workout-display__header">
        <h2 id="workout-title" className="workout-display__title">
          {workout.title}
        </h2>
        
        {workout.description && (
          <p className="workout-display__description">
            {workout.description}
          </p>
        )}
      </header>
      
      <main className="workout-display__content">
        {showSelections && (
          <div className="workout-display__selections-container">
            <div className="workout-display__selections-border">
              <h3 className="workout-display__selections-title">
                🎯 Enhanced Workout Selections Summary
              </h3>
              <p className="workout-display__selections-subtitle">
                Complete data from WorkoutGeneratorGrid and profile context
              </p>
              <WorkoutSelectionSummary 
                workout={workout}
                className="workout-display__selections"
                title=""
                subtitle=""
              />
            </div>
          </div>
        )}
        {workout.sections && workout.sections.length > 0 ? (
          workout.sections.map((section, index) => renderSection(section, index))
        ) : workout.exercises && workout.exercises.length > 0 ? (
          <section className="workout-display__section">
            <header className="workout-display__section-header">
              <h3 className="workout-display__section-name">Exercises</h3>
            </header>
            <div className="workout-display__exercises">
              {workout.exercises.map((exercise, exerciseIndex) => 
                renderExercise(exercise, exerciseIndex)
              )}
            </div>
          </section>
        ) : (
          <div className="workout-display__no-content">
            <p>No workout content available</p>
          </div>
        )}
      </main>
      
      {showActions && (
        <footer className="workout-display__actions">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrint}
            startIcon={<PrinterIcon size={16} />}
            aria-label="Print workout"
          >
            Print
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={handleShare}
            startIcon={<Share2 size={16} />}
            aria-label="Share workout"
          >
            Share
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopy}
            startIcon={<Copy size={16} />}
            aria-label="Copy workout text"
          >
            Copy
          </Button>
        </footer>
      )}
    </article>
  );
};

/**
 * Generate plain text version of workout for copying/sharing
 */
const generateWorkoutText = (workout: GeneratedWorkout): string => {
  let text = `${workout.title}\n`;
  text += '='.repeat(workout.title.length) + '\n\n';
  
  if (workout.description) {
    text += `${workout.description}\n\n`;
  }
  
  workout.sections?.forEach((section, sectionIndex) => {
    text += `${section.name}`;
    if (section.duration) {
      text += ` (${section.duration} min)`;
    }
    text += '\n' + '-'.repeat(section.name.length) + '\n';
    
    section.exercises.forEach((exercise, exerciseIndex) => {
      text += `${exerciseIndex + 1}. ${exercise.name}\n`;
      
      if ('sets' in exercise) {
        text += `   ${exercise.sets} sets × ${exercise.reps} reps\n`;
      } else if ('duration' in exercise) {
        text += `   ${exercise.duration}\n`;
      }
      
      if (exercise.description) {
        text += `   ${exercise.description}\n`;
      }
      
      text += '\n';
    });
    
    text += '\n';
  });
  
  return text;
};



export default WorkoutDisplay; 