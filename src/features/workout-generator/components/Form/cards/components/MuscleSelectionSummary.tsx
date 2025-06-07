/**
 * Muscle Selection Summary Component
 * 
 * Displays a compact summary of muscle selection with validation feedback.
 */
import React from 'react';
import { 
  MuscleSelectionSummary as MuscleSelectionSummaryType,
  MuscleSelectionValidation 
} from '../../../../types/muscle-types';
import { muscleGroupData } from '../../../../constants/muscle-data';

interface MuscleSelectionSummaryProps {
  summary: MuscleSelectionSummaryType;
  validation: MuscleSelectionValidation | null;
  showDetails?: boolean;
}

export const MuscleSelectionSummary: React.FC<MuscleSelectionSummaryProps> = ({
  summary,
  validation,
  showDetails = true
}) => {
  const hasErrors = validation?.errors && validation.errors.length > 0;
  const hasWarnings = validation?.warnings && validation.warnings.length > 0;
  const isValid = validation?.isValid !== false;

  return (
    <div className={`muscle-selection-summary ${!isValid ? 'has-errors' : hasWarnings ? 'has-warnings' : 'valid'}`}>
      {/* Main Summary Display */}
      <div className="summary-main">
        <div className="summary-status">
          <span className={`status-icon ${!isValid ? 'error' : hasWarnings ? 'warning' : 'success'}`}>
            {!isValid ? '⚠️' : hasWarnings ? '💡' : '✅'}
          </span>
          <span className="status-text">{summary.displayText}</span>
        </div>

        {/* Quick Stats */}
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Groups:</span>
            <span className="stat-value">{summary.totalGroups}</span>
          </div>
          {summary.totalMuscles > 0 && (
            <div className="stat-item">
              <span className="stat-label">Specific:</span>
              <span className="stat-value">{summary.totalMuscles}</span>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Group Summary */}
      {showDetails && summary.groupSummary.length > 0 && (
        <div className="summary-details">
          <div className="group-pills">
            {summary.groupSummary.map(({ group, muscleCount, isComplete }) => {
              const groupData = muscleGroupData[group];
              
              return (
                <div 
                  key={group}
                  className={`group-pill ${isComplete ? 'complete' : muscleCount > 0 ? 'partial' : 'group-only'}`}
                  title={
                    muscleCount === 0 
                      ? `${groupData.display} - Entire muscle group targeted`
                      : isComplete
                      ? `${groupData.display} - All ${groupData.muscles.length} muscles selected`
                      : `${groupData.display} - ${muscleCount} of ${groupData.muscles.length} muscles selected`
                  }
                >
                  <span className="pill-icon">{groupData.icon}</span>
                  <span className="pill-label">{groupData.display}</span>
                  {muscleCount > 0 && (
                    <span className="pill-count">
                      {muscleCount}
                      {isComplete && <span className="complete-indicator">✓</span>}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {(hasErrors || hasWarnings) && (
        <div className="summary-validation">
          {hasErrors && validation?.errors.map((error, index) => (
            <div key={`error-${index}`} className="validation-message error">
              <span className="message-icon">⚠️</span>
              <span className="message-text">{error}</span>
            </div>
          ))}
          {hasWarnings && validation?.warnings.map((warning, index) => (
            <div key={`warning-${index}`} className="validation-message warning">
              <span className="message-icon">💡</span>
              <span className="message-text">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Helpful Tips */}
      {summary.totalGroups === 0 && (
        <div className="summary-tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">Select 1-3 muscle groups to target your workout</span>
        </div>
      )}

      {summary.totalGroups > 0 && summary.totalMuscles === 0 && (
        <div className="summary-tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">Click on muscle group chips to select specific muscles (optional)</span>
        </div>
      )}
    </div>
  );
}; 