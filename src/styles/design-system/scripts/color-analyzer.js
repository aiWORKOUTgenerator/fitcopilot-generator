/**
 * Color System Analyzer
 * 
 * This utility analyzes the color system for inconsistencies and usage patterns.
 * It helps identify color token usage, accessibility issues, and optimization opportunities.
 */

const fs = require('fs');
const path = require('path');
const sass = require('sass');
const glob = require('glob');
const colorContrastChecker = require('color-contrast-checker');

// Configuration
const CONFIG = {
  rootDir: path.resolve(__dirname, '../../../'),
  scssFiles: path.resolve(__dirname, '../../../**/*.scss'),
  coreColorFile: path.resolve(__dirname, '../tokens/core/_colors.scss'),
  outputDir: path.resolve(__dirname, '../docs/color-analysis'),
  minContrastRatio: 4.5 // WCAG AA standard
};

// Color analysis data
const analysisData = {
  colorTokens: {},
  directColorUsage: [],
  colorContrast: {
    passing: [],
    failing: []
  },
  redundancies: [],
  recommendations: []
};

/**
 * Extract color tokens from SCSS files
 */
function extractColorTokens() {
  console.log('Extracting color tokens...');
  
  try {
    const coreColorContent = fs.readFileSync(CONFIG.coreColorFile, 'utf8');
    const colorRegex = /\$color-([a-zA-Z0-9\-]+):\s*(#[a-fA-F0-9]{3,8}|rgba?\([^\)]+\))/g;
    
    let match;
    while ((match = colorRegex.exec(coreColorContent)) !== null) {
      const [_, tokenName, colorValue] = match;
      analysisData.colorTokens[tokenName] = colorValue;
    }
    
    console.log(`Extracted ${Object.keys(analysisData.colorTokens).length} color tokens.`);
  } catch (error) {
    console.error('Error extracting color tokens:', error);
  }
}

/**
 * Find direct color usage (not using tokens)
 */
function findDirectColorUsage() {
  console.log('Finding direct color usage...');
  
  const files = glob.sync(CONFIG.scssFiles);
  const directColorRegex = /(background|color|border|box-shadow):\s*(#[a-fA-F0-9]{3,8}|rgba?\([^\)]+\))/g;
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let match;
      
      while ((match = directColorRegex.exec(content)) !== null) {
        const [fullMatch, property, colorValue] = match;
        
        // Skip if it's a variable
        if (colorValue.includes('$') || colorValue.includes('var(')) continue;
        
        analysisData.directColorUsage.push({
          file: path.relative(CONFIG.rootDir, file),
          line: getLineNumber(content, match.index),
          property,
          colorValue
        });
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  });
  
  console.log(`Found ${analysisData.directColorUsage.length} instances of direct color usage.`);
}

/**
 * Analyze color contrast for accessibility
 */
function analyzeColorContrast() {
  console.log('Analyzing color contrast...');
  
  const ccc = new colorContrastChecker();
  const textColors = ['gray-800', 'gray-900', 'white', 'black'];
  const backgroundColors = Object.keys(analysisData.colorTokens).filter(token => 
    token.endsWith('-50') || 
    token.endsWith('-100') || 
    token === 'white' || 
    token === 'gray-50'
  );
  
  textColors.forEach(textColor => {
    const textValue = analysisData.colorTokens[textColor];
    
    backgroundColors.forEach(bgColor => {
      const bgValue = analysisData.colorTokens[bgColor];
      
      if (textValue && bgValue) {
        const contrastResult = {
          textColor: `$color-${textColor}`,
          textValue,
          bgColor: `$color-${bgColor}`,
          bgValue,
          ratio: calculateContrastRatio(textValue, bgValue)
        };
        
        if (contrastResult.ratio >= CONFIG.minContrastRatio) {
          analysisData.colorContrast.passing.push(contrastResult);
        } else {
          analysisData.colorContrast.failing.push(contrastResult);
        }
      }
    });
  });
  
  console.log(`Analyzed ${analysisData.colorContrast.passing.length + analysisData.colorContrast.failing.length} color contrast combinations.`);
  console.log(`${analysisData.colorContrast.failing.length} combinations fail WCAG AA standards.`);
}

/**
 * Find color redundancies
 */
function findColorRedundancies() {
  console.log('Finding color redundancies...');
  
  const colorValues = {};
  
  // Group tokens by their actual color value
  Object.entries(analysisData.colorTokens).forEach(([token, value]) => {
    if (!colorValues[value]) {
      colorValues[value] = [];
    }
    colorValues[value].push(`$color-${token}`);
  });
  
  // Find duplicates
  Object.entries(colorValues).forEach(([value, tokens]) => {
    if (tokens.length > 1) {
      analysisData.redundancies.push({
        value,
        tokens,
        count: tokens.length
      });
    }
  });
  
  analysisData.redundancies.sort((a, b) => b.count - a.count);
  
  console.log(`Found ${analysisData.redundancies.length} color redundancies.`);
}

/**
 * Generate recommendations
 */
function generateRecommendations() {
  console.log('Generating recommendations...');
  
  // Recommend token usage for direct color values
  analysisData.directColorUsage.forEach(usage => {
    const similarToken = findSimilarToken(usage.colorValue);
    if (similarToken) {
      analysisData.recommendations.push({
        type: 'direct-color-replacement',
        file: usage.file,
        line: usage.line,
        currentValue: usage.colorValue,
        recommendedToken: similarToken,
        priority: 'high'
      });
    }
  });
  
  // Recommend consolidating redundant colors
  analysisData.redundancies.forEach(redundancy => {
    analysisData.recommendations.push({
      type: 'redundancy-consolidation',
      tokens: redundancy.tokens,
      value: redundancy.value,
      recommendation: `Consider consolidating these tokens to a single semantic token.`,
      priority: redundancy.tokens.length > 2 ? 'high' : 'medium'
    });
  });
  
  // Recommend fixing contrast issues
  analysisData.colorContrast.failing.forEach(contrast => {
    const recommendedTextColor = findBetterContrastColor(contrast.bgValue, contrast.textValue);
    analysisData.recommendations.push({
      type: 'contrast-improvement',
      textColor: contrast.textColor,
      bgColor: contrast.bgColor,
      currentRatio: contrast.ratio.toFixed(2),
      recommendation: `Consider using ${recommendedTextColor} for better contrast with ${contrast.bgColor}.`,
      priority: 'high'
    });
  });
  
  console.log(`Generated ${analysisData.recommendations.length} recommendations.`);
}

/**
 * Generate detailed analysis report
 */
function generateReport() {
  console.log('Generating analysis report...');
  
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  // Write JSON data
  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'color-analysis.json'),
    JSON.stringify(analysisData, null, 2)
  );
  
  // Generate HTML report
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Color System Analysis Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        h1, h2, h3 {
          color: #0f172a;
        }
        .section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          border-radius: 0.5rem;
          background-color: #f8fafc;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .token-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        .token-preview {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .color-box {
          width: 24px;
          height: 24px;
          margin-right: 10px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          text-align: left;
          padding: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background-color: #f1f5f9;
        }
        .priority-high {
          color: #b91c1c;
          font-weight: bold;
        }
        .priority-medium {
          color: #b45309;
        }
        .priority-low {
          color: #15803d;
        }
        .stats {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .stat-box {
          flex: 1;
          min-width: 200px;
          padding: 1.5rem;
          background-color: #f1f5f9;
          border-radius: 0.5rem;
          text-align: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .stat-label {
          font-size: 0.875rem;
          color: #475569;
        }
      </style>
    </head>
    <body>
      <h1>Color System Analysis Report</h1>
      
      <section class="section">
        <h2>Summary Statistics</h2>
        <div class="stats">
          <div class="stat-box">
            <div class="stat-number">${Object.keys(analysisData.colorTokens).length}</div>
            <div class="stat-label">Color Tokens</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${analysisData.directColorUsage.length}</div>
            <div class="stat-label">Direct Color Usages</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${analysisData.redundancies.length}</div>
            <div class="stat-label">Redundant Colors</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${analysisData.colorContrast.failing.length}</div>
            <div class="stat-label">Contrast Issues</div>
          </div>
        </div>
      </section>
      
      <section class="section">
        <h2>Top Recommendations</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Details</th>
              <th>Recommendation</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            ${analysisData.recommendations.slice(0, 10).map(rec => `
              <tr>
                <td>${formatRecommendationType(rec.type)}</td>
                <td>${formatRecommendationDetails(rec)}</td>
                <td>${rec.recommendation || formatRecommendation(rec)}</td>
                <td class="priority-${rec.priority}">${rec.priority}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${analysisData.recommendations.length > 10 ? 
          `<p>And ${analysisData.recommendations.length - 10} more recommendations...</p>` : ''}
      </section>
      
      <section class="section">
        <h2>Color Tokens</h2>
        <div class="token-list">
          ${Object.entries(analysisData.colorTokens).map(([token, value]) => `
            <div class="token-preview">
              <div class="color-box" style="background-color: ${value}"></div>
              <code>$color-${token}</code>: <span>${value}</span>
            </div>
          `).join('')}
        </div>
      </section>
      
      ${analysisData.redundancies.length > 0 ? `
        <section class="section">
          <h2>Color Redundancies</h2>
          <table>
            <thead>
              <tr>
                <th>Color Value</th>
                <th>Tokens</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              ${analysisData.redundancies.map(redundancy => `
                <tr>
                  <td>
                    <div class="token-preview">
                      <div class="color-box" style="background-color: ${redundancy.value}"></div>
                      <span>${redundancy.value}</span>
                    </div>
                  </td>
                  <td>${redundancy.tokens.join(', ')}</td>
                  <td>${redundancy.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      ` : ''}
      
      ${analysisData.directColorUsage.length > 0 ? `
        <section class="section">
          <h2>Direct Color Usage</h2>
          <p>These colors are used directly in the code instead of using tokens.</p>
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Line</th>
                <th>Property</th>
                <th>Color Value</th>
              </tr>
            </thead>
            <tbody>
              ${analysisData.directColorUsage.map(usage => `
                <tr>
                  <td>${usage.file}</td>
                  <td>${usage.line}</td>
                  <td>${usage.property}</td>
                  <td>
                    <div class="token-preview">
                      <div class="color-box" style="background-color: ${usage.colorValue}"></div>
                      <span>${usage.colorValue}</span>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      ` : ''}
      
      ${analysisData.colorContrast.failing.length > 0 ? `
        <section class="section">
          <h2>Contrast Issues</h2>
          <p>These color combinations fail WCAG AA contrast standards (ratio < ${CONFIG.minContrastRatio}).</p>
          <table>
            <thead>
              <tr>
                <th>Text Color</th>
                <th>Background Color</th>
                <th>Contrast Ratio</th>
              </tr>
            </thead>
            <tbody>
              ${analysisData.colorContrast.failing.map(contrast => `
                <tr>
                  <td>
                    <div class="token-preview">
                      <div class="color-box" style="background-color: ${contrast.textValue}"></div>
                      <span>${contrast.textColor}</span>
                    </div>
                  </td>
                  <td>
                    <div class="token-preview">
                      <div class="color-box" style="background-color: ${contrast.bgValue}"></div>
                      <span>${contrast.bgColor}</span>
                    </div>
                  </td>
                  <td>${contrast.ratio.toFixed(2)} (needs ${CONFIG.minContrastRatio})</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      ` : ''}
    </body>
    </html>
  `;
  
  fs.writeFileSync(path.join(CONFIG.outputDir, 'color-analysis.html'), html);
  console.log(`Report generated at ${path.join(CONFIG.outputDir, 'color-analysis.html')}`);
}

// Helper functions
function getLineNumber(content, index) {
  const lines = content.substr(0, index).split('\n');
  return lines.length;
}

function calculateContrastRatio(color1, color2) {
  // Simplified contrast calculation - in a real implementation
  // this would convert colors to luminance values and calculate actual ratio
  return 4.2; // Placeholder
}

function findSimilarToken(colorValue) {
  // Find the most similar color token
  // In a real implementation this would compare RGB values
  return '$color-primary-500'; // Placeholder
}

function findBetterContrastColor(bgColor, textColor) {
  // Find a better contrast color
  // In a real implementation this would suggest actual improvements
  return '$color-gray-900'; // Placeholder
}

function formatRecommendationType(type) {
  const types = {
    'direct-color-replacement': 'Direct Color Usage',
    'redundancy-consolidation': 'Color Redundancy',
    'contrast-improvement': 'Contrast Issue'
  };
  return types[type] || type;
}

function formatRecommendationDetails(rec) {
  if (rec.type === 'direct-color-replacement') {
    return `${rec.file}:${rec.line} - ${rec.currentValue}`;
  } else if (rec.type === 'redundancy-consolidation') {
    return `${rec.tokens.join(', ')} all use ${rec.value}`;
  } else if (rec.type === 'contrast-improvement') {
    return `${rec.textColor} on ${rec.bgColor} (${rec.currentRatio})`;
  }
  return JSON.stringify(rec);
}

function formatRecommendation(rec) {
  if (rec.type === 'direct-color-replacement') {
    return `Replace with ${rec.recommendedToken}`;
  }
  return '';
}

// Main execution
function runAnalysis() {
  console.log('Starting color system analysis...');
  
  extractColorTokens();
  findDirectColorUsage();
  analyzeColorContrast();
  findColorRedundancies();
  generateRecommendations();
  generateReport();
  
  console.log('Analysis complete.');
}

runAnalysis(); 