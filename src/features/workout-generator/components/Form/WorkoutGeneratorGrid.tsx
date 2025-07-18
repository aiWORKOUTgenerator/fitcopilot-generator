/**
 * Workout Generator Grid Component
 * 
 * Premium grid-based workout generator interface inspired by FitnessStats design.
 * Fully modularized architecture with 9 dedicated card components and enhanced muscle targeting integration.
 * 
 * Architectural Responsibilities:
 * - Component orchestration and layout
 * - Data flow coordination between domains
 * - State management integration
 * - User interaction handling
 */
import React, { useCallback, useMemo } from 'react';
import { useProfile } from '../../../profile/context';
import { useWorkoutGridCompletion } from '../../hooks/useWorkoutGridCompletion';
import { useWorkoutForm } from '../../hooks/useWorkoutForm';
import { 
  mapProfileToWorkoutContext, 
  isProfileSufficientForWorkout 
} from '../../utils/profileMapping';
import { 
  FormFieldCard, 
  WorkoutFocusCard, 
  IntensityCard,
  DurationCard,
  RestrictionsCard,
  LocationCard,
  StressMoodCard,
  EnergyMoodCard,
  SleepQualityCard,
  WorkoutCustomizationCard,
  MuscleGroupCard, 
  EquipmentCard 
} from './cards';
import { getValidationErrorMessage, getMissingRequiredFields } from '../../utils/validators';
import './WorkoutGeneratorGrid.scss';

interface WorkoutGeneratorGridProps {
  className?: string;
  onContinue?: () => void;
}

/**
 * Main WorkoutGeneratorGrid Component
 * 
 * Orchestrates the premium workout generator interface with proper architectural
 * separation between presentation and business logic layers.
 */
