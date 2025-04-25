/**
 * Advanced Options Panel Component
 * 
 * A collapsible panel that provides additional workout customization options including
 * equipment selection and physical restrictions or preferences. This component helps
 * declutter the main form by hiding less commonly used options.
 * 
 * Features:
 * - Accordion-style expand/collapse functionality
 * - Equipment selection with checkboxes
 * - Text area for specifying physical restrictions
 * - Analytics tracking for panel interaction
 * 
 * @example
 * // Basic usage
 * <AdvancedOptionsPanel 
 *   equipmentOptions={[
 *     { id: 'dumbbells', label: 'Dumbbells' },
 *     { id: 'bench', label: 'Bench' }
 *   ]}
 *   selectedEquipment={['dumbbells']}
 *   onEquipmentChange={(equipment) => setSelectedEquipment(equipment)}
 *   restrictions="Shoulder injury"
 *   onRestrictionsChange={(text) => setRestrictions(text)}
 * />
 */

import React, { useState } from 'react';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Textarea } from '../../../../components/ui/Textarea';
import { useAnalytics } from '../../../analytics/hooks/useAnalytics';

/**
 * Represents a piece of exercise equipment
 */
interface Equipment {
  /** Unique identifier for the equipment item */
  id: string;
  /** Display name for the equipment item */
  label: string;
}

interface AdvancedOptionsPanelProps {
  /** 
   * Array of available equipment options to display as checkboxes
   * Each option should have a unique id and display label
   */
  equipmentOptions: Equipment[];
  
  /** 
   * Array of equipment IDs that are currently selected
   * Should contain only valid IDs from the equipmentOptions array
   */
  selectedEquipment: string[];
  
  /** 
   * Callback function triggered when equipment selection changes
   * @param equipmentIds - Array of selected equipment IDs
   */
  onEquipmentChange: (equipmentIds: string[]) => void;
  
  /** 
   * Current text value for the restrictions/preferences textarea
   * Contains user-provided information about physical limitations
   */
  restrictions: string;
  
  /** 
   * Callback function triggered when restrictions text changes
   * @param text - Updated restrictions text
   */
  onRestrictionsChange: (text: string) => void;
}

/**
 * Advanced options panel component that provides additional workout customization options
 * in a collapsible interface to save space in the main form.
 * 
 * State Management:
 * - Uses local state (isExpanded) to track the expanded/collapsed state of the panel
 * - Parent component manages the selected equipment and restrictions state
 * - Selection changes are propagated to parent via callback props
 * - Panel expansion state is tracked via analytics events
 * 
 * Accessibility:
 * - Uses appropriate ARIA attributes (aria-expanded) for the accordion
 * - Properly associates labels with form controls
 * - Uses semantic HTML structure
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
  // Track whether the panel is expanded or collapsed
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  // Hook for tracking analytics events
  const { trackEvent } = useAnalytics();
  
  /**
   * Handles the selection/deselection of an equipment item
   * 
   * @param id - The ID of the equipment being toggled
   * @param checked - Whether the checkbox is being checked or unchecked
   */
  const handleEquipmentChange = (id: string, checked: boolean) => {
    if (checked) {
      // Add the equipment to the selected array
      onEquipmentChange([...selectedEquipment, id]);
    } else {
      // Remove the equipment from the selected array
      onEquipmentChange(selectedEquipment.filter(item => item !== id));
    }
  };

  /**
   * Toggles the expanded/collapsed state of the panel and tracks the event
   */
  const togglePanel = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    
    // Track the panel expansion/collapse for analytics
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
        aria-controls="advanced-options-content"
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
        <div id="advanced-options-content" className="px-4 pb-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Available Equipment</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {equipmentOptions.map(equipment => (
                <div key={equipment.id} className="flex items-center">
                  <Checkbox
                    id={`equipment-${equipment.id}`}
                    checked={selectedEquipment.includes(equipment.id)}
                    onChange={(checked) => handleEquipmentChange(equipment.id, checked)}
                    aria-label={equipment.label}
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
              aria-label="Physical restrictions or workout preferences"
            />
          </div>
        </div>
      )}
    </div>
  );
}; 