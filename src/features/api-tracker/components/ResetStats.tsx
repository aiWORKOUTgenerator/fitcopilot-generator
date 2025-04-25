import React, { useState } from 'react';
import { __ } from '../utils/wordpress-polyfills';
import { ResetStatsProps } from '../types';

/**
 * ResetStats component provides a way to reset all API tracking statistics
 */
const ResetStats: React.FC<ResetStatsProps> = ({ onResetStats }) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Start reset confirmation
  const handleResetClick = () => {
    setIsConfirming(true);
    setMessage(null);
  };

  // Cancel reset
  const handleCancelClick = () => {
    setIsConfirming(false);
  };

  // Confirm and execute reset
  const handleConfirmReset = async () => {
    setIsResetting(true);
    setMessage(null);

    try {
      const success = await onResetStats();
      
      if (success) {
        setMessage({
          text: __('All statistics have been reset successfully.', 'fitcopilot'),
          type: 'success',
        });
        setIsConfirming(false);
      } else {
        setMessage({
          text: __('Failed to reset statistics.', 'fitcopilot'),
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error resetting statistics:', error);
      setMessage({
        text: __('An error occurred while resetting statistics.', 'fitcopilot'),
        type: 'error',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="api-tracker-card reset-stats-card">
      <h2>{__('Reset Statistics', 'fitcopilot')}</h2>
      
      <div className="reset-stats-content">
        <p>
          {__('This will permanently delete all stored API usage statistics. This action cannot be undone.', 'fitcopilot')}
        </p>
        
        {!isConfirming ? (
          <button 
            type="button" 
            className="button button-secondary reset-button"
            onClick={handleResetClick}
          >
            {__('Reset All Statistics', 'fitcopilot')}
          </button>
        ) : (
          <div className="reset-confirmation">
            <p className="confirmation-message">
              {__('Are you sure you want to reset all statistics? This cannot be undone.', 'fitcopilot')}
            </p>
            
            <div className="confirmation-buttons">
              <button
                type="button"
                className="button button-secondary cancel-button"
                onClick={handleCancelClick}
                disabled={isResetting}
              >
                {__('Cancel', 'fitcopilot')}
              </button>
              
              <button 
                type="button"
                className="button button-primary confirm-button"
                onClick={handleConfirmReset}
                disabled={isResetting}
              >
                {isResetting 
                  ? __('Resetting...', 'fitcopilot') 
                  : __('Yes, Reset Everything', 'fitcopilot')
                }
              </button>
            </div>
          </div>
        )}
        
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetStats; 