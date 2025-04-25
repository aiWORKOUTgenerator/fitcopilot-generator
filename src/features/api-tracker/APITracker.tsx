import React, { useState, useEffect, useRef } from 'react';
import { apiFetch, addQueryArgs, __ } from './utils/wordpress-polyfills';
import ReactDOM from 'react-dom';

// Components
import { SummaryCard, TokenCostSetting, UsageChart, ResetStats, EndpointsTable, EndpointStatsTable } from './components';

// Types
import { APISummary, DailyStats, MonthlyStats, ApiEndpoint, EndpointStat } from './types/index';

// CSS
import './styles/api-tracker.css';

// Define tab types
type TabType = 'endpoints' | 'usage-stats' | 'docs';

const APITracker: React.FC = () => {
  // References for tab elements
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<{
    buttons: NodeListOf<HTMLButtonElement> | null;
    contents: HTMLDivElement[];
  }>({
    buttons: null,
    contents: []
  });

  // Hide debug info when component renders
  useEffect(() => {
    const debugInfo = document.querySelector('.debug-info');
    if (debugInfo && debugInfo instanceof HTMLElement) {
      debugInfo.style.display = 'none';
      console.log('Debug info panel hidden');
    }
  }, []);

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>('endpoints');

  // State for API data
  const [summary, setSummary] = useState<APISummary | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [endpointStats, setEndpointStats] = useState<EndpointStat[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState({
    summary: true,
    daily: true,
    monthly: true,
    endpoints: true,
    endpointStats: true,
  });

  // Error states
  const [error, setError] = useState<{
    summary: string | null;
    daily: string | null;
    monthly: string | null;
    endpoints: string | null;
    endpointStats: string | null;
  }>({
    summary: null,
    daily: null,
    monthly: null,
    endpoints: null,
    endpointStats: null,
  });

  // Set up custom event delegation for tabs
  useEffect(() => {
    if (!tabContainerRef.current) return;

    const handleTabClick = (e: MouseEvent) => {
      // Find closest tab button if clicking on a child element
      const target = (e.target as HTMLElement).closest('[data-tab-target]') as HTMLElement;
      
      if (!target) return;
      
      // Prevent default browser behavior
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Tab clicked via delegation:', target);
      
      // Get the tab type from the data attribute
      const tabType = target.getAttribute('data-tab-target') as TabType;
      if (tabType) {
        setActiveTab(tabType);
        console.log('Tab changed to:', tabType);
      }
    };

    // Add event listener to the container instead of individual tabs
    tabContainerRef.current.addEventListener('click', handleTabClick);

    // Store references to tab buttons
    tabsRef.current.buttons = document.querySelectorAll('.api-tracker-tab');
    
    // Clean up event listener
    return () => {
      if (tabContainerRef.current) {
        tabContainerRef.current.removeEventListener('click', handleTabClick);
      }
    };
  }, []);

  // Update active tab styling directly in DOM when activeTab changes
  useEffect(() => {
    if (tabsRef.current.buttons) {
      tabsRef.current.buttons.forEach(button => {
        const tabType = button.getAttribute('data-tab-target');
        if (tabType === activeTab) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    }
    
    // Also track the active tab via console for debugging
    console.log('Active tab updated:', activeTab);
  }, [activeTab]);

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

  // Fetch API endpoints
  const fetchEndpoints = async () => {
    setIsLoading(prev => ({ ...prev, endpoints: true }));
    try {
      console.log('Fetching API endpoints');
      const response = await apiFetch({
        path: 'fitcopilot/v1/api-tracker/endpoints',
        method: 'GET',
      });

      console.log('Endpoints response:', response);
      if (response.success) {
        setEndpoints(response.data);
      } else {
        setError(prev => ({ ...prev, endpoints: response.message || 'Failed to load API endpoints' }));
      }
    } catch (err) {
      console.error('Error fetching API endpoints:', err);
      setError(prev => ({ ...prev, endpoints: 'Failed to load API endpoints' }));
    } finally {
      setIsLoading(prev => ({ ...prev, endpoints: false }));
    }
  };

  // Fetch endpoint stats
  const fetchEndpointStats = async () => {
    setIsLoading(prev => ({ ...prev, endpointStats: true }));
    try {
      console.log('Fetching endpoint stats');
      
      // For now, generate mock data based on endpoints
      // In a real implementation, this would come from the API
      if (endpoints && endpoints.length > 0) {
        // Generate some sample data based on the actual endpoints
        const mockStats: EndpointStat[] = endpoints.map(endpoint => {
          const calls = Math.floor(Math.random() * 1000);
          const health = Math.random() * 100;
          const responseTime = Math.random() * 400;
          const hasErrors = Math.random() > 0.7;
          
          return {
            route: endpoint.route,
            namespace: endpoint.namespace,
            method: Object.keys(endpoint.methods)[0] || 'GET',
            calls,
            health,
            responseTime,
            lastCalled: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
            ...(hasErrors ? {
              errors: {
                count: Math.floor(Math.random() * 10),
                lastError: {
                  code: '500',
                  message: 'Internal server error occurred during processing',
                  time: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString()
                }
              }
            } : {})
          };
        });
        
        setEndpointStats(mockStats);
      } else {
        setEndpointStats([]);
      }
    } catch (err) {
      console.error('Error fetching endpoint stats:', err);
      setError(prev => ({ ...prev, endpointStats: 'Failed to load endpoint stats' }));
    } finally {
      setIsLoading(prev => ({ ...prev, endpointStats: false }));
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
        fetchEndpoints();
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
    fetchEndpoints();
  }, []);

  // Once endpoints are loaded, generate mock stats
  useEffect(() => {
    if (endpoints.length > 0 && isLoading.endpoints === false) {
      fetchEndpointStats();
    }
  }, [endpoints, isLoading.endpoints]);

  return (
    <div className="fitcopilot-api-tracker">
      <div className="api-tracker-header">
        <h1>{__('API Usage Tracker', 'fitcopilot')}</h1>
      </div>

      <div className="api-tracker-tabs" ref={tabContainerRef}>
        <button 
          className={`api-tracker-tab ${activeTab === 'endpoints' ? 'active' : ''}`}
          data-tab-target="endpoints"
          type="button"
        >
          {__('Endpoints', 'fitcopilot')}
        </button>
        <button 
          className={`api-tracker-tab ${activeTab === 'usage-stats' ? 'active' : ''}`}
          data-tab-target="usage-stats"
          type="button"
        >
          {__('Usage Statistics', 'fitcopilot')}
        </button>
        <button 
          className={`api-tracker-tab ${activeTab === 'docs' ? 'active' : ''}`}
          data-tab-target="docs"
          type="button"
        >
          {__('Documentation', 'fitcopilot')}
        </button>
      </div>

      <div className="api-tracker-container">
        <div className="api-tracker-section" style={{ display: activeTab === 'endpoints' ? 'block' : 'none' }}>
          <div className="api-tracker-card endpoints-card">
            <h2>{__('REST API Endpoints', 'fitcopilot')}</h2>
            <EndpointsTable 
              endpoints={endpoints}
              isLoading={isLoading.endpoints}
              error={error.endpoints}
            />
          </div>
        </div>

        <div className="api-tracker-section" style={{ display: activeTab === 'usage-stats' ? 'block' : 'none' }}>
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

          <div className="api-tracker-card">
            <h2>{__('Endpoint Performance', 'fitcopilot')}</h2>
            <EndpointStatsTable 
              stats={endpointStats}
              isLoading={isLoading.endpointStats}
              error={error.endpointStats}
            />
          </div>
        </div>

        <div className="api-tracker-section" style={{ display: activeTab === 'docs' ? 'block' : 'none' }}>
          <div className="api-tracker-card docs-card">
            <h2>{__('API Tracker Documentation', 'fitcopilot')}</h2>
            
            <div className="api-docs-section">
              <h3>{__('Overview', 'fitcopilot')}</h3>
              <p>{__('The API Tracker provides visibility into your WordPress REST API endpoints and their usage statistics. It helps you monitor API consumption, performance, and token costs.', 'fitcopilot')}</p>
            </div>
            
            <div className="api-docs-section">
              <h3>{__('Endpoints Tab', 'fitcopilot')}</h3>
              <p>{__('The Endpoints tab displays all registered REST API endpoints related to FitCopilot, their HTTP methods, callbacks, and required arguments.', 'fitcopilot')}</p>
              <ul>
                <li><strong>{__('Route', 'fitcopilot')}</strong>: {__('The full URL path that handles the request', 'fitcopilot')}</li>
                <li><strong>{__('Method', 'fitcopilot')}</strong>: {__('The HTTP method (GET, POST, PUT, DELETE, etc.)', 'fitcopilot')}</li>
                <li><strong>{__('Callback', 'fitcopilot')}</strong>: {__('The function that processes the request', 'fitcopilot')}</li>
                <li><strong>{__('Permission', 'fitcopilot')}</strong>: {__('The function that checks if the user has permission', 'fitcopilot')}</li>
                <li><strong>{__('Args', 'fitcopilot')}</strong>: {__('Parameters the endpoint accepts', 'fitcopilot')}</li>
              </ul>
            </div>
            
            <div className="api-docs-section">
              <h3>{__('Usage Statistics Tab', 'fitcopilot')}</h3>
              <p>{__('The Usage Statistics tab shows real-time data about your API usage:', 'fitcopilot')}</p>
              <ul>
                <li><strong>{__('Summary Card', 'fitcopilot')}</strong>: {__('Displays total API calls, token usage, and estimated costs', 'fitcopilot')}</li>
                <li><strong>{__('Token Cost', 'fitcopilot')}</strong>: {__('Configure the cost per 1,000 tokens to calculate accurate cost estimates', 'fitcopilot')}</li>
                <li><strong>{__('Daily Usage', 'fitcopilot')}</strong>: {__('Chart showing API usage over the last 30 days', 'fitcopilot')}</li>
                <li><strong>{__('Monthly Usage', 'fitcopilot')}</strong>: {__('Chart showing API usage over the last 12 months', 'fitcopilot')}</li>
                <li><strong>{__('Endpoint Performance', 'fitcopilot')}</strong>: {__('Detailed statistics for each endpoint, including call count, health status, and response times', 'fitcopilot')}</li>
              </ul>
            </div>
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