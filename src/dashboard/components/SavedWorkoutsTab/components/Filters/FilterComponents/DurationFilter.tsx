/**
 * Duration Filter Component
 * 
 * Provides range slider for filtering workouts by duration.
 * Extracted from AdvancedWorkoutFilters as part of Week 2 Component Splitting.
 */
import React, { useState, useEffect } from 'react';
import { WorkoutFormatters } from '../../../utils/ui/formatters';

interface DurationFilterProps {
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  workouts: any[];
}

/**
 * DurationFilter Component - Range slider for duration filtering
 */
export const DurationFilter: React.FC<DurationFilterProps> = ({
  value,
  onChange,
  workouts
}) => {
  const [localMin, setLocalMin] = useState(value.min);
  const [localMax, setLocalMax] = useState(value.max);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate min/max from workout data
  const workoutDurations = workouts
    .map(w => typeof w.duration === 'number' ? w.duration : 0)
    .filter(d => d > 0);
  
  const dataMin = workoutDurations.length > 0 ? Math.min(...workoutDurations) : 0;
  const dataMax = workoutDurations.length > 0 ? Math.max(...workoutDurations) : 120;
  const rangeMin = Math.max(0, dataMin - 5);
  const rangeMax = Math.min(300, dataMax + 10);

  // Update local state when prop changes (external reset)
  useEffect(() => {
    if (!isDragging) {
      setLocalMin(value.min);
      setLocalMax(value.max);
    }
  }, [value, isDragging]);

  // Debounced update to parent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localMin !== value.min || localMax !== value.max) {
        onChange({ min: localMin, max: localMax });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localMin, localMax, onChange, value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value);
    if (newMin <= localMax) {
      setLocalMin(newMin);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value);
    if (newMax >= localMin) {
      setLocalMax(newMax);
    }
  };

  return (
    <div className="duration-filter">
      <label className="filter-label">Duration Range</label>
      
      <div className="range-container">
        <div className="range-values">
          <span className="range-value min">{WorkoutFormatters.formatDuration(localMin)}</span>
          <span className="range-separator">to</span>
          <span className="range-value max">{WorkoutFormatters.formatDuration(localMax)}</span>
        </div>

        <div className="range-sliders">
          <input
            type="range"
            min={rangeMin}
            max={rangeMax}
            value={localMin}
            onChange={handleMinChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className="range-slider min"
          />
          <input
            type="range"
            min={rangeMin}
            max={rangeMax}
            value={localMax}
            onChange={handleMaxChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className="range-slider max"
          />
        </div>

        <div className="range-track">
          <div 
            className="range-fill"
            style={{
              left: `${((localMin - rangeMin) / (rangeMax - rangeMin)) * 100}%`,
              width: `${((localMax - localMin) / (rangeMax - rangeMin)) * 100}%`
            }}
          />
        </div>
      </div>

      <div className="range-labels">
        <span className="range-label-min">{WorkoutFormatters.formatDuration(rangeMin)}</span>
        <span className="range-label-max">{WorkoutFormatters.formatDuration(rangeMax)}</span>
      </div>

      {/* Active filter indicator */}
      {(localMin > rangeMin || localMax < rangeMax) && (
        <div className="active-filter-indicator">
          <span className="filter-text">
            Showing workouts from {WorkoutFormatters.formatDuration(localMin)} to {WorkoutFormatters.formatDuration(localMax)}
          </span>
          <button 
            className="clear-filter-btn"
            onClick={() => {
              setLocalMin(rangeMin);
              setLocalMax(rangeMax);
            }}
            title="Reset duration filter"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default DurationFilter; 