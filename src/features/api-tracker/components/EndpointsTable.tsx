import React, { useState, useMemo } from 'react';
import { __ } from '../utils/wordpress-polyfills';
import { ApiEndpoint, EndpointsTableProps } from '../types';

/**
 * Component for displaying API endpoints in a table
 */
const EndpointsTable: React.FC<EndpointsTableProps> = ({ endpoints, isLoading, error }) => {
  // State for endpoint filter type
  const [filterType, setFilterType] = useState<'fitcopilot' | 'all'>('fitcopilot');

  // Format methods into a string
  const formatMethods = (methods: Record<string, boolean>): string => {
    return Object.keys(methods).join(', ');
  };

  // Format route to be more readable
  const formatRoute = (namespace: string, route: string): string => {
    return route.replace('/' + namespace, '');
  };

  // Filter endpoints based on selected filter type
  const filteredEndpoints = useMemo(() => {
    if (!endpoints) return [];
    
    if (filterType === 'fitcopilot') {
      return endpoints.filter(endpoint => endpoint.namespace.startsWith('fitcopilot'));
    }
    
    return endpoints;
  }, [endpoints, filterType]);

  // Return a loading state if the data is still loading
  if (isLoading) {
    return (
      <div className="endpoints-table-loading">
        <p>{__('Loading API endpoints...', 'fitcopilot')}</p>
      </div>
    );
  }

  // Return an error state if there was an error
  if (error) {
    return (
      <div className="endpoints-table-error">
        <p>{error}</p>
      </div>
    );
  }

  // Return empty state if no endpoints are available
  if (!endpoints || endpoints.length === 0) {
    return (
      <div className="endpoints-table-empty">
        <p>{__('No API endpoints found.', 'fitcopilot')}</p>
      </div>
    );
  }

  return (
    <div className="endpoints-card">
      <h2>API Endpoints</h2>
      
      <div className="endpoints-filter">
        <label htmlFor="endpoints-filter">{__('Show:', 'fitcopilot')}</label>
        <select 
          id="endpoints-filter"
          className="endpoints-filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'fitcopilot' | 'all')}
        >
          <option value="fitcopilot">{__('Fitcopilot Endpoints', 'fitcopilot')}</option>
          <option value="all">{__('All Endpoints', 'fitcopilot')}</option>
        </select>
        <span className="endpoints-count">
          {filteredEndpoints.length} {filteredEndpoints.length === 1 ? __('endpoint', 'fitcopilot') : __('endpoints', 'fitcopilot')} {__('found', 'fitcopilot')}
        </span>
      </div>

      <div className="endpoints-table-wrapper">
        {filteredEndpoints.length > 0 ? (
          <div className="endpoints-table-container">
            <table className="endpoints-table">
              <thead>
                <tr>
                  <th>{__('Route', 'fitcopilot')}</th>
                  <th>{__('Method', 'fitcopilot')}</th>
                  <th>{__('Callback', 'fitcopilot')}</th>
                  <th>{__('Permission', 'fitcopilot')}</th>
                  <th>{__('Args', 'fitcopilot')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEndpoints.map((endpoint, index) => (
                  <tr key={index}>
                    <td>
                      <code>{endpoint.namespace + formatRoute(endpoint.namespace, endpoint.route)}</code>
                      <button 
                        className="copy-route-button"
                        onClick={() => {
                          navigator.clipboard.writeText(endpoint.namespace + formatRoute(endpoint.namespace, endpoint.route));
                        }}
                        title={__('Copy Route', 'fitcopilot')}
                      >
                        {__('Copy', 'fitcopilot')}
                      </button>
                    </td>
                    <td>{formatMethods(endpoint.methods)}</td>
                    <td>{endpoint.callback}</td>
                    <td>{endpoint.permission}</td>
                    <td>{endpoint.args}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-endpoints-message">
            {__('No endpoints found for the selected filter.', 'fitcopilot')}
          </div>
        )}
      </div>
    </div>
  );
};

export default EndpointsTable; 