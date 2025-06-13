/**
 * Workout Form Validation Utilities
 * 
 * Provides validation functions and error message generation for the workout form.
 * Supports both legacy and modern form validation patterns.
 */

import { WorkoutFormParams } from '../types/workout';
import { MuscleSelectionData } from '../types/muscle-types';

/**
 * Required form fields for workout generation
 */
export const REQUIRED_FORM_FIELDS = {
  // Core workout parameters
  duration: 'Workout Duration',
  difficulty: 'Experience Level', 
  goals: 'Fitness Goal',
  
  // Optional but recommended
  intensity: 'Intensity Level',
  equipment: 'Equipment',
  
  // Session-specific (optional)
  restrictions: 'Health Restrictions',
  location: 'Workout Location'
} as const;

/**
 * Form field validation result
 */
export interface FormFieldValidation {
  field: keyof typeof REQUIRED_FORM_FIELDS;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Complete form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  missingRequiredFields: string[];
  fieldValidations: FormFieldValidation[];
  errorMessage: string;
}

/**
 * Validate individual form field
 */
export function validateFormField(
  field: keyof typeof REQUIRED_FORM_FIELDS, 
  value: any
): FormFieldValidation {
  const fieldName = REQUIRED_FORM_FIELDS[field];
  
  switch (field) {
    case 'duration':
      const isValidDuration = typeof value === 'number' && value > 0;
      return {
        field,
        isValid: isValidDuration,
        errorMessage: isValidDuration ? undefined : `${fieldName} must be greater than 0`
      };
      
    case 'difficulty':
      const isValidDifficulty = typeof value === 'string' && value.trim().length > 0;
      return {
        field,
        isValid: isValidDifficulty,
        errorMessage: isValidDifficulty ? undefined : `${fieldName} is required`
      };
      
    case 'goals':
      const isValidGoals = typeof value === 'string' && value.trim().length > 0;
      return {
        field,
        isValid: isValidGoals,
        errorMessage: isValidGoals ? undefined : `${fieldName} is required`
      };
      
    case 'intensity':
      const isValidIntensity = typeof value === 'number' && value >= 1 && value <= 5;
      return {
        field,
        isValid: isValidIntensity,
        errorMessage: isValidIntensity ? undefined : `${fieldName} must be between 1 and 5`
      };
      
    case 'equipment':
      const isValidEquipment = Array.isArray(value);
      return {
        field,
        isValid: isValidEquipment,
        errorMessage: isValidEquipment ? undefined : `${fieldName} must be an array`
      };
      
    default:
      return {
        field,
        isValid: true,
        errorMessage: undefined
      };
  }
}

/**
 * Get missing required fields from form data
 */
export function getMissingRequiredFields(formData: Partial<WorkoutFormParams>): string[] {
  const missingFields: string[] = [];
  
  // Check core required fields
  if (!formData.duration || formData.duration <= 0) {
    missingFields.push(REQUIRED_FORM_FIELDS.duration);
  }
  
  if (!formData.difficulty || formData.difficulty.trim().length === 0) {
    missingFields.push(REQUIRED_FORM_FIELDS.difficulty);
  }
  
  if (!formData.goals || formData.goals.trim().length === 0) {
    missingFields.push(REQUIRED_FORM_FIELDS.goals);
  }
  
  return missingFields;
}

/**
 * Generate user-friendly validation error message
 */
export function getValidationErrorMessage(missingFields: string[]): string {
  if (missingFields.length === 0) {
    return '';
  }
  
  if (missingFields.length === 1) {
    return `Please select your ${missingFields[0]} to continue.`;
  }
  
  if (missingFields.length === 2) {
    return `Please select your ${missingFields[0]} and ${missingFields[1]} to continue.`;
  }
  
  // For 3+ missing fields
  const lastField = missingFields[missingFields.length - 1];
  const otherFields = missingFields.slice(0, -1).join(', ');
  
  return `Please select your ${otherFields}, and ${lastField} to continue.`;
}

