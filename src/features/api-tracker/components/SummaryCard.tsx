import React from 'react';
import { __ } from '../utils/wordpress-polyfills';
import { SummaryCardProps } from '../types';

/**
 * Format numbers with commas as thousands separators
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Format currency in USD
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format duration in milliseconds to a readable format
 */
const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = seconds / 60;
  return `${minutes.toFixed(1)}m`;
};

/**
 * SummaryCard component displays the API usage summary
 */
const SummaryCard: React.FC<SummaryCardProps> = ({ summary, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="api-tracker-card summary-card loading">
        <div className="card-loading">{__('Loading summary data...', 'fitcopilot')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-tracker-card summary-card error">
        <div className="card-error">{error}</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="api-tracker-card summary-card empty">
        <div className="card-empty">{__('No data available.', 'fitcopilot')}</div>
      </div>
    );
  }

  return (
    <div className="api-tracker-card summary-card">
      <h2>{__('API Usage Summary', 'fitcopilot')}</h2>
      
      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-label">{__('Total Requests', 'fitcopilot')}</span>
          <span className="summary-value">{formatNumber(summary.total_requests || 0)}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">{__('Total Tokens', 'fitcopilot')}</span>
          <span className="summary-value">{formatNumber(summary.total_tokens || 0)}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">{__('Prompt Tokens', 'fitcopilot')}</span>
          <span className="summary-value">{formatNumber(summary.prompt_tokens || 0)}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">{__('Completion Tokens', 'fitcopilot')}</span>
          <span className="summary-value">{formatNumber(summary.completion_tokens || 0)}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">{__('Avg. Tokens/Request', 'fitcopilot')}</span>
          <span className="summary-value">{formatNumber(summary.avg_tokens || 0)}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">{__('Avg. Duration', 'fitcopilot')}</span>
          <span className="summary-value">{formatDuration(summary.avg_duration_ms || 0)}</span>
        </div>
        
        <div className="summary-item estimated-cost">
          <span className="summary-label">{__('Estimated Cost', 'fitcopilot')}</span>
          <span className="summary-value">{formatCurrency(summary.estimated_cost || 0)}</span>
        </div>
      </div>
      
      <div className="summary-footer">
        <p className="summary-note">
          {__('Cost estimate based on current token price of', 'fitcopilot')} 
          {' $'}
          {(summary.token_cost || 0).toFixed(4)}
          {__(' per 1M tokens', 'fitcopilot')}
        </p>
      </div>
    </div>
  );
};

export default SummaryCard; 