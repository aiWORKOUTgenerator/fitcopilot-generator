/**
 * Muscle Selection Workflow Debugging Script
 * 
 * Traces the complete data flow from WorkoutGeneratorGrid muscle selection
 * to PremiumPreviewCard display to identify where "back/arms" becomes "Chest/Arms"
 * 
 * Usage: Run this in browser console on WorkoutGeneratorGrid page
 */

console.log('🔍 MUSCLE SELECTION WORKFLOW DEBUGGING');
console.log('='.repeat(60));

// Global debugging state
window.muscleDebugState = {
  originalSelection: null,
  transformationSteps: [],
  finalDisplay: null,
  errors: []
};

// Helper function to log transformation steps
function logTransformation(step, data, source = 'Unknown') {
  const entry = {
    step,
    source,
    data: JSON.parse(JSON.stringify(data)), // Deep clone
    timestamp: new Date().toISOString()
  };
  
  window.muscleDebugState.transformationSteps.push(entry);
  console.log(`📍 STEP ${window.muscleDebugState.transformationSteps.length}: ${step} (${source})`);
  console.log('   Data:', data);
  console.log('   Timestamp:', entry.timestamp);
  console.log('');
}

// Function to intercept and monitor muscle selection changes
function interceptMuscleSelection() {
  console.log('🎯 Setting up muscle selection interception...');
  
  // Try to find the muscle selection hook
  const muscleCards = document.querySelectorAll('[data-muscle-group]');
  console.log(`Found ${muscleCards.length} muscle group buttons`);
  
  // Add click listeners to muscle group buttons
  muscleCards.forEach((button, index) => {
    const muscleGroup = button.dataset.muscleGroup || button.textContent?.toLowerCase();
    console.log(`  Button ${index + 1}: ${muscleGroup}`);
    
    // Store original click handler
    const originalClick = button.onclick;
    
    // Intercept clicks
    button.addEventListener('click', function(event) {
      console.log(`🖱️ MUSCLE BUTTON CLICKED: ${muscleGroup}`);
      logTransformation('Muscle Button Click', {
        muscleGroup,
        buttonText: button.textContent,
        buttonData: button.dataset
      }, 'MuscleGroupCard');
      
      // Call original handler if exists
      if (originalClick) {
        originalClick.call(this, event);
      }
      
      // Monitor state changes after click
      setTimeout(() => {
        checkMuscleSelectionState();
      }, 100);
    });
  });
}

// Function to check current muscle selection state
function checkMuscleSelectionState() {
  console.log('🔍 Checking muscle selection state...');
  
  // Check localStorage for muscle selection
  const localStorageKeys = Object.keys(localStorage).filter(key => 
    key.includes('muscle') || key.includes('fitcopilot')
  );
  
  console.log('📦 LocalStorage muscle-related keys:', localStorageKeys);
  localStorageKeys.forEach(key => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      console.log(`  ${key}:`, value);
      
      if (key.includes('muscle') && value) {
        logTransformation('LocalStorage Update', {
          key,
          value
        }, 'localStorage');
      }
    } catch (e) {
      console.log(`  ${key}: ${localStorage.getItem(key)} (not JSON)`);
    }
  });
  
  // Check sessionStorage for form state
  const sessionKeys = Object.keys(sessionStorage).filter(key => 
    key.includes('muscle') || key.includes('fitcopilot') || key.includes('workout')
  );
  
  console.log('📦 SessionStorage workout-related keys:', sessionKeys);
  sessionKeys.forEach(key => {
    try {
      const value = JSON.parse(sessionStorage.getItem(key));
      console.log(`  ${key}:`, value);
      
      if (value && (value.sessionInputs || value.muscleTargeting || value.focusArea)) {
        logTransformation('SessionStorage Update', {
          key,
          value,
          muscleData: {
            sessionInputs: value.sessionInputs,
            muscleTargeting: value.muscleTargeting,
            focusArea: value.focusArea
          }
        }, 'sessionStorage');
      }
    } catch (e) {
      console.log(`  ${key}: ${sessionStorage.getItem(key)} (not JSON)`);
    }
  });
  
  // Check React component state if accessible
  checkReactComponentState();
}

