/**
 * Step Data Utilities
 * 
 * Utility functions for processing profile data into step-based cards
 */

import { UserProfile } from '../types/profile';
import { 
  StepCardData, 
  StepDisplayData, 
  StepCompletionStatus, 
  ProfileFieldKey,
  PROFILE_STEP_MAPPING,
  FIELD_DISPLAY_CONFIG
} from '../types/step-cards';

/**
 * Calculate completion status for a specific step
 */
export function calculateStepCompletion(
  profile: UserProfile | null, 
  stepNumber: number
): StepCompletionStatus {
  const stepMetadata = PROFILE_STEP_MAPPING[stepNumber];
  
  if (!stepMetadata || !profile) {
    return {
      stepNumber,
      isComplete: false,
      completedFields: 0,
      totalFields: 0,
      completionPercentage: 0
    };
  }

  const requiredFields = stepMetadata.fields.filter(field => 
    FIELD_DISPLAY_CONFIG[field]?.isRequired
  );
  
  const completedFields = requiredFields.filter(field => {
    const value = profile[field];
    
    // Handle different field types
    if (Array.isArray(value)) {
      // Special case for limitations: 'none' is a valid completion
      if (field === 'limitations') {
        return value.length > 0; // Having any value (including 'none') means it's complete
      }
      // For availableEquipment: 'none' is a valid completion (bodyweight workouts)
      if (field === 'availableEquipment') {
        return value.length > 0; // Having any value (including 'none') means it's complete
      }
      // For other arrays like goals: should have actual values, not 'none'
      return value.length > 0 && !value.includes('none');
    }
    
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    
    if (typeof value === 'number') {
      return value > 0;
    }
    
    return value != null;
  }).length;

  const totalFields = requiredFields.length;
  const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  
  return {
    stepNumber,
    isComplete: completionPercentage === 100,
    completedFields,
    totalFields,
    completionPercentage
  };
}

/**
 * Generate display data for a step's fields
 */
export function generateStepDisplayData(
  profile: UserProfile | null, 
  stepNumber: number
): StepDisplayData[] {
  const stepMetadata = PROFILE_STEP_MAPPING[stepNumber];
  
  if (!stepMetadata || !profile) {
    return [];
  }

  return stepMetadata.fields.map(field => {
    const fieldConfig = FIELD_DISPLAY_CONFIG[field];
    const value = profile[field];
    
    let formattedValue: string;
    let isSet = false;

    if (fieldConfig.formatter) {
      formattedValue = fieldConfig.formatter(value, profile);
      isSet = formattedValue !== 'Not set' && formattedValue !== 'None';
    } else {
      if (Array.isArray(value)) {
        formattedValue = value.length > 0 ? value.join(', ') : 'Not set';
        isSet = value.length > 0;
      } else if (typeof value === 'string') {
        formattedValue = value || 'Not set';
        isSet = value?.trim() !== '';
      } else if (typeof value === 'number') {
        formattedValue = value > 0 ? value.toString() : 'Not set';
        isSet = value > 0;
      } else {
        formattedValue = value ? value.toString() : 'Not set';
        isSet = value != null;
      }
    }

    return {
      label: fieldConfig.label,
      value: formattedValue,
      fieldKey: field,
      isSet
    };
  });
}

/**
 * Generate a summary text for a step
 */
