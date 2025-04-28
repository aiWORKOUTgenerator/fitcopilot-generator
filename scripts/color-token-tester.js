#!/usr/bin/env node
/**
 * Color Token Compliance Tester
 * 
 * This script analyzes the codebase to detect non-compliant color usage.
 * It scans SCSS, CSS, and TSX/JSX files to identify hardcoded color values
 * that should be using the design token system instead.
 * 
 * Features:
 * - Detects different color formats (hex, rgb, rgba, hsl, hsla, named colors)
 * - Reports compliance statistics
 * - Suggests token replacements for hardcoded colors
 * - Generates detailed HTML report (with --report flag)
 * - Can target specific components or features for focused testing
 * 
 * Usage:
 *   npm run test-colors               - Basic scan
 *   npm run test-colors:verbose       - Detailed output
 *   npm run test-colors:report        - Generate HTML report
 *   npm run test-colors:component=X   - Test specific component
 *   npm run test-colors:feature=Y     - Test specific feature
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const CONFIG = {
  // Directories to include in scan
  includeDirs: [
    'src/components',
    'src/features',
    'src/styles'
  ],
  
  // Directories to exclude from scan
  excludeDirs: [
    'node_modules',
    'dist',
    'build',
    'vendor'
  ],
  
  // File patterns to scan
  filePatterns: [
    '**/*.scss',
    '**/*.css',
    '**/*.tsx',
    '**/*.jsx'
  ],
  
  // Color token mapping (simplified example - should match your actual tokens)
  colorTokens: {
    // Primary colors
    primary: {
      lightest: '#e6f7ff',
      lighter: '#bae7ff',
      light: '#91d5ff',
      base: '#1890ff',
      dark: '#0c53b7',
      darker: '#003a8c',
      darkest: '#002766'
    },
    // Secondary colors
    secondary: {
      lightest: '#f9f0ff',
      lighter: '#efdbff',
      light: '#d3adf7',
      base: '#722ed1',
      dark: '#531dab',
      darker: '#391085',
      darkest: '#22075e'
    },
    // Grayscale
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    },
    // Common named colors
    black: '#000000',
    white: '#ffffff',
    transparent: 'transparent',
    current: 'currentColor',
    // Success/error states
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#1890ff'
  }
};

// Regular expressions for detecting different color formats
const COLOR_PATTERNS = {
  hex3: /#([0-9a-f]{3})(\s|;|,|\)|\}|$)/gi,
  hex6: /#([0-9a-f]{6})(\s|;|,|\)|\}|$)/gi,
  hex8: /#([0-9a-f]{8})(\s|;|,|\)|\}|$)/gi,
  rgb: /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/gi,
  rgba: /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-9.]+)\s*\)/gi,
  hsl: /hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/gi,
  hsla: /hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*([0-9.]+)\s*\)/gi,
  namedColors: /(\s|:|\()(aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)(\s|;|,|\)|\}|$)/gi
};

// Initialize results object
const results = {
  totalFiles: 0,
  scannedFiles: 0,
  compliantFiles: 0,
  nonCompliantFiles: 0,
  totalColors: 0,
  compliantColors: 0,
  nonCompliantColors: 0,
  issues: [],
  fileResults: {},
  startTime: new Date(),
  endTime: null
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose'),
  report: args.includes('--report'),
  component: args.find(arg => arg.startsWith('--component='))?.split('=')[1] || null,
  feature: args.find(arg => arg.startsWith('--feature='))?.split('=')[1] || null
};

/**
 * Convert hex color to normalized format
 * @param {string} hex - Hex color code
 * @returns {string} - Normalized hex color
 */
