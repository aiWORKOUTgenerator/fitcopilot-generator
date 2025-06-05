/**
 * Dashboard Settings Component
 * 
 * Comprehensive settings panel for dashboard customization including theme preferences,
 * layout options, notification settings, and user preferences.
 */
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Palette, 
  Layout, 
  Bell, 
  User, 
  Monitor, 
  Moon, 
  Sun,
  Grid,
  List,
  Save,
  RefreshCw,
  X
} from 'lucide-react';
import Button from '../../../components/ui/Button/Button';
import Card from '../../../components/ui/Card/Card';
import './DashboardSettings.scss';

export interface DashboardSettingsData {
  // Theme settings
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  
  // Layout settings
  sidebarPosition: 'left' | 'right';
  workoutGridLayout: 'grid' | 'list';
  compactMode: boolean;
  
  // Notification settings
  showSuccessMessages: boolean;
  showErrorMessages: boolean;
  autoHideNotifications: boolean;
  notificationDuration: number;
  
  // Workout preferences
  defaultWorkoutView: 'simple' | 'detailed';
  showAdvancedFilters: boolean;
  autoSaveWorkouts: boolean;
  confirmDeleteActions: boolean;
  
  // Privacy settings
  shareWorkoutHistory: boolean;
  allowAnalytics: boolean;
}

export interface DashboardSettingsProps {
  isOpen: boolean;
  settings: DashboardSettingsData;
  onClose: () => void;
  onSettingsChange: (settings: DashboardSettingsData) => void;
  onSave: (settings: DashboardSettingsData) => Promise<void>;
  onReset: () => void;
  isSaving?: boolean;
  className?: string;
}

const DEFAULT_SETTINGS: DashboardSettingsData = {
  theme: 'system',
  accentColor: '#6366f1',
  sidebarPosition: 'left',
  workoutGridLayout: 'grid',
  compactMode: false,
  showSuccessMessages: true,
  showErrorMessages: true,
  autoHideNotifications: true,
  notificationDuration: 5000,
  defaultWorkoutView: 'detailed',
  showAdvancedFilters: false,
  autoSaveWorkouts: true,
  confirmDeleteActions: true,
  shareWorkoutHistory: false,
  allowAnalytics: true
};

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#10b981' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Teal', value: '#14b8a6' }
];

