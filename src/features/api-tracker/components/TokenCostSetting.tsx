import React, { useState } from 'react';
import { __ } from '../utils/wordpress-polyfills';
import { TokenCostSettingProps } from '../types';

/**
 * TokenCostSetting component for updating the token cost setting
 */
const TokenCostSetting: React.FC<TokenCostSettingProps> = ({ currentCost, onUpdateCost }) => {
  // Default to 0.002 if currentCost is undefined
  const [cost, setCost] = useState<string>((currentCost || 0.002).toString());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Handle input change
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCost(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const costValue = parseFloat(cost);
    if (isNaN(costValue) || costValue <= 0) {
      setMessage({
        text: __('Please enter a valid number greater than zero.', 'fitcopilot'),
        type: 'error',
      });
      return;
    }

    setIsUpdating(true);
    setMessage(null);

    try {
      const success = await onUpdateCost(costValue);
      
      if (success) {
        setMessage({
          text: __('Token cost updated successfully.', 'fitcopilot'),
          type: 'success',
        });
        setCost(costValue.toString()); // Update with the normalized value
      } else {
        setMessage({
          text: __('Failed to update token cost.', 'fitcopilot'),
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating token cost:', error);
      setMessage({
        text: __('An error occurred while updating the token cost.', 'fitcopilot'),
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="api-tracker-card token-cost-card">
      <h2>{__('Token Cost Settings', 'fitcopilot')}</h2>
      
      <form onSubmit={handleSubmit} className="token-cost-form">
        <div className="form-group">
          <label htmlFor="token-cost">
            {__('Cost per 1M tokens (USD)', 'fitcopilot')}
          </label>
          <div className="input-group">
            <span className="input-prefix">$</span>
            <input
              type="number"
              id="token-cost"
              value={cost}
              onChange={handleCostChange}
              step="0.0001"
              min="0.0001"
              disabled={isUpdating}
              required
              aria-label={__('Token cost in USD per 1 million tokens', 'fitcopilot')}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="button button-primary" 
            disabled={isUpdating}
          >
            {isUpdating 
              ? __('Updating...', 'fitcopilot') 
              : __('Update Cost', 'fitcopilot')
            }
          </button>
        </div>
      </form>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="token-cost-info">
        <p>
          {__('This setting is used to estimate the cost of API calls based on token usage.', 'fitcopilot')}
        </p>
        <p>
          {__('Default value is $0.002 per 1M tokens (based on approximate GPT-3.5 Turbo pricing).', 'fitcopilot')}
        </p>
      </div>
    </div>
  );
};

export default TokenCostSetting; 