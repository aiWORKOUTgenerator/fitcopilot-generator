/**
 * Equipment Icons Utility
 * 
 * Maps equipment types to their corresponding icons and provides a component for rendering.
 * This follows the new design system for consistent equipment representation.
 */
import React from 'react';
import { 
  Dumbbell, 
  Box, 
  Zap, 
  Activity, 
  BarChart,
  Circle,
  Watch,
  Bike,
  Disc,
  LifeBuoy,
  Feather,
  MoveVertical
} from 'lucide-react';

/**
 * Map of equipment types to their icon components
 */
export const EQUIPMENT_ICONS: Record<string, React.ComponentType<any>> = {
  // Body weight / no equipment
  'none': Circle,
  
  // Strength equipment
  'dumbbells': Dumbbell,
  'kettlebells': BarChart,
  'barbell': MoveVertical,
  'resistance-bands': Zap,
  'medicine-ball': Disc,
  'stability-ball': LifeBuoy,
  'cable-machine': Activity,
  
  // Support equipment
  'bench': Box,
  'squat-rack': MoveVertical,
  'pull-up-bar': MoveVertical,
  
  // Cardio equipment
  'treadmill': Activity,
  'stationary-bike': Bike,
  'elliptical': Activity,
  'rowing-machine': Activity,
  'jump-rope': Activity,
  
  // Other equipment
  'yoga-mat': Feather,
  'trx': Zap,
};

export interface EquipmentIconProps {
  /** The equipment type */
  type: string;
  /** Optional CSS class name */
  className?: string;
  /** Optional size in pixels */
  size?: number;
}

/**
 * Equipment Icon Component
 * Renders the appropriate icon for the given equipment type
 */
export const EquipmentIcon: React.FC<EquipmentIconProps> = ({ 
  type,
  className = "equipment-icon",
  size = 16
}) => {
  // Get the icon component or default to Circle (body weight)
  const IconComponent = EQUIPMENT_ICONS[type] || EQUIPMENT_ICONS['none'];
  
  return <IconComponent className={className} size={size} />;
};

export default EquipmentIcon; 