export const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  isOpen,
  settings,
  onClose,
  onSettingsChange,
  onSave,
  onReset,
  isSaving = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'layout' | 'notifications' | 'preferences' | 'privacy'>('appearance');
  const [localSettings, setLocalSettings] = useState<DashboardSettingsData>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(changed);
  }, [localSettings, settings]);

  // Handle setting changes
  const updateSetting = <K extends keyof DashboardSettingsData>(
    key: K, 
    value: DashboardSettingsData[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  // Handle save
  const handleSave = async () => {
    await onSave(localSettings);
    setHasChanges(false);
  };

  // Handle reset
  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    onReset();
    setHasChanges(true);
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`dashboard-settings-overlay ${className}`}>
      <div className="dashboard-settings-modal">
        <div className="settings-header">
          <div className="settings-title">
            <Settings size={24} />
            <h2>Dashboard Settings</h2>
          </div>
          
          <button 
            className="settings-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          {/* Tab Navigation */}
          <div className="settings-tabs">
            <button
              className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <Palette size={16} />
              Appearance
            </button>
            
            <button
              className={`settings-tab ${activeTab === 'layout' ? 'active' : ''}`}
              onClick={() => setActiveTab('layout')}
            >
              <Layout size={16} />
              Layout
            </button>
            
            <button
              className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={16} />
              Notifications
            </button>
            
            <button
              className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <User size={16} />
              Preferences
            </button>
            
            <button
              className={`settings-tab ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <User size={16} />
              Privacy
            </button>
          </div>

          {/* Tab Content */}
          <div className="settings-tab-content">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h3>Appearance Settings</h3>
                
                {/* Theme Selection */}
                <div className="setting-group">
                  <label className="setting-label">Theme</label>
                  <div className="theme-options">
                    <button
                      className={`theme-option ${localSettings.theme === 'light' ? 'active' : ''}`}
                      onClick={() => updateSetting('theme', 'light')}
                    >
                      <Sun size={16} />
                      Light
                    </button>
                    
                    <button
                      className={`theme-option ${localSettings.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => updateSetting('theme', 'dark')}
                    >
                      <Moon size={16} />
                      Dark
                    </button>
                    
                    <button
                      className={`theme-option ${localSettings.theme === 'system' ? 'active' : ''}`}
                      onClick={() => updateSetting('theme', 'system')}
                    >
                      <Monitor size={16} />
                      System
                    </button>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="setting-group">
                  <label className="setting-label">Accent Color</label>
                  <div className="color-palette">
                    {ACCENT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        className={`color-option ${localSettings.accentColor === color.value ? 'active' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => updateSetting('accentColor', color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <div className="settings-section">
                <h3>Layout Settings</h3>
                
                {/* Workout Grid Layout */}
                <div className="setting-group">
                  <label className="setting-label">Workout Display</label>
                  <div className="layout-options">
                    <button
                      className={`layout-option ${localSettings.workoutGridLayout === 'grid' ? 'active' : ''}`}
                      onClick={() => updateSetting('workoutGridLayout', 'grid')}
                    >
                      <Grid size={16} />
                      Grid View
                    </button>
                    
                    <button
                      className={`layout-option ${localSettings.workoutGridLayout === 'list' ? 'active' : ''}`}
                      onClick={() => updateSetting('workoutGridLayout', 'list')}
                    >
                      <List size={16} />
                      List View
                    </button>
                  </div>
                </div>

                {/* Compact Mode */}
                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={localSettings.compactMode}
                      onChange={(e) => updateSetting('compactMode', e.target.checked)}
                    />
                    Compact Mode
                  </label>
                  <p className="setting-description">
                    Reduce spacing and padding for more content on screen
                  </p>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h3>Notification Settings</h3>
                
                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={localSettings.showSuccessMessages}
                      onChange={(e) => updateSetting('showSuccessMessages', e.target.checked)}
                    />
                    Show Success Messages
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={localSettings.showErrorMessages}
                      onChange={(e) => updateSetting('showErrorMessages', e.target.checked)}
                    />
                    Show Error Messages
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={localSettings.autoHideNotifications}
                      onChange={(e) => updateSetting('autoHideNotifications', e.target.checked)}
                    />
                    Auto-hide Notifications
                  </label>
                </div>

                {localSettings.autoHideNotifications && (
                  <div className="setting-group">
                    <label className="setting-label">
                      Notification Duration: {localSettings.notificationDuration / 1000}s
                    </label>
                    <input
                      type="range"
                      min="2000"
                      max="10000"
                      step="1000"
                      value={localSettings.notificationDuration}
                      onChange={(e) => updateSetting('notificationDuration', parseInt(e.target.value))}
                      className="setting-range"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="settings-section">
                <h3>Workout Preferences</h3>
                
                <div className="setting-group">
                  <label className="setting-label">Default Workout View</label>
                  <select
                    value={localSettings.defaultWorkoutView}
                    onChange={(e) => updateSetting('defaultWorkoutView', e.target.value as 'simple' | 'detailed')}
                    className="setting-select"
                  >
                    <option value="simple">Simple View</option>
                    <option value="detailed">Detailed View</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={localSettings.showAdvancedFilters}
                      onChange={(e) => updateSetting('showAdvancedFilters', e.target.checked)}
                    />
                    Show Advanced Filters by Default
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={localSettings.autoSaveWorkouts}
                      onChange={(e) => updateSetting('autoSaveWorkouts', e.target.checked)}
                    />
                    Auto-save Workout Changes
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={localSettings.confirmDeleteActions}
                      onChange={(e) => updateSetting('confirmDeleteActions', e.target.checked)}
                    />
                    Confirm Delete Actions
                  </label>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="settings-section">
                <h3>Privacy Settings</h3>
                
                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={localSettings.shareWorkoutHistory}
                      onChange={(e) => updateSetting('shareWorkoutHistory', e.target.checked)}
                    />
                    Share Workout History for Insights
                  </label>
                  <p className="setting-description">
                    Help improve the AI by sharing anonymized workout data
                  </p>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={localSettings.allowAnalytics}
                      onChange={(e) => updateSetting('allowAnalytics', e.target.checked)}
                    />
                    Allow Analytics
                  </label>
                  <p className="setting-description">
                    Help us improve the dashboard with usage analytics
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="settings-footer">
          <div className="settings-actions">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              <RefreshCw size={14} />
              Reset to Defaults
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="spin" size={14} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Settings
                </>
              )}
            </Button>
          </div>
          
          {hasChanges && (
            <div className="unsaved-changes-notice">
              <span>You have unsaved changes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 