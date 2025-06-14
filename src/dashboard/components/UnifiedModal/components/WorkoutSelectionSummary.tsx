/**
 * Workout Selection Summary Component
 * 
 * Displays the user's original form selections that influenced the workout generation.
 * This provides transparency and context for how the AI generated the specific workout.
 */
import React from 'react';
import { Target, Clock, Zap, MapPin, AlertCircle, User, Dumbbell } from 'lucide-react';
import './WorkoutSelectionSummary.scss';

interface SessionInputs {
  focusArea?: string[];
  currentSoreness?: string[];
  energyLevel?: number;
  moodLevel?: number;
  sleepQuality?: number;
  environment?: string;
  todaysFocus?: string;
  dailyIntensityLevel?: number;
  healthRestrictionsToday?: string[];
  equipmentAvailableToday?: string[];
  timeConstraintsToday?: number;
  locationToday?: string;
}

export interface WorkoutSelectionSummaryProps {
  /** Duration from the main workout parameters */
  duration?: number;
  /** Difficulty level */
  difficulty?: string;
  /** Equipment used */
  equipment?: string[];
  /** Goals/focus */
  goals?: string | string[];
  /** Session-specific inputs that influenced the workout */
  sessionInputs?: SessionInputs;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Complete workout object - EXACT same as EnhancedWorkoutModal receives */
  workoutData?: any;
}

/**
 * Format focus area for display
 */
const formatFocusArea = (focusArea: string[]): string => {
  if (!focusArea || focusArea.length === 0) return 'General fitness';
  
  const formatted = focusArea.map(area => {
    // Convert from API format to display format
    return area.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  });
  
  if (formatted.length <= 2) {
    return formatted.join(' & ');
  } else {
    return `${formatted.slice(0, 2).join(', ')} +${formatted.length - 2} more`;
  }
};

/**
 * Format energy level for display
 */
const formatEnergyLevel = (level?: number): string => {
  if (!level) return 'Not specified';
  
  const levels = {
    1: 'Very Low',
    2: 'Low', 
    3: 'Moderate',
    4: 'High',
    5: 'Very High'
  };
  
  return levels[level as keyof typeof levels] || 'Moderate';
};

/**
 * Format goals for display
 */
