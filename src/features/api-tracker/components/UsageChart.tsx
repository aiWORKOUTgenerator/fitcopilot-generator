import React, { useEffect, useRef } from 'react';
import { __ } from '../utils/wordpress-polyfills';
import { UsageChartProps } from '../types';
import { Chart, ChartConfiguration, ChartTypeRegistry } from 'chart.js/auto';

// Register required Chart.js components
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Declare global Chart type
declare global {
  interface Window {
    Chart: typeof Chart;
  }
}

/**
 * Format a date string for display in charts
 */
const formatDate = (dateStr: string, dateKey: 'date' | 'month'): string => {
  if (dateKey === 'month') {
    // For months (format: YYYY-MM) display as MMM YYYY
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } else {
    // For days (format: YYYY-MM-DD) display as MMM DD
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

/**
 * UsageChart component displays API usage data in a chart
 */
const UsageChart: React.FC<UsageChartProps> = ({ 
  data, 
  isLoading, 
  error, 
  dateKey,
  title
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Set Chart.js globally for other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.Chart = Chart;
    }
  }, []);

  useEffect(() => {
    // Don't render chart during loading or if there's an error
    if (isLoading || error || !data.length) {
      return;
    }

    // Clean up any existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    // Sort data by date/month
    const sortedData = [...data].sort((a, b) => {
      const aDate = String(a[dateKey as keyof typeof a]);
      const bDate = String(b[dateKey as keyof typeof b]);
      return aDate.localeCompare(bDate);
    });

    // Prepare chart data
    const labels = sortedData.map(item => formatDate(String(item[dateKey as keyof typeof item]), dateKey));
    
    // Create chart configuration
    const config = {
      type: 'bar' as const,
      data: {
        labels,
        datasets: [
          {
            label: __('Requests', 'fitcopilot'),
            data: sortedData.map(item => item.requests),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            order: 1,
            yAxisID: 'y',
          },
          {
            label: __('Tokens', 'fitcopilot'),
            data: sortedData.map(item => item.total_tokens),
            type: 'line' as const,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            fill: true,
            tension: 0.2,
            order: 0,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
            },
          },
          legend: {
            position: 'top' as const,
          },
          tooltip: {
            mode: 'index' as const,
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
              display: true,
              text: __('Requests', 'fitcopilot'),
            },
            grid: {
              display: true,
            },
            min: 0,
            ticks: {
              precision: 0,
            },
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            title: {
              display: true,
              text: __('Tokens', 'fitcopilot'),
            },
            grid: {
              display: false,
            },
            min: 0,
            ticks: {
              precision: 0,
              callback: function(tickValue: number | string): string {
                const value = Number(tickValue);
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`;
                }
                return value.toString();
              },
            },
          },
        },
      },
    };
    
    try {
      chartInstance.current = new Chart(ctx, config);
      console.log('Chart created successfully!');
    } catch (e) {
      console.error('Error creating chart:', e);
    }

    // Clean up chart instance on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, isLoading, error, dateKey, title]);

  if (isLoading) {
    return (
      <div className="chart-container loading">
        <div className="chart-loading">{__('Loading chart data...', 'fitcopilot')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container error">
        <div className="chart-error">{error}</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="chart-container empty">
        <div className="chart-empty">{__('No data available for this period.', 'fitcopilot')}</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <canvas ref={chartRef} height="350"></canvas>
    </div>
  );
};

export default UsageChart; 