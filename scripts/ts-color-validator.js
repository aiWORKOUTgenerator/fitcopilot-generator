#!/usr/bin/env node

/**
 * TypeScript Color Token Validator
 * 
 * Validates color token usage in TypeScript/TSX files to detect non-compliant
 * CSS-in-JS implementations that use hardcoded colors instead of design tokens.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const CONFIG = {
  // Directories to scan
  includeDirs: ['src'],
  // File patterns to include
  includePatterns: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
  // Directories to exclude
  excludeDirs: ['node_modules', 'dist', 'build'],
  // Files to exclude
  excludePatterns: ['**/tokens.ts', '**/colors.ts', '**/theme.ts'],
  // Design token file path (for reference)
  tokenFile: 'src/styles/design-system/_colors.scss',
  // Allowed exceptions (won't be flagged)
  allowedValues: [
    'transparent',
    '#000', '#000000', 'rgb(0,0,0)', 'rgb(0, 0, 0)', 'rgba(0,0,0,', 'rgba(0, 0, 0,', 
    '#fff', '#ffffff', 'rgb(255,255,255)', 'rgb(255, 255, 255)', 'rgba(255,255,255,', 'rgba(255, 255, 255,'
  ]
};

// Command line arguments
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose');
const shouldGenerateReport = args.includes('--report');
const componentFilter = args.find(arg => arg.startsWith('--component='))?.split('=')[1];
const featureFilter = args.find(arg => arg.startsWith('--feature='))?.split('=')[1];

// State for tracking results
const results = {
  totalFiles: 0,
  filesWithIssues: 0,
  totalIssues: 0,
  issuesByType: {
    hex: 0,
    rgb: 0,
    rgba: 0,
    hsl: 0,
    hsla: 0,
    namedColor: 0
  },
  issues: []
};