const formatGoals = (goals?: string | string[]): string => {
  if (!goals) return 'General fitness';
  
  if (Array.isArray(goals)) {
    return goals.join(', ');
  }
  
  // Convert from API format to display format
  const goalMap: Record<string, string> = {
    'lose-weight': 'Fat Burning & Cardio',
    'build-muscle': 'Muscle Building',
    'improve-endurance': 'Endurance & Stamina', 
    'increase-strength': 'Strength Training',
    'enhance-flexibility': 'Flexibility & Mobility',
    'general-fitness': 'General Fitness',
    'sport-specific': 'Sport-Specific Training'
  };
  
  return goalMap[goals] || goals.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Calculate workout statistics from workout data
 * EXACT COPY of EnhancedWorkoutModal calculation logic
 */
const calculateWorkoutStats = (workout?: any) => {
  if (!workout) return { totalExercises: 0, totalSections: 0 };
  
  // EXACT COPY from EnhancedWorkoutModal line 296
  const totalExercises = workout.exercises?.length || workout.sections?.reduce((total, section) => total + section.exercises.length, 0) || 0;
  const totalSections = workout.sections?.length || 0;
  
  return { totalExercises, totalSections };
};

/**
 * WorkoutSelectionSummary Component
 */
export const WorkoutSelectionSummary: React.FC<WorkoutSelectionSummaryProps> = ({
  duration,
  difficulty,
  equipment,
  goals,
  sessionInputs,
  compact = false,
  workoutData
}) => {
  // Calculate workout statistics
  const { totalExercises, totalSections } = calculateWorkoutStats(workoutData);
  
  // Don't render if no meaningful data
  const hasData = duration || difficulty || equipment?.length || goals || 
                  sessionInputs?.focusArea?.length || sessionInputs?.energyLevel ||
                  totalExercises > 0 || totalSections > 0;
  
  if (!hasData) {
    return (
      <div className="workout-selection-summary workout-selection-summary--empty">
        <p className="workout-selection-summary__empty-message">
          <Target size={16} />
          This workout was generated with default settings.
        </p>
      </div>
    );
  }

  return (
    <div className={`workout-selection-summary ${compact ? 'workout-selection-summary--compact' : ''}`}>
      <h3 className="workout-selection-summary__title">
        <Target size={18} />
        Your Workout Configuration
      </h3>
      
      <div className="workout-selection-summary__grid">
        {/* Core Workout Parameters */}
        {duration && (
          <div className="workout-selection-summary__item">
            <div className="workout-selection-summary__icon">
              <Clock size={14} />
            </div>
            <div className="workout-selection-summary__content">
              <span className="workout-selection-summary__label">Duration</span>
              <span className="workout-selection-summary__value">{duration} minutes</span>
            </div>
          </div>
        )}

        {/* Workout Statistics */}
        {totalExercises > 0 && (
          <div className="workout-selection-summary__item">
            <div className="workout-selection-summary__icon">
              <Target size={14} />
            </div>
            <div className="workout-selection-summary__content">
              <span className="workout-selection-summary__label">Exercises</span>
              <span className="workout-selection-summary__value">
                {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {totalSections > 0 && (
          <div className="workout-selection-summary__item">
            <div className="workout-selection-summary__icon">
              <Dumbbell size={14} />
            </div>
            <div className="workout-selection-summary__content">
              <span className="workout-selection-summary__label">Sections</span>
              <span className="workout-selection-summary__value">
                {totalSections} section{totalSections !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
        
        {difficulty && (
          <div className="workout-selection-summary__item">
            <div className="workout-selection-summary__icon">
              <Zap size={14} />
            </div>
            <div className="workout-selection-summary__content">
              <span className="workout-selection-summary__label">Difficulty</span>
              <span className="workout-selection-summary__value">
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
            </div>
          </div>
        )}

        {goals && (
          <div className="workout-selection-summary__item">
            <div className="workout-selection-summary__icon">
              <Target size={14} />
            </div>
            <div className="workout-selection-summary__content">
              <span className="workout-selection-summary__label">Focus</span>
              <span className="workout-selection-summary__value">{formatGoals(goals)}</span>
            </div>
          </div>
        )}

        {/* Session-Specific Data */}
        {sessionInputs?.focusArea && sessionInputs.focusArea.length > 0 && (
          <div className="workout-selection-summary__item">
            <div className="workout-selection-summary__icon">
              <Target size={14} />
            </div>
            <div className="workout-selection-summary__content">
              <span className="workout-selection-summary__label">Target Areas</span>
              <span className="workout-selection-summary__value">
                {formatFocusArea(sessionInputs.focusArea)}
              </span>
            </div>
          </div>
        )}

        {sessionInputs?.energyLevel && (
          <div className="workout-selection-summary__item">
            <div className="workout-selection-summary__icon">
              <Zap size={14} />
            </div>
            <div className="workout-selection-summary__content">
              <span className="workout-selection-summary__label">Energy Level</span>
              <span className="workout-selection-summary__value">
                {formatEnergyLevel(sessionInputs.energyLevel)}
              </span>
            </div>
          </div>
        )}

        {sessionInputs?.environment && (
          <div className="workout-selection-summary__item">
            <div className="workout-selection-summary__icon">
              <MapPin size={14} />
            </div>
            <div className="workout-selection-summary__content">
              <span className="workout-selection-summary__label">Location</span>
              <span className="workout-selection-summary__value">
                {sessionInputs.environment.charAt(0).toUpperCase() + sessionInputs.environment.slice(1)}
              </span>
            </div>
          </div>
        )}

        {equipment && equipment.length > 0 && (
          <div className="workout-selection-summary__item">
            <div className="workout-selection-summary__icon">
              <User size={14} />
            </div>
            <div className="workout-selection-summary__content">
              <span className="workout-selection-summary__label">Equipment</span>
              <span className="workout-selection-summary__value">
                {equipment.length <= 3 
                  ? equipment.join(', ')
                  : `${equipment.slice(0, 3).join(', ')} +${equipment.length - 3} more`
                }
              </span>
            </div>
          </div>
        )}

        {/* Current Soreness/Restrictions */}
        {sessionInputs?.currentSoreness && sessionInputs.currentSoreness.length > 0 && (
          <div className="workout-selection-summary__item workout-selection-summary__item--warning">
            <div className="workout-selection-summary__icon">
              <AlertCircle size={14} />
            </div>
            <div className="workout-selection-summary__content">
              <span className="workout-selection-summary__label">Avoided Areas</span>
              <span className="workout-selection-summary__value">
                {sessionInputs.currentSoreness.length <= 2
                  ? sessionInputs.currentSoreness.join(', ')
                  : `${sessionInputs.currentSoreness.slice(0, 2).join(', ')} +${sessionInputs.currentSoreness.length - 2} more`
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {compact && (
        <div className="workout-selection-summary__note">
          <p>Workout generated based on your preferences above</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutSelectionSummary; 