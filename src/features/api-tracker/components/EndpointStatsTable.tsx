import React, { useState, useEffect, useRef, useCallback } from 'react';
import { __ } from '../utils/wordpress-polyfills';
import { EndpointStat, EndpointStatsTableProps } from '../types';
import ReactDOM from 'react-dom';

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  children, 
  defaultExpanded = false 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className="api-tracker-collapsible-section" style={{
      marginBottom: '15px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div 
        className="api-tracker-section-header" 
        data-expanded={isExpanded ? 'true' : 'false'}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '10px 15px',
          backgroundColor: '#f5f5f5',
          borderBottom: isExpanded ? '1px solid #ddd' : 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600
        }}
      >
        {title} <span className="expand-icon" style={{ fontSize: '16px' }}>{isExpanded ? '−' : '+'}</span>
      </div>
      <div 
        className={`api-tracker-section-content ${isExpanded ? '' : 'hidden'}`}
        style={{
          padding: isExpanded ? '15px' : '0',
          maxHeight: isExpanded ? '500px' : '0',
          overflow: 'auto',
          transition: 'all 0.3s ease',
          display: isExpanded ? 'block' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// JSON Formatter with syntax highlighting
const JsonFormatter = ({ data }: { data: any }) => {
  if (!data) return <div>No data available</div>;
  
  const formatJson = (json: any): string => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return String(json);
    }
  };
  
  return (
    <pre style={{
      backgroundColor: '#f8f8f8',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #eee',
      fontSize: '13px',
      lineHeight: '1.4',
      overflow: 'auto',
      maxHeight: '300px',
      color: '#333',
      fontFamily: 'monospace'
    }}>
      {formatJson(data)}
    </pre>
  );
};

// KeyValue Component for displaying paired information
const KeyValue = ({ 
  label, 
  value, 
  valueComponent 
}: { 
  label: string; 
  value?: any; 
  valueComponent?: React.ReactNode;
}) => (
  <div style={{ marginBottom: '8px' }}>
    <strong style={{ display: 'inline-block', minWidth: '140px', marginRight: '10px' }}>{label}:</strong>
    {valueComponent || <span>{value || 'Not available'}</span>}
  </div>
);

// Error Category Badge
const ErrorCategoryBadge = ({ category }: { category: string }) => {
  let backgroundColor = '#f8f8f8';
  let textColor = '#333';
  
  switch (category.toLowerCase()) {
    case 'authentication':
      backgroundColor = '#ffe8e8';
      textColor = '#d63638';
      break;
    case 'authorization':
      backgroundColor = '#fff8e8';
      textColor = '#996600';
      break;
    case 'server':
      backgroundColor = '#e8e8ff';
      textColor = '#3366cc';
      break;
    case 'client':
      backgroundColor = '#e8fff0';
      textColor = '#00994d';
      break;
    case 'validation':
      backgroundColor = '#f0e8ff';
      textColor = '#6600cc';
      break;
    default:
      backgroundColor = '#f8f8f8';
      textColor = '#666';
  }
  
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: '12px',
      backgroundColor,
      color: textColor,
      fontSize: '12px',
      fontWeight: 600
    }}>
      {category}
    </span>
  );
};

