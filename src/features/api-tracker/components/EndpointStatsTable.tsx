import React, { useState, useEffect, useRef, useCallback } from 'react';
import { __ } from '../utils/wordpress-polyfills';
import { EndpointStat, EndpointStatsTableProps } from '../types';
import ReactDOM from 'react-dom';

// Error Modal component using Portal
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
        minute: '2-digit'
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
          maxWidth: '800px',
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
          {endpoint.errors?.lastError ? (
            <>
              <div className="error-summary" style={{ marginBottom: '20px' }}>
                <p><strong>{__('Total Errors', 'fitcopilot')}:</strong> {endpoint.errors.count}</p>
                <p><strong>{__('Last Error Time', 'fitcopilot')}:</strong> {formatDate(endpoint.errors.lastError.time)}</p>
                <p><strong>{__('Error Code', 'fitcopilot')}:</strong> {endpoint.errors.lastError.code}</p>
              </div>
              <div className="error-message">
                <h4 style={{ marginTop: 0, marginBottom: '10px' }}>{__('Error Message', 'fitcopilot')}</h4>
                <pre style={{
                  background: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '3px',
                  border: '1px solid #ddd',
                  overflowX: 'auto',
                  maxHeight: '300px',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap'
                }}>{endpoint.errors.lastError.message}</pre>
              </div>
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