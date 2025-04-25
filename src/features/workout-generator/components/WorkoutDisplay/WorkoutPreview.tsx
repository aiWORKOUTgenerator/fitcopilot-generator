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
import { WorkoutDifficulty } from '../../types/workout';

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
  restrictions = ''
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
  
  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-all duration-300 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}
      aria-label="Workout preview"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-3">Workout Preview</h3>
      
      <div className="space-y-3">
        {/* Key workout parameters */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 p-2 rounded-md">
            <div className="text-xs text-gray-500 mb-1">Goal</div>
            <div className="font-medium text-blue-700">{goalLabel}</div>
          </div>
          
          <div className="bg-green-50 p-2 rounded-md">
            <div className="text-xs text-gray-500 mb-1">Level</div>
            <div className="font-medium text-green-700">{difficultyLabel}</div>
          </div>
          
          <div className="bg-purple-50 p-2 rounded-md">
            <div className="text-xs text-gray-500 mb-1">Duration</div>
            <div className="font-medium text-purple-700">{duration} min</div>
          </div>
        </div>
        
        {/* Equipment section */}
        {hasEquipment && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Equipment</h4>
            <div className="flex flex-wrap gap-1">
              {equipmentList.map((item, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Restrictions section */}
        {restrictions && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Restrictions/Preferences</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">{restrictions}</p>
          </div>
        )}
      </div>
    </div>
  );
}; 