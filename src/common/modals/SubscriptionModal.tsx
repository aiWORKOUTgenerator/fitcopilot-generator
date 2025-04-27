/**
 * SubscriptionModal Component
 * 
 * Displays subscription information and upgrade options for users
 */
import React from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal for prompting users to upgrade their subscription
 */
const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="subscription-modal">
      <div className="subscription-modal-overlay" onClick={onClose}></div>
      <div className="subscription-modal-content">
        <h2>Upgrade Your Subscription</h2>
        <p>Unlock premium features with a subscription upgrade!</p>
        
        <div className="subscription-options">
          <div className="subscription-option">
            <h3>Monthly</h3>
            <p className="price">$9.99/month</p>
            <button 
              className="upgrade-button"
              onClick={() => {
                // Simulated upgrade success - would be replaced with actual payment processing
                onSuccess();
              }}
            >
              Select Plan
            </button>
          </div>
          
          <div className="subscription-option recommended">
            <h3>Annual</h3>
            <p className="price">$99/year</p>
            <p className="savings">Save 17%</p>
            <button 
              className="upgrade-button"
              onClick={() => {
                // Simulated upgrade success - would be replaced with actual payment processing
                onSuccess();
              }}
            >
              Select Plan
            </button>
          </div>
        </div>
        
        <button className="close-button" onClick={onClose}>
          Maybe Later
        </button>
      </div>
    </div>
  );
};

export default SubscriptionModal; 