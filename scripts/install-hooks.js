#!/usr/bin/env node

/**
 * Git Hooks Installer for FitCopilot
 * 
 * This script installs custom Git hooks to help enforce design system standards.
 * It should be run after initial project setup and after any hook changes.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const HOOKS_SOURCE_DIR = path.resolve(__dirname, 'git-hooks');
const HOOKS_DEST_DIR = path.resolve(__dirname, '..', '.git', 'hooks');

// Colors for output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

/**
 * Make file executable
 * @param {string} filePath - Path to file
 */
function makeExecutable(filePath) {
  try {
    fs.chmodSync(filePath, '0755');
  } catch (err) {
    console.error(`${COLORS.red}Error making file executable: ${err.message}${COLORS.reset}`);
    process.exit(1);
  }
}

/**
 * Check if Git hooks directory exists
 * If running in a CI environment or Git is not initialized, exit gracefully
 */
function checkGitHooksDir() {
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    console.log(`${COLORS.yellow}Running in CI environment, skipping Git hooks installation.${COLORS.reset}`);
    process.exit(0);
  }

  // See if .git exists
  const gitDir = path.resolve(__dirname, '..', '.git');
  if (!fs.existsSync(gitDir)) {
    console.log(`${COLORS.yellow}No .git directory found, skipping Git hooks installation.${COLORS.reset}`);
    console.log(`${COLORS.yellow}If you're in a Git repository, run this script from the project root.${COLORS.reset}`);
    process.exit(0);
  }

  // Create hooks directory if it doesn't exist
  if (!fs.existsSync(HOOKS_DEST_DIR)) {
    try {
      fs.mkdirSync(HOOKS_DEST_DIR, { recursive: true });
    } catch (err) {
      console.error(`${COLORS.red}Error creating hooks directory: ${err.message}${COLORS.reset}`);
      process.exit(1);
    }
  }
}

/**
 * Install Git hooks
 */
function installHooks() {
  console.log(`${COLORS.blue}${COLORS.bright}Installing FitCopilot Git hooks...${COLORS.reset}`);
  
  // Check if source directory exists
  if (!fs.existsSync(HOOKS_SOURCE_DIR)) {
    console.error(`${COLORS.red}Hooks source directory not found: ${HOOKS_SOURCE_DIR}${COLORS.reset}`);
    process.exit(1);
  }

  try {
    // Read all files in source directory
    const hookFiles = fs.readdirSync(HOOKS_SOURCE_DIR);
    
    // Copy each hook file to destination
    let installedCount = 0;
    
    for (const hookFile of hookFiles) {
      const sourcePath = path.join(HOOKS_SOURCE_DIR, hookFile);
      const destPath = path.join(HOOKS_DEST_DIR, hookFile);
      
      // Skip if not a file
      if (!fs.statSync(sourcePath).isFile()) continue;
      
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
      makeExecutable(destPath);
      installedCount++;
      
      console.log(`${COLORS.green}✓ Installed hook:${COLORS.reset} ${hookFile}`);
    }
    
    if (installedCount > 0) {
      console.log(`\n${COLORS.green}${COLORS.bright}Successfully installed ${installedCount} Git hooks.${COLORS.reset}`);
    } else {
      console.log(`\n${COLORS.yellow}No hook files found in ${HOOKS_SOURCE_DIR}${COLORS.reset}`);
    }
    
    // Update package.json to include hook installation in postinstall
    ensurePostInstallScript();
    
  } catch (err) {
    console.error(`${COLORS.red}Error installing hooks: ${err.message}${COLORS.reset}`);
    process.exit(1);
  }
}

/**
 * Add hook installation to package.json postinstall script
 */
function ensurePostInstallScript() {
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  
  try {
    // Read and parse package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Check if scripts section exists
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    // Check if postinstall script exists
    const hookInstallerScript = 'node scripts/install-hooks.js';
    
    if (!packageJson.scripts.postinstall) {
      packageJson.scripts.postinstall = hookInstallerScript;
      console.log(`${COLORS.blue}Added postinstall script to package.json${COLORS.reset}`);
    } else if (!packageJson.scripts.postinstall.includes(hookInstallerScript)) {
      packageJson.scripts.postinstall += ` && ${hookInstallerScript}`;
      console.log(`${COLORS.blue}Updated postinstall script in package.json${COLORS.reset}`);
    }
    
    // Add separate hooks installer script
    packageJson.scripts['install-hooks'] = hookInstallerScript;
    
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
  } catch (err) {
    console.error(`${COLORS.yellow}Warning: Could not update package.json: ${err.message}${COLORS.reset}`);
    console.log(`${COLORS.yellow}You may need to manually add 'node scripts/install-hooks.js' to your postinstall script.${COLORS.reset}`);
  }
}

// Main execution
checkGitHooksDir();
installHooks();

console.log(`\n${COLORS.magenta}${COLORS.bright}Git hooks installed!${COLORS.reset}`);
console.log(`${COLORS.magenta}These hooks will help enforce design system standards.${COLORS.reset}`);
console.log(`${COLORS.magenta}Run 'npm run install-hooks' if you need to reinstall hooks.${COLORS.reset}`); 