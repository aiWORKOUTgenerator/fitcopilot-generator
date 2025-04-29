/**
 * Token Usage Analyzer
 * 
 * This script helps identify token usage patterns throughout the codebase.
 * It scans scss files and counts occurrences of tokens to help prioritize migration.
 * 
 * Usage:
 * 1. Navigate to the root directory
 * 2. Run: node src/styles/design-system/scripts/token-usage-analyzer.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const STYLES_DIR = path.resolve(__dirname, '../../../');
const OUTPUT_FILE = path.resolve(__dirname, '../docs/token-usage-report.md');

// Token patterns to search for
const tokenPatterns = {
  colors: [
    { pattern: /\$primary-color(?![-a-zA-Z0-9])/g, name: '$primary-color' },
    { pattern: /\$primary-color-light/g, name: '$primary-color-light' },
    { pattern: /\$primary-color-dark/g, name: '$primary-color-dark' },
    { pattern: /\$secondary-color(?![-a-zA-Z0-9])/g, name: '$secondary-color' },
    { pattern: /\$text-color(?![-a-zA-Z0-9])/g, name: '$text-color' },
    { pattern: /\$text-color-light/g, name: '$text-color-light' },
    { pattern: /\$border-color(?![-a-zA-Z0-9])/g, name: '$border-color' },
    { pattern: /\$bg-color(?![-a-zA-Z0-9])/g, name: '$bg-color' },
    { pattern: /\$success-color/g, name: '$success-color' },
    { pattern: /\$error-color/g, name: '$error-color' },
    { pattern: /\$warning-color/g, name: '$warning-color' },
    { pattern: /\$info-color/g, name: '$info-color' },
    // CSS variables
    { pattern: /--primary-color(?![-a-zA-Z0-9])/g, name: '--primary-color' },
    { pattern: /--text-color(?![-a-zA-Z0-9])/g, name: '--text-color' },
    { pattern: /--border-color(?![-a-zA-Z0-9])/g, name: '--border-color' },
    { pattern: /--bg-color(?![-a-zA-Z0-9])/g, name: '--bg-color' },
  ],
  typography: [
    { pattern: /\$font-family(?![-a-zA-Z0-9])/g, name: '$font-family' },
    { pattern: /\$font-family-mono/g, name: '$font-family-mono' },
    { pattern: /\$font-size-xs/g, name: '$font-size-xs' },
    { pattern: /\$font-size-sm/g, name: '$font-size-sm' },
    { pattern: /\$font-size-base/g, name: '$font-size-base' },
    { pattern: /\$font-size-md/g, name: '$font-size-md' },
    { pattern: /\$font-size-lg/g, name: '$font-size-lg' },
    { pattern: /\$font-size-xl/g, name: '$font-size-xl' },
    { pattern: /\$font-weight-normal/g, name: '$font-weight-normal' },
    { pattern: /\$font-weight-medium/g, name: '$font-weight-medium' },
    { pattern: /\$font-weight-bold/g, name: '$font-weight-bold' },
    { pattern: /\$line-height-normal/g, name: '$line-height-normal' },
  ],
  spacing: [
    { pattern: /\$spacing-xs/g, name: '$spacing-xs' },
    { pattern: /\$spacing-sm/g, name: '$spacing-sm' },
    { pattern: /\$spacing-md/g, name: '$spacing-md' },
    { pattern: /\$spacing-lg/g, name: '$spacing-lg' },
    { pattern: /\$spacing-xl/g, name: '$spacing-xl' },
  ],
};

// Find all SCSS files in the styles directory
const findScssFiles = () => {
  return glob.sync('**/*.scss', { cwd: STYLES_DIR, ignore: ['node_modules/**'] })
    .map(file => path.join(STYLES_DIR, file));
};

// Analyze token usage in a file
const analyzeFile = (filePath, results) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(STYLES_DIR, filePath);
  
  Object.keys(tokenPatterns).forEach(category => {
    tokenPatterns[category].forEach(({ pattern, name }) => {
      const matches = (fileContent.match(pattern) || []).length;
      
      if (matches > 0) {
        if (!results[category][name]) {
          results[category][name] = { count: 0, files: [] };
        }
        
        results[category][name].count += matches;
        results[category][name].files.push({
          path: relativePath,
          count: matches
        });
      }
    });
  });
};

// Generate the report
const generateReport = (results) => {
  let output = '# Token Usage Report\n\n';
  output += 'This report shows the usage frequency of design tokens throughout the codebase.\n\n';
  
  Object.keys(results).forEach(category => {
    output += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Tokens\n\n`;
    
    const tokens = Object.keys(results[category])
      .map(name => ({ 
        name, 
        ...results[category][name],
        totalFiles: results[category][name].files.length
      }))
      .sort((a, b) => b.count - a.count);
    
    output += '| Token | Total Uses | Files | Top Files |\n';
    output += '|-------|------------|-------|----------|\n';
    
    tokens.forEach(token => {
      const topFiles = token.files
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(file => `${file.path} (${file.count})`)
        .join(', ');
      
      output += `| \`${token.name}\` | ${token.count} | ${token.totalFiles} | ${topFiles} |\n`;
    });
    
    output += '\n';
  });
  
  output += '## Recommendations\n\n';
  output += 'Based on this analysis, consider prioritizing the migration of these tokens:\n\n';
  
  const allTokens = [];
  Object.keys(results).forEach(category => {
    Object.keys(results[category]).forEach(name => {
      allTokens.push({
        name,
        category,
        count: results[category][name].count,
        files: results[category][name].files.length
      });
    });
  });
  
  const topTokens = allTokens
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  output += '1. High impact tokens (most widely used):\n';
  topTokens.forEach((token, index) => {
    output += `   ${index + 1}. \`${token.name}\` (${token.count} uses in ${token.files} files)\n`;
  });
  
  return output;
};

// Main function
const analyzeTokenUsage = () => {
  console.log('Analyzing token usage across the codebase...');
  
  const files = findScssFiles();
  console.log(`Found ${files.length} SCSS files to analyze.`);
  
  const results = {
    colors: {},
    typography: {},
    spacing: {}
  };
  
  files.forEach(file => {
    analyzeFile(file, results);
  });
  
  const report = generateReport(results);
  
  // Ensure the directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Analysis complete! Report saved to ${OUTPUT_FILE}`);
};

// Run the analysis
analyzeTokenUsage(); 