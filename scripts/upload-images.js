#!/usr/bin/env node

/**
 * Simple runner for bulk upload script
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting bulk upload of images to Firebase Storage...');

try {
  // Use ts-node to run the TypeScript script
  const scriptPath = path.join(__dirname, 'bulk-upload-to-firebase.ts');
  execSync(`npx ts-node "${scriptPath}"`, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Bulk upload completed successfully!');
} catch (error) {
  console.error('❌ Bulk upload failed:', error.message);
  process.exit(1);
}
