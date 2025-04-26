import React, { useState } from 'react';
import { __ } from '../utils/wordpress-polyfills';

interface ResetStatsProps {
  onResetStats: () => Promise<boolean>;
  isDisabled?: boolean;
}

const ResetStats: React.FC<ResetStatsProps> = ({
  onResetStats,
  isDisabled = false
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleResetClick = () => {
    setShowConfirmation(true);
  };

  const handleCancelReset = () => {
    setShowConfirmation(false);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    setResetStatus('idle');
    
    try {
      const success = await onResetStats();
      
      if (success) {
        setResetStatus('success');
        setTimeout(() => {
          setShowConfirmation(false);
          setResetStatus('idle');
        }, 1500);
      } else {
        setResetStatus('error');
      }
    } catch (err) {
      setResetStatus('error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="token-usage-actions">
      <button 
        className="reset-button" 
        onClick={handleResetClick}
        disabled={isDisabled}
        aria-label={__('Reset all token usage statistics', 'fitcopilot')}
      >
        <svg 
          viewBox="0 0 24 24" 
          width="16" 
          height="16" 
          className="reset-icon"
          aria-hidden="true"
          style={{ marginRight: '8px' }}
        >
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor" />
        </svg>
        {__('Reset All Stats', 'fitcopilot')}
      </button>

      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-overlay" onClick={handleCancelReset}></div>
          <div 
            className="confirmation-dialog" 
            role="dialog" 
            aria-labelledby="reset-confirmation-title"
            aria-describedby="reset-confirmation-description"
          >
            <h3 id="reset-confirmation-title">
              {__('Reset All Statistics?', 'fitcopilot')}
            </h3>
            <p id="reset-confirmation-description">
              {__('This action will permanently delete all token usage statistics and cannot be undone. Are you sure you want to continue?', 'fitcopilot')}
            </p>
            
            <div className="confirmation-actions">
              <button 
                className="cancel-button" 
                onClick={handleCancelReset}
                disabled={isResetting}
              >
                {__('Cancel', 'fitcopilot')}
              </button>
              <button 
                className={`confirm-button ${resetStatus !== 'idle' ? `reset-${resetStatus}` : ''}`} 
                onClick={handleConfirmReset}
                disabled={isResetting}
              >
                {isResetting ? __('Resetting...', 'fitcopilot') : 
                 resetStatus === 'success' ? __('Success!', 'fitcopilot') : 
                 resetStatus === 'error' ? __('Failed', 'fitcopilot') : 
                 __('Yes, Reset Everything', 'fitcopilot')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetStats; 