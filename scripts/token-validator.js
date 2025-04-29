#!/usr/bin/env node

/**
 * FitCopilot Color Token Validator
 * 
 * This script scans the codebase for hardcoded color values and suggests
 * appropriate token alternatives to ensure consistent design system usage.
 * 
 * Usage:
 *   node token-validator.js [--fix] [--report] [path/to/scan]
 * 
 * Options:
 *   --fix       Auto-fix simple token replacements
 *   --report    Generate HTML report of violations
 *   path        Optional path to scan (defaults to src/)
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require('chalk');

// Configuration
const DEFAULT_SCAN_PATH = 'src/';
const IGNORE_PATHS = [
  'node_modules',
  'dist',
  'build',
  'scripts',
  '.git',
];
const OUTPUT_REPORT_PATH = 'token-validation-report.html';

// Color pattern detection regexes
const HEX_COLOR_REGEX = /#([0-9A-Fa-f]{3}){1,2}\b/g;
const RGB_COLOR_REGEX = /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g;
const RGBA_COLOR_REGEX = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)/g;

// Common hardcoded values to token mappings
const COLOR_TOKEN_MAP = {
  // Primary brand colors
  '#1FAD9F': "color('primary')",
  '#007A91': "color('primary', 'dark')",
  '#33B1C9': "color('primary', 'light')",
  
  // Accent colors
  '#D4A017': "color('accent')",
  
  // Workout Generator colors
  '#2563EB': "wg-color('primary')",
  '#1D4ED8': "wg-color('primary', 'hover')",
  
  // Gray scale
  '#FFFFFF': "color('surface')",
  '#F5F7FA': "color('bg')",
  '#F0F0F0': "color('surface', 'accent')",
  '#333333': "color('text')",
  
  // Feedback colors
  '#2BAE66': "color('success')",
  '#D94E4E': "color('error')",
  '#F0AD4E': "color('warning')",
  '#4DABF5': "color('info')",
};

// Format for CSS variables
const CSS_VAR_SUGGESTIONS = {
  // Primary brand colors
  '#1FAD9F': 'var(--color-primary)',
  '#007A91': 'var(--color-primary-dark)',
  '#33B1C9': 'var(--color-primary-light)',
  
  // Accent colors
  '#D4A017': 'var(--color-accent)',
  
  // Workout Generator colors
  '#2563EB': 'var(--color-wg-primary)',
  '#1D4ED8': 'var(--color-wg-primary-hover)',
  
  // Gray scale
  '#FFFFFF': 'var(--color-surface)',
  '#F5F7FA': 'var(--color-bg)',
  '#F0F0F0': 'var(--color-surface-accent)',
  '#333333': 'var(--color-text)',
  
  // Feedback colors
  '#2BAE66': 'var(--color-success)',
  '#D94E4E': 'var(--color-error)',
  '#F0AD4E': 'var(--color-warning)',
  '#4DABF5': 'var(--color-info)',
};

// Track overall stats
let stats = {
  totalFiles: 0,
  filesWithIssues: 0,
  totalIssues: 0,
  hexIssues: 0,
  rgbIssues: 0,
  rgbaIssues: 0,
  fixableIssues: 0,
};

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const shouldGenerateReport = args.includes('--report');
const scanPath = args.find(arg => !arg.startsWith('--')) || DEFAULT_SCAN_PATH;

/**
 * Scan a file for hardcoded color values
 * @param {string} filePath - Path to the file to scan
 * @returns {Object} - Object with violations and fix suggestions
 */
