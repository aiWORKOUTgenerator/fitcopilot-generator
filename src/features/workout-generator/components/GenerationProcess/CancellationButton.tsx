/**
 * CancellationButton Component
 * 
 * A specialized button for canceling the workout generation process.
 * Uses the design system's Button component with consistent styling.
 */
import React from 'react';
import { Button } from '../../../../common/components/UI';
import { X } from 'lucide-react';

interface CancellationButtonProps {
  /** Callback when the user wants to cancel generation */
  onCancel: () => void;
  /** Optionally disable the button */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * CancellationButton provides a consistent way to cancel the workout generation process
 */
const CancellationButton: React.FC<CancellationButtonProps> = ({
  onCancel,
  disabled = false,
  className = '',
}) => {
  return (
    <Button
      variant="secondary"
      size="md"
      onClick={onCancel}
      disabled={disabled}
      className={className}
      aria-label="Cancel workout generation"
      startIcon={<X size={18} />}
    >
      Cancel
    </Button>
  );
};

export default CancellationButton; 