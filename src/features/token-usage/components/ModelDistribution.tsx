import React, { useMemo } from 'react';
import { ModelBreakdown } from '../types';
import { __ } from '../utils/wordpress-polyfills';

interface ModelDistributionProps {
  models: ModelBreakdown[];
  isLoading: boolean;
  error: string | null;
  emptyMessage?: string;
}

// Generate colors for pie chart segments
const getColorForIndex = (index: number, total: number): string => {
  const baseColors = [
    '#2271b1', // Primary blue
    '#3498db', // Light blue
    '#2ecc71', // Green
    '#e74c3c', // Red
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Turquoise
    '#34495e', // Dark blue
  ];
  
  // If we have more models than base colors, generate colors programmatically
  if (index < baseColors.length) {
    return baseColors[index];
  } else {
    // Generate a color based on the index
    const hue = (index / total) * 360;
    return `hsl(${hue}, 70%, 50%)`;
  }
};

const ModelDistribution: React.FC<ModelDistributionProps> = ({
  models,
  isLoading,
  error,
  emptyMessage = __('No model breakdown data available.', 'fitcopilot')
}) => {
  // Sort models by usage (highest first)
  const sortedModels = useMemo(() => {
    return [...models].sort((a, b) => b.tokens - a.tokens);
  }, [models]);

  // Calculate the angles for the pie chart segments
  const pieSegments = useMemo(() => {
    if (!sortedModels.length) return [];
    
    const total = sortedModels.reduce((sum, model) => sum + model.tokens, 0);
    let startAngle = 0;
    
    return sortedModels.map((model, index) => {
      const percentage = total > 0 ? (model.tokens / total) * 100 : 0;
      const angleSize = (percentage / 100) * 360;
      const endAngle = startAngle + angleSize;
      
      // Calculate SVG arc path
      const x1 = 50 + 45 * Math.cos((startAngle - 90) * Math.PI / 180);
      const y1 = 50 + 45 * Math.sin((startAngle - 90) * Math.PI / 180);
      const x2 = 50 + 45 * Math.cos((endAngle - 90) * Math.PI / 180);
      const y2 = 50 + 45 * Math.sin((endAngle - 90) * Math.PI / 180);
      
      const largeArcFlag = angleSize > 180 ? 1 : 0;
      
      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');
      
      const segment = {
        model,
        color: getColorForIndex(index, sortedModels.length),
        pathData,
        startAngle,
        endAngle,
        percentage
      };
      
      startAngle = endAngle;
      return segment;
    });
  }, [sortedModels]);

  if (isLoading) {
    return (
      <div className="loading-indicator" aria-live="polite">
        {__('Loading model breakdown...', 'fitcopilot')}
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

  if (!sortedModels.length) {
    return (
      <div className="empty-state">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="model-distribution-container">
      <div className="pie-chart-container">
        <svg 
          viewBox="0 0 100 100" 
          className="pie-chart"
          aria-hidden="true"
        >
          {pieSegments.map((segment, index) => (
            <path
              key={segment.model.model_id}
              d={segment.pathData}
              fill={segment.color}
              stroke="#fff"
              strokeWidth="1"
              className="pie-segment"
              data-model={segment.model.model_name}
              data-percentage={segment.percentage.toFixed(1)}
            />
          ))}
          <circle cx="50" cy="50" r="20" fill="white" />
        </svg>
        
        <div className="chart-legend">
          {pieSegments.map((segment) => (
            <div key={segment.model.model_id} className="legend-item">
              <span 
                className="color-indicator" 
                style={{ backgroundColor: segment.color }}
                aria-hidden="true"
              ></span>
              <span className="model-name" title={segment.model.model_name}>
                {segment.model.model_name}
              </span>
              <span className="percentage">
                {segment.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="model-breakdown-table">
        <table aria-label={__('Cost breakdown by model', 'fitcopilot')}>
          <thead>
            <tr>
              <th scope="col">{__('Model', 'fitcopilot')}</th>
              <th scope="col">{__('Tokens', 'fitcopilot')}</th>
              <th scope="col">{__('Percentage', 'fitcopilot')}</th>
              <th scope="col">{__('Cost', 'fitcopilot')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedModels.map(model => (
              <tr key={model.model_id}>
                <td>{model.model_name}</td>
                <td>{model.tokens.toLocaleString()}</td>
                <td>{model.percentage.toFixed(1)}%</td>
                <td>${model.cost.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelDistribution; 