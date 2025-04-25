import React, { useState, useEffect } from 'react';
import { apiFetch, addQueryArgs, __ } from './utils/wordpress-polyfills';

// Components
import { SummaryCard, TokenCostSetting, UsageChart, ResetStats } from './components';

// Types
import { APISummary, DailyStats, MonthlyStats } from './types/index';

// CSS
import './styles/api-tracker.css';

const APITracker: React.FC = () => {
  // State for API data
  const [summary, setSummary] = useState<APISummary | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState({
    summary: true,
    daily: true,
    monthly: true,
  });

  // Error states
  const [error, setError] = useState<{
    summary: string | null;
    daily: string | null;
    monthly: string | null;
  }>({
    summary: null,
    daily: null,
    monthly: null,
  });

  // Fetch data from API
  const fetchSummary = async () => {
    setIsLoading(prev => ({ ...prev, summary: true }));
    try {
      console.log('Fetching API summary data');
      const response = await apiFetch({
        path: 'fitcopilot/v1/api-tracker/summary',
        method: 'GET',
      });

      console.log('API summary response:', response);
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
      console.log('Fetching daily stats');
      const response = await apiFetch({
        path: addQueryArgs('fitcopilot/v1/api-tracker/daily', { days }),
        method: 'GET',
      });

      console.log('Daily stats response:', response);
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
      console.log('Fetching monthly stats');
      const response = await apiFetch({
        path: addQueryArgs('fitcopilot/v1/api-tracker/monthly', { months }),
        method: 'GET',
      });

      console.log('Monthly stats response:', response);
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

  // Update token cost
  const handleUpdateTokenCost = async (cost: number): Promise<boolean> => {
    try {
      console.log('Updating token cost:', cost);
      const response = await apiFetch({
        path: 'fitcopilot/v1/api-tracker/token-cost',
        method: 'POST',
        data: { cost },
      });

      if (response.success) {
        // Refresh summary data after updating token cost
        fetchSummary();
        return true;
      } else {
        console.error('Failed to update token cost:', response.message);
        return false;
      }
    } catch (err) {
      console.error('Error updating token cost:', err);
      return false;
    }
  };

  // Reset all statistics
  const handleResetStats = async (): Promise<boolean> => {
    try {
      console.log('Resetting stats');
      const response = await apiFetch({
        path: 'fitcopilot/v1/api-tracker/reset',
        method: 'POST',
      });

      if (response.success) {
        // Refresh all data after reset
        fetchSummary();
        fetchDailyStats();
        fetchMonthlyStats();
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
    console.log('APITracker component mounted, fetching data');
    fetchSummary();
    fetchDailyStats();
    fetchMonthlyStats();
  }, []);

  console.log('Rendering APITracker component');
  console.log('Summary:', summary);
  console.log('Daily stats:', dailyStats);
  console.log('Monthly stats:', monthlyStats);

  return (
    <div className="fitcopilot-api-tracker">
      <div className="api-tracker-header">
        <h1>{__('API Usage Tracker', 'fitcopilot')}</h1>
      </div>

      <div className="api-tracker-container">
        <div className="api-tracker-summary">
          <SummaryCard 
            summary={summary} 
            isLoading={isLoading.summary} 
            error={error.summary} 
          />
          <TokenCostSetting 
            currentCost={summary?.token_cost || 0.002} 
            onUpdateCost={handleUpdateTokenCost} 
          />
        </div>

        <div className="api-tracker-charts">
          <div className="api-tracker-card">
            <h2>{__('Daily Usage', 'fitcopilot')}</h2>
            <UsageChart 
              data={dailyStats} 
              isLoading={isLoading.daily} 
              error={error.daily}
              dateKey="date"
              title={__('API Calls - Last 30 Days', 'fitcopilot')}
            />
          </div>

          <div className="api-tracker-card">
            <h2>{__('Monthly Usage', 'fitcopilot')}</h2>
            <UsageChart 
              data={monthlyStats} 
              isLoading={isLoading.monthly} 
              error={error.monthly}
              dateKey="month" 
              title={__('API Calls - Last 12 Months', 'fitcopilot')}
            />
          </div>
        </div>

        <div className="api-tracker-actions">
          <ResetStats onResetStats={handleResetStats} />
        </div>
      </div>
    </div>
  );
};

export default APITracker; 