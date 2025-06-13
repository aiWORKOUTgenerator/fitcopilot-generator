/**
 * useEquipmentSelection Hook
 * 
 * Manages equipment selection state and profile integration
 */
import { useCallback, useMemo } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../../profile/context';
import { GridOption } from '../shared/types';
import { mapProfileToWorkoutContext } from '../../../../utils/profileMapping';

// Equipment options with consistent data structure
const EQUIPMENT_OPTIONS: GridOption<string>[] = [
  { value: 'none', label: 'No Equipment', tooltip: 'Bodyweight exercises only' },
  { value: 'dumbbells', label: 'Dumbbells', tooltip: 'Dumbbell exercises' },
  { value: 'kettlebells', label: 'Kettlebells', tooltip: 'Kettlebell training' },
  { value: 'resistance-bands', label: 'Resistance Bands', tooltip: 'Band exercises' },
  { value: 'pull-up-bar', label: 'Pull-up Bar', tooltip: 'Pull-up and hanging exercises' },
  { value: 'yoga-mat', label: 'Yoga Mat', tooltip: 'Floor exercises and yoga' },
  { value: 'bench', label: 'Bench', tooltip: 'Bench exercises' },
  { value: 'barbell', label: 'Barbell', tooltip: 'Barbell training' },
  { value: 'trx', label: 'TRX', tooltip: 'Suspension training' },
  { value: 'medicine-ball', label: 'Medicine Ball', tooltip: 'Medicine ball exercises' },
  { value: 'jump-rope', label: 'Jump Rope', tooltip: 'Cardio and coordination' },
  { value: 'stability-ball', label: 'Stability Ball', tooltip: 'Core and stability exercises' },
];

export const useEquipmentSelection = () => {
  const { setEquipmentAvailableToday, formValues } = useWorkoutForm();
  const { state: profileState } = useProfile();
  const { profile, loading, error } = profileState;

  // Get current selected equipment
  const selectedEquipment = formValues.sessionInputs?.equipmentAvailableToday || [];

  // Map profile data for display
  const profileMapping = profile ? mapProfileToWorkoutContext(profile) : null;
  const profileEquipment = useMemo(() => {
    if (!profileMapping?.displayData?.equipment) return [];
    
    return profileMapping.displayData.equipment.map(eq => ({
      value: eq.value,
      display: eq.display,
      icon: eq.icon,
      color: 'var(--color-text-secondary, #b3b3b3)',
      bgColor: 'rgba(255, 255, 255, 0.05)'
    }));
  }, [profileMapping]);

  // Handle equipment selection changes
  const handleEquipmentChange = useCallback((equipment: string[]) => {
    console.log('[EquipmentCard] Equipment selection changed:', equipment);
    setEquipmentAvailableToday(equipment);
  }, [setEquipmentAvailableToday]);

  return {
    availableEquipment: EQUIPMENT_OPTIONS,
    selectedEquipment,
    profileEquipment,
    isLoading: loading,
    error: error?.message,
    handleEquipmentChange
  };
}; 