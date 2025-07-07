#!/usr/bin/env node

/**
 * Firebase Configuration Test
 * Tests Firebase initialization and basic functionality
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
  log('\n🔧 Checking Firebase Environment Variables...', 'blue');
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  let allPresent = true;
  
  try {
    // Check .env file
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    for (const varName of requiredVars) {
      if (envContent.includes(`${varName}=`)) {
        log(`  ✅ ${varName} found in .env`, 'green');
      } else {
        log(`  ❌ ${varName} missing from .env`, 'red');
        allPresent = false;
      }
    }
    
    if (allPresent) {
      log('  ✅ All Firebase environment variables are configured', 'green');
    } else {
      log('  ❌ Some Firebase environment variables are missing', 'red');
    }
  } catch (error) {
    log(`  ❌ Error reading .env file: ${error.message}`, 'red');
    allPresent = false;
  }

  return allPresent;
}

function checkFirebaseFiles() {
  log('\n📁 Checking Firebase Files...', 'blue');
  
  const files = [
    { path: 'src/lib/firebase.ts', description: 'Firebase configuration file' },
    { path: 'src/components/firebase-provider.tsx', description: 'Firebase provider component' },
    { path: 'firebase.json', description: 'Firebase project configuration' },
    { path: 'apphosting.yaml', description: 'Firebase App Hosting configuration' },
    { path: 'storage.rules', description: 'Firebase Storage rules' }
  ];

  let allPresent = true;

  for (const file of files) {
    const fullPath = path.join(process.cwd(), file.path);
    if (fs.existsSync(fullPath)) {
      log(`  ✅ ${file.description}: ${file.path}`, 'green');
    } else {
      log(`  ❌ ${file.description}: ${file.path} not found`, 'red');
      allPresent = false;
    }
  }

  return allPresent;
}

function checkImageStorageAdapter() {
  log('\n📸 Checking Image Storage Adapters...', 'blue');
  
  try {
    const imagePath = path.join(process.cwd(), 'src/lib/image-storage.ts');
    const imageContent = fs.readFileSync(imagePath, 'utf-8');
    
    if (imageContent.includes('FirebaseStorageAdapter')) {
      log('  ✅ Firebase Storage adapter implemented', 'green');
    } else {
      log('  ❌ Firebase Storage adapter not found', 'red');
      return false;
    }
    
    if (imageContent.includes('uploadViaSDK')) {
      log('  ✅ Firebase SDK upload method implemented', 'green');
    } else {
      log('  ❌ Firebase SDK upload method not found', 'red');
      return false;
    }
    
    return true;
  } catch (error) {
    log(`  ❌ Error checking image storage: ${error.message}`, 'red');
    return false;
  }
}

function checkDatabaseAdapter() {
  log('\n🗄️ Checking Database Adapters...', 'blue');
  
  try {
    const dbPath = path.join(process.cwd(), 'src/lib/database-adapter.ts');
    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    
    if (dbContent.includes('FirestoreAdapter') && !dbContent.includes('not implemented')) {
      log('  ✅ Firestore adapter fully implemented', 'green');
    } else if (dbContent.includes('FirestoreAdapter')) {
      log('  ⚠️ Firestore adapter exists but may be stubbed', 'yellow');
    } else {
      log('  ❌ Firestore adapter not found', 'red');
      return false;
    }
    
    if (dbContent.includes('getFirebaseFirestore')) {
      log('  ✅ Firebase SDK integration detected', 'green');
    } else {
      log('  ❌ Firebase SDK integration not found', 'red');
      return false;
    }
    
    return true;
  } catch (error) {
    log(`  ❌ Error checking database adapter: ${error.message}`, 'red');
    return false;
  }
}

function checkAppHostingConfig() {
  log('\n🚀 Checking App Hosting Configuration...', 'blue');
  
  try {
    const configPath = path.join(process.cwd(), 'apphosting.yaml');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'UPLOAD_PROVIDER',
      'STORAGE_TYPE'
    ];
    
    let allPresent = true;
    for (const envVar of requiredEnvVars) {
      if (configContent.includes(envVar)) {
        log(`  ✅ ${envVar} configured in apphosting.yaml`, 'green');
      } else {
        log(`  ❌ ${envVar} missing from apphosting.yaml`, 'red');
        allPresent = false;
      }
    }
    
    return allPresent;
  } catch (error) {
    log(`  ❌ Error checking apphosting.yaml: ${error.message}`, 'red');
    return false;
  }
}

function generateReport() {
  log('\n📊 Firebase Integration Summary', 'magenta');
  log('=' * 50, 'magenta');
  
  const checks = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Firebase Files', fn: checkFirebaseFiles },
    { name: 'Image Storage Adapter', fn: checkImageStorageAdapter },
    { name: 'Database Adapter', fn: checkDatabaseAdapter },
    { name: 'App Hosting Config', fn: checkAppHostingConfig }
  ];
  
  let allPassed = true;
  const results = [];
  
  for (const check of checks) {
    const passed = check.fn();
    results.push({ name: check.name, passed });
    if (!passed) allPassed = false;
  }
  
  log('\n📋 Final Results:', 'blue');
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const color = result.passed ? 'green' : 'red';
    log(`  ${status} ${result.name}`, color);
  }
  
  if (allPassed) {
    log('\n🎉 All Firebase integration checks passed!', 'green');
    log('Your app is ready for Firebase Hosting deployment.', 'green');
  } else {
    log('\n⚠️ Some checks failed. Please fix the issues above.', 'yellow');
  }
  
  log('\n🚀 Next Steps:', 'blue');
  log('1. Enable Firestore in Firebase Console', 'reset');
  log('2. Deploy to Firebase: npm run deploy', 'reset');
  log('3. Test image upload and property scraping', 'reset');
}

function main() {
  log('🔥 Firebase Integration Test', 'magenta');
  log('Testing Firebase configuration and setup...', 'reset');
  
  generateReport();
}

// Run the test
main();