// Regular expressions for finding color values in TS/TSX files
// These are designed to match CSS-in-JS patterns
const REGEX = {
  // Matches property: '#hex' patterns
  hexProperty: /(\w+)\s*:\s*['"]?(#([0-9a-f]{3}|[0-9a-f]{6}))['"]?/gi,
  // Matches property: 'rgb(...)' patterns
  rgbProperty: /(\w+)\s*:\s*['"]?(rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))['"]?/gi,
  // Matches property: 'rgba(...)' patterns
  rgbaProperty: /(\w+)\s*:\s*['"]?(rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\))['"]?/gi,
  // Matches property: 'hsl(...)' patterns
  hslProperty: /(\w+)\s*:\s*['"]?(hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\))['"]?/gi,
  // Matches property: 'hsla(...)' patterns
  hslaProperty: /(\w+)\s*:\s*['"]?(hsla\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*,\s*[0-9.]+\s*\))['"]?/gi,
  // Matches property: 'colorName' patterns (for common CSS color names)
  namedColorProperty: /(\w+)\s*:\s*['"]?(aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|purple|red|silver|teal|white|yellow)['"]?(?!\w)/gi
};

// Color-related CSS properties to focus on
const COLOR_PROPERTIES = [
  'color',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'textDecorationColor',
  'fill',
  'stroke',
  'background',
  'border'
];

/**
 * Loads and parses color tokens for reference
 * @returns {Object} Map of token names to values
 */
function loadTokens() {
  try {
    const tokenFilePath = path.resolve(process.cwd(), CONFIG.tokenFile);
    const tokenContent = fs.readFileSync(tokenFilePath, 'utf8');
    
    // Extract variables from SCSS
    const tokenMap = {};
    // Match CSS variable declarations
    const variableRegex = /--color-([^:]+):\s*([^;]+);/g;
    let match;
    
    while ((match = variableRegex.exec(tokenContent)) !== null) {
      const [, name, value] = match;
      tokenMap[name] = value.trim();
    }
    
    return tokenMap;
  } catch (error) {
    console.error(chalk.red(`Error loading token file: ${error.message}`));
    return {};
  }
}

/**
 * Check if a value is in the allowed exceptions list
 * @param {string} value The color value to check
 * @returns {boolean} True if the value is allowed, false otherwise
 */
function isAllowedValue(value) {
  return CONFIG.allowedValues.some(allowed => {
    // For exact matches
    if (value === allowed) return true;
    // For rgba values with alpha
    if (allowed.endsWith(',') && value.startsWith(allowed)) return true;
    return false;
  });
}

/**
 * Check if a property should be excluded
 * @param {string} property The property name
 * @returns {boolean} True if the property should not be checked
 */
function shouldCheckProperty(property) {
  return COLOR_PROPERTIES.some(colorProp => 
    property.toLowerCase() === colorProp.toLowerCase() || 
    property.toLowerCase().includes('color')
  );
}

/**
 * Suggests a token based on the detected color value
 * @param {string} colorValue The raw color value 
 * @param {object} tokens Available tokens
 * @returns {string} Suggested token replacement
 */
function suggestToken(colorValue, tokens) {
  // This would ideally match colors to closest design tokens
  // For now, just returning a basic suggestion
  if (colorValue.includes('rgb(31, 173, 159)') || colorValue.includes('#1fad9f')) {
    return 'var(--color-primary)';
  }
  if (colorValue.includes('rgb(212, 160, 23)') || colorValue.includes('#d4a017')) {
    return 'var(--color-accent)';
  }
  
  // For other colors, suggest the appropriate category
  if (colorValue.includes('rgb(0, 0, 0)') || colorValue.includes('#000')) {
    return 'var(--color-text)';
  }
  if (colorValue.includes('rgb(255, 255, 255)') || colorValue.includes('#fff')) {
    return 'var(--color-surface)';
  }
  
  return 'Use an appropriate design token';
}

/**
 * Process a regex match from a file
 * @param {object} match The regex match result
 * @param {string} type The type of color (hex, rgb, etc)
 * @param {string} fileContent The file content
 * @param {string} filePath The file path
 * @param {object} tokens Available tokens
 */
function processMatch(match, type, fileContent, filePath, tokens) {
  const [fullMatch, property, colorValue] = match;
  
  // Skip if not a color-related property
  if (!shouldCheckProperty(property)) return;
  
  // Skip if it's an allowed value
  if (isAllowedValue(colorValue)) return;
  
  // Get the line number and content for context
  const line = fileContent.substring(0, match.index).split('\n').length;
  const lineContent = fileContent.split('\n')[line - 1].trim();
  
  // Skip if it's in a comment
  if (lineContent.startsWith('//') || lineContent.includes('/*')) return;
  
  // It's an issue - record it
  results.totalIssues++;
  results.issuesByType[type]++;
  
  // Add to the file's issues
  const suggestion = suggestToken(colorValue, tokens);
  const fileRelativePath = path.relative(process.cwd(), filePath);
  
  let fileIssueIndex = results.issues.findIndex(issue => issue.file === fileRelativePath);
  if (fileIssueIndex === -1) {
    results.filesWithIssues++;
    fileIssueIndex = results.issues.push({
      file: fileRelativePath,
      issues: []
    }) - 1;
  }
  
  results.issues[fileIssueIndex].issues.push({
    type,
    property,
    value: colorValue,
    line,
    column: match.index - fileContent.lastIndexOf('\n', match.index),
    context: lineContent,
    suggestion
  });
}

/**
 * Scans a file for hardcoded color values in CSS-in-JS patterns
 * @param {string} filePath Path to the file to scan
 * @param {object} tokens Available tokens
 */
function scanFile(filePath, tokens) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    results.totalFiles++;
    
    // Check for each type of color format
    Object.entries(REGEX).forEach(([type, regex]) => {
      let match;
      
      // Reset regex state
      regex.lastIndex = 0; 
      
      // Find all matches for this pattern
      while ((match = regex.exec(content)) !== null) {
        // Clean up type name for reporting
        const cleanType = type.replace('Property', '');
        processMatch(match, cleanType, content, filePath, tokens);
      }
    });
  } catch (error) {
    console.error(chalk.yellow(`Warning: Could not scan file ${filePath}: ${error.message}`));
  }
}

/**
 * Gets the list of files to scan based on configuration and filters
 * @returns {string[]} Array of file paths to scan
 */
function getFilesToScan() {
  let searchPattern = CONFIG.includePatterns.map(pattern => 
    CONFIG.includeDirs.map(dir => `${dir}/${pattern}`)).flat();
  
  const ignorePatterns = [
    ...CONFIG.excludeDirs.map(dir => `**/${dir}/**`),
    ...CONFIG.excludePatterns
  ];
  
  // Apply component filter if specified
  if (componentFilter) {
    searchPattern = [
      `**/components/**/${componentFilter}.tsx`,
      `**/components/**/${componentFilter}.ts`,
      `**/components/**/${componentFilter}.jsx`,
      `**/components/**/${componentFilter}.js`,
      `**/Components/**/${componentFilter}.tsx`,
      `**/Components/**/${componentFilter}.ts`,
      `**/Components/**/${componentFilter}.jsx`,
      `**/Components/**/${componentFilter}.js`,
      // Also check subfolders with the component name
      `**/components/${componentFilter}/**/*.tsx`,
      `**/components/${componentFilter}/**/*.ts`,
      `**/components/${componentFilter}/**/*.jsx`,
      `**/components/${componentFilter}/**/*.js`,
      `**/Components/${componentFilter}/**/*.tsx`,
      `**/Components/${componentFilter}/**/*.ts`,
      `**/Components/${componentFilter}/**/*.jsx`,
      `**/Components/${componentFilter}/**/*.js`
    ];
  }
  
  // Apply feature filter if specified
  if (featureFilter) {
    searchPattern = [
      `**/features/${featureFilter}/**/*.tsx`,
      `**/features/${featureFilter}/**/*.ts`,
      `**/features/${featureFilter}/**/*.jsx`,
      `**/features/${featureFilter}/**/*.js`,
      `**/Features/${featureFilter}/**/*.tsx`,
      `**/Features/${featureFilter}/**/*.ts`,
      `**/Features/${featureFilter}/**/*.jsx`,
      `**/Features/${featureFilter}/**/*.js`
    ];
  }
  
  // Find all matching files
  const files = [];
  for (const pattern of searchPattern) {
    const matches = glob.sync(pattern, {
      ignore: ignorePatterns,
      cwd: process.cwd(),
      absolute: true
    });
    files.push(...matches);
  }
  
  return files;
}

/**
 * Prints the validation results to the console
 */
function printResults() {
  console.log('\n' + chalk.bold('=== TypeScript Color Token Validation Results ===') + '\n');
  
  // Print summary
  console.log(chalk.bold('Summary:'));
  console.log(`Total files scanned: ${results.totalFiles}`);
  console.log(`Files with issues: ${results.filesWithIssues}`);
  console.log(`Total issues found: ${results.totalIssues}`);
  
  // Print breakdown by type
  console.log('\n' + chalk.bold('Issues by Type:'));
  Object.entries(results.issuesByType).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`${type.padEnd(10)}: ${count}`);
    }
  });
  
  // Print detailed results if verbose or if there are issues
  if ((isVerbose || shouldGenerateReport) && results.issues.length > 0) {
    console.log('\n' + chalk.bold('Detailed Issues:'));
    results.issues.forEach(fileResult => {
      console.log('\n' + chalk.underline(fileResult.file));
      fileResult.issues.forEach(issue => {
        console.log(`  ${chalk.gray(`Line ${issue.line}:`)} ${chalk.yellow(issue.property)}: ${chalk.red(issue.value)} in:`);
        console.log(`    ${chalk.gray(issue.context)}`);
        console.log(`    ${chalk.green(`Suggestion: ${issue.suggestion}`)}`);
      });
    });
  }
  
  // Final result
  console.log('\n' + chalk.bold('Result:'));
  if (results.totalIssues === 0) {
    console.log(chalk.green('✓ No CSS-in-JS color token issues found!'));
  } else {
    console.log(chalk.red(`✗ Found ${results.totalIssues} CSS-in-JS color token issues in ${results.filesWithIssues} files.`));
    console.log(chalk.gray('Run with --verbose for detailed information.'));
  }
  
  console.log('\n' + chalk.bold('=== End of TypeScript Color Token Validation ===') + '\n');
}

