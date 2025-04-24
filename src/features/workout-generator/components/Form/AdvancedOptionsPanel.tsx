/**
 * Advanced Options Panel Component
 * 
 * Provides collapsible advanced options for workout customization including
 * equipment selection and physical restrictions or preferences.
 */

import React, { useState } from 'react';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Textarea } from '../../../../components/ui/Textarea';
import { useAnalytics } from '../../../analytics/hooks/useAnalytics';

interface Equipment {
  id: string;
  label: string;
}

interface AdvancedOptionsPanelProps {
  /** List of available equipment options */
  equipmentOptions: Equipment[];
  /** Currently selected equipment IDs */
  selectedEquipment: string[];
  /** Function to update selected equipment */
  onEquipmentChange: (equipmentIds: string[]) => void;
  /** Current restrictions text */
  restrictions: string;
  /** Function to update restrictions */
  onRestrictionsChange: (text: string) => void;
}

/**
 * Advanced options panel for workout form with equipment selection and restrictions
 * 
 * @param {AdvancedOptionsPanelProps} props - Component properties
 * @returns {JSX.Element} Rendered advanced options component
 */
export const AdvancedOptionsPanel: React.FC<AdvancedOptionsPanelProps> = ({
  equipmentOptions,
  selectedEquipment,
  onEquipmentChange,
  restrictions,
  onRestrictionsChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { trackEvent } = useAnalytics();
  
  const handleEquipmentChange = (id: string, checked: boolean) => {
    if (checked) {
      onEquipmentChange([...selectedEquipment, id]);
    } else {
      onEquipmentChange(selectedEquipment.filter(item => item !== id));
    }
  };

  const togglePanel = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    trackEvent('view_form', {
      advanced_options_expanded: newState
    });
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-lg">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-primary-500"
        onClick={togglePanel}
        aria-expanded={isExpanded}
      >
        <span>Advanced Options</span>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Available Equipment</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {equipmentOptions.map(equipment => (
                <div key={equipment.id} className="flex items-center">
                  <Checkbox
                    id={`equipment-${equipment.id}`}
                    checked={selectedEquipment.includes(equipment.id)}
                    onChange={(checked) => handleEquipmentChange(equipment.id, checked)}
                  />
                  <label
                    htmlFor={`equipment-${equipment.id}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {equipment.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Restrictions or Preferences</h3>
            <Textarea
              id="restrictions"
              placeholder="Enter any injuries, limitations, or preferences (e.g., knee injury, prefer machine exercises, etc.)"
              value={restrictions}
              onChange={(e) => onRestrictionsChange(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 