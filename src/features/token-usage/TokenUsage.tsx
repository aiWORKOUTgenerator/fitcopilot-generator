import React, { useState, useEffect } from 'react';
import { apiFetch, addQueryArgs, __ } from './utils/wordpress-polyfills';

// Types
import { 
  TokenSummary, 
  DailyTokenStats, 
  MonthlyTokenStats,
  ModelBreakdown
} from './types';

// CSS
import './styles/token-usage.css';

const TokenUsage: React.FC = () => {
  // State for API data
  const [summary, setSummary] = useState<TokenSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyTokenStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyTokenStats[]>([]);
  const [modelBreakdown, setModelBreakdown] = useState<ModelBreakdown[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState({
    summary: true,
    daily: true,
    monthly: true,
    breakdown: true
  });

  // Error states
  const [error, setError] = useState<{
    summary: string | null;
    daily: string | null;
    monthly: string | null;
    breakdown: string | null;
  }>({
    summary: null,
    daily: null,
    monthly: null,
    breakdown: null
  });

  // Fetch data from API
  const fetchModelSummary = async () => {
    setIsLoading(prev => ({ ...prev, summary: true }));
    try {
      console.log('Fetching token usage summary data');
      const response = await apiFetch({
        path: 'fitcopilot/v1/token-usage/model-summary',
        method: 'GET',
      });

      console.log('Token usage summary response:', response);
      if (response.success) {
        setSummary(response.data);
      } else {
        setError(prev => ({ ...prev, summary: response.message || 'Failed to load summary data' }));
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError(prev => ({ ...prev, summary: 'Failed to load summary data' }));
    } finally {
      setIsLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const fetchDailyStats = async (days = 30) => {
    setIsLoading(prev => ({ ...prev, daily: true }));
    try {
      console.log('Fetching daily token stats');
      const response = await apiFetch({
        path: addQueryArgs('fitcopilot/v1/token-usage/daily', { days }),
        method: 'GET',
      });

      console.log('Daily token stats response:', response);
      if (response.success) {
        setDailyStats(response.data);
      } else {
        setError(prev => ({ ...prev, daily: response.message || 'Failed to load daily stats' }));
      }
    } catch (err) {
      console.error('Error fetching daily stats:', err);
      setError(prev => ({ ...prev, daily: 'Failed to load daily stats' }));
    } finally {
      setIsLoading(prev => ({ ...prev, daily: false }));
    }
  };

  const fetchMonthlyStats = async (months = 12) => {
    setIsLoading(prev => ({ ...prev, monthly: true }));
    try {
      console.log('Fetching monthly token stats');
      const response = await apiFetch({
        path: addQueryArgs('fitcopilot/v1/token-usage/monthly', { months }),
        method: 'GET',
      });

      console.log('Monthly token stats response:', response);
      if (response.success) {
        setMonthlyStats(response.data);
      } else {
        setError(prev => ({ ...prev, monthly: response.message || 'Failed to load monthly stats' }));
      }
    } catch (err) {
      console.error('Error fetching monthly stats:', err);
      setError(prev => ({ ...prev, monthly: 'Failed to load monthly stats' }));
    } finally {
      setIsLoading(prev => ({ ...prev, monthly: false }));
    }
  };

  const fetchModelBreakdown = async () => {
    setIsLoading(prev => ({ ...prev, breakdown: true }));
    try {
      console.log('Fetching model cost breakdown');
      const response = await apiFetch({
        path: 'fitcopilot/v1/token-usage/cost-breakdown',
        method: 'GET',
      });

      console.log('Model breakdown response:', response);
      if (response.success) {
        setModelBreakdown(response.data);
      } else {
        setError(prev => ({ ...prev, breakdown: response.message || 'Failed to load model breakdown' }));
      }
    } catch (err) {
      console.error('Error fetching model breakdown:', err);
      setError(prev => ({ ...prev, breakdown: 'Failed to load model breakdown' }));
    } finally {
      setIsLoading(prev => ({ ...prev, breakdown: false }));
    }
  };

  // Reset all statistics
  const handleResetStats = async (): Promise<boolean> => {
    try {
      console.log('Resetting token usage stats');
      const response = await apiFetch({
        path: 'fitcopilot/v1/token-usage/reset',
        method: 'POST',
      });

      if (response.success) {
        // Refresh all data after reset
        fetchModelSummary();
        fetchDailyStats();
        fetchMonthlyStats();
        fetchModelBreakdown();
        return true;
      } else {
        console.error('Failed to reset stats:', response.message);
        return false;
      }
    } catch (err) {
      console.error('Error resetting stats:', err);
      return false;
    }
  };

  // Load data on component mount
  useEffect(() => {
    console.log('TokenUsage component mounted, fetching data');
    fetchModelSummary();
    fetchDailyStats();
    fetchMonthlyStats();
    fetchModelBreakdown();
    
    // Dispatch event to hide debug info when the app loads
    const loadedEvent = new Event('token-usage-loaded');
    window.dispatchEvent(loadedEvent);
  }, []);

  // Create placeholder content for now
  return (
    <div className="fitcopilot-token-usage">
      <div className="token-usage-header">
        <h1>{__('Token Usage Tracker', 'fitcopilot')}</h1>
        <p>{__('Monitor your AI models token usage and associated costs', 'fitcopilot')}</p>
      </div>

      <div className="token-usage-container">
        <div className="token-usage-summary">
          {isLoading.summary ? (
            <div className="loading-indicator">Loading summary data...</div>
          ) : error.summary ? (
            <div className="error-message">{error.summary}</div>
          ) : summary ? (
            <div className="summary-panel">
              <h2>{__('Token Usage Summary', 'fitcopilot')}</h2>
              <div className="summary-stats">
                <div className="stat-card">
                  <div className="stat-value">{summary.total_tokens.toLocaleString()}</div>
                  <div className="stat-label">{__('Total Tokens', 'fitcopilot')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{summary.total_requests.toLocaleString()}</div>
                  <div className="stat-label">{__('Total Requests', 'fitcopilot')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">${summary.total_cost.toFixed(4)}</div>
                  <div className="stat-label">{__('Estimated Cost', 'fitcopilot')}</div>
                </div>
              </div>
              
              <h3>{__('By Model', 'fitcopilot')}</h3>
              <table className="model-table">
                <thead>
                  <tr>
                    <th>{__('Model', 'fitcopilot')}</th>
                    <th>{__('Tokens', 'fitcopilot')}</th>
                    <th>{__('Cost', 'fitcopilot')}</th>
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
          ) : (
            <div className="empty-state">
              {__('No token usage data available yet.', 'fitcopilot')}
            </div>
          )}
        </div>
        
        <div className="token-usage-charts">
          <div className="chart-section">
            <h2>{__('Daily Token Usage', 'fitcopilot')}</h2>
            {isLoading.daily ? (
              <div className="loading-indicator">Loading daily stats...</div>
            ) : error.daily ? (
              <div className="error-message">{error.daily}</div>
            ) : dailyStats.length > 0 ? (
              <div className="chart-placeholder">
                {/* Chart will be added in a separate component */}
                <p>{__('Chart showing daily token usage over the last 30 days', 'fitcopilot')}</p>
                <ul>
                  {dailyStats.slice(0, 5).map(stat => (
                    <li key={stat.date}>
                      {stat.date}: {stat.total_tokens.toLocaleString()} tokens (${stat.estimated_cost.toFixed(4)})
                    </li>
                  ))}
                  {dailyStats.length > 5 && <li>...</li>}
                </ul>
              </div>
            ) : (
              <div className="empty-state">
                {__('No daily usage data available.', 'fitcopilot')}
              </div>
            )}
          </div>
          
          <div className="chart-section">
            <h2>{__('Monthly Token Usage', 'fitcopilot')}</h2>
            {isLoading.monthly ? (
              <div className="loading-indicator">Loading monthly stats...</div>
            ) : error.monthly ? (
              <div className="error-message">{error.monthly}</div>
            ) : monthlyStats.length > 0 ? (
              <div className="chart-placeholder">
                {/* Chart will be added in a separate component */}
                <p>{__('Chart showing monthly token usage over the last 12 months', 'fitcopilot')}</p>
                <ul>
                  {monthlyStats.slice(0, 5).map(stat => (
                    <li key={stat.month}>
                      {stat.month}: {stat.total_tokens.toLocaleString()} tokens (${stat.estimated_cost.toFixed(4)})
                    </li>
                  ))}
                  {monthlyStats.length > 5 && <li>...</li>}
                </ul>
              </div>
            ) : (
              <div className="empty-state">
                {__('No monthly usage data available.', 'fitcopilot')}
              </div>
            )}
          </div>
          
          <div className="chart-section">
            <h2>{__('Cost Breakdown by Model', 'fitcopilot')}</h2>
            {isLoading.breakdown ? (
              <div className="loading-indicator">Loading cost breakdown...</div>
            ) : error.breakdown ? (
              <div className="error-message">{error.breakdown}</div>
            ) : modelBreakdown.length > 0 ? (
              <div className="breakdown-placeholder">
                {/* Pie chart will be added in a separate component */}
                <p>{__('Pie chart showing cost breakdown by model', 'fitcopilot')}</p>
                <ul>
                  {modelBreakdown.map(model => (
                    <li key={model.model_id}>
                      {model.model_name}: {model.tokens.toLocaleString()} tokens ({model.percentage.toFixed(1)}%) - ${model.cost.toFixed(4)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="empty-state">
                {__('No model breakdown data available.', 'fitcopilot')}
              </div>
            )}
          </div>
        </div>
        
        <div className="token-usage-actions">
          <button 
            className="reset-button" 
            onClick={handleResetStats}
            disabled={isLoading.summary || isLoading.daily || isLoading.monthly || isLoading.breakdown}
          >
            {__('Reset All Stats', 'fitcopilot')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenUsage; 