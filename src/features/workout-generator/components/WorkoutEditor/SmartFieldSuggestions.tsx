/**
 * Smart Field Suggestions Component
 * 
 * Displays intelligent suggestions for auto-correcting exercise field parsing issues.
 * Provides one-click fixes for common problems like "4 sets x 8 reps" in reps field.
 */
import React, { useState, useEffect } from 'react';
import { FieldSuggestion } from '../../utils/ExerciseDataParser';
import { Exercise, FieldValidationResult } from '../../utils/FieldValidator';

export interface SmartFieldSuggestionsProps {
  /**
   * The exercise being validated
   */
  exercise: Exercise;
  
  /**
   * Validation result with suggestions
   */
  validationResult: FieldValidationResult;
  
  /**
   * Callback when user applies a suggestion
   */
  onApplySuggestion: (field: string, value: any, suggestion: FieldSuggestion) => void;
  
  /**
   * Callback when user dismisses a suggestion
   */
  onDismissSuggestion: (suggestion: FieldSuggestion) => void;
  
  /**
   * Callback when user applies all suggestions at once
   */
  onApplyAllSuggestions?: (suggestions: FieldSuggestion[]) => void;
  
  /**
   * Whether to show the component (can be controlled externally)
   */
  show?: boolean;
  
  /**
   * Maximum number of suggestions to show at once
   */
  maxSuggestions?: number;
}

interface SuggestionDisplayData extends FieldSuggestion {
  id: string;
  isDismissed: boolean;
  isApplying: boolean;
}

