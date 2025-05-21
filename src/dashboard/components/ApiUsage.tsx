import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';

interface ApiUsageStats {
  daily: number;
  weekly: number;
  monthly: number;
  limit: number;
}

/**
 * Displays API usage statistics for the FitCopilot plugin
 * 
 * @returns {JSX.Element} The rendered API usage component
 */
const ApiUsage: React.FC = () => {
  const { state } = useDashboard();
  const [stats, setStats] = useState<ApiUsageStats>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    limit: 100
  });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchApiUsage = async () => {
      setIsLoading(true);
      try {
        // API call would go here
        // const response = await fetch('/wp-json/my-wg/v1/token-usage', ...);
        // const data = await response.json();
        
        // Using mock data for now
        setTimeout(() => {
          setStats({
            daily: 12,
            weekly: 45,
            monthly: 87,
            limit: 100
          });
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching API usage stats:', error);
        setIsLoading(false);
      }
    };
    
    fetchApiUsage();
  }, [state.lastRefresh]);
  
  const calculatePercentage = (value: number): number => {
    return Math.min((value / stats.limit) * 100, 100);
  };
  
  if (isLoading) {
    return <div className="api-usage-loading">Loading usage data...</div>;
  }
  
  return (
    <div className="api-usage">
      <div className="usage-metric">
        <div className="usage-label">Daily Usage</div>
        <div className="usage-bar">
          <div 
            className="usage-progress" 
            style={{ width: `${calculatePercentage(stats.daily)}%` }}
          ></div>
        </div>
        <div className="usage-stats">
          <span className="usage-value">{stats.daily}</span>
          <span className="usage-total">/ {stats.limit}</span>
        </div>
      </div>
      
      <div className="usage-metric">
        <div className="usage-label">Weekly Usage</div>
        <div className="usage-bar">
          <div 
            className="usage-progress" 
            style={{ width: `${calculatePercentage(stats.weekly)}%` }}
          ></div>
        </div>
        <div className="usage-stats">
          <span className="usage-value">{stats.weekly}</span>
          <span className="usage-total">/ {stats.limit}</span>
        </div>
      </div>
      
      <div className="usage-metric">
        <div className="usage-label">Monthly Usage</div>
        <div className="usage-bar">
          <div 
            className="usage-progress" 
            style={{ width: `${calculatePercentage(stats.monthly)}%` }}
          ></div>
        </div>
        <div className="usage-stats">
          <span className="usage-value">{stats.monthly}</span>
          <span className="usage-total">/ {stats.limit}</span>
        </div>
      </div>
    </div>
  );
};

export default ApiUsage; 