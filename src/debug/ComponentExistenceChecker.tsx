import React from 'react';

/**
 * Component Existence Checker
 * 
 * This will test each component individually to find the undefined one
 * causing React Error #130
 */

// Test each import individually
console.log('🔍 Starting Component Existence Check...');

// Test 1: Basic UI Components
let Card: any = null;
let Button: any = null;

try {
  const CardModule = require('../components/ui/Card/Card');
  Card = CardModule.default;
  console.log('✅ Card:', Card ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ Card import error:', error);
}

try {
  const ButtonModule = require('../components/ui/Button/Button');
  Button = ButtonModule.default;
  console.log('✅ Button:', Button ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ Button import error:', error);
}

// Test 2: Dashboard Context
let DashboardProvider: any = null;
let useDashboard: any = null;

try {
  const DashboardModule = require('../dashboard/context/DashboardContext');
  DashboardProvider = DashboardModule.DashboardProvider;
  useDashboard = DashboardModule.useDashboard;
  console.log('✅ DashboardProvider:', DashboardProvider ? 'FOUND' : '❌ UNDEFINED');
  console.log('✅ useDashboard:', useDashboard ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ Dashboard context import error:', error);
}

// Test 3: Workout Generator
let WorkoutGeneratorFeature: any = null;

try {
  const WorkoutModule = require('../features/workout-generator/WorkoutGeneratorFeature');
  WorkoutGeneratorFeature = WorkoutModule.WorkoutGeneratorFeature;
  console.log('✅ WorkoutGeneratorFeature:', WorkoutGeneratorFeature ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ WorkoutGeneratorFeature import error:', error);
}

// Test 4: Tab System Components (CRITICAL)
let TabContainer: any = null;
let TabHeader: any = null;
let TabContent: any = null;
let TabPanel: any = null;
let useTabNavigation: any = null;

try {
  const TabSystemModule = require('../dashboard/components/TabSystem');
  console.log('📦 TabSystem module keys:', Object.keys(TabSystemModule));
  
  TabContainer = TabSystemModule.TabContainer;
  TabHeader = TabSystemModule.TabHeader;
  TabContent = TabSystemModule.TabContent;
  TabPanel = TabSystemModule.TabPanel;
  useTabNavigation = TabSystemModule.useTabNavigation;
  
  console.log('✅ TabContainer:', TabContainer ? 'FOUND' : '❌ UNDEFINED');
  console.log('✅ TabHeader:', TabHeader ? 'FOUND' : '❌ UNDEFINED');
  console.log('✅ TabContent:', TabContent ? 'FOUND' : '❌ UNDEFINED');
  console.log('✅ TabPanel:', TabPanel ? 'FOUND' : '❌ UNDEFINED');
  console.log('✅ useTabNavigation:', useTabNavigation ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ TabSystem import error:', error);
}

// Test 5: Tab Content Components
let ProfileSummary: any = null;
let WorkoutGrid: any = null;
let ApiUsage: any = null;

try {
  const ProfileModule = require('../dashboard/components/ProfileTab/ProfileSummary');
  ProfileSummary = ProfileModule.ProfileSummary;
  console.log('✅ ProfileSummary:', ProfileSummary ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ ProfileSummary import error:', error);
}

try {
  const WorkoutGridModule = require('../dashboard/components/SavedWorkoutsTab/WorkoutGrid');
  WorkoutGrid = WorkoutGridModule.WorkoutGrid;
  console.log('✅ WorkoutGrid:', WorkoutGrid ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ WorkoutGrid import error:', error);
}

try {
  const ApiModule = require('../dashboard/components/ApiUsage');
  ApiUsage = ApiModule.default || ApiModule.ApiUsage;
  console.log('✅ ApiUsage:', ApiUsage ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ ApiUsage import error:', error);
}

// Test 6: Individual TabSystem Components (Direct Import)
console.log('🔍 Testing individual TabSystem components...');

let TabContainerDirect: any = null;
let TabHeaderDirect: any = null;
let TabContentDirect: any = null;
let TabPanelDirect: any = null;

try {
  const TabContainerModule = require('../dashboard/components/TabSystem/TabContainer');
  TabContainerDirect = TabContainerModule.TabContainer || TabContainerModule.default;
  console.log('✅ TabContainer (direct):', TabContainerDirect ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ TabContainer direct import error:', error);
}

try {
  const TabHeaderModule = require('../dashboard/components/TabSystem/TabHeader');
  TabHeaderDirect = TabHeaderModule.TabHeader || TabHeaderModule.default;
  console.log('✅ TabHeader (direct):', TabHeaderDirect ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ TabHeader direct import error:', error);
}

try {
  const TabContentModule = require('../dashboard/components/TabSystem/TabContent');
  TabContentDirect = TabContentModule.TabContent || TabContentModule.default;
  console.log('✅ TabContent (direct):', TabContentDirect ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ TabContent direct import error:', error);
}

try {
  const TabPanelModule = require('../dashboard/components/TabSystem/TabPanel');
  TabPanelDirect = TabPanelModule.TabPanel || TabPanelModule.default;
  console.log('✅ TabPanel (direct):', TabPanelDirect ? 'FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ TabPanel direct import error:', error);
}

// Main Component
export const ComponentExistenceChecker: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}>
      <h1>🔍 Component Existence Checker</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Check the browser console for detailed component analysis.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Basic UI Components */}
        <div style={{ padding: '15px', border: '2px solid #007cba', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>🎨 UI Components</h3>
          <p>Card: {Card ? '✅ FOUND' : '❌ UNDEFINED'}</p>
          <p>Button: {Button ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        </div>

        {/* Dashboard Context */}
        <div style={{ padding: '15px', border: '2px solid #28a745', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>🏠 Dashboard Context</h3>
          <p>DashboardProvider: {DashboardProvider ? '✅ FOUND' : '❌ UNDEFINED'}</p>
          <p>useDashboard: {useDashboard ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        </div>

        {/* Workout Generator */}
        <div style={{ padding: '15px', border: '2px solid #ffc107', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>💪 Workout Generator</h3>
          <p>WorkoutGeneratorFeature: {WorkoutGeneratorFeature ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        </div>

        {/* Tab System (Index) */}
        <div style={{ padding: '15px', border: '2px solid #dc3545', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>📑 Tab System (Index)</h3>
          <p>TabContainer: {TabContainer ? '✅ FOUND' : '❌ UNDEFINED'}</p>
          <p>TabHeader: {TabHeader ? '✅ FOUND' : '❌ UNDEFINED'}</p>
          <p>TabContent: {TabContent ? '✅ FOUND' : '❌ UNDEFINED'}</p>
          <p>TabPanel: {TabPanel ? '✅ FOUND' : '❌ UNDEFINED'}</p>
          <p>useTabNavigation: {useTabNavigation ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        </div>

        {/* Tab System (Direct) */}
        <div style={{ padding: '15px', border: '2px solid #6f42c1', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>📑 Tab System (Direct)</h3>
          <p>TabContainer: {TabContainerDirect ? '✅ FOUND' : '❌ UNDEFINED'}</p>
          <p>TabHeader: {TabHeaderDirect ? '✅ FOUND' : '❌ UNDEFINED'}</p>
          <p>TabContent: {TabContentDirect ? '✅ FOUND' : '❌ UNDEFINED'}</p>
          <p>TabPanel: {TabPanelDirect ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '15px', border: '2px solid #17a2b8', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>📄 Tab Content</h3>
          <p>ProfileSummary: {ProfileSummary ? '✅ FOUND' : '❌ UNDEFINED'}</p>
          <p>WorkoutGrid: {WorkoutGrid ? '✅ FOUND' : '❌ UNDEFINED'}</p>
          <p>ApiUsage: {ApiUsage ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', border: '3px solid #dc3545', borderRadius: '8px', backgroundColor: '#fff5f5' }}>
        <h2>🚨 Critical Analysis</h2>
        <p><strong>Any component showing "❌ UNDEFINED" is the cause of React Error #130!</strong></p>
        <p>Check the browser console for detailed import error messages.</p>
        <p>Focus on TabSystem components as they are most likely to be the issue.</p>
      </div>
    </div>
  );
};

export default ComponentExistenceChecker; 