const SmartFieldSuggestions: React.FC<SmartFieldSuggestionsProps> = ({
  exercise,
  validationResult,
  onApplySuggestion,
  onDismissSuggestion,
  onApplyAllSuggestions,
  show = true,
  maxSuggestions = 3
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionDisplayData[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert suggestions to display format
  useEffect(() => {
    const displaySuggestions = validationResult.suggestions
      .slice(0, maxSuggestions)
      .map((suggestion, index) => ({
        ...suggestion,
        id: `${exercise.id}-${suggestion.field}-${index}`,
        isDismissed: false,
        isApplying: false
      }));
    
    setSuggestions(displaySuggestions);
    
    // Auto-expand if there are high-confidence suggestions
    const hasHighConfidenceSuggestions = displaySuggestions.some(s => s.confidence > 0.8);
    setIsExpanded(hasHighConfidenceSuggestions);
  }, [validationResult.suggestions, exercise.id, maxSuggestions]);

  const handleApplySuggestion = async (suggestion: SuggestionDisplayData) => {
    console.log('✅ Apply suggestion clicked:', suggestion);
    
    // Set applying state
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, isApplying: true } : s
    ));

    try {
      console.log('📝 Calling onApplySuggestion with:', {
        field: suggestion.field,
        value: suggestion.suggestedValue,
        suggestion
      });
      
      await onApplySuggestion(suggestion.field, suggestion.suggestedValue, suggestion);
      
      console.log('✅ onApplySuggestion completed successfully');
      
      // Remove the applied suggestion
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (error) {
      console.error('❌ Error applying suggestion:', error);
      
      // Reset applying state on error
      setSuggestions(prev => prev.map(s => 
        s.id === suggestion.id ? { ...s, isApplying: false } : s
      ));
    }
  };

  const handleDismissSuggestion = (suggestion: SuggestionDisplayData) => {
    console.log('❌ Dismiss suggestion clicked:', suggestion);
    
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, isDismissed: true } : s
    ));
    
    onDismissSuggestion(suggestion);
  };

  const handleApplyAll = () => {
    const applicableSuggestions = suggestions.filter(s => !s.isDismissed && !s.isApplying);
    
    if (onApplyAllSuggestions && applicableSuggestions.length > 0) {
      onApplyAllSuggestions(applicableSuggestions);
      setSuggestions([]);
    }
  };

  const activeSuggestions = suggestions.filter(s => !s.isDismissed);
  
  if (!show || activeSuggestions.length === 0) {
    return null;
  }

  const highPrioritySuggestions = activeSuggestions.filter(s => s.confidence >= 0.8);
  const lowPrioritySuggestions = activeSuggestions.filter(s => s.confidence < 0.8);

  const getConfidenceLevel = (confidence: number): string => {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'var(--wg-color-success)';
    if (confidence >= 0.7) return 'var(--wg-color-warning)';
    return 'var(--wg-color-muted)';
  };

  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return 'empty';
    if (typeof value === 'string' && value.length > 30) {
      return `"${value.substring(0, 30)}..."`;
    }
    return `"${value}"`;
  };

  return (
    <div className="smart-field-suggestions">
      <div className="smart-field-suggestions__header">
        <button
          type="button"
          className="smart-field-suggestions__toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span className="smart-field-suggestions__icon">
            {isExpanded ? '▼' : '▶'}
          </span>
          <span className="smart-field-suggestions__title">
            Smart Suggestions ({activeSuggestions.length})
          </span>
          {highPrioritySuggestions.length > 0 && (
            <span className="smart-field-suggestions__badge smart-field-suggestions__badge--high">
              {highPrioritySuggestions.length} high confidence
            </span>
          )}
        </button>
        
        {isExpanded && activeSuggestions.length > 1 && onApplyAllSuggestions && (
          <button
            type="button"
            className="smart-field-suggestions__apply-all"
            onClick={handleApplyAll}
          >
            Apply All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="smart-field-suggestions__content">
          {/* High priority suggestions first */}
          {highPrioritySuggestions.map(suggestion => (
            <div 
              key={suggestion.id} 
              className={`smart-field-suggestions__item smart-field-suggestions__item--${getConfidenceLevel(suggestion.confidence)}`}
            >
              <div className="smart-field-suggestions__item-header">
                <span className="smart-field-suggestions__field-name">
                  {suggestion.field}
                </span>
                <div 
                  className="smart-field-suggestions__confidence"
                  style={{ backgroundColor: getConfidenceColor(suggestion.confidence) }}
                >
                  {Math.round(suggestion.confidence * 100)}%
                </div>
              </div>
              
              <div className="smart-field-suggestions__change">
                <span className="smart-field-suggestions__from">
                  {formatValue(suggestion.currentValue)}
                </span>
                <span className="smart-field-suggestions__arrow">→</span>
                <span className="smart-field-suggestions__to">
                  {formatValue(suggestion.suggestedValue)}
                </span>
              </div>
              
              <div className="smart-field-suggestions__reason">
                {suggestion.reason}
              </div>
              
              <div className="smart-field-suggestions__actions">
                <button
                  type="button"
                  className="smart-field-suggestions__action smart-field-suggestions__action--apply"
                  onClick={() => handleApplySuggestion(suggestion)}
                  disabled={suggestion.isApplying}
                >
                  {suggestion.isApplying ? 'Applying...' : 'Apply'}
                </button>
                
                <button
                  type="button"
                  className="smart-field-suggestions__action smart-field-suggestions__action--dismiss"
                  onClick={() => handleDismissSuggestion(suggestion)}
                  disabled={suggestion.isApplying}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
          
          {/* Lower priority suggestions */}
          {lowPrioritySuggestions.map(suggestion => (
            <div 
              key={suggestion.id} 
              className={`smart-field-suggestions__item smart-field-suggestions__item--${getConfidenceLevel(suggestion.confidence)}`}
            >
              <div className="smart-field-suggestions__item-header">
                <span className="smart-field-suggestions__field-name">
                  {suggestion.field}
                </span>
                <div 
                  className="smart-field-suggestions__confidence"
                  style={{ backgroundColor: getConfidenceColor(suggestion.confidence) }}
                >
                  {Math.round(suggestion.confidence * 100)}%
                </div>
              </div>
              
              <div className="smart-field-suggestions__change">
                <span className="smart-field-suggestions__from">
                  {formatValue(suggestion.currentValue)}
                </span>
                <span className="smart-field-suggestions__arrow">→</span>
                <span className="smart-field-suggestions__to">
                  {formatValue(suggestion.suggestedValue)}
                </span>
              </div>
              
              <div className="smart-field-suggestions__reason">
                {suggestion.reason}
              </div>
              
              <div className="smart-field-suggestions__actions">
                <button
                  type="button"
                  className="smart-field-suggestions__action smart-field-suggestions__action--apply"
                  onClick={() => handleApplySuggestion(suggestion)}
                  disabled={suggestion.isApplying}
                >
                  {suggestion.isApplying ? 'Applying...' : 'Apply'}
                </button>
                
                <button
                  type="button"
                  className="smart-field-suggestions__action smart-field-suggestions__action--dismiss"
                  onClick={() => handleDismissSuggestion(suggestion)}
                  disabled={suggestion.isApplying}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
          
          {activeSuggestions.length === 0 && (
            <div className="smart-field-suggestions__empty">
              All suggestions have been applied or dismissed.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartFieldSuggestions; 