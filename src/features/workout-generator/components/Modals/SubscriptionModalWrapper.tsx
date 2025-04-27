/**
 * SubscriptionModalWrapper Component
 * 
 * Wrapper for the common SubscriptionModal component with workout generator specific functionality
 */
import React from 'react';
import { SubscriptionModal } from '../../../../common/modals';

interface SubscriptionModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Wrapper for the subscription modal, can add feature-specific behavior
 */
const SubscriptionModalWrapper: React.FC<SubscriptionModalWrapperProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => (
  <SubscriptionModal
    isOpen={isOpen}
    onClose={onClose}
    onSuccess={onSuccess}
  />
);

export default SubscriptionModalWrapper; 