#!/usr/bin/env node

/**
 * Clear Cache and Rebuild Script
 * 
 * This script clears various cache directories to solve compilation issues
 * and then rebuilds the project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cache directories that should be cleared
const cacheDirs = [
  path.resolve(__dirname, 'node_modules/.cache')
];

// Function to delete folders recursively
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    console.log(`🗑️  Deleting cache: ${folderPath}`);
    
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        try {
          fs.unlinkSync(curPath);
        } catch (err) {
          console.error(`❌ Could not delete file: ${curPath}`, err.message);
        }
      }
    });
    
    try {
      fs.rmdirSync(folderPath);
      console.log(`✅ Successfully deleted: ${folderPath}`);
    } catch (err) {
      console.error(`❌ Could not delete directory: ${folderPath}`, err.message);
    }
  }
}

// Clear cache folders
console.log('🧹 Starting cache cleanup...');
cacheDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    deleteFolderRecursive(dir);
  } else {
    console.log(`⚠️ Cache directory does not exist: ${dir}`);
  }
});

// Skip npm ci since there are dependency conflicts
console.log('\n⏩ Skipping dependency reinstallation due to conflicts');

// Rebuild the project
console.log('\n🔨 Rebuilding project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Project rebuilt successfully');
} catch (error) {
  console.error('❌ Error rebuilding project:', error.message);
  process.exit(1);
}

console.log('\n🎉 Cache clearing and rebuild completed successfully!'); 