function normalizeHexColor(hex) {
  hex = hex.toLowerCase();
  // Convert 3-digit hex to 6-digit
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

/**
 * Convert RGB color to hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} - Hex color 
 */
function rgbToHex(r, g, b) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Find the closest color token for a given hex value
 * @param {string} hexColor - Hex color to match
 * @returns {string|null} - Suggested token path or null if no match
 */
function findClosestToken(hexColor) {
  hexColor = normalizeHexColor(hexColor);
  
  // Check for exact matches first
  for (const [category, values] of Object.entries(CONFIG.colorTokens)) {
    if (typeof values === 'string' && normalizeHexColor(values) === hexColor) {
      return `$color-${category}`;
    }
    
    if (typeof values === 'object') {
      for (const [shade, value] of Object.entries(values)) {
        if (typeof value === 'string' && normalizeHexColor(value) === hexColor) {
          return `$color-${category}-${shade}`;
        }
      }
    }
  }
  
  // If no exact match, return null - could implement a closest match algorithm here
  return null;
}

/**
 * Check if a color is on the allowed list or uses tokens
 * @param {string} colorValue - The color value to check
 * @param {string} line - The full line of code for context
 * @returns {boolean} - Whether the color is compliant
 */
function isAllowedColor(colorValue, line) {
  // Normalize color value
  colorValue = colorValue.toLowerCase().trim();
  
  // Allow transparent, currentColor, and inherit
  if (['transparent', 'currentcolor', 'inherit', 'initial', 'unset'].includes(colorValue)) {
    return true;
  }
  
  // Check if using a token variable
  if (line.includes('$color-') || line.includes('var(--color-')) {
    return true;
  }
  
  // Check if it's a function like calc() or a CSS variable
  if (colorValue.startsWith('calc(') || colorValue.startsWith('var(--')) {
    return true;
  }
  
  return false;
}

/**
 * Extract all color values from a file
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @returns {Array} - Array of color issues found
 */
function extractColors(filePath, content) {
  const issues = [];
  const lines = content.split('\n');
  
  lines.forEach((line, lineIndex) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
      return;
    }
    
    // Check for each color pattern
    Object.entries(COLOR_PATTERNS).forEach(([format, pattern]) => {
      let match;
      // Reset the regex
      pattern.lastIndex = 0;
      
      while ((match = pattern.exec(line)) !== null) {
        // Different handling based on color format
        let colorValue;
        let normalizedValue;
        
        switch (format) {
          case 'hex3':
          case 'hex6':
          case 'hex8':
            colorValue = match[0].split(/[\s;,)}\]]/)[0];
            normalizedValue = normalizeHexColor(colorValue);
            break;
          case 'rgb':
            colorValue = match[0];
            normalizedValue = rgbToHex(
              parseInt(match[1], 10),
              parseInt(match[2], 10),
              parseInt(match[3], 10)
            );
            break;
          case 'rgba':
            colorValue = match[0];
            normalizedValue = rgbToHex(
              parseInt(match[1], 10),
              parseInt(match[2], 10),
              parseInt(match[3], 10)
            );
            break;
          case 'hsl':
          case 'hsla':
            colorValue = match[0];
            normalizedValue = colorValue; // Could convert HSL to hex for better matching
            break;
          case 'namedColors':
            colorValue = match[2];
            normalizedValue = colorValue;
            break;
          default:
            colorValue = match[0];
            normalizedValue = colorValue;
        }
        
        // Check if this color is allowed
        const isCompliant = isAllowedColor(colorValue, line);
        
        if (!isCompliant) {
          const suggestedToken = findClosestToken(normalizedValue);
          
          issues.push({
            file: filePath,
            line: lineIndex + 1,
            column: match.index,
            color: colorValue,
            normalizedColor: normalizedValue,
            lineContent: line.trim(),
            suggestion: suggestedToken,
            isCompliant: false
          });
          
          results.nonCompliantColors++;
        } else {
          results.compliantColors++;
        }
        
        results.totalColors++;
      }
    });
  });
  
  return issues;
}

/**
 * Scan a file for color usage
 * @param {string} filePath - Path to file
 * @returns {Object} - Scan results for the file
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileIssues = extractColors(filePath, content);
  
  const fileResult = {
    path: filePath,
    totalColors: fileIssues.length + results.compliantColors - results.nonCompliantColors,
    compliantColors: results.compliantColors - results.nonCompliantColors,
    nonCompliantColors: fileIssues.length,
    issues: fileIssues,
    isCompliant: fileIssues.length === 0
  };
  
  // Reset the counters for the next file
  results.compliantColors -= results.nonCompliantColors;
  results.nonCompliantColors = 0;
  
  return fileResult;
}

/**
 * Generate paths to scan based on configuration and options
 * @returns {Array} - Array of file paths to scan
 */
function getFilesToScan() {
  let basePaths = [...CONFIG.includeDirs];
  
  // If targeting a specific component
  if (options.component) {
    basePaths = [`src/components/${options.component}`];
  }
  
  // If targeting a specific feature
  if (options.feature) {
    basePaths = [`src/features/${options.feature}`];
  }
  
  // Collect all file paths from each base path
  const allFiles = [];
  
  basePaths.forEach(basePath => {
    if (!fs.existsSync(basePath)) {
      console.warn(chalk.yellow(`Warning: Path ${basePath} does not exist.`));
      return;
    }
    
    CONFIG.filePatterns.forEach(pattern => {
      const files = glob.sync(pattern, {
        cwd: basePath,
        absolute: true,
        ignore: CONFIG.excludeDirs.map(dir => `**/${dir}/**`)
      });
      
      allFiles.push(...files);
    });
  });
  
  return allFiles;
}

/**
 * Print test results to the console
 */
