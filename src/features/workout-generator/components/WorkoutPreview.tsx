import React from 'react';
import { Card, Button } from '../../../components/ui';
import './WorkoutPreview.scss';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

interface WorkoutPreviewProps {
  title: string;
  description: string;
  exercises: Exercise[];
  onSave?: () => void;
  onRegenerate?: () => void;
}

export const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({
  title,
  description,
  exercises,
  onSave,
  onRegenerate
}) => {
  return (
    <div className="workout-preview">
      <Card>
        <h2>{title}</h2>
        <p className="workout-description">{description}</p>
        
        <div className="exercise-list">
          <h3>Exercises</h3>
          {exercises.map((exercise, index) => (
            <div key={index} className="exercise-item">
              <div className="exercise-name">{exercise.name}</div>
              <div className="exercise-details">
                <span>{exercise.sets} sets</span>
                <span>{exercise.reps} reps</span>
                <span>{exercise.rest}s rest</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="workout-actions">
          {onRegenerate && (
            <Button onClick={onRegenerate}>
              Regenerate
            </Button>
          )}
          
          {onSave && (
            <Button onClick={onSave}>
              Save Workout
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}; 