/**
 * Validate complete form with muscle selection
 */
export function validateCompleteForm(
  formData: Partial<WorkoutFormParams>,
  muscleSelection?: MuscleSelectionData,
  requireMuscleSelection: boolean = false
): FormValidationResult {
  
  // Get missing required fields
  const missingRequiredFields = getMissingRequiredFields(formData);
  
  // Validate individual fields
  const fieldValidations: FormFieldValidation[] = [];
  
  (Object.keys(REQUIRED_FORM_FIELDS) as Array<keyof typeof REQUIRED_FORM_FIELDS>).forEach(field => {
    const validation = validateFormField(field, formData[field]);
    fieldValidations.push(validation);
  });
  
  // Check muscle selection if required
  let hasMuscleSelection = true;
  if (requireMuscleSelection && muscleSelection) {
    hasMuscleSelection = muscleSelection.selectedGroups.length > 0;
    if (!hasMuscleSelection) {
      missingRequiredFields.push('Target Muscles');
    }
  }
  
  // Determine overall validity
  const isValid = missingRequiredFields.length === 0 && 
                  fieldValidations.every(v => v.isValid) && 
                  hasMuscleSelection;
  
  // Generate error message
  const errorMessage = getValidationErrorMessage(missingRequiredFields);
  
  return {
    isValid,
    missingRequiredFields,
    fieldValidations,
    errorMessage
  };
}

/**
 * Check if form has minimum required data for generation
 */
export function hasMinimumRequiredData(formData: Partial<WorkoutFormParams>): boolean {
  return !!(
    formData.duration && 
    formData.duration > 0 &&
    formData.difficulty && 
    formData.difficulty.trim().length > 0 &&
    formData.goals && 
    formData.goals.trim().length > 0
  );
}

/**
 * Calculate form completion percentage
 */
export function calculateFormCompletionPercentage(
  formData: Partial<WorkoutFormParams>,
  muscleSelection?: MuscleSelectionData
): number {
  let completed = 0;
  const total = 7;
  
  if (formData.duration && formData.duration > 0) completed++;
  if (formData.difficulty && formData.difficulty.trim().length > 0) completed++;
  if (formData.goals && formData.goals.trim().length > 0) completed++;
  if (formData.equipment && formData.equipment.length > 0) completed++;
  if (formData.intensity && formData.intensity > 0) completed++;
  if (muscleSelection && muscleSelection.selectedGroups.length > 0) completed++;
  if (formData.sessionInputs && Object.keys(formData.sessionInputs).length > 0) completed++;
  
  return Math.round((completed / total) * 100);
}

/**
 * Get form validation status for display
 */
export function getFormValidationStatus(
  formData: Partial<WorkoutFormParams>,
  muscleSelection?: MuscleSelectionData
): {
  percentage: number;
  status: 'incomplete' | 'minimum' | 'good' | 'complete';
  message: string;
  canProceed: boolean;
} {
  const percentage = calculateFormCompletionPercentage(formData, muscleSelection);
  const hasMinimum = hasMinimumRequiredData(formData);
  const hasMuscleSelection = muscleSelection ? muscleSelection.selectedGroups.length > 0 : false;
  
  if (percentage >= 90) {
    return {
      percentage,
      status: 'complete',
      message: 'Form complete! Ready to generate your workout.',
      canProceed: true
    };
  } else if (percentage >= 70) {
    return {
      percentage,
      status: 'good',
      message: 'Good progress! Add more details for a better workout.',
      canProceed: hasMinimum && hasMuscleSelection
    };
  } else if (hasMinimum && hasMuscleSelection) {
    return {
      percentage,
      status: 'minimum',
      message: 'Minimum requirements met. You can proceed or add more details.',
      canProceed: true
    };
  } else {
    return {
      percentage,
      status: 'incomplete',
      message: 'Please complete the required fields to continue.',
      canProceed: false
    };
  }
} 