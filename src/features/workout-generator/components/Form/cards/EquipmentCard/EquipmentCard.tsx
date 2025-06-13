/**
 * EquipmentCard Component
 * 
 * Equipment selection card for workout generator
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { GridSelector } from '../shared/GridSelector';
import { CardHeader } from '../shared/CardHeader';
import { useEquipmentSelection } from './useEquipmentSelection';
import { BaseCardProps } from '../shared/types';
import './EquipmentCard.scss';

interface EquipmentCardProps extends BaseCardProps {}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  const {
    availableEquipment,
    selectedEquipment,
    profileEquipment,
    isLoading,
    error,
    handleEquipmentChange
  } = useEquipmentSelection();

  return (
    <FormFieldCard
      title="Equipment"
      description="What do you have available?"
      delay={delay}
      variant="complex"
      className={`equipment-card ${className}`}
      profileSection={
        <CardHeader
          label="Your Available Equipment:"
          badges={profileEquipment}
          isLoading={isLoading}
          error={error}
          fallback={{
            icon: "🏋️",
            text: "Available Equipment",
            subtitle: "Set up your profile to see your equipment"
          }}
        />
      }
    >
      <GridSelector
        options={availableEquipment}
        selectedValues={selectedEquipment}
        onSelectionChange={handleEquipmentChange}
        multiSelect={true}
        gridColumns={4}
        label="Select for Today:"
        className="equipment-selector"
      />
    </FormFieldCard>
  );
}; 