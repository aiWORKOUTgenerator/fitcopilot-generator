/**
 * useWorkoutCustomizationSelection Hook
 * 
 * Manages workout customization text input state for the WorkoutCustomizationCard.
 * Handles textarea input, character counting, and form state integration.
 */
import { useCallback, useMemo } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';

export const useWorkoutCustomizationSelection = () => {
  const { formValues, setWorkoutCustomization } = useWorkoutForm();

  // Get current customization text from session inputs
  const customizationText = formValues.sessionInputs?.workoutCustomization || '';

  // Configuration constants
  const maxLength = 500;
  const placeholder = "e.g., Focus on upper body, avoid jumping exercises, include more stretching, use specific equipment...";

  // Calculate character count
  const characterCount = useMemo(() => {
    return customizationText.length;
  }, [customizationText]);

  // Handle customization text change
  const handleCustomizationChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    
    console.log('[useWorkoutCustomizationSelection] Customization text updated:', { 
      length: newValue.length,
      maxLength,
      preview: newValue.slice(0, 50) + (newValue.length > 50 ? '...' : '')
    });
    
    // Enforce character limit
    if (newValue.length <= maxLength) {
      setWorkoutCustomization(newValue);
    }
  }, [setWorkoutCustomization, maxLength]);

  // Alternative handler for direct string input (backward compatibility)
  const handleCustomizationStringChange = useCallback((customization: string) => {
    console.log('[useWorkoutCustomizationSelection] Direct string update:', { 
      length: customization.length,
      maxLength,
      preview: customization.slice(0, 50) + (customization.length > 50 ? '...' : '')
    });
    
    // Enforce character limit
    if (customization.length <= maxLength) {
      setWorkoutCustomization(customization);
    }
  }, [setWorkoutCustomization, maxLength]);

  // Check if customization has content
  const hasCustomization = useMemo(() => {
    return customizationText.trim().length > 0;
  }, [customizationText]);

  // Calculate remaining characters
  const remainingCharacters = useMemo(() => {
    return maxLength - characterCount;
  }, [maxLength, characterCount]);

  // Determine if approaching character limit
  const isApproachingLimit = useMemo(() => {
    return remainingCharacters <= 50; // Warning when 50 or fewer characters remain
  }, [remainingCharacters]);

  // Determine if at character limit
  const isAtLimit = useMemo(() => {
    return characterCount >= maxLength;
  }, [characterCount, maxLength]);

  return {
    customizationText,
    handleCustomizationChange,
    handleCustomizationStringChange, // For backward compatibility
    characterCount,
    maxLength,
    placeholder,
    hasCustomization,
    remainingCharacters,
    isApproachingLimit,
    isAtLimit
  };
}; 