// ErrorModal component using Portal
const ErrorModal = ({ 
  isOpen, 
  onClose, 
  endpoint 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  endpoint: EndpointStat | null;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  
  // Mock data for demonstration, would come from backend in real implementation
  const mockErrorData = endpoint?.errors?.lastError ? {
    errorId: `err-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: endpoint.errors.lastError.time,
    endpointPath: endpoint.namespace + endpoint.route,
    statusCode: endpoint.errors.lastError.code || '500',
    category: getErrorCategory(endpoint.errors.lastError.code),
    
    requestMethod: endpoint.method,
    requestHeaders: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': 'abc123def456',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    requestParams: {
      query: { per_page: 10, page: 1 },
      body: endpoint.method !== 'GET' ? { title: 'Example data', content: 'Test content' } : null
    },
    userContext: {
      id: 1,
      role: 'administrator',
      capabilities: ['manage_options', 'edit_posts']
    },
    requestSource: 'admin',
    
    responseHeaders: {
      'Content-Type': 'application/json',
      'X-WP-Total': '42',
      'X-WP-TotalPages': '5'
    },
    errorMessage: endpoint.errors.lastError.message,
    rawResponse: {
      code: endpoint.errors.lastError.code,
      message: endpoint.errors.lastError.message,
      data: { status: parseInt(endpoint.errors.lastError.code) || 500 }
    },
    processingTime: (Math.random() * 100 + 50).toFixed(2) + 'ms',
    
    stackTrace: [
      `PHP Fatal error: Uncaught Exception: Invalid data format in /wp-content/plugins/fitcopilot/includes/api/class-api-handler.php:256`,
      `Stack trace:`,
      `#0 /wp-includes/rest-api/class-wp-rest-server.php(1182): FitCopilot\\API\\APIHandler->process_request(Array)`,
      `#1 /wp-includes/rest-api/class-wp-rest-server.php(1029): WP_REST_Server->respond_to_request(Object(WP_REST_Request))`,
      `#2 /wp-includes/rest-api.php(522): WP_REST_Server->dispatch(Object(WP_REST_Request))`,
      `#3 /wp-includes/rest-api.php(1730): rest_do_request(Object(WP_REST_Request))`,
      `#4 {main}`
    ].join("\n"),
    wpHooks: [
      'rest_pre_dispatch',
      'rest_request_before_callbacks',
      'rest_request_after_callbacks',
      'rest_post_dispatch'
    ],
    dbQueries: [
      "SELECT * FROM wp_options WHERE option_name = 'fitcopilot_settings' LIMIT 1",
      "SELECT ID, post_title FROM wp_posts WHERE post_type = 'workout' AND post_status = 'publish' LIMIT 10"
    ],
    memoryUsage: '24.5 MB / 40 MB (61.25%)',
    
    similarErrors: [
      { id: 'err-abc123', endpoint: '/wp/v2/posts', timestamp: '2023-05-10 14:32:19' },
      { id: 'err-def456', endpoint: '/fitcopilot/v1/workouts', timestamp: '2023-05-09 08:12:45' }
    ],
    commonSolutions: [
      'Verify authentication credentials are properly set',
      'Check API route permissions in REST API controller',
      'Ensure required parameters are provided in correct format'
    ],
    docsLinks: [
      { title: 'WordPress REST API Handbook', url: 'https://developer.wordpress.org/rest-api/' },
      { title: 'FitCopilot API Documentation', url: '#docs-tab' }
    ]
  } : null;
  
  // Helper to determine error category based on code
  function getErrorCategory(code: string | undefined): string {
    if (!code) return 'Unknown';
    
    const codeNum = parseInt(code);
    
    if (codeNum >= 400 && codeNum < 404) return 'Authentication';
    if (codeNum === 404) return 'Not Found';
    if (codeNum === 403) return 'Authorization';
    if (codeNum >= 400 && codeNum < 500) return 'Client';
    if (codeNum >= 500) return 'Server';
    
    return 'Unknown';
  }
  
  // Format date for display
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'Never';

    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateStr || 'Never';
    }
  };
  
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    
    // Save the currently focused element to restore focus later
    lastFocusedElement.current = document.activeElement as HTMLElement;
    
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // Focus the modal when it opens
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    // Add event listener for ESC key
    document.addEventListener('keydown', handleEscKey);
    
    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Don't render anything if the modal is not open
  if (!isOpen || !endpoint) return null;
  
  // Use ReactDOM.createPortal to render the modal directly to document.body
  return ReactDOM.createPortal(
    <div 
      className="error-modal-backdrop" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 999999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'auto'
      }}
    >
      <div 
        className="error-modal-content" 
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
        style={{
          background: '#fff',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '90vh',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1000000
        }}
      >
        <div className="error-modal-header" style={{
          padding: '15px 20px',
          background: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 id="error-modal-title" style={{ margin: 0, fontSize: '18px' }}>
            {__('Error Details for', 'fitcopilot')} {endpoint.namespace + endpoint.route.replace('/' + endpoint.namespace, '')}
          </h3>
          <button 
            className="close-modal" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }} 
            aria-label={__('Close modal', 'fitcopilot')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>
        
        <div className="error-modal-body" style={{ padding: '20px', overflow: 'auto' }}>
          {mockErrorData ? (
            <>
              {/* 1. Error Overview Section */}
              <CollapsibleSection title={__('Error Overview', 'fitcopilot')} defaultExpanded={true}>
                <div className="error-overview">
                  <KeyValue label={__('Error ID', 'fitcopilot')} value={mockErrorData.errorId} />
                  <KeyValue label={__('Timestamp', 'fitcopilot')} value={formatDate(mockErrorData.timestamp)} />
                  <KeyValue label={__('Endpoint Path', 'fitcopilot')} value={mockErrorData.endpointPath} />
                  <KeyValue label={__('HTTP Status Code', 'fitcopilot')} value={mockErrorData.statusCode} />
                  <KeyValue 
                    label={__('Error Category', 'fitcopilot')} 
                    valueComponent={<ErrorCategoryBadge category={mockErrorData.category} />} 
                  />
                  <KeyValue label={__('Total Occurrences', 'fitcopilot')} value={endpoint.errors?.count || 1} />
                </div>
              </CollapsibleSection>
              
              {/* 2. Request Details Section */}
              <CollapsibleSection title={__('Request Details', 'fitcopilot')}>
                <div className="request-details">
                  <KeyValue label={__('Request Method', 'fitcopilot')} value={mockErrorData.requestMethod} />
                  <KeyValue label={__('Request Source', 'fitcopilot')} value={mockErrorData.requestSource} />
                  
                  <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('Request Headers', 'fitcopilot')}</h4>
                    <JsonFormatter data={mockErrorData.requestHeaders} />
                  </div>
                  
                  <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('Request Parameters', 'fitcopilot')}</h4>
                    <JsonFormatter data={mockErrorData.requestParams} />
                  </div>
                  
                  <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('User Context', 'fitcopilot')}</h4>
                    <JsonFormatter data={mockErrorData.userContext} />
                  </div>
                </div>
              </CollapsibleSection>
              
              {/* 3. Response Analysis */}
              <CollapsibleSection title={__('Response Analysis', 'fitcopilot')}>
                <div className="response-analysis">
                  <KeyValue label={__('Processing Time', 'fitcopilot')} value={mockErrorData.processingTime} />
                  
                  <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('Response Headers', 'fitcopilot')}</h4>
                    <JsonFormatter data={mockErrorData.responseHeaders} />
                  </div>
                  
                  <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('Error Message', 'fitcopilot')}</h4>
                    <div style={{ 
                      padding: '15px', 
                      backgroundColor: '#fff1f0', 
                      border: '1px solid #ffccc7',
                      borderRadius: '4px',
                      color: '#cf1322' 
                    }}>
                      {mockErrorData.errorMessage}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('Raw Response Data', 'fitcopilot')}</h4>
                    <JsonFormatter data={mockErrorData.rawResponse} />
                  </div>
                </div>
              </CollapsibleSection>
              
              {/* 4. Debug Information */}
              <CollapsibleSection title={__('Debug Information', 'fitcopilot')}>
                <div className="debug-information">
                  <KeyValue label={__('Memory Usage', 'fitcopilot')} value={mockErrorData.memoryUsage} />
                  
                  <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('Stack Trace', 'fitcopilot')}</h4>
                    <pre style={{ 
                      backgroundColor: '#2d2d2d', 
                      color: '#f8f8f2',
                      padding: '15px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '300px',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      fontFamily: 'monospace'
                    }}>
                      {mockErrorData.stackTrace}
                    </pre>
                  </div>
                  
                  <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('WordPress Hooks Fired', 'fitcopilot')}</h4>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '5px',
                      marginBottom: '10px'
                    }}>
                      {mockErrorData.wpHooks.map((hook, index) => (
                        <span key={index} style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          backgroundColor: '#f0f0f0',
                          borderRadius: '3px',
                          fontSize: '12px',
                          color: '#555'
                        }}>
                          {hook}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('Database Queries', 'fitcopilot')}</h4>
                    <div style={{
                      backgroundColor: '#f8f8f8',
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      padding: '10px',
                      fontSize: '13px',
                      fontFamily: 'monospace'
                    }}>
                      {mockErrorData.dbQueries.map((query, index) => (
                        <div key={index} style={{
                          padding: '5px 0',
                          borderBottom: index < mockErrorData.dbQueries.length - 1 ? '1px solid #eee' : 'none'
                        }}>
                          {query}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
              
              {/* 5. Troubleshooting Tools */}
              <CollapsibleSection title={__('Troubleshooting Tools', 'fitcopilot')}>
                <div className="troubleshooting-tools">
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('Common Solutions', 'fitcopilot')}</h4>
                    <ul style={{ marginLeft: '20px', color: '#0073aa' }}>
                      {mockErrorData.commonSolutions.map((solution, index) => (
                        <li key={index} style={{ marginBottom: '5px' }}>{solution}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('Similar Errors', 'fitcopilot')}</h4>
                    <div style={{
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      {mockErrorData.similarErrors.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                              <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #eee' }}>{__('Error ID', 'fitcopilot')}</th>
                              <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #eee' }}>{__('Endpoint', 'fitcopilot')}</th>
                              <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #eee' }}>{__('Timestamp', 'fitcopilot')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockErrorData.similarErrors.map((error, index) => (
                              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{error.id}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{error.endpoint}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{error.timestamp}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                          {__('No similar errors found', 'fitcopilot')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{__('Documentation Links', 'fitcopilot')}</h4>
                    <ul style={{ marginLeft: '0', listStyle: 'none' }}>
                      {mockErrorData.docsLinks.map((link, index) => (
                        <li key={index} style={{ marginBottom: '5px' }}>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: '#0073aa',
                              textDecoration: 'none',
                              padding: '5px 10px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '3px',
                              fontSize: '13px'
                            }}
                          >
                            <span style={{ marginRight: '5px' }}>📄</span> {link.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button 
                      style={{
                        backgroundColor: '#0073aa',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span style={{ marginRight: '5px' }}>↻</span>
                      {__('Test Request Again', 'fitcopilot')}
                    </button>
                  </div>
                </div>
              </CollapsibleSection>
            </>
          ) : (
            <p>{__('No detailed error information available for this endpoint.', 'fitcopilot')}</p>
          )}
        </div>
        
        <div className="error-modal-footer" style={{
          padding: '15px 20px',
          background: '#f5f5f5',
          borderTop: '1px solid #ddd',
          textAlign: 'right'
        }}>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }} 
            className="button"
            style={{
              padding: '6px 12px',
              background: '#f6f7f7',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            {__('Close', 'fitcopilot')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/**
 * Component for displaying API endpoint usage statistics
 */
const EndpointStatsTable: React.FC<EndpointStatsTableProps> = ({ stats, isLoading, error }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointStat | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  
  // Reference to table container for event delegation
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Set up event delegation for error buttons
  useEffect(() => {
    const handleErrorButtonClick = (e: MouseEvent) => {
      // Find closest error button if clicking on a child element
      const target = (e.target as HTMLElement).closest('.error-details-button') as HTMLButtonElement;
      
      if (!target) return;
      
      // Prevent default browser behavior
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Error button clicked via delegation:', target);
      
      // Get the endpoint ID from the data attribute
      const endpointId = target.getAttribute('data-endpoint-id');
      if (endpointId && stats && stats.length > parseInt(endpointId, 10)) {
        const endpoint = stats[parseInt(endpointId, 10)];
        console.log('Opening modal for endpoint:', endpoint.route);
        
        // Save reference to clicked element for focus restoration
        lastFocusedElement.current = target;
        
        // Update state
        setSelectedEndpoint(endpoint);
        setShowErrorModal(true);
        
        // Force a direct DOM update as a backup plan
        setTimeout(() => {
          if (!document.querySelector('.error-modal-backdrop') && endpoint) {
            console.log('Modal not found in DOM, creating direct modal');
            createDirectModal(endpoint);
          }
        }, 50);
      }
    };
    
    // Function to create a direct modal in case React state doesn't update
    const createDirectModal = (endpoint: EndpointStat) => {
      // First remove any existing direct modals
      const existingModal = document.getElementById('direct-error-modal');
      if (existingModal) {
        existingModal.remove();
      }
      
      // Create modal container
      const modalContainer = document.createElement('div');
      modalContainer.id = 'direct-error-modal';
      modalContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
      `;
      
      // Create modal content
      modalContainer.innerHTML = `
        <div style="background: #fff; width: 90%; max-width: 800px; max-height: 90vh; border-radius: 4px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); overflow: auto;">
          <div style="padding: 15px 20px; background: #f5f5f5; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 18px;">Error Details for ${endpoint.namespace + endpoint.route.replace('/' + endpoint.namespace, '')}</h3>
            <button id="direct-modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0; color: #666;">×</button>
          </div>
          <div style="padding: 20px;">
            <p><strong>Endpoint:</strong> ${endpoint.method} ${endpoint.route}</p>
            <p><strong>Errors:</strong> ${endpoint.errors?.count || 0}</p>
            <p><strong>Note:</strong> This is a fallback modal created directly in the DOM.</p>
          </div>
          <div style="padding: 15px 20px; background: #f5f5f5; border-top: 1px solid #ddd; text-align: right;">
            <button id="direct-modal-close-btn" style="padding: 6px 12px; background: #f6f7f7; border: 1px solid #ddd; border-radius: 3px; cursor: pointer;">Close</button>
          </div>
        </div>
      `;
      
      // Add to body
      document.body.appendChild(modalContainer);
      
      // Add close event listeners
      document.getElementById('direct-modal-close')?.addEventListener('click', () => {
        modalContainer.remove();
      });
      
      document.getElementById('direct-modal-close-btn')?.addEventListener('click', () => {
        modalContainer.remove();
      });
      
      modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
          modalContainer.remove();
        }
      });
    };
    
    // Add event listener to the document for capturing all error button clicks
    document.addEventListener('click', handleErrorButtonClick, true);
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleErrorButtonClick, true);
    };
  }, [stats]);
  
  // DEBUG: Add global window variable to track state
  useEffect(() => {
    // Add debug object to window for development testing
    if (typeof window !== 'undefined') {
      // Define a type for the global window object
      interface CustomWindow extends Window {
        debugApiTracker?: {
          endpointStats?: {
            showModal: () => void;
            getState: () => { showErrorModal: boolean; selectedEndpoint: EndpointStat | null };
            forceRender: () => void;
            createDirectModal?: () => void;
          };
        };
      }

      // Cast window to CustomWindow
      const customWindow = window as CustomWindow;
      
      // Initialize or update the debug object
      customWindow.debugApiTracker = customWindow.debugApiTracker || {};
      customWindow.debugApiTracker.endpointStats = {
        showModal: () => {
          console.log("MANUAL TRIGGER: Setting modal open");
          if (stats && stats.length > 0) {
            setSelectedEndpoint(stats[0]);
            setShowErrorModal(true);
            
            // Force a direct DOM update as a backup plan
            setTimeout(() => {
              if (!document.querySelector('.error-modal-backdrop') && stats[0]) {
                console.log('Modal not found in DOM after setState, creating direct modal');
                
                // Create modal container
                const modalContainer = document.createElement('div');
                modalContainer.id = 'direct-error-modal';
                modalContainer.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-color: rgba(0, 0, 0, 0.7);
                  z-index: 999999;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                `;
                
                // Create modal content
                modalContainer.innerHTML = `
                  <div style="background: #fff; width: 90%; max-width: 800px; max-height: 90vh; border-radius: 4px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); overflow: auto;">
                    <div style="padding: 15px 20px; background: #f5f5f5; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                      <h3 style="margin: 0; font-size: 18px;">Error Details for ${stats[0].namespace + stats[0].route.replace('/' + stats[0].namespace, '')}</h3>
                      <button id="direct-modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0; color: #666;">×</button>
                    </div>
                    <div style="padding: 20px;">
                      <p><strong>Endpoint:</strong> ${stats[0].method} ${stats[0].route}</p>
                      <p><strong>Errors:</strong> ${stats[0].errors?.count || 0}</p>
                      <p><strong>Note:</strong> This is a fallback modal created via debug function.</p>
                    </div>
                    <div style="padding: 15px 20px; background: #f5f5f5; border-top: 1px solid #ddd; text-align: right;">
                      <button id="direct-modal-close-btn" style="padding: 6px 12px; background: #f6f7f7; border: 1px solid #ddd; border-radius: 3px; cursor: pointer;">Close</button>
                    </div>
                  </div>
                `;
                
                // Add to body
                document.body.appendChild(modalContainer);
                
                // Add close event listeners
                document.getElementById('direct-modal-close')?.addEventListener('click', () => {
                  modalContainer.remove();
                });
                
                document.getElementById('direct-modal-close-btn')?.addEventListener('click', () => {
                  modalContainer.remove();
                });
                
                modalContainer.addEventListener('click', (e) => {
                  if (e.target === modalContainer) {
                    modalContainer.remove();
                  }
                });
              }
            }, 50);
          } else {
            console.error("No stats available for debug modal");
          }
        },
        getState: () => {
          return { showErrorModal, selectedEndpoint };
        },
        forceRender: () => {
          setShowErrorModal(prev => !prev);
          setTimeout(() => setShowErrorModal(prev => !prev), 10);
        },
        createDirectModal: () => {
          if (stats && stats.length > 0) {
            // Create modal container
            const modalContainer = document.createElement('div');
            modalContainer.id = 'direct-error-modal';
            modalContainer.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.7);
              z-index: 999999;
              display: flex;
              justify-content: center;
              align-items: center;
            `;
            
            // Create modal content
            modalContainer.innerHTML = `
              <div style="background: #fff; width: 90%; max-width: 800px; max-height: 90vh; border-radius: 4px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); overflow: auto;">
                <div style="padding: 15px 20px; background: #f5f5f5; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                  <h3 style="margin: 0; font-size: 18px;">Error Details for ${stats[0].namespace + stats[0].route.replace('/' + stats[0].namespace, '')}</h3>
                  <button id="direct-modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0; color: #666;">×</button>
                </div>
                <div style="padding: 20px;">
                  <p><strong>Endpoint:</strong> ${stats[0].method} ${stats[0].route}</p>
                  <p><strong>Errors:</strong> ${stats[0].errors?.count || 0}</p>
                  <p><strong>Note:</strong> This is a direct DOM modal created for debugging.</p>
                </div>
                <div style="padding: 15px 20px; background: #f5f5f5; border-top: 1px solid #ddd; text-align: right;">
                  <button id="direct-modal-close-btn" style="padding: 6px 12px; background: #f6f7f7; border: 1px solid #ddd; border-radius: 3px; cursor: pointer;">Close</button>
                </div>
              </div>
            `;
            
            // Add to body
            document.body.appendChild(modalContainer);
            
            // Add close event listeners
            document.getElementById('direct-modal-close')?.addEventListener('click', () => {
              modalContainer.remove();
            });
            
            document.getElementById('direct-modal-close-btn')?.addEventListener('click', () => {
              modalContainer.remove();
            });
            
            modalContainer.addEventListener('click', (e) => {
              if (e.target === modalContainer) {
                modalContainer.remove();
              }
            });
          }
        }
      };
    }
    
    console.log("EndpointStatsTable MOUNTED. Debug functions attached to window.debugApiTracker.endpointStats");
    return () => {
      console.log("EndpointStatsTable UNMOUNTED");
    };
  }, [stats]);
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("STATE CHANGE - showErrorModal:", showErrorModal);
    console.log("STATE CHANGE - selectedEndpoint:", selectedEndpoint);
  }, [showErrorModal, selectedEndpoint]);

  // Format response time to be readable
  const formatResponseTime = (ms: number): string => {
    if (ms < 1) {
      return `${(ms * 1000).toFixed(2)} μs`;
    }
    return `${ms.toFixed(2)} ms`;
  };

  // Format last called date
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'Never';

    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr || 'Never';
    }
  };

  // Format health percentage with color coding
  const getHealthStatus = (health: number) => {
    let statusClass = 'health-unknown';
    let statusIcon = '❓';

    if (health >= 98) {
      statusClass = 'health-excellent';
      statusIcon = '✅';
    } else if (health >= 90) {
      statusClass = 'health-good';
      statusIcon = '✅';
    } else if (health >= 75) {
      statusClass = 'health-fair';
      statusIcon = '⚠️';
    } else if (health >= 0) {
      statusClass = 'health-poor';
      statusIcon = '❌';
    }

    return (
      <span className={`health-indicator ${statusClass}`}>
        {statusIcon} {health.toFixed(1)}%
      </span>
    );
  };

  // Handle showing error details - now uses multiple approaches
  const showErrorDetails = useCallback((endpoint: EndpointStat, e: React.MouseEvent) => {
    if (e) {
      // Prevent default behavior and stop propagation
      e.preventDefault();
      e.stopPropagation();
      
      console.log("View error details clicked for endpoint:", endpoint.route);
      alert("View error details clicked for: " + endpoint.route + ". Opening modal...");
      
      // Save reference to clicked element for focus restoration
      lastFocusedElement.current = e.target as HTMLElement;
    }
    
    setSelectedEndpoint(endpoint);
    setShowErrorModal(true);
    
    // Force a direct DOM update as a backup plan
    setTimeout(() => {
      if (!document.querySelector('.error-modal-backdrop') && endpoint) {
        console.log('Modal not found in DOM after setState, creating direct modal');
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.id = 'direct-error-modal';
        modalContainer.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 999999;
          display: flex;
          justify-content: center;
          align-items: center;
        `;
        
        // Create modal content
        modalContainer.innerHTML = `
          <div style="background: #fff; width: 90%; max-width: 800px; max-height: 90vh; border-radius: 4px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); overflow: auto;">
            <div style="padding: 15px 20px; background: #f5f5f5; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="margin: 0; font-size: 18px;">Error Details for ${endpoint.namespace + endpoint.route.replace('/' + endpoint.namespace, '')}</h3>
              <button id="direct-modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0; color: #666;">×</button>
            </div>
            <div style="padding: 20px;">
              <p><strong>Endpoint:</strong> ${endpoint.method} ${endpoint.route}</p>
              <p><strong>Errors:</strong> ${endpoint.errors?.count || 0}</p>
              <p><strong>Note:</strong> This is a fallback modal created via direct DOM manipulation.</p>
            </div>
            <div style="padding: 15px 20px; background: #f5f5f5; border-top: 1px solid #ddd; text-align: right;">
              <button id="direct-modal-close-btn" style="padding: 6px 12px; background: #f6f7f7; border: 1px solid #ddd; border-radius: 3px; cursor: pointer;">Close</button>
            </div>
          </div>
        `;
        
        // Add to body
        document.body.appendChild(modalContainer);
        
        // Add close event listeners
        document.getElementById('direct-modal-close')?.addEventListener('click', () => {
          modalContainer.remove();
        });
        
        document.getElementById('direct-modal-close-btn')?.addEventListener('click', () => {
          modalContainer.remove();
        });
        
        modalContainer.addEventListener('click', (e) => {
          if (e.target === modalContainer) {
            modalContainer.remove();
          }
        });
      }
    }, 50);
  }, []);

  // Close error modal
  const closeErrorModal = useCallback(() => {
    console.log("Closing error modal");
    setShowErrorModal(false);
    
    // Also remove any direct DOM modals
    const directModal = document.getElementById('direct-error-modal');
    if (directModal) {
      directModal.remove();
    }
    
    // Return focus to button when modal closes
    setTimeout(() => {
      if (lastFocusedElement.current) {
        console.log("Restoring focus to:", lastFocusedElement.current);
        lastFocusedElement.current.focus();
      }
    }, 10);
  }, []);

  // Return a loading state if the data is still loading
  if (isLoading) {
    return (
      <div className="endpoints-table-loading">
        <p>{__('Loading API usage statistics...', 'fitcopilot')}</p>
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

  // Return empty state if no stats are available
  if (!stats || stats.length === 0) {
    return (
      <div className="no-endpoints-message">
        <p>{__('No API usage statistics available. Endpoints will appear here after they have been called.', 'fitcopilot')}</p>
      </div>
    );
  }

  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-controls" style={{background: "#ffe", padding: "10px", marginBottom: "10px", border: "1px solid #ccc"}}>
          <button
            onClick={() => {
              console.log("Debug button clicked");
              if (stats && stats.length > 0) {
                showErrorDetails(stats[0], {} as React.MouseEvent);
              } else {
                console.error("No stats available for debug modal");
              }
            }}
            style={{padding: "5px 10px", background: "red", color: "white"}}
          >
            DEBUG: Open Modal
          </button>
          <button
            onClick={() => {
              // @ts-ignore
              if (window.debugApiTracker?.endpointStats?.createDirectModal) {
                // @ts-ignore
                window.debugApiTracker.endpointStats.createDirectModal();
              }
            }}
            style={{padding: "5px 10px", background: "blue", color: "white", marginLeft: "10px"}}
          >
            DEBUG: Direct DOM Modal
          </button>
        </div>
      )}
    
      <div className="endpoints-table-container" ref={tableContainerRef}>
        <table className="endpoints-table stats-table">
          <thead>
            <tr>
              <th>{__('Route', 'fitcopilot')}</th>
              <th>{__('Method', 'fitcopilot')}</th>
              <th>{__('Calls', 'fitcopilot')}</th>
              <th>{__('Health', 'fitcopilot')}</th>
              <th>{__('Avg. Response Time', 'fitcopilot')}</th>
              <th>{__('Last Called', 'fitcopilot')}</th>
              <th>{__('Actions', 'fitcopilot')}</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => (
              <tr key={index}>
                <td><code>{stat.namespace + stat.route.replace('/' + stat.namespace, '')}</code></td>
                <td>{stat.method}</td>
                <td>{stat.calls}</td>
                <td>{getHealthStatus(stat.health)}</td>
                <td>{formatResponseTime(stat.responseTime)}</td>
                <td>{formatDate(stat.lastCalled)}</td>
                <td>
                  {stat.errors && stat.errors.count > 0 && (
                    <button 
                      className="error-details-button"
                      onClick={(e) => showErrorDetails(stat, e)} 
                      title={__('View Error Details', 'fitcopilot')}
                      type="button"
                      data-endpoint-id={index.toString()}
                      aria-label={__('View Error Details for', 'fitcopilot') + ' ' + stat.route}
                      style={{
                        cursor: 'pointer',
                        background: '#ffeeee',
                        color: '#990000',
                        padding: '5px 10px',
                        border: '1px solid #cc0000',
                        borderRadius: '3px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {__('View Errors', 'fitcopilot')} ({stat.errors.count})
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Use the Portal-based modal component with inline styles */}
      <ErrorModal 
        isOpen={showErrorModal}
        onClose={closeErrorModal}
        endpoint={selectedEndpoint}
      />
    </>
  );
};

export default EndpointStatsTable; 