function printResults() {
  console.log('\n');
  console.log(chalk.bold('🎨 Color Token Compliance Test Results'));
  console.log(chalk.gray('----------------------------------------'));
  
  // Print summary statistics
  console.log(`📊 ${chalk.bold('Summary:')} (Duration: ${(results.endTime - results.startTime) / 1000}s)`);
  console.log(`   Files scanned: ${chalk.bold(results.scannedFiles)}`);
  console.log(`   Total colors found: ${chalk.bold(results.totalColors)}`);
  
  // Color compliance statistics
  const compliantPercentage = (results.compliantColors / results.totalColors * 100).toFixed(1);
  console.log(`   Compliant colors: ${chalk.green.bold(results.compliantColors)} (${compliantPercentage}%)`);
  console.log(`   Non-compliant colors: ${chalk.red.bold(results.nonCompliantColors)} (${(100 - compliantPercentage).toFixed(1)}%)`);
  
  // File compliance statistics
  const fileCompliantPercentage = (results.compliantFiles / results.scannedFiles * 100).toFixed(1);
  console.log(`   Compliant files: ${chalk.green.bold(results.compliantFiles)} (${fileCompliantPercentage}%)`);
  console.log(`   Non-compliant files: ${chalk.red.bold(results.nonCompliantFiles)} (${(100 - fileCompliantPercentage).toFixed(1)}%)`);
  
  // Print top non-compliant files
  if (results.nonCompliantFiles > 0) {
    console.log('\n' + chalk.bold('📋 Top Non-Compliant Files:'));
    
    const sortedFiles = Object.values(results.fileResults)
      .filter(file => !file.isCompliant)
      .sort((a, b) => b.nonCompliantColors - a.nonCompliantColors)
      .slice(0, 10);
    
    sortedFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${chalk.yellow(file.path)} - ${chalk.red(file.nonCompliantColors)} issues`);
      
      // In verbose mode, show the first 3 issues per file
      if (options.verbose && file.issues.length > 0) {
        file.issues.slice(0, 3).forEach(issue => {
          const suggestion = issue.suggestion ? 
            chalk.green(issue.suggestion) : 
            chalk.gray('No direct token match');
          
          console.log(`      - Line ${issue.line}: ${chalk.red(issue.color)} → ${suggestion}`);
          console.log(`        ${chalk.gray(issue.lineContent)}`);
        });
        
        if (file.issues.length > 3) {
          console.log(`        ${chalk.gray(`... and ${file.issues.length - 3} more issues`)}`);
        }
      }
    });
  }
  
  // Print recommendations
  console.log('\n' + chalk.bold('🚀 Recommendations:'));
  if (results.nonCompliantColors > 0) {
    console.log(`   • ${results.nonCompliantColors} color values should be converted to design tokens`);
    console.log(`   • Focus on the top non-compliant files first for maximum impact`);
    if (options.report) {
      console.log(`   • Review the HTML report for detailed information on each issue`);
    } else {
      console.log(`   • Run with ${chalk.yellow('--report')} flag to generate a detailed HTML report`);
    }
  } else {
    console.log(`   • ${chalk.green('Great job! All colors are using the design token system.')}`);
  }
  
  console.log('\n');
}

/**
 * Generate an HTML report
 */
function generateReport() {
  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, 'color-token-report.html');
  const timestamp = new Date().toLocaleString();
  
  // Get sorted list of non-compliant files
  const sortedFiles = Object.values(results.fileResults)
    .filter(file => !file.isCompliant)
    .sort((a, b) => b.nonCompliantColors - a.nonCompliantColors);
  
  // Create HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Color Token Compliance Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eaeaea;
    }
    h1, h2, h3 {
      color: #333;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      background-color: #f9f9f9;
      border-radius: 5px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary-card h3 {
      margin-top: 0;
      color: #555;
      font-size: 0.9rem;
      text-transform: uppercase;
    }
    .summary-card p {
      font-size: 1.8rem;
      font-weight: bold;
      margin: 0;
    }
    .summary-card .percentage {
      font-size: 1rem;
      color: #777;
    }
    .file-list {
      margin-bottom: 2rem;
    }
    .file-item {
      background-color: #f9f9f9;
      margin-bottom: 1rem;
      border-radius: 5px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .file-item h3 {
      margin-top: 0;
      display: flex;
      justify-content: space-between;
    }
    .file-path {
      font-family: monospace;
      word-break: break-all;
    }
    .issue-count {
      background-color: #e53e3e;
      color: white;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.8rem;
    }
    .issue-list {
      font-family: monospace;
      font-size: 0.9rem;
    }
    .issue {
      background-color: #fff;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border-radius: 3px;
      border-left: 3px solid #e53e3e;
    }
    .issue-location {
      font-weight: bold;
      margin-bottom: 0.3rem;
    }
    .issue-code {
      background-color: #f1f1f1;
      padding: 0.5rem;
      border-radius: 3px;
      overflow-x: auto;
    }
    .issue-suggestion {
      margin-top: 0.5rem;
      color: #2b6cb0;
    }
    .issue-color {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      margin-right: 0.3rem;
      border: 1px solid #ddd;
      vertical-align: middle;
    }
    footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #eaeaea;
      font-size: 0.8rem;
      color: #777;
    }
    .compliant { color: #38a169; }
    .non-compliant { color: #e53e3e; }
  </style>
</head>
<body>
  <header>
    <h1>Color Token Compliance Report</h1>
    <p>Generated on ${timestamp}</p>
  </header>
  
  <section class="summary">
    <div class="summary-card">
      <h3>Files Scanned</h3>
      <p>${results.scannedFiles}</p>
    </div>
    <div class="summary-card">
      <h3>Colors Found</h3>
      <p>${results.totalColors}</p>
    </div>
    <div class="summary-card">
      <h3>Compliant Colors</h3>
      <p class="compliant">${results.compliantColors} <span class="percentage">(${(results.compliantColors / results.totalColors * 100).toFixed(1)}%)</span></p>
    </div>
    <div class="summary-card">
      <h3>Non-Compliant Colors</h3>
      <p class="non-compliant">${results.nonCompliantColors} <span class="percentage">(${(results.nonCompliantColors / results.totalColors * 100).toFixed(1)}%)</span></p>
    </div>
    <div class="summary-card">
      <h3>Compliant Files</h3>
      <p class="compliant">${results.compliantFiles} <span class="percentage">(${(results.compliantFiles / results.scannedFiles * 100).toFixed(1)}%)</span></p>
    </div>
    <div class="summary-card">
      <h3>Non-Compliant Files</h3>
      <p class="non-compliant">${results.nonCompliantFiles} <span class="percentage">(${(results.nonCompliantFiles / results.scannedFiles * 100).toFixed(1)}%)</span></p>
    </div>
  </section>
  
  <section class="file-list">
    <h2>Non-Compliant Files (${sortedFiles.length})</h2>
    ${sortedFiles.map(file => `
    <div class="file-item">
      <h3>
        <span class="file-path">${file.path}</span>
        <span class="issue-count">${file.nonCompliantColors} issues</span>
      </h3>
      <div class="issue-list">
        ${file.issues.map(issue => `
        <div class="issue">
          <div class="issue-location">Line ${issue.line}, Column ${issue.column}</div>
          <div class="issue-code">${issue.lineContent.replace(issue.color, `<strong>${issue.color}</strong>`)}</div>
          <div class="issue-suggestion">
            <span class="issue-color" style="background-color: ${issue.color};"></span>
            <strong>${issue.color}</strong> → ${issue.suggestion || 'No direct token match'}
          </div>
        </div>
        `).join('')}
      </div>
    </div>
    `).join('')}
  </section>
  
  <footer>
    <p>Color Token Compliance Report • Generated by color-token-tester.js</p>
  </footer>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(chalk.green(`HTML report generated: ${reportPath}`));
}

/**
 * Main function
 */
function main() {
  console.log(chalk.bold('🎨 Color Token Compliance Tester'));
  console.log(chalk.gray('Running scan...'));
  
  // Get files to scan
  const filesToScan = getFilesToScan();
  results.totalFiles = filesToScan.length;
  
  // Display scan configuration
  if (options.verbose) {
    console.log(`Scanning ${filesToScan.length} files...`);
    if (options.component) {
      console.log(`Focusing on component: ${options.component}`);
    }
    if (options.feature) {
      console.log(`Focusing on feature: ${options.feature}`);
    }
  }
  
  // Scan each file
  filesToScan.forEach((file, index) => {
    if (options.verbose) {
      process.stdout.write(`\r${chalk.gray(`Scanning file ${index + 1}/${filesToScan.length}: ${file}`)}`);
    }
    
    const fileResult = scanFile(file);
    results.fileResults[file] = fileResult;
    results.scannedFiles++;
    
    if (fileResult.isCompliant) {
      results.compliantFiles++;
    } else {
      results.nonCompliantFiles++;
      results.issues.push(...fileResult.issues);
    }
  });
  
  // Clear scanning line in verbose mode
  if (options.verbose) {
    process.stdout.write('\r' + ' '.repeat(100) + '\r');
  }
  
  // Record end time
  results.endTime = new Date();
  
  // Print results to console
  printResults();
  
  // Generate HTML report if requested
  if (options.report) {
    generateReport();
  }
  
  // Exit with appropriate code
  process.exit(results.nonCompliantColors > 0 ? 1 : 0);
}

// Run the main function
main(); 