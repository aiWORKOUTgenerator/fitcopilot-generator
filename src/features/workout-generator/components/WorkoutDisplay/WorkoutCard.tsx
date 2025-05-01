/**
 * WorkoutCard Component
 * 
 * Displays a generated workout with sections for warm-up, main workout, and cool-down.
 * Provides a clean, structured layout for viewing workout details.
 */
import React from 'react';
import './WorkoutCard.scss';
import Button from '../../../../components/ui/Button/Button';
import { PrinterIcon, Save, Share2 } from 'lucide-react';
import { GeneratedWorkout, WorkoutSection, Exercise } from '../../types/workout';

interface WorkoutCardProps {
  /** The generated workout to display */
  workout: GeneratedWorkout;
  /** Optional class name for additional styling */
  className?: string;
  /** Callback for saving the workout */
  onSave?: () => void;
  /** Callback for printing the workout */
  onPrint?: () => void;
  /** Callback for sharing the workout */
  onShare?: () => void;
  /** Indicates if the save operation is in progress */
  isSaving?: boolean;
}

/**
 * Component that displays the details of a generated workout
 */
const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  className = '',
  onSave,
  onPrint,
  onShare,
  isSaving = false,
}) => {
  /**
   * Render an exercise based on its type
   * 
   * @param exercise - The exercise to render
   * @returns The rendered exercise component
   */
  const renderExercise = (exercise: Exercise) => {
    // Check if it's a sets-based exercise (has sets and reps)
    if ('sets' in exercise) {
      return (
        <div className="workout-card__exercise">
          <h4 className="workout-card__exercise-name">{exercise.name}</h4>
          <div className="workout-card__exercise-details">
            {exercise.sets} reps
          </div>
          <p className="workout-card__exercise-description">{exercise.description}</p>
        </div>
      );
    }
    
    // It's a timed exercise
    return (
      <div className="workout-card__exercise">
        <h4 className="workout-card__exercise-name">{exercise.name}</h4>
        <div className="workout-card__exercise-details">
          {exercise.duration}
        </div>
        <p className="workout-card__exercise-description">{exercise.description}</p>
      </div>
    );
  };

  /**
   * Render a workout section
   * 
   * @param section - The section to render
   * @returns The rendered section component
   */
  const renderSection = (section: WorkoutSection) => {
    return (
      <div className="workout-card__section" key={section.name}>
        <div className="workout-card__section-header">
          <h3 className="workout-card__section-name">{section.name}</h3>
          <span className="workout-card__section-duration">
            {section.duration} min
          </span>
        </div>
        
        <div className="workout-card__exercises">
          {section.exercises.map((exercise, index) => (
            <div key={`${exercise.name}-${index}`} className="workout-card__exercise-container">
              {renderExercise(exercise)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`workout-card ${className}`}>
      <div className="workout-card__header">
        <h2 className="workout-card__title">{workout.title}</h2>
      </div>
      
      <div className="workout-card__content">
        {workout.sections.map(section => renderSection(section))}
      </div>
      
      <div className="workout-card__actions">
        {onPrint && (
          <Button 
            onClick={onPrint} 
            variant="secondary" 
            size="md"
          >
            <PrinterIcon size={18} />
            Print Workout
          </Button>
        )}
        
        {onShare && (
          <Button 
            onClick={onShare} 
            variant="secondary" 
            size="md"
          >
            <Share2 size={18} />
            Share
          </Button>
        )}
        
        {onSave && (
          <Button 
            onClick={onSave} 
            variant="gradient" 
            size="md"
            isLoading={isSaving}
          >
            <Save size={18} />
            Save Workout
          </Button>
        )}
      </div>
    </div>
  );
};

export default WorkoutCard; 