async function scanFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const fileExt = path.extname(filePath);
  const issues = [];
  
  // Skip binary files and specific file types
  if (
    fileExt === '.svg' || 
    fileExt === '.png' || 
    fileExt === '.jpg' || 
    fileExt === '.jpeg' || 
    fileExt === '.gif'
  ) {
    return { issues, fileContent };
  }
  
  // Match hex colors
  const hexMatches = Array.from(fileContent.matchAll(HEX_COLOR_REGEX) || []);
  for (const match of hexMatches) {
    const hexValue = match[0].toUpperCase();
    const suggestion = getColorTokenSuggestion(hexValue, fileExt);
    if (suggestion) {
      issues.push({
        type: 'hex',
        value: hexValue,
        index: match.index,
        suggestion,
        fixable: Boolean(COLOR_TOKEN_MAP[hexValue] || CSS_VAR_SUGGESTIONS[hexValue]),
      });
      stats.hexIssues++;
      stats.totalIssues++;
      if (COLOR_TOKEN_MAP[hexValue] || CSS_VAR_SUGGESTIONS[hexValue]) {
        stats.fixableIssues++;
      }
    }
  }
  
  // Match rgb colors
  const rgbMatches = Array.from(fileContent.matchAll(RGB_COLOR_REGEX) || []);
  for (const match of rgbMatches) {
    issues.push({
      type: 'rgb',
      value: match[0],
      index: match.index,
      suggestion: 'Use rgb(var(--color-*-rgb)) instead of hardcoded RGB values',
      fixable: false,
    });
    stats.rgbIssues++;
    stats.totalIssues++;
  }
  
  // Match rgba colors
  const rgbaMatches = Array.from(fileContent.matchAll(RGBA_COLOR_REGEX) || []);
  for (const match of rgbaMatches) {
    issues.push({
      type: 'rgba',
      value: match[0],
      index: match.index,
      suggestion: 'Use rgba(var(--color-*-rgb), alpha) instead of hardcoded RGBA values',
      fixable: false,
    });
    stats.rgbaIssues++;
    stats.totalIssues++;
  }
  
  // Apply fixes if requested
  let updatedContent = fileContent;
  if (shouldFix && issues.some(i => i.fixable)) {
    // Sort issues by index in reverse order to avoid offset issues
    const fixableIssues = issues
      .filter(i => i.fixable)
      .sort((a, b) => b.index - a.index);
    
    for (const issue of fixableIssues) {
      const replacement = getFixReplacement(issue.value, fileExt);
      if (replacement) {
        updatedContent = 
          updatedContent.substring(0, issue.index) + 
          replacement + 
          updatedContent.substring(issue.index + issue.value.length);
      }
    }
  }
  
  return { issues, updatedContent };
}

/**
 * Get appropriate color token suggestion based on file type
 * @param {string} hexValue - Hex color value
 * @param {string} fileExt - File extension
 * @returns {string} - Suggestion for token replacement
 */
function getColorTokenSuggestion(hexValue, fileExt) {
  // For CSS/SCSS files, suggest SCSS function
  if (['.scss', '.css', '.sass'].includes(fileExt)) {
    return COLOR_TOKEN_MAP[hexValue] || 
           `Consider using a semantic color token instead of hardcoded value ${hexValue}`;
  }
  
  // For JS/TS/TSX/JSX files, suggest CSS variable
  if (['.js', '.jsx', '.ts', '.tsx'].includes(fileExt)) {
    return CSS_VAR_SUGGESTIONS[hexValue] || 
           `Consider using a CSS variable instead of hardcoded value ${hexValue}`;
  }
  
  // Default suggestion
  return `Replace hardcoded value ${hexValue} with appropriate design token`;
    }

/**
 * Get appropriate replacement for fixing
 * @param {string} value - Color value
 * @param {string} fileExt - File extension
 * @returns {string} - Replacement value
 */
function getFixReplacement(value, fileExt) {
  // For CSS/SCSS files, use SCSS function
  if (['.scss', '.css', '.sass'].includes(fileExt)) {
    return COLOR_TOKEN_MAP[value] || null;
  }
  
  // For JS/TS/TSX/JSX files, use CSS variable
  if (['.js', '.jsx', '.ts', '.tsx'].includes(fileExt)) {
    return CSS_VAR_SUGGESTIONS[value] || null;
  }
  
  return null;
}

/**
 * Get all files in a directory recursively
 * @param {string} dir - Directory to scan
 * @returns {string[]} - Array of file paths
 */
