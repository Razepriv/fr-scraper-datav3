#!/usr/bin/env node

/**
 * Test Deployment Image Configuration
 * Run this to verify your deployment environment is properly configured
 */

async function testDeploymentConfig() {
  console.log('🚀 Testing Deployment Image Configuration');
  console.log('=========================================');

  // Check environment
  console.log('\n📋 Environment Information:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Node Version: ${process.version}`);
  
  // Check serverless detection
  const isVercel = !!process.env.VERCEL;
  const isNetlify = !!process.env.NETLIFY;
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const isServerless = isVercel || isNetlify || isLambda;
  
  console.log(`Is Vercel: ${isVercel}`);
  console.log(`Is Netlify: ${isNetlify}`);
  console.log(`Is Lambda: ${isLambda}`);
  console.log(`Is Serverless: ${isServerless}`);

  // Check storage configuration
  console.log('\n📦 Storage Configuration:');
  console.log(`STORAGE_TYPE: ${process.env.STORAGE_TYPE || 'undefined'}`);
  console.log(`UPLOAD_PROVIDER: ${process.env.UPLOAD_PROVIDER || 'undefined'}`);
  console.log(`CLOUDINARY_URL: ${process.env.CLOUDINARY_URL ? '✅ Configured' : '❌ Not configured'}`);

  // Simulate storage adapter selection
  console.log('\n🎯 Storage Adapter Selection:');
  const uploadProvider = process.env.UPLOAD_PROVIDER || 'local';
  const isProduction = process.env.NODE_ENV === 'production';
  const hasCloudinary = !!process.env.CLOUDINARY_URL;

  if (isServerless || isProduction) {
    if (hasCloudinary) {
      console.log('✅ Will use: Cloudinary storage (recommended for production)');
    } else {
      console.log('⚠️  Will use: External storage (data URLs/placeholders)');
      console.log('   Recommendation: Set up Cloudinary for better performance');
    }
  } else {
    switch (uploadProvider) {
      case 'cloudinary':
        console.log(hasCloudinary ? '✅ Will use: Cloudinary storage' : '❌ Will fallback to: Local storage (Cloudinary not configured)');
        break;
      case 'external':
        console.log('✅ Will use: External storage (data URLs/placeholders)');
        break;
      case 'local':
      default:
        console.log('✅ Will use: Local filesystem storage');
        break;
    }
  }

  // Test image download capability
  console.log('\n🌐 Network Test:');
  try {
    const testUrl = 'https://httpbin.org/status/200';
    const response = await fetch(testUrl);
    if (response.ok) {
      console.log('✅ Network connectivity: OK');
    } else {
      console.log('❌ Network connectivity: Failed');
    }
  } catch (error) {
    console.log('❌ Network connectivity: Error -', error.message);
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (isServerless && !hasCloudinary) {
    console.log('🔧 Set up Cloudinary for optimal image handling in serverless environment');
    console.log('   1. Create account at cloudinary.com');
    console.log('   2. Add CLOUDINARY_URL to environment variables');
    console.log('   3. Set UPLOAD_PROVIDER=cloudinary');
  }
  
  if (isProduction && uploadProvider === 'local') {
    console.log('🔧 Local storage not recommended for production');
    console.log('   Consider using cloudinary or external storage');
  }
  
  if (!isServerless && uploadProvider === 'local') {
    console.log('✅ Configuration looks good for development environment');
  }

  console.log('\n🎉 Configuration test complete!');
}

// Run if called directly
if (require.main === module) {
  testDeploymentConfig().catch(console.error);
}

module.exports = { testDeploymentConfig };
