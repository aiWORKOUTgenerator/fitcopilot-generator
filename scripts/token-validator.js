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
  tokenFile: 'src/styles/tokens.scss',
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
  
  // Print results
  printResults();
  
  // Exit with appropriate code
  process.exit(results.totalIssues > 0 ? 1 : 0);
}

// Execute main function
main(); 