export const WorkoutGeneratorGrid: React.FC<WorkoutGeneratorGridProps> = ({ 
  className = '', 
  onContinue 
}) => {
  
  // Profile integration - using correct context structure
  const { state: profileState } = useProfile();
  const { profile: profileData, loading: profileLoading, error: profileError } = profileState;
  
  // SIMPLIFIED: Clean completion tracking (replaced 811-line over-engineered hook)
  const { 
    completionPercentage, 
    hasMuscleSelection, 
    selectionSummary,
    muscleSelection 
  } = useWorkoutGridCompletion();
  
  // Profile mapping for component props
  const profileMapping = useMemo(() => {
    if (!profileData) return null;
    return mapProfileToWorkoutContext(profileData);
  }, [profileData]);
  
  const isProfileSufficient = useMemo(() => {
    return profileData ? isProfileSufficientForWorkout(profileData) : false;
  }, [profileData]);
  
  // Access the standard workout form for validation (muscle selection is optional)
  const { validateFormWithModularSupport } = useWorkoutForm();
  
  // Form validation - using standard validation since muscle selection is optional
  const validateFormAndContinue = useCallback(() => {
    const isValid = validateFormWithModularSupport();
    
    if (isValid) {
      console.log('[WorkoutGeneratorGrid] Form validation passed, proceeding with workout generation data:');
      console.log('- Muscle Selection:', muscleSelection.selectionData);
      console.log('- Completion:', `${completionPercentage}%`);
      
      if (onContinue) {
        onContinue();
      }
    } else {
      // Get detailed validation errors for user feedback
      const { formValues } = useWorkoutForm();
      const missingFields = getMissingRequiredFields(formValues);
      const errorMessage = getValidationErrorMessage(missingFields);
      
      console.warn('[WorkoutGeneratorGrid] Form validation failed:', {
        missingFields,
        errorMessage,
        muscleSelection: hasMuscleSelection,
        formCompletion: completionPercentage
      });
      
      // Show specific validation errors to user
      if (errorMessage) {
        alert(errorMessage); // Temporary - should use proper error UI
      } else {
        alert("Please complete all required fields to continue."); // Fallback message
      }
    }
  }, [validateFormWithModularSupport, completionPercentage, onContinue]);
  
  // Handle continue button state - simplified logic
  const { formValues } = useWorkoutForm();
  const canReviewWorkout = useMemo(() => {
    // Original requirement: Only duration selection needed
    const hasDuration = formValues.sessionInputs?.timeConstraintsToday && formValues.sessionInputs.timeConstraintsToday > 0;
    return hasDuration;
  }, [formValues.sessionInputs?.timeConstraintsToday]);
  
  // Helper for enhanced button messaging
  const getButtonMessage = useCallback(() => {
    const hasDuration = formValues.sessionInputs?.timeConstraintsToday && formValues.sessionInputs.timeConstraintsToday > 0;
    
    if (!hasDuration) {
      return "Select duration to continue";
    }
    
    if (hasMuscleSelection) {
      return `Preview your workout with ${selectionSummary} (${completionPercentage}% complete)`;
    }
    
    return `Preview your workout (${completionPercentage}% complete)`;
  }, [formValues.sessionInputs?.timeConstraintsToday, hasMuscleSelection, selectionSummary, completionPercentage]);
  
  return (
    <div className={`workout-generator-container-premium ${className}`}>
      <div className="workout-generator-grid-premium">
        {/* Header */}
        <div className="grid-header">
          <div className="grid-insight">
            <span className="insight-text">
              🚀 Ready to create your perfect workout? Let's get started!
              {hasMuscleSelection && (
                <span className="muscle-status"> 🎯 {selectionSummary}</span>
              )}
            </span>
          </div>
        </div>
        
        {/* Grid Container */}
        <div className="generator-grid">
          
          {/* Workout Focus Card - Modular Component */}
          <WorkoutFocusCard delay={0} />

          {/* Workout Intensity Card - Modular Component (includes profile fitness level badge) */}
          <IntensityCard delay={100} />
          
          {/* Duration Card - Modular Component */}
          <DurationCard delay={200} />

          {/* Target Muscles Card - Enhanced Muscle Group Selector with Bridge Integration */}
          <FormFieldCard
            title="Target Muscles"
            description="Select up to 3 muscle groups to focus on"
            delay={300}
            variant="complex"
          >
            <MuscleGroupCard
              profileLoading={profileLoading}
              profileError={profileError}
              isProfileSufficient={isProfileSufficient}
              profileMapping={profileMapping}
                             onSelectionChange={() => {}} // Simplified - no sync needed
            />
          </FormFieldCard>

          {/* Equipment Card - Modular Component */}
          <EquipmentCard delay={400} />

          {/* Restrictions Card - Modular Component */}
          <RestrictionsCard delay={500} />
          
        </div>
        
        {/* Second Row: Location + Additional Cards */}
        <div className="generator-row generator-row--second">
          
          {/* Location Card - Modular Component */}
          <LocationCard delay={600} />

          {/* Stress Level Card - Modular Component */}
          <StressMoodCard delay={700} />

          {/* Energy/Motivation Level Card - Modular Component */}
          <EnergyMoodCard delay={800} />
          
        </div>
        
        {/* Third Row: 2-Column Layout */}
        <div className="generator-row generator-row--third">
          
          {/* Sleep Quality Card - Modular Component */}
          <SleepQualityCard delay={900} />

          {/* Workout Customization Card - Modular Component */}
          <WorkoutCustomizationCard delay={1000} />
          
        </div>
        
        {/* Generate Button - Enhanced with Muscle Integration */}
        <div className="generator-action">
          <div className="generate-button-card">
            <button 
              className="generate-workout-btn" 
              disabled={!canReviewWorkout}
              onClick={canReviewWorkout ? validateFormAndContinue : undefined}
            >
              <span className="btn-icon">✨</span>
              <span className="btn-text">Review Workout</span>
              <span className="btn-subtitle">
                {getButtonMessage()}
              </span>
            </button>
          </div>
        </div>
        
      </div>
      
      {/* Debug Information (Development Only) - Minimized */}
      {process.env.NODE_ENV === 'development' && (
        <details className="debug-integration-info" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
          <summary>🔧 Muscle Integration Debug</summary>
          <div style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
            <p><strong>Progress:</strong> {completionPercentage}% | <strong>Muscle Selection:</strong> {hasMuscleSelection ? 'Yes' : 'No'} | <strong>Can Continue:</strong> {canReviewWorkout ? 'Yes' : 'No'}</p>
            {hasMuscleSelection && <p><strong>Selection:</strong> {selectionSummary}</p>}
          </div>
        </details>
      )}
      
    </div>
  );
};

export default WorkoutGeneratorGrid;