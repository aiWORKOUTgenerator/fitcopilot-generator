#!/usr/bin/env node

/**
 * Token Validator Script
 * 
 * Validates color token usage throughout the codebase to ensure design system compliance.
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
  includePatterns: ['**/*.scss', '**/*.css', '**/*.tsx', '**/*.jsx'],
  // Directories to exclude
  excludeDirs: ['node_modules', 'dist', 'build'],
  // Files to exclude
  excludePatterns: ['**/tokens.scss'],
  // Token file path (relative to project root)
  tokenFile: 'src/styles/design-system/tokens/_color-maps.scss',
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
const componentFilter = args.find(arg => arg.startsWith('--component='))?.split('=')[1] || 
                      (args.includes('--component') && args[args.indexOf('--component') + 1]);
const featureFilter = args.find(arg => arg.startsWith('--feature='))?.split('=')[1] || 
                     (args.includes('--feature') && args[args.indexOf('--feature') + 1]);
const filesFilter = args.find(arg => arg.startsWith('--files='))?.split('=')[1] || 
                     (args.includes('--files') && args[args.indexOf('--files') + 1]);
const generateReport = args.includes('--report');

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
    hsla: 0
  },
  issues: []
};

// Regular expressions for finding color values
const REGEX = {
  hex: /#([0-9a-f]{3}|[0-9a-f]{6})(?![0-9a-f])/gi,
  rgb: /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi,
  rgba: /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)/gi,
  hsl: /hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)/gi,
  hsla: /hsla\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*,\s*[0-9.]+\s*\)/gi,
};

/**
 * Loads and parses the token file to extract valid color tokens
 * @returns {Object} Map of token names to values
 */
function loadTokens() {
  try {
    const tokenFilePath = path.resolve(process.cwd(), CONFIG.tokenFile);
    const tokenContent = fs.readFileSync(tokenFilePath, 'utf8');
    
    // Extract variables from SCSS
    const tokenMap = {};
    const variableRegex = /\$([\w-]+):\s*([^;]+);/g;
    let match;
    
    while ((match = variableRegex.exec(tokenContent)) !== null) {
      const [, name, value] = match;
      tokenMap[name] = value.trim();
    }
    
    return tokenMap;
  } catch (error) {
    console.error(chalk.red(`Error loading token file: ${error.message}`));
    process.exit(1);
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
 * Scans a file for hardcoded color values
 * @param {string} filePath Path to the file to scan
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    let fileHasIssues = false;
    const fileIssues = [];

    // Check for each type of color format
    Object.entries(REGEX).forEach(([type, regex]) => {
      let match;
      
      // Use regex.exec in a loop to find all matches
      regex.lastIndex = 0; // Reset regex state
      while ((match = regex.exec(content)) !== null) {
        const value = match[0];
        
        // Skip if it's an allowed value
        if (isAllowedValue(value)) continue;
        
        // Check if this is in a context that might be allowed (like a comment)
        const line = content.substring(0, match.index).split('\n').length;
        const lineContent = content.split('\n')[line - 1];
        
        // Skip comments
        if (lineContent.trim().startsWith('//') || lineContent.includes('/*')) continue;
        
        // It's an issue - record it
        fileHasIssues = true;
        results.totalIssues++;
        results.issuesByType[type]++;
        
        fileIssues.push({
          type,
          value,
          line,
          column: match.index - content.lastIndexOf('\n', match.index),
          context: lineContent.trim()
        });
      }
    });

    if (fileHasIssues) {
      results.filesWithIssues++;
      results.issues.push({
        file: relativePath,
        issues: fileIssues
      });
    }
    
    results.totalFiles++;
  } catch (error) {
    console.error(chalk.yellow(`Warning: Could not scan file ${filePath}: ${error.message}`));
  }
}

/**
 * Gets the list of files to scan based on configuration and filters
 * @returns {string[]} Array of file paths to scan
 */
