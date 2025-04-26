import React, { useMemo } from 'react';
import { DailyTokenStats, MonthlyTokenStats } from '../types';
import { __ } from '../utils/wordpress-polyfills';

interface UsageChartProps {
  data: (DailyTokenStats | MonthlyTokenStats)[];
  isLoading: boolean;
  error: string | null;
  dateKey: 'date' | 'month';
  title: string;
  emptyMessage?: string;
}

// Type guards to check which type we're working with
const isDailyStats = (item: DailyTokenStats | MonthlyTokenStats): item is DailyTokenStats => {
  return 'date' in item;
};

const isMonthlyStats = (item: DailyTokenStats | MonthlyTokenStats): item is MonthlyTokenStats => {
  return 'month' in item;
};

// Safely get the date value based on dateKey
const getDateValue = (item: DailyTokenStats | MonthlyTokenStats, dateKey: 'date' | 'month'): string => {
  if (dateKey === 'date' && isDailyStats(item)) {
    return item.date;
  } else if (dateKey === 'month' && isMonthlyStats(item)) {
    return item.month;
  }
  // This should never happen if we're using the component correctly
  return '';
};

const UsageChart: React.FC<UsageChartProps> = ({
  data,
  isLoading,
  error,
  dateKey,
  title,
  emptyMessage = __('No data available.', 'fitcopilot')
}) => {
  const chartData = useMemo(() => {
    if (!data.length) return [];

    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
      return getDateValue(a, dateKey).localeCompare(getDateValue(b, dateKey));
    });

    return sortedData;
  }, [data, dateKey]);

  // Calculate max values for proper scaling
  const maxTokens = useMemo(() => {
    if (!chartData.length) return 1000;
    return Math.max(...chartData.map(item => item.total_tokens)) * 1.1;
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="loading-indicator" aria-live="polite">
        {__('Loading chart data...', 'fitcopilot')}
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

  if (!chartData.length) {
    return (
      <div className="empty-state">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="usage-chart-container" aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-chart-title`}>
      <h3 id={`${title.toLowerCase().replace(/\s+/g, '-')}-chart-title`} className="visually-hidden">
        {title}
      </h3>
      
      <div className="chart-visualization" aria-hidden="true">
        <div className="chart-bars">
          {chartData.map((item, index) => {
            const barHeight = `${(item.total_tokens / maxTokens) * 100}%`;
            const dateValue = getDateValue(item, dateKey);
            const formattedDate = dateKey === 'date' 
              ? new Date(dateValue).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : dateValue;
            
            return (
              <div 
                key={dateValue} 
                className="chart-bar-container"
                title={`${formattedDate}: ${item.total_tokens.toLocaleString()} tokens ($${item.estimated_cost.toFixed(4)})`}
              >
                <div 
                  className="chart-bar" 
                  style={{ height: barHeight }}
                  data-tokens={item.total_tokens.toLocaleString()}
                ></div>
                <div className="chart-label">{formattedDate}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chart-data-table">
        <table aria-label={title}>
          <thead>
            <tr>
              <th scope="col">{dateKey === 'date' ? __('Date', 'fitcopilot') : __('Month', 'fitcopilot')}</th>
              <th scope="col">{__('Tokens', 'fitcopilot')}</th>
              <th scope="col">{__('Requests', 'fitcopilot')}</th>
              <th scope="col">{__('Cost', 'fitcopilot')}</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map(item => (
              <tr key={getDateValue(item, dateKey)}>
                <td>{getDateValue(item, dateKey)}</td>
                <td>{item.total_tokens.toLocaleString()}</td>
                <td>{item.requests}</td>
                <td>${item.estimated_cost.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsageChart; 