export function generateStepSummary(
  profile: UserProfile | null, 
  stepNumber: number
): string {
  const stepMetadata = PROFILE_STEP_MAPPING[stepNumber];
  const completion = calculateStepCompletion(profile, stepNumber);
  
  if (!stepMetadata || !profile) {
    return 'No data available';
  }

  if (completion.isComplete) {
    // Generate a meaningful summary based on the step content
    switch (stepNumber) {
      case 1: // Basic Info
        const level = profile.fitnessLevel?.replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
        return `${profile.firstName || 'User'} - ${level} level`;
        
      case 2: // Body Metrics
        const age = profile.age ? `${profile.age}y` : '';
        const weight = profile.weight ? `${profile.weight}${profile.weightUnit || 'kg'}` : '';
        const height = profile.height ? `${profile.height}${profile.heightUnit || 'cm'}` : '';
        const metrics = [age, weight, height].filter(Boolean);
        return metrics.length > 0 ? metrics.join(', ') : 'Metrics recorded';
        
      case 3: // Equipment
        const equipment = profile.availableEquipment;
        if (equipment?.includes('none')) {
          return 'No equipment workouts';
        }
        const location = profile.preferredLocation?.replace(/\b\w/g, l => l.toUpperCase()) || '';
        return location ? `${location} workouts` : 'Equipment configured';
        
      case 4: // Health
        const hasLimitations = profile.limitations && 
          profile.limitations.length > 0 && 
          !profile.limitations.includes('none');
        return hasLimitations ? 'Health considerations noted' : 'No limitations';
        
      case 5: // Preferences
        const goalCount = profile.goals?.length || 0;
        const frequency = profile.workoutFrequency || '';
        return `${goalCount} goal${goalCount !== 1 ? 's' : ''}, ${frequency}x/week`;
        
      default:
        return 'Complete';
    }
  } else {
    const remaining = completion.totalFields - completion.completedFields;
    return `${remaining} field${remaining !== 1 ? 's' : ''} remaining`;
  }
}

/**
 * Generate completion text for a step
 */
export function generateCompletionText(completion: StepCompletionStatus): string {
  if (completion.isComplete) {
    return 'Complete';
  }
  
  if (completion.completedFields === 0) {
    return 'Not started';
  }
  
  return `${completion.completionPercentage}% complete`;
}

/**
 * Generate step card data for a specific step
 */
export function generateStepCardData(
  profile: UserProfile | null, 
  stepNumber: number
): StepCardData {
  const stepMetadata = PROFILE_STEP_MAPPING[stepNumber];
  const completion = calculateStepCompletion(profile, stepNumber);
  const displayData = generateStepDisplayData(profile, stepNumber);
  const summary = generateStepSummary(profile, stepNumber);
  const completionText = generateCompletionText(completion);

  return {
    stepNumber,
    title: stepMetadata.title,
    description: stepMetadata.description,
    fields: stepMetadata.fields,
    isComplete: completion.isComplete,
    completionText,
    summary,
    displayData
  };
}

/**
 * Generate all step card data for a profile
 */
export function generateAllStepCardData(profile: UserProfile | null): StepCardData[] {
  return Object.keys(PROFILE_STEP_MAPPING)
    .map(Number)
    .sort()
    .map(stepNumber => generateStepCardData(profile, stepNumber));
}

/**
 * Calculate overall profile completion
 */
export function calculateOverallCompletion(profile: UserProfile | null): {
  completionPercentage: number;
  completedSteps: number;
  totalSteps: number;
  isComplete: boolean;
} {
  const totalSteps = Object.keys(PROFILE_STEP_MAPPING).length;
  
  if (!profile) {
    return {
      completionPercentage: 0,
      completedSteps: 0,
      totalSteps,
      isComplete: false
    };
  }

  const completedSteps = Object.keys(PROFILE_STEP_MAPPING)
    .map(Number)
    .filter(stepNumber => calculateStepCompletion(profile, stepNumber).isComplete)
    .length;

  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  
  return {
    completionPercentage,
    completedSteps,
    totalSteps,
    isComplete: completionPercentage === 100
  };
}

/**
 * Get the next incomplete step
 */
export function getNextIncompleteStep(profile: UserProfile | null): number | null {
  if (!profile) return 1;

  for (let stepNumber = 1; stepNumber <= Object.keys(PROFILE_STEP_MAPPING).length; stepNumber++) {
    const completion = calculateStepCompletion(profile, stepNumber);
    if (!completion.isComplete) {
      return stepNumber;
    }
  }
  
  return null; // All steps complete
} 