// Function to check React component state
function checkReactComponentState() {
  console.log('⚛️ Checking React component state...');
  
  // Try to find WorkoutGeneratorGrid component
  const gridElement = document.querySelector('.workout-generator-grid-premium') || 
                     document.querySelector('.workout-generator-container-premium') ||
                     document.querySelector('[class*="workout-generator"]');
  
  if (gridElement) {
    console.log('✅ Found WorkoutGeneratorGrid element');
    
    // Try to access React fiber
    const reactFiber = gridElement._reactInternalFiber || 
                      gridElement._reactInternals ||
                      gridElement.__reactInternalInstance;
    
    if (reactFiber) {
      console.log('✅ Found React fiber');
      
      // Try to find muscle selection state
      let currentFiber = reactFiber;
      let attempts = 0;
      
      while (currentFiber && attempts < 10) {
        if (currentFiber.memoizedState || currentFiber.stateNode) {
          console.log(`  Fiber ${attempts}:`, {
            type: currentFiber.type?.name || currentFiber.type,
            memoizedState: currentFiber.memoizedState,
            stateNode: currentFiber.stateNode
          });
          
          // Check for muscle selection data
          if (currentFiber.memoizedState) {
            const state = currentFiber.memoizedState;
            if (state && (state.muscleSelection || state.selectionData)) {
              logTransformation('React Component State', {
                fiberType: currentFiber.type?.name,
                muscleSelection: state.muscleSelection || state.selectionData,
                fullState: state
              }, 'React Fiber');
            }
          }
        }
        
        currentFiber = currentFiber.child || currentFiber.sibling || currentFiber.return;
        attempts++;
      }
    } else {
      console.log('❌ React fiber not accessible');
    }
  } else {
    console.log('❌ WorkoutGeneratorGrid element not found');
  }
  
  // Check for global React state
  if (window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('⚛️ React DevTools available');
    
    // Try to access global state
    if (window.workoutForm) {
      console.log('✅ Found global workoutForm');
      logTransformation('Global WorkoutForm State', {
        formValues: window.workoutForm.formValues,
        sessionInputs: window.workoutForm.formValues?.sessionInputs,
        muscleTargeting: window.workoutForm.formValues?.muscleTargeting
      }, 'Global State');
    }
  }
}

// Function to monitor form state changes
function monitorFormStateChanges() {
  console.log('👀 Setting up form state monitoring...');
  
  // Monitor sessionStorage changes
  const originalSetItem = sessionStorage.setItem;
  sessionStorage.setItem = function(key, value) {
    if (key.includes('fitcopilot') || key.includes('workout') || key.includes('muscle')) {
      console.log(`📝 SessionStorage SET: ${key}`);
      try {
        const parsedValue = JSON.parse(value);
        logTransformation('SessionStorage Set', {
          key,
          value: parsedValue
        }, 'sessionStorage.setItem');
      } catch (e) {
        console.log(`   Value: ${value} (not JSON)`);
      }
    }
    return originalSetItem.call(this, key, value);
  };
  
  // Monitor localStorage changes
  const originalLocalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (key.includes('fitcopilot') || key.includes('workout') || key.includes('muscle')) {
      console.log(`📝 LocalStorage SET: ${key}`);
      try {
        const parsedValue = JSON.parse(value);
        logTransformation('LocalStorage Set', {
          key,
          value: parsedValue
        }, 'localStorage.setItem');
      } catch (e) {
        console.log(`   Value: ${value} (not JSON)`);
      }
    }
    return originalLocalSetItem.call(this, key, value);
  };
}

// Function to check PremiumPreviewStep display
function checkPremiumPreviewDisplay() {
  console.log('🎯 Checking PremiumPreviewStep display...');
  
  const premiumPreview = document.querySelector('.premium-preview-step');
  if (!premiumPreview) {
    console.log('❌ PremiumPreviewStep not found');
    return;
  }
  
  console.log('✅ Found PremiumPreviewStep');
  
  // Check modular cards section
  const modularCards = premiumPreview.querySelectorAll('.modular-preview-card');
  console.log(`Found ${modularCards.length} modular preview cards`);
  
  modularCards.forEach((card, index) => {
    const label = card.querySelector('.modular-preview-card__label')?.textContent;
    const value = card.querySelector('.modular-preview-card__value')?.textContent;
    
    console.log(`  Card ${index + 1}: ${label} = ${value}`);
    
    if (label && label.toLowerCase().includes('muscle')) {
      logTransformation('PremiumPreview Muscle Display', {
        label,
        value,
        cardIndex: index
      }, 'PremiumPreviewStep');
      
      window.muscleDebugState.finalDisplay = { label, value };
    }
  });
  
  // Check session inputs display
  const sessionInputs = premiumPreview.querySelectorAll('.session-input-item');
  console.log(`Found ${sessionInputs.length} session input items`);
  
  sessionInputs.forEach((item, index) => {
    const label = item.querySelector('.session-label')?.textContent;
    const value = item.querySelector('.session-value')?.textContent;
    console.log(`  Session ${index + 1}: ${label} = ${value}`);
  });
}

// Function to simulate muscle selection for testing
function simulateMuscleSelection(muscleGroups = ['Back', 'Arms']) {
  console.log(`🧪 Simulating muscle selection: ${muscleGroups.join(', ')}`);
  
  // Store original selection for comparison
  window.muscleDebugState.originalSelection = muscleGroups;
  
  logTransformation('Test Simulation Start', {
    targetMuscleGroups: muscleGroups,
    testType: 'Simulated Selection'
  }, 'Test Script');
  
  // Try to click the muscle group buttons
  muscleGroups.forEach(group => {
    const button = Array.from(document.querySelectorAll('[data-muscle-group]')).find(btn => 
      btn.dataset.muscleGroup?.toLowerCase() === group.toLowerCase() ||
      btn.textContent?.toLowerCase().includes(group.toLowerCase())
    );
    
    if (button) {
      console.log(`🖱️ Clicking ${group} button`);
      button.click();
      
      // Wait for state updates
      setTimeout(() => {
        checkMuscleSelectionState();
      }, 200);
    } else {
      console.log(`❌ ${group} button not found`);
    }
  });
  
  // Check final state after all clicks
  setTimeout(() => {
    checkPremiumPreviewDisplay();
    generateDebugReport();
  }, 1000);
}

// Function to generate comprehensive debug report
function generateDebugReport() {
  console.log('📊 GENERATING DEBUG REPORT');
  console.log('='.repeat(60));
  
  const report = {
    originalSelection: window.muscleDebugState.originalSelection,
    transformationSteps: window.muscleDebugState.transformationSteps,
    finalDisplay: window.muscleDebugState.finalDisplay,
    errors: window.muscleDebugState.errors,
    summary: {
      totalSteps: window.muscleDebugState.transformationSteps.length,
      dataFlowSources: [...new Set(window.muscleDebugState.transformationSteps.map(step => step.source))],
      hasDataLoss: false,
      hasDataCorruption: false
    }
  };
  
  // Analyze data flow
  console.log('🔍 DATA FLOW ANALYSIS:');
  console.log(`  Original Selection: ${report.originalSelection?.join(', ') || 'None'}`);
  console.log(`  Final Display: ${report.finalDisplay?.value || 'None'}`);
  console.log(`  Transformation Steps: ${report.summary.totalSteps}`);
  console.log(`  Data Sources: ${report.summary.dataFlowSources.join(', ')}`);
  
  // Check for data corruption
  if (report.originalSelection && report.finalDisplay) {
    const originalLower = report.originalSelection.map(g => g.toLowerCase()).sort();
    const finalLower = report.finalDisplay.value.toLowerCase();
    
    const hasAllOriginal = originalLower.every(group => finalLower.includes(group));
    const hasUnexpected = !originalLower.some(group => finalLower.includes(group));
    
    if (!hasAllOriginal) {
      report.summary.hasDataLoss = true;
      console.log('❌ DATA LOSS DETECTED: Original selection not fully preserved');
    }
    
    if (hasUnexpected && finalLower.includes('chest')) {
      report.summary.hasDataCorruption = true;
      console.log('❌ DATA CORRUPTION DETECTED: Unexpected "Chest" in final display');
    }
  }
  
  // Store report globally
  window.muscleDebugReport = report;
  
  console.log('\n📋 DETAILED TRANSFORMATION STEPS:');
  report.transformationSteps.forEach((step, index) => {
    console.log(`\n${index + 1}. ${step.step} (${step.source})`);
    console.log(`   Time: ${step.timestamp}`);
    console.log(`   Data:`, step.data);
  });
  
  console.log('\n💡 DEBUGGING RECOMMENDATIONS:');
  if (report.summary.hasDataCorruption) {
    console.log('1. Check formatMuscleSelectionForAPI function for incorrect mapping');
    console.log('2. Verify MuscleGroup enum values match expected strings');
    console.log('3. Check PremiumPreviewStep muscle data source priority');
  }
  
  if (report.summary.hasDataLoss) {
    console.log('1. Check useWorkoutFormMuscleIntegration sync logic');
    console.log('2. Verify sessionInputs.focusArea persistence');
    console.log('3. Check form state update timing');
  }
  
  console.log('\n🎯 ACCESS FULL REPORT: window.muscleDebugReport');
  
  return report;
}

// Main execution function
function runMuscleSelectionDebug() {
  console.log('🚀 STARTING MUSCLE SELECTION WORKFLOW DEBUG');
  console.log('='.repeat(60));
  
  try {
    // Setup monitoring
    monitorFormStateChanges();
    interceptMuscleSelection();
    
    // Check initial state
    console.log('\n📊 INITIAL STATE CHECK:');
    checkMuscleSelectionState();
    
    // Wait a moment then simulate selection
    setTimeout(() => {
      console.log('\n🧪 SIMULATING MUSCLE SELECTION:');
      simulateMuscleSelection(['Back', 'Arms']);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
    window.muscleDebugState.errors.push(error.message);
  }
}

// Auto-run the debug script
console.log('🎬 Auto-running muscle selection debug...');
runMuscleSelectionDebug();

// Export functions for manual testing
window.muscleDebugFunctions = {
  runMuscleSelectionDebug,
  simulateMuscleSelection,
  checkMuscleSelectionState,
  checkPremiumPreviewDisplay,
  generateDebugReport
};

console.log('\n💡 MANUAL TESTING FUNCTIONS:');
console.log('- window.muscleDebugFunctions.runMuscleSelectionDebug()');
console.log('- window.muscleDebugFunctions.simulateMuscleSelection(["Back", "Arms"])');
console.log('- window.muscleDebugFunctions.checkMuscleSelectionState()');
console.log('- window.muscleDebugFunctions.checkPremiumPreviewDisplay()');
console.log('- window.muscleDebugFunctions.generateDebugReport()'); 