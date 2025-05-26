import React from 'react';

/**
 * Component Debugger - Tests each import individually to identify undefined components
 * This will help us pinpoint exactly which component is causing React Error #130
 */

// Test 1: Basic React functionality
const BasicTest: React.FC = () => {
  console.log('✅ BasicTest: React is working');
  return <div>✅ Basic React Test Passed</div>;
};

// Test 2: Test TabSystem imports one by one
let TabContainer: any = null;
let TabHeader: any = null;
let TabContent: any = null;
let TabPanel: any = null;
let useTabNavigation: any = null;
let TabType: any = null;

try {
  console.log('🔍 Testing TabContainer import...');
  const TabSystemModule = require('../dashboard/components/TabSystem');
  console.log('📦 TabSystem module loaded:', Object.keys(TabSystemModule));
  
  TabContainer = TabSystemModule.TabContainer;
  console.log('🔍 TabContainer:', TabContainer ? '✅ FOUND' : '❌ UNDEFINED');
  
  TabHeader = TabSystemModule.TabHeader;
  console.log('🔍 TabHeader:', TabHeader ? '✅ FOUND' : '❌ UNDEFINED');
  
  TabContent = TabSystemModule.TabContent;
  console.log('🔍 TabContent:', TabContent ? '✅ FOUND' : '❌ UNDEFINED');
  
  TabPanel = TabSystemModule.TabPanel;
  console.log('🔍 TabPanel:', TabPanel ? '✅ FOUND' : '❌ UNDEFINED');
  
  useTabNavigation = TabSystemModule.useTabNavigation;
  console.log('🔍 useTabNavigation:', useTabNavigation ? '✅ FOUND' : '❌ UNDEFINED');
  
  // TabType is a TypeScript type, not a runtime value - skipping test
  console.log('🔍 TabType: ⚠️ SKIPPED (TypeScript type, not runtime value)');
  
} catch (error) {
  console.error('❌ Error importing TabSystem:', error);
}

// Test 3: Test ProfileSummary import
let ProfileSummary: any = null;
try {
  console.log('🔍 Testing ProfileSummary import...');
  const ProfileModule = require('../dashboard/components/ProfileTab/ProfileSummary');
  console.log('📦 Profile module loaded:', Object.keys(ProfileModule));
  
  ProfileSummary = ProfileModule.ProfileSummary;
  console.log('🔍 ProfileSummary:', ProfileSummary ? '✅ FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ Error importing ProfileSummary:', error);
}

// Test 4: Test WorkoutGrid import
let WorkoutGrid: any = null;
try {
  console.log('🔍 Testing WorkoutGrid import...');
  const WorkoutModule = require('../dashboard/components/SavedWorkoutsTab/WorkoutGrid');
  console.log('📦 Workout module loaded:', Object.keys(WorkoutModule));
  
  WorkoutGrid = WorkoutModule.WorkoutGrid;
  console.log('🔍 WorkoutGrid:', WorkoutGrid ? '✅ FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ Error importing WorkoutGrid:', error);
}

// Test 5: Test ApiUsage import
let ApiUsage: any = null;
try {
  console.log('🔍 Testing ApiUsage import...');
  const ApiModule = require('../dashboard/components/ApiUsage');
  console.log('📦 Api module loaded:', Object.keys(ApiModule));
  
  ApiUsage = ApiModule.default || ApiModule.ApiUsage;
  console.log('🔍 ApiUsage:', ApiUsage ? '✅ FOUND' : '❌ UNDEFINED');
} catch (error) {
  console.error('❌ Error importing ApiUsage:', error);
}

// Main Debug Component
export const ComponentDebugger: React.FC = () => {
  console.log('🚀 ComponentDebugger: Starting comprehensive component test...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 Component Debugger</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '2px solid green' }}>
        <h2>✅ Test 1: Basic React</h2>
        <BasicTest />
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '2px solid blue' }}>
        <h2>🔍 Test 2: TabSystem Components</h2>
        <p>TabContainer: {TabContainer ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        <p>TabHeader: {TabHeader ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        <p>TabContent: {TabContent ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        <p>TabPanel: {TabPanel ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        <p>useTabNavigation: {useTabNavigation ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        <p>TabType: ⚠️ SKIPPED (TypeScript type, not runtime value)</p>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '2px solid orange' }}>
        <h2>🔍 Test 3: Tab Content Components</h2>
        <p>ProfileSummary: {ProfileSummary ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        <p>WorkoutGrid: {WorkoutGrid ? '✅ FOUND' : '❌ UNDEFINED'}</p>
        <p>ApiUsage: {ApiUsage ? '✅ FOUND' : '❌ UNDEFINED'}</p>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '2px solid purple' }}>
        <h2>🔍 Test 4: Component Rendering Test</h2>
        {TabContainer && (
          <div>
            <p>✅ Attempting to render TabContainer...</p>
            {/* We'll only test if it exists */}
          </div>
        )}
        {!TabContainer && <p>❌ Cannot test TabContainer - it's undefined</p>}
      </div>
      
      <div style={{ padding: '10px', border: '2px solid red' }}>
        <h2>📋 Debug Summary</h2>
        <p>Check the browser console for detailed import analysis.</p>
        <p>Any component showing "❌ UNDEFINED" is the culprit for React Error #130.</p>
      </div>
    </div>
  );
};

export default ComponentDebugger; 