function getAllFiles(dir) {
  if (IGNORE_PATHS.some(ignorePath => dir.includes(ignorePath))) {
    return [];
  }
  
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Generate HTML report of violations
 * @param {Object[]} fileIssues - Array of file issues
 */
function generateReport(fileIssues) {
  const reportContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FitCopilot Color Token Validation Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 {
      color: #1F2937;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 0.5rem;
    }
    .summary {
      background-color: #F9FAFB;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .stat-card {
      background-color: white;
      border-radius: 0.5rem;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #1F2937;
    }
    .stat-label {
      color: #6B7280;
      font-size: 0.875rem;
    }
    .file-issues {
      margin-top: 1rem;
    }
    .file-path {
      background-color: #F3F4F6;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      font-family: monospace;
      font-weight: bold;
      color: #1F2937;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .file-path span {
      font-weight: normal;
      color: #6B7280;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
    }
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #E5E7EB;
    }
    th {
      background-color: #F9FAFB;
      font-weight: 600;
    }
    .color-value {
      font-family: monospace;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      background-color: #F3F4F6;
    }
    .suggestion {
      font-family: monospace;
      color: #059669;
    }
    .fixable {
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .fixable.yes {
      background-color: #D1FAE5;
      color: #065F46;
    }
    .fixable.no {
      background-color: #FEF3C7;
      color: #92400E;
    }
    .token-docs {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 2px solid #E5E7EB;
    }
    .token-docs h2 {
      color: #1F2937;
    }
    .token-docs code {
      background-color: #F3F4F6;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <h1>FitCopilot Color Token Validation Report</h1>
  
  <div class="summary">
    <div class="stat-card">
      <div class="stat-value">${stats.filesWithIssues}/${stats.totalFiles}</div>
      <div class="stat-label">Files with issues</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.totalIssues}</div>
      <div class="stat-label">Total issues</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.hexIssues}</div>
      <div class="stat-label">Hex color issues</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.rgbIssues + stats.rgbaIssues}</div>
      <div class="stat-label">RGB/RGBA issues</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.fixableIssues}</div>
      <div class="stat-label">Auto-fixable issues</div>
    </div>
  </div>
  
  <div class="file-issues">
    ${fileIssues.map(file => `
      <div class="file-path">
        ${file.path} <span>${file.issues.length} issue${file.issues.length !== 1 ? 's' : ''}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Value</th>
            <th>Suggestion</th>
            <th>Auto-fixable</th>
          </tr>
        </thead>
        <tbody>
          ${file.issues.map(issue => `
            <tr>
              <td>${issue.type.toUpperCase()}</td>
              <td><span class="color-value">${issue.value}</span></td>
              <td><span class="suggestion">${issue.suggestion}</span></td>
              <td><span class="fixable ${issue.fixable ? 'yes' : 'no'}">${issue.fixable ? 'Yes' : 'No'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `).join('')}
  </div>
  
  <div class="token-docs">
    <h2>How to Fix</h2>
    <p>Replace hardcoded color values with appropriate tokens from the design system:</p>
    <ul>
      <li>For SCSS files, use token functions: <code>color('primary')</code></li>
      <li>For React components, use CSS variables: <code>var(--color-primary)</code></li>
      <li>For RGBA values with opacity: <code>rgba(var(--color-primary-rgb), 0.5)</code></li>
    </ul>
    <p>See the <a href="src/styles/design-system/tokens/docs/token-map.md">Color Token Documentation</a> for a complete reference.</p>
    </div>
</body>
</html>
  `;
  
  fs.writeFileSync(OUTPUT_REPORT_PATH, reportContent);
  console.log(`\nReport generated at ${OUTPUT_REPORT_PATH}`);
}

/**
 * Main function
 */
async function main() {
  console.log(`\n🔍 Scanning for hardcoded color values in ${scanPath}...\n`);
  
  try {
    const baseDir = path.resolve(process.cwd(), scanPath);
    const files = getAllFiles(baseDir);
    stats.totalFiles = files.length;
    
    const fileIssues = [];
    let fixCount = 0;
    
    for (const filePath of files) {
      const relativePath = path.relative(process.cwd(), filePath);
      const { issues, updatedContent } = await scanFile(filePath);
      
      if (issues.length > 0) {
        stats.filesWithIssues++;
        fileIssues.push({
          path: relativePath,
          issues
        });
        
        console.log(`${chalk.yellow('!')} ${relativePath}: ${issues.length} issue${issues.length !== 1 ? 's' : ''}`);
        
        // If we're fixing and content changed, write back to file
        if (shouldFix && updatedContent !== fs.readFileSync(filePath, 'utf8')) {
          fs.writeFileSync(filePath, updatedContent);
          const fixedCount = issues.filter(i => i.fixable).length;
          fixCount += fixedCount;
          console.log(`  ${chalk.green('✓')} Fixed ${fixedCount} issue${fixedCount !== 1 ? 's' : ''}`);
}
      }
    }
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`- Files scanned: ${stats.totalFiles}`);
    console.log(`- Files with issues: ${stats.filesWithIssues}`);
    console.log(`- Total issues: ${stats.totalIssues}`);
    console.log(`  - Hex color issues: ${stats.hexIssues}`);
    console.log(`  - RGB/RGBA color issues: ${stats.rgbIssues + stats.rgbaIssues}`);
    
    if (shouldFix) {
      console.log(`\n🔧 Fixed ${fixCount} issues automatically`);
    }
  
    // Generate report if requested
    if (shouldGenerateReport) {
      generateReport(fileIssues);
    }
  
    // Exit with error code if issues found
    process.exit(stats.totalIssues > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main(); 