function getFilesToScan() {
  // If specific files are provided via a file list
  if (filesFilter) {
    try {
      const filePath = path.resolve(process.cwd(), filesFilter);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      // Get list of files from the provided file
      return fileContent.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => path.resolve(process.cwd(), line.trim()));
    } catch (error) {
      console.error(chalk.red(`Error reading files list: ${error.message}`));
      process.exit(1);
    }
  }

  let searchPattern = CONFIG.includePatterns;
  const ignorePatterns = [
    ...CONFIG.excludeDirs.map(dir => `**/${dir}/**`),
    ...CONFIG.excludePatterns
  ];
  
  // Apply component filter if specified
  if (componentFilter) {
    searchPattern = [`**/components/**/${componentFilter}/**`, `**/Components/**/${componentFilter}/**`];
  }
  
  // Apply feature filter if specified
  if (featureFilter) {
    searchPattern = [`**/features/**/${featureFilter}/**`, `**/Features/**/${featureFilter}/**`];
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
 * Generates an HTML report of token usage
 */
function generateHtmlReport() {
  if (!generateReport) return;
  
  const reportDir = 'reports';
  const reportPath = path.join(reportDir, 'token-validation-report.html');
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Extract top 10 most frequent hardcoded values
  const valueFrequency = {};
  results.issues.forEach(fileResult => {
    fileResult.issues.forEach(issue => {
      if (!valueFrequency[issue.value]) {
        valueFrequency[issue.value] = 0;
      }
      valueFrequency[issue.value]++;
    });
  });
  
  const topValues = Object.entries(valueFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  // Generate HTML content
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Color Token Validation Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1, h2, h3 {
      margin-top: 2rem;
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
    .card .number {
      font-size: 2rem;
      font-weight: bold;
      margin: 0.5rem 0;
    }
    .file {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 1rem;
    }
    .issue {
      margin: 0.5rem 0;
      padding: 0.5rem;
      background: #f5f5f5;
      border-left: 3px solid #ff5252;
    }
    .color-preview {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border-radius: 3px;
      margin-right: 0.5rem;
      vertical-align: middle;
      border: 1px solid #ddd;
    }
    .top-values {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    .value-card {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .value-count {
      margin-left: auto;
      font-weight: bold;
      background: #f0f0f0;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Color Token Validation Report</h1>
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
  
  <h2>Most Common Hardcoded Values</h2>
  <div class="top-values">
    ${topValues.map(([value, count]) => `
      <div class="value-card">
        <span class="color-preview" style="background-color: ${value}"></span>
        <code>${value}</code>
        <span class="value-count">${count}</span>
      </div>
    `).join('')}
  </div>
  
  <h2>Issues by File</h2>
  ${results.issues.map(fileResult => `
    <div class="file">
      <h3>${fileResult.file}</h3>
      <p>Found ${fileResult.issues.length} issues:</p>
      ${fileResult.issues.slice(0, 10).map(issue => `
        <div class="issue">
          <p>Line ${issue.line}: <strong>${issue.value}</strong></p>
          <pre>${issue.context}</pre>
        </div>
      `).join('')}
      ${fileResult.issues.length > 10 ? `<p>...and ${fileResult.issues.length - 10} more issues.</p>` : ''}
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
 * Prints the validation results to the console
 */
function printResults() {
  console.log('\n' + chalk.bold('=== Token Validation Results ===') + '\n');
  
  // Print summary
  console.log(chalk.bold('Summary:'));
  console.log(`Total files scanned: ${results.totalFiles}`);
  console.log(`Files with issues: ${results.filesWithIssues}`);
  console.log(`Total issues found: ${results.totalIssues}`);
  
  // Print breakdown by type
  console.log('\n' + chalk.bold('Issues by Type:'));
  Object.entries(results.issuesByType).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`${type.padEnd(6)}: ${count}`);
    }
  });
  
  // Print detailed results if verbose or if there are issues
  if (isVerbose && results.issues.length > 0) {
    console.log('\n' + chalk.bold('Detailed Issues:'));
    results.issues.forEach(fileResult => {
      console.log('\n' + chalk.underline(fileResult.file));
      fileResult.issues.forEach(issue => {
        console.log(`  ${chalk.gray(`Line ${issue.line}:`)} ${chalk.red(issue.value)} in:`);
        console.log(`    ${chalk.gray(issue.context)}`);
      });
    });
  }
  
  // Final result
  console.log('\n' + chalk.bold('Result:'));
  if (results.totalIssues === 0) {
    console.log(chalk.green('✓ No token issues found!'));
  } else {
    console.log(chalk.red(`✗ Found ${results.totalIssues} token issues in ${results.filesWithIssues} files.`));
    console.log(chalk.gray('Run with --verbose for detailed information.'));
  }
  
  console.log('\n' + chalk.bold('=== End of Token Validation ===') + '\n');
}

/**
 * Main function that executes the validation process
 */
function main() {
  // Log start
  console.log(chalk.blue('Starting token validation...'));
  
  // Apply filters
  if (componentFilter) {
    console.log(chalk.blue(`Filtering to component: ${componentFilter}`));
  }
  if (featureFilter) {
    console.log(chalk.blue(`Filtering to feature: ${featureFilter}`));
  }
  if (filesFilter) {
    console.log(chalk.blue(`Using files from: ${filesFilter}`));
  }
  
  // Load tokens
  console.log(chalk.blue('Loading tokens...'));
  const tokens = loadTokens();
  console.log(chalk.green(`Loaded ${Object.keys(tokens).length} tokens.`));
  
  // Get files to scan
  const files = getFilesToScan();
  console.log(chalk.blue(`Found ${files.length} files to scan.`));
  
  // Scan each file
  console.log(chalk.blue('Scanning files...'));
  files.forEach(file => {
    if (isVerbose) {
      console.log(chalk.gray(`Scanning ${file}...`));
    }
    scanFile(file);
  });
  
  // Generate HTML report if requested
  if (generateReport) {
    generateHtmlReport();
  }
  
  // Print results
  printResults();
  
  // Exit with appropriate code
  process.exit(results.totalIssues > 0 ? 1 : 0);
}

// Execute main function
main(); 