/**
 * DebugControls Component
 * 
 * Provides developer controls for debugging workout generation
 */
import React from 'react';
import { Button } from '../../../../components/ui';
import { useWorkoutGenerator } from '../../../workout-generator/context';
import { WorkoutActionType } from '../../../workout-generator/context/actions';

/**
 * Debug controls for workout generator feature
 * Only visible in development environments
 */
export const DebugControls: React.FC = () => {
  const { state, dispatch } = useWorkoutGenerator();
  const showLogs = state.ui?.debugMode || false;
  
  const toggleLogs = () => {
    dispatch({ 
      type: WorkoutActionType.TOGGLE_DEBUG_MODE,
      payload: !showLogs
    });
  };
  
  // Only render in development environments
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="debug-controls">
      <h4>Debug Controls</h4>
      <div className="debug-buttons">
        <Button 
          variant="secondary"
          size="small"
          onClick={toggleLogs}
        >
          {showLogs ? 'Hide Logs' : 'Show Logs'}
        </Button>
        
        <Button 
          variant="secondary" 
          size="small"
          onClick={() => {
            console.log('Current State:', state);
          }}
        >
          Log State
        </Button>
      </div>
    </div>
  );
};

export default DebugControls; 