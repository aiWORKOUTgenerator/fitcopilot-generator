/**
 * Conflict Resolution Panel Component
 * 
 * Provides user-friendly interface for resolving version conflicts and context isolation issues.
 * Integrates with the Day 1 completion services (ContextIsolationService & VersionManager).
 */
import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Shield, Clock, CheckCircle } from 'lucide-react';
import Button from '../../../../../components/ui/Button/Button';
import Card from '../../../../../components/ui/Card/Card';
import './ConflictResolutionPanel.scss';

interface ConflictResolutionPanelProps {
  // Version conflicts
  hasVersionConflicts: boolean;
  versionConflicts?: Array<{
    type: 'outdated' | 'modified' | 'deleted';
    field: string;
    localValue: any;
    serverValue: any;
    lastModified: string;
  }>;
  
  // Context isolation conflicts
  hasIsolationConflicts: boolean;
  isolationConflicts?: Array<{
    type: 'provider_conflict' | 'hook_collision' | 'state_interference';
    component: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  
  // Resolution callbacks
  onResolveVersionConflicts: () => Promise<void>;
  onResolveIsolationConflicts: () => Promise<void>;
  onFetchLatestVersion: () => Promise<void>;
  onEnableIsolation: () => Promise<void>;
  
  // UI state
  isResolving?: boolean;
  className?: string;
}

export const ConflictResolutionPanel: React.FC<ConflictResolutionPanelProps> = ({
  hasVersionConflicts,
  versionConflicts = [],
  hasIsolationConflicts,
  isolationConflicts = [],
  onResolveVersionConflicts,
  onResolveIsolationConflicts,
  onFetchLatestVersion,
  onEnableIsolation,
  isResolving = false,
  className = ''
}) => {
  const [resolutionStep, setResolutionStep] = useState<'detecting' | 'resolving' | 'complete'>('detecting');
  const [activeTab, setActiveTab] = useState<'version' | 'isolation'>('version');

  // Don't render if no conflicts
  if (!hasVersionConflicts && !hasIsolationConflicts) {
    return null;
  }

  const handleResolveAll = async () => {
    setResolutionStep('resolving');
    
    try {
      if (hasVersionConflicts) {
        await onResolveVersionConflicts();
      }
      
      if (hasIsolationConflicts) {
        await onResolveIsolationConflicts();
      }
      
      setResolutionStep('complete');
      
      // Auto-hide after success
      setTimeout(() => {
        setResolutionStep('detecting');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to resolve conflicts:', error);
      setResolutionStep('detecting');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="conflict-icon conflict-icon--high" size={16} />;
      case 'medium': return <Shield className="conflict-icon conflict-icon--medium" size={16} />;
      case 'low': return <Clock className="conflict-icon conflict-icon--low" size={16} />;
      default: return <AlertTriangle className="conflict-icon" size={16} />;
    }
  };

  return (
    <Card className={`conflict-resolution-panel ${className}`}>
      <div className="conflict-panel-header">
        <div className="conflict-panel-title">
          <AlertTriangle className="conflict-panel-icon" size={20} />
          <h3>Conflict Resolution Required</h3>
        </div>
        
        <div className="conflict-tabs">
          {hasVersionConflicts && (
            <button
              className={`conflict-tab ${activeTab === 'version' ? 'active' : ''}`}
              onClick={() => setActiveTab('version')}
            >
              <RefreshCw size={14} />
              Version ({versionConflicts.length})
            </button>
          )}
          
          {hasIsolationConflicts && (
            <button
              className={`conflict-tab ${activeTab === 'isolation' ? 'active' : ''}`}
              onClick={() => setActiveTab('isolation')}
            >
              <Shield size={14} />
              Isolation ({isolationConflicts.length})
            </button>
          )}
        </div>
      </div>

      <div className="conflict-panel-content">
        {/* Version Conflicts Tab */}
        {activeTab === 'version' && hasVersionConflicts && (
          <div className="conflict-section">
            <div className="section-header">
              <h4>Version Conflicts Detected</h4>
              <p>The workout has been modified elsewhere. Review changes below:</p>
            </div>
            
            <div className="conflict-list">
              {versionConflicts.map((conflict, index) => (
                <div key={index} className={`conflict-item conflict-item--${conflict.type}`}>
                  <div className="conflict-item-header">
                    <span className="conflict-field">{conflict.field}</span>
                    <span className={`conflict-type conflict-type--${conflict.type}`}>
                      {conflict.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="conflict-values">
                    <div className="conflict-value">
                      <label>Your Version:</label>
                      <div className="value-content">{JSON.stringify(conflict.localValue)}</div>
                    </div>
                    <div className="conflict-value">
                      <label>Server Version:</label>
                      <div className="value-content">{JSON.stringify(conflict.serverValue)}</div>
                    </div>
                  </div>
                  
                  <div className="conflict-meta">
                    <span>Last modified: {conflict.lastModified}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="conflict-actions">
              <Button 
                variant="outline" 
                onClick={onFetchLatestVersion}
                disabled={isResolving}
              >
                <RefreshCw size={14} />
                Fetch Latest
              </Button>
            </div>
          </div>
        )}

        {/* Isolation Conflicts Tab */}
        {activeTab === 'isolation' && hasIsolationConflicts && (
          <div className="conflict-section">
            <div className="section-header">
              <h4>Context Isolation Issues</h4>
              <p>Component conflicts detected that may affect editor functionality:</p>
            </div>
            
            <div className="conflict-list">
              {isolationConflicts.map((conflict, index) => (
                <div key={index} className={`conflict-item conflict-item--${conflict.severity}`}>
                  <div className="conflict-item-header">
                    {getSeverityIcon(conflict.severity)}
                    <span className="conflict-component">{conflict.component}</span>
                    <span className={`conflict-severity conflict-severity--${conflict.severity}`}>
                      {conflict.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="conflict-description">
                    {conflict.description}
                  </div>
                  
                  <div className="conflict-type-info">
                    Type: {conflict.type.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="conflict-actions">
              <Button 
                variant="outline" 
                onClick={onEnableIsolation}
                disabled={isResolving}
              >
                <Shield size={14} />
                Enable Isolation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Resolution Actions */}
      <div className="conflict-panel-footer">
        {resolutionStep === 'detecting' && (
          <div className="resolution-actions">
            <Button 
              variant="primary" 
              onClick={handleResolveAll}
              disabled={isResolving}
              className="resolve-all-btn"
            >
              {isResolving ? (
                <>
                  <RefreshCw className="spin" size={14} />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Resolve All Conflicts
                </>
              )}
            </Button>
            
            <div className="resolution-help">
              <small>This will automatically resolve conflicts using the latest data and enable proper isolation.</small>
            </div>
          </div>
        )}
        
        {resolutionStep === 'resolving' && (
          <div className="resolution-progress">
            <div className="progress-indicator">
              <RefreshCw className="spin" size={20} />
              <span>Resolving conflicts...</span>
            </div>
          </div>
        )}
        
        {resolutionStep === 'complete' && (
          <div className="resolution-success">
            <CheckCircle className="success-icon" size={20} />
            <span>All conflicts resolved successfully!</span>
          </div>
        )}
      </div>
    </Card>
  );
}; 