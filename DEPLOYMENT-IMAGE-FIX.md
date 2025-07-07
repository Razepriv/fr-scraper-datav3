# Deployment Configuration for Image Scraping

## Issue: Image Scraping Not Working After Deployment

### Root Cause
In serverless environments (Vercel, Netlify, etc.), the filesystem is read-only and temporary. The local image storage that works in development cannot save images permanently after deployment.

### Solution: Cloud Storage Configuration

## Option 1: Cloudinary (Recommended - Free Tier Available)

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Get your Cloudinary URL from the dashboard

### 2. Add Environment Variables
Add these to your deployment platform (Vercel/Netlify):

```bash
# Required for production deployment
NODE_ENV=production
STORAGE_TYPE=database
UPLOAD_PROVIDER=cloudinary

# Cloudinary configuration
CLOUDINARY_URL=cloudinary://API_Key:API_Secret@Cloud_Name

# Optional: Force cloud storage even in development
# FORCE_CLOUD_STORAGE=true
```

### 3. Vercel Deployment
```bash
# Set environment variables in Vercel dashboard or via CLI
vercel env add CLOUDINARY_URL
vercel env add NODE_ENV production
vercel env add UPLOAD_PROVIDER cloudinary
```

### 4. Netlify Deployment
Add to `netlify.toml`:
```toml
[build.environment]
NODE_ENV = "production"
UPLOAD_PROVIDER = "cloudinary"
CLOUDINARY_URL = "cloudinary://your_key:your_secret@your_cloud"
```

## Option 2: Alternative Solutions

### Use Data URLs for Small Images
If you don't want to set up cloud storage:

```bash
# This will use data URLs for small images and placeholders for large ones
UPLOAD_PROVIDER=external
```

**Limitations:**
- Large images become placeholders
- Slower page loading
- Higher bandwidth usage

### Use External Image URLs
Keep original image URLs without downloading:

```bash
# Modify image scraping to use original URLs
SKIP_IMAGE_DOWNLOAD=true
```

## Testing Deployment

### 1. Build Test
```bash
npm run build
```

### 2. Check Configuration
```bash
# In your deployed app console
console.log('Storage config:', {
  isServerless: process.env.VERCEL || process.env.NETLIFY,
  uploadProvider: process.env.UPLOAD_PROVIDER,
  hasCloudinary: !!process.env.CLOUDINARY_URL
});
```

### 3. Monitor Logs
Check your deployment platform's logs for:
- `📸 Using Cloudinary image storage for serverless/production`
- `✅ Image uploaded to Cloudinary`
- Any error messages

## Current Status

✅ **Local Development**: Works with filesystem storage
❌ **Production Deployment**: Needs cloud storage configuration
🔧 **Solution**: Set up Cloudinary or use alternative approach

## Quick Fix for Immediate Deployment

If you need to deploy immediately without setting up cloud storage:

```bash
# Add these environment variables to use placeholders
UPLOAD_PROVIDER=external
CLOUDINARY_URL=""
```

This will make images work (with placeholders for large images) while you set up proper cloud storage.
