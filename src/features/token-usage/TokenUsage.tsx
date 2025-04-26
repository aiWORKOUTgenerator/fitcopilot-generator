import React, { useState, useEffect } from 'react';
import { apiFetch, addQueryArgs, __ } from './utils/wordpress-polyfills';

// Components
import SummaryCard from './components/SummaryCard';
import UsageChart from './components/UsageChart';
import ModelDistribution from './components/ModelDistribution';
import ResetStats from './components/ResetStats';

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

  // Check if any data is loading
  const isAnyLoading = Object.values(isLoading).some(state => state === true);

  return (
    <div className="fitcopilot-token-usage">
      <div className="token-usage-header">
        <h1>{__('Token Usage Tracker', 'fitcopilot')}</h1>
        <p>{__('Monitor your AI models token usage and associated costs', 'fitcopilot')}</p>
      </div>

      <div className="token-usage-container">
        <div className="token-usage-summary">
          <SummaryCard 
            summary={summary}
            isLoading={isLoading.summary}
            error={error.summary}
          />
        </div>
        
        <div className="token-usage-charts">
          <div className="chart-section">
            <h2>{__('Daily Token Usage', 'fitcopilot')}</h2>
            <UsageChart 
              data={dailyStats}
              isLoading={isLoading.daily}
              error={error.daily}
              dateKey="date" 
              title={__('Daily Token Usage', 'fitcopilot')}
              emptyMessage={__('No daily usage data available.', 'fitcopilot')}
            />
          </div>
          
          <div className="chart-section">
            <h2>{__('Monthly Token Usage', 'fitcopilot')}</h2>
            <UsageChart 
              data={monthlyStats}
              isLoading={isLoading.monthly}
              error={error.monthly}
              dateKey="month" 
              title={__('Monthly Token Usage', 'fitcopilot')}
              emptyMessage={__('No monthly usage data available.', 'fitcopilot')}
            />
          </div>
          
          <div className="chart-section">
            <h2>{__('Cost Breakdown by Model', 'fitcopilot')}</h2>
            <ModelDistribution 
              models={modelBreakdown}
              isLoading={isLoading.breakdown}
              error={error.breakdown}
              emptyMessage={__('No model breakdown data available.', 'fitcopilot')}
            />
          </div>
        </div>
        
        <ResetStats 
          onResetStats={handleResetStats} 
          isDisabled={isAnyLoading}
        />
      </div>
    </div>
  );
};

export default TokenUsage; 