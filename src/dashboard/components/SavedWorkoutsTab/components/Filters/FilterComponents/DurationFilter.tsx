/**
 * Duration Filter Component
 * 
 * Handles workout duration range filtering with slider interface.
 * Extracted from AdvancedWorkoutFilters as part of Week 2 Component Splitting.
 */
import React, { useCallback, useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface DurationFilterProps {
  duration: { min: number; max: number };
  maxDuration: number;
  onChange: (duration: { min: number; max: number }) => void;
  showLabel?: boolean;
}

/**
 * DurationFilter Component - Range slider for workout duration
 */
export const DurationFilter: React.FC<DurationFilterProps> = ({
  duration,
  maxDuration,
  onChange,
  showLabel = true
}) => {
  const [localMin, setLocalMin] = useState(duration.min);
  const [localMax, setLocalMax] = useState(duration.max);

  // Sync local state with props
  useEffect(() => {
    setLocalMin(duration.min);
    setLocalMax(duration.max);
  }, [duration]);

  const handleMinChange = useCallback((value: number) => {
    const newMin = Math.min(value, localMax - 5); // Ensure min is at least 5 minutes less than max
    setLocalMin(newMin);
    onChange({ min: newMin, max: localMax });
  }, [localMax, onChange]);

  const handleMaxChange = useCallback((value: number) => {
    const newMax = Math.max(value, localMin + 5); // Ensure max is at least 5 minutes more than min
    setLocalMax(newMax);
    onChange({ min: localMin, max: newMax });
  }, [localMin, onChange]);

  const handleReset = useCallback(() => {
    const resetDuration = { min: 0, max: maxDuration };
    setLocalMin(0);
    setLocalMax(maxDuration);
    onChange(resetDuration);
  }, [maxDuration, onChange]);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isFiltered = localMin > 0 || localMax < maxDuration;

  return (
    <div className="duration-filter">
      {showLabel && (
        <div className="filter-section__header">
          <h4 className="filter-section__title">
            <Clock size={16} />
            Duration
          </h4>
          {isFiltered && (
            <button
              type="button"
              className="filter-section__action"
              onClick={handleReset}
            >
              Reset
            </button>
          )}
        </div>
      )}
      
      <div className="duration-filter__controls">
        <div className="duration-filter__values">
          <span className="duration-value">
            {formatDuration(localMin)}
          </span>
          <span className="duration-separator">to</span>
          <span className="duration-value">
            {formatDuration(localMax)}
          </span>
        </div>
        
        <div className="duration-filter__sliders">
          <div className="range-slider">
            <input
              type="range"
              min="0"
              max={maxDuration}
              step="5"
              value={localMin}
              onChange={(e) => handleMinChange(parseInt(e.target.value))}
              className="range-slider__input range-slider__input--min"
            />
            <input
              type="range"
              min="0"
              max={maxDuration}
              step="5"
              value={localMax}
              onChange={(e) => handleMaxChange(parseInt(e.target.value))}
              className="range-slider__input range-slider__input--max"
            />
            <div className="range-slider__track">
              <div 
                className="range-slider__fill"
                style={{
                  left: `${(localMin / maxDuration) * 100}%`,
                  width: `${((localMax - localMin) / maxDuration) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="duration-filter__presets">
          <button
            type="button"
            className={`duration-preset ${localMin === 0 && localMax === 30 ? 'duration-preset--active' : ''}`}
            onClick={() => onChange({ min: 0, max: 30 })}
          >
            Quick (≤30min)
          </button>
          <button
            type="button"
            className={`duration-preset ${localMin === 30 && localMax === 60 ? 'duration-preset--active' : ''}`}
            onClick={() => onChange({ min: 30, max: 60 })}
          >
            Medium (30-60min)
          </button>
          <button
            type="button"
            className={`duration-preset ${localMin === 60 && localMax === maxDuration ? 'duration-preset--active' : ''}`}
            onClick={() => onChange({ min: 60, max: maxDuration })}
          >
            Long (60min+)
          </button>
        </div>
      </div>
      
      {isFiltered && (
        <div className="duration-filter__summary">
          <span className="filter-summary">
            Showing workouts from {formatDuration(localMin)} to {formatDuration(localMax)}
          </span>
        </div>
      )}
    </div>
  );
};

export default DurationFilter; 