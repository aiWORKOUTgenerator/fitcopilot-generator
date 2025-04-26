/**
 * Workout Preview Component
 * 
 * This component provides a visual preview of workout parameters before generation.
 * It helps users understand exactly what they're requesting before committing to 
 * the full AI generation process.
 * 
 * Features:
 * - Visual representation of selected workout parameters
 * - Summary of key workout attributes (goal, difficulty, duration)
 * - Equipment list display
 * - Restrictions/limitations display
 * 
 * @example
 * // Basic usage
 * <WorkoutPreview 
 *   goal="build-muscle"
 *   difficulty="intermediate"
 *   duration={45}
 *   equipment={['dumbbells', 'bench']}
 *   restrictions="Shoulder injury, prefer no overhead movements"
 * />
 */

import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../../../components/ui';
import { WorkoutDifficulty } from '../../types/workout';
import './WorkoutPreview.scss';

// Map of goal values to human-readable labels
const GOAL_LABELS: Record<string, string> = {
  'lose-weight': 'Lose Weight',
  'build-muscle': 'Build Muscle',
  'improve-endurance': 'Improve Endurance',
  'increase-strength': 'Increase Strength',
  'enhance-flexibility': 'Enhance Flexibility',
  'general-fitness': 'General Fitness',
  'sport-specific': 'Sport-Specific Training'
};

// Map of difficulty values to human-readable labels
const DIFFICULTY_LABELS: Record<string, string> = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced'
};

// Map of equipment IDs to human-readable labels
const EQUIPMENT_LABELS: Record<string, string> = {
  'dumbbells': 'Dumbbells',
  'kettlebells': 'Kettlebells',
  'resistance-bands': 'Resistance Bands',
  'pull-up-bar': 'Pull-up Bar',
  'yoga-mat': 'Yoga Mat',
  'bench': 'Bench',
  'barbell': 'Barbell',
  'trx': 'TRX/Suspension Trainer',
  'medicine-ball': 'Medicine Ball',
  'jump-rope': 'Jump Rope',
  'stability-ball': 'Stability Ball',
  'none': 'None/Bodyweight Only'
};

// Optional exercise interface for displaying workout exercises
interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

interface WorkoutPreviewProps {
  /** The selected workout goal */
  goal: string;
  
  /** User's experience level */
  difficulty: WorkoutDifficulty;
  
  /** Workout duration in minutes */
  duration: number;
  
  /** Selected equipment IDs */
  equipment?: string[];
  
  /** Physical restrictions or preferences */
  restrictions?: string;

  /** Optional title for the workout */
  title?: string;
  
  /** Optional description for the workout */
  description?: string;
  
  /** Optional list of exercises */
  exercises?: Exercise[];
  
  /** Optional callback for saving the workout */
  onSave?: () => void;
  
  /** Optional callback for regenerating the workout */
  onRegenerate?: () => void;
}

/**
 * Displays a visual preview of workout parameters before generation
 * 
 * This component summarizes the user's selected workout parameters
 * in a readable format, helping users confirm their choices before
 * generating a full workout.
 * 
 * @param {WorkoutPreviewProps} props - Component properties
 * @returns {JSX.Element} Rendered workout preview
 */
export const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({
  goal,
  difficulty,
  duration,
  equipment = [],
  restrictions = '',
  title,
  description,
  exercises = [],
  onSave,
  onRegenerate
}) => {
  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  
  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get human-readable labels
  const goalLabel = GOAL_LABELS[goal] || goal;
  const difficultyLabel = DIFFICULTY_LABELS[difficulty] || difficulty;
  
  // Format equipment list
  const equipmentList = equipment.map(id => EQUIPMENT_LABELS[id] || id);
  const hasEquipment = equipmentList.length > 0 && !equipmentList.includes('None/Bodyweight Only');
  
  // Determine if this is a parameter preview or a full workout preview
  const isFullWorkout = Boolean(title && exercises.length > 0);

  return (
    <div className={`workout-preview ${isVisible ? 'visible' : ''}`}>
      <Card>
        {isFullWorkout ? (
          // Full workout preview (with exercises)
          <>
            <h2>{title}</h2>
            {description && <p className="workout-description">{description}</p>}
            
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
          </>
        ) : (
          // Parameter preview (before generation)
          <>
            <h3 className="preview-title">Workout Preview</h3>
            
            <div className="parameter-grid">
              <div className="parameter-item">
                <div className="parameter-label">Goal</div>
                <div className="parameter-value">{goalLabel}</div>
              </div>
              
              <div className="parameter-item">
                <div className="parameter-label">Level</div>
                <div className="parameter-value">{difficultyLabel}</div>
              </div>
              
              <div className="parameter-item">
                <div className="parameter-label">Duration</div>
                <div className="parameter-value">{duration} min</div>
              </div>
            </div>
            
            {hasEquipment && (
              <div className="preview-section">
                <h4>Equipment</h4>
                <div className="equipment-tags">
                  {equipmentList.map((item, index) => (
                    <span key={index} className="equipment-tag">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {restrictions && (
              <div className="preview-section">
                <h4>Restrictions/Preferences</h4>
                <p className="restrictions-text">{restrictions}</p>
              </div>
            )}
          </>
        )}
        
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