/**
 * Generates an HTML report of the validation results
 */
function generateReport() {
  if (!shouldGenerateReport) return;
  
  const reportDir = 'reports';
  const reportPath = path.join(reportDir, 'ts-color-validation-report.html');
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Generate HTML content
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TypeScript Color Token Validation Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1, h2, h3 {
      margin-top: 2rem;
    }
    h1 {
      border-bottom: 2px solid #eee;
      padding-bottom: 0.5rem;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    .card {
      background: #f9f9f9;
      border-radius: 4px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .card h3 {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5rem;
    }
    .card .number {
      font-size: 2rem;
      font-weight: bold;
      margin: 1rem 0;
    }
    .file {
      margin-bottom: 2rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 1rem;
    }
    .file h3 {
      margin-bottom: 0.5rem;
    }
    .issue {
      background: #fff;
      border-left: 4px solid #ff5252;
      padding: 0.75rem;
      margin: 0.75rem 0;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .issue .property {
      color: #2196F3;
      font-weight: bold;
    }
    .issue .value {
      color: #ff5252;
      font-weight: bold;
    }
    .issue .context {
      font-family: monospace;
      background: #f5f5f5;
      padding: 0.5rem;
      margin: 0.5rem 0;
      border-radius: 4px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .issue .suggestion {
      color: #4CAF50;
      font-weight: bold;
    }
    .types {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .type-card {
      flex: 1;
      min-width: 150px;
      text-align: center;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .type-card .type-name {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .type-card .type-count {
      font-size: 1.5rem;
      color: #ff5252;
    }
  </style>
</head>
<body>
  <h1>TypeScript Color Token Validation Report</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <div class="card">
      <h3>Files Scanned</h3>
      <div class="number">${results.totalFiles}</div>
    </div>
    <div class="card">
      <h3>Files with Issues</h3>
      <div class="number">${results.filesWithIssues}</div>
    </div>
    <div class="card">
      <h3>Total Issues</h3>
      <div class="number">${results.totalIssues}</div>
    </div>
  </div>
  
  <h2>Issues by Type</h2>
  <div class="types">
    ${Object.entries(results.issuesByType)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => `
        <div class="type-card">
          <div class="type-name">${type}</div>
          <div class="type-count">${count}</div>
        </div>
      `).join('')}
  </div>
  
  <h2>Detailed Issues</h2>
  ${results.issues.map(fileResult => `
    <div class="file">
      <h3>${fileResult.file}</h3>
      ${fileResult.issues.map(issue => `
        <div class="issue">
          <div>Line ${issue.line}: <span class="property">${issue.property}</span>: <span class="value">${issue.value}</span></div>
          <div class="context">${issue.context}</div>
          <div class="suggestion">Suggestion: ${issue.suggestion}</div>
        </div>
      `).join('')}
    </div>
  `).join('')}
</body>
</html>
  `;
  
  // Write HTML to file
  fs.writeFileSync(reportPath, html);
  console.log(chalk.blue(`Report generated at: ${reportPath}`));
}

/**
 * Main function that executes the validation process
 */
function main() {
  // Log start
  console.log(chalk.blue('Starting TypeScript color token validation...'));
  
  // Load tokens for reference
  const tokens = loadTokens();
  
  // Get files to scan
  const files = getFilesToScan();
  console.log(chalk.blue(`Found ${files.length} files to scan.`));
  
  // Scan files
  files.forEach(file => scanFile(file, tokens));
  
  // Print results
  printResults();
  
  // Generate report if requested
  if (shouldGenerateReport) {
    generateReport();
  }
  
  // Exit with appropriate code
  process.exit(results.totalIssues > 0 ? 1 : 0);
}

// Run the script
main(); 