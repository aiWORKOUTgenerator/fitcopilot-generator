#!/usr/bin/env node

/**
 * Visual Regression Test Script
 * 
 * This script runs Chromatic to capture visual snapshots of components for regression testing.
 * It compares new snapshots with the previous baseline to identify visual changes.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CHROMATIC_PROJECT_TOKEN = process.env.CHROMATIC_PROJECT_TOKEN;
const STORYBOOK_DIR = path.join(__dirname, '../storybook-static');
const OUTPUT_DIR = path.join(__dirname, '../visual-regression-results');

// Ensure token is available
if (!CHROMATIC_PROJECT_TOKEN) {
  console.error('Error: CHROMATIC_PROJECT_TOKEN environment variable is required');
  console.error('Set it using: export CHROMATIC_PROJECT_TOKEN=your_token');
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Build Storybook
console.log('📚 Building Storybook...');
const buildProcess = spawn('npm', ['run', 'build-storybook'], { stdio: 'inherit' });

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Storybook build failed');
    process.exit(1);
  }
  
  console.log('✅ Storybook built successfully');
  runChromatic();
});

// Run Chromatic
function runChromatic() {
  console.log('🔍 Running Chromatic visual regression tests...');
  
  const chromaticArgs = [
    `--project-token=${CHROMATIC_PROJECT_TOKEN}`,
    `--storybook-build-dir=${STORYBOOK_DIR}`,
    '--exit-zero-on-changes', // Don't fail CI on changes, just report them
    '--auto-accept-changes', // Auto-accept changes on the main branch
    `--output-dir=${OUTPUT_DIR}` // Save results
  ];
  
  // Add branch info if running in CI
  if (process.env.CI) {
    const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || '';
    if (branch) {
      chromaticArgs.push(`--branch-name=${branch}`);
    }
  }
  
  const chromaticProcess = spawn('npx', ['chromatic', ...chromaticArgs], { stdio: 'inherit' });
  
  chromaticProcess.on('close', (code) => {
    if (code !== 0 && code !== 1) { // 1 is for detected changes
      console.error('❌ Chromatic tests failed to run correctly');
      process.exit(1);
    }
    
    console.log('✅ Chromatic tests completed');
    
    // Generate report
    generateReport();
  });
}

// Generate visual report
function generateReport() {
  console.log('📊 Generating visual regression report...');
  
  // Check if results file exists
  const resultsFile = path.join(OUTPUT_DIR, 'chromatic-results.json');
  if (!fs.existsSync(resultsFile)) {
    console.warn('⚠️ No results file found, skipping report generation');
    process.exit(0);
  }
  
  try {
    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    
    const totalTests = results.tests?.length || 0;
    const changedTests = results.tests?.filter(test => test.changeCount > 0).length || 0;
    
    console.log(`\n📊 Visual Regression Summary:`);
    console.log(`Total tests: ${totalTests}`);
    console.log(`Changed components: ${changedTests}`);
    
    if (changedTests > 0) {
      console.log('\n🔍 Components with visual changes:');
      results.tests
        .filter(test => test.changeCount > 0)
        .forEach(test => {
          console.log(` - ${test.name} (${test.changeCount} changes)`);
        });
      
      console.log(`\n👀 View detailed results: ${results.webUrl}`);
    } else {
      console.log('\n✅ No visual changes detected!');
    }
  } catch (error) {
    console.error('❌ Error generating report:', error);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Visual regression testing interrupted');
  process.exit(0);
}); 