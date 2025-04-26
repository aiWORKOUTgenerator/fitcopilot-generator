import React from 'react';
import { TokenSummary } from '../types';
import { __ } from '../utils/wordpress-polyfills';

interface SummaryCardProps {
  summary: TokenSummary | null;
  isLoading: boolean;
  error: string | null;
  emptyMessage?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  isLoading,
  error,
  emptyMessage = __('No token usage data available yet.', 'fitcopilot')
}) => {
  if (isLoading) {
    return (
      <div className="loading-indicator" aria-live="polite">
        {__('Loading summary data...', 'fitcopilot')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message" role="alert">
        {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="empty-state">
        {emptyMessage}
      </div>
    );
  }

  // Calculate date range for display
  const dateRange = summary.start_date && summary.end_date 
    ? `${new Date(summary.start_date).toLocaleDateString()} - ${new Date(summary.end_date).toLocaleDateString()}`
    : __('All time', 'fitcopilot');

  return (
    <div className="summary-panel">
      <h2>{__('Token Usage Summary', 'fitcopilot')}</h2>
      
      <div className="date-range">
        <span className="date-range-label">{__('Period:', 'fitcopilot')}</span>
        <span className="date-range-value">{dateRange}</span>
      </div>
      
      <div className="summary-stats">
        <div className="stat-card" tabIndex={0}>
          <div className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M11 17h2v4h-2v-4zm4-10h2v14h-2V7zM7 13h2v8H7v-8zM3 9h2v12H3V9z" fill="currentColor" />
            </svg>
          </div>
          <div className="stat-value">{summary.total_tokens.toLocaleString()}</div>
          <div className="stat-label">{__('Total Tokens', 'fitcopilot')}</div>
        </div>
        
        <div className="stat-card" tabIndex={0}>
          <div className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" fill="currentColor" />
              <path d="M12 17l5-5-5-5v10z" fill="currentColor" />
            </svg>
          </div>
          <div className="stat-value">{summary.total_requests.toLocaleString()}</div>
          <div className="stat-label">{__('Total Requests', 'fitcopilot')}</div>
        </div>
        
        <div className="stat-card" tabIndex={0}>
          <div className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor" />
            </svg>
          </div>
          <div className="stat-value">${summary.total_cost.toFixed(4)}</div>
          <div className="stat-label">{__('Estimated Cost', 'fitcopilot')}</div>
        </div>
      </div>
      
      <h3>{__('By Model', 'fitcopilot')}</h3>
      
      <div className="model-table-wrapper">
        <table className="model-table">
          <thead>
            <tr>
              <th scope="col">{__('Model', 'fitcopilot')}</th>
              <th scope="col">{__('Tokens', 'fitcopilot')}</th>
              <th scope="col">{__('Cost', 'fitcopilot')}</th>
            </tr>
          </thead>
          <tbody>
            {summary.models.map(model => (
              <tr key={model.id}>
                <td>{model.name}</td>
                <td>{model.total_tokens.toLocaleString()}</td>
                <td>${model.estimated_cost.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryCard; 