# Vercel Environment Variables Setup Guide

## The Problem
The error "Environment Variable references Secret which does not exist" occurs because the vercel.json file was referencing Vercel secrets that don't exist.

## Solution
I've updated the vercel.json file to remove secret references. Now you need to manually add environment variables in the Vercel dashboard.

## Steps to Deploy:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Click "New Project"
- Import your GitHub repository: `Razepriv/fr-scraper-datav3`

### 2. Add Environment Variables
Go to Project Settings > Environment Variables and add these **EXACT** variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyD2ScfODrkVf0zWaJdsjy_Mw4c09k0oM8Y
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = fr-toolv2.firebaseapp.com  
NEXT_PUBLIC_FIREBASE_DATABASE_URL = https://fr-toolv2-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = fr-toolv2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = fr-toolv2.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 540549710523
NEXT_PUBLIC_FIREBASE_APP_ID = 1:540549710523:web:fadec9af72cdeb9d019f9e
GEMINI_API_KEY = AIzaSyAruKQEX7GIP3VAgw486lJlYVyrIciYqHE
NODE_ENV = production
STORAGE_TYPE = database
UPLOAD_PROVIDER = firebase
ENABLE_BULK_DELETE = true
ENABLE_EXPORT = true
ENABLE_AI_FEATURES = true
MAX_PROPERTIES = 10000
MAX_UPLOAD_SIZE = 10485760
```

### 3. Environment Selection
For each variable, check:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Deploy
Click "Deploy" and Vercel will build your project with the correct environment variables.

### 5. Update Base URL
After deployment, update this environment variable with your actual Vercel domain:
```
NEXT_PUBLIC_BASE_URL = https://your-actual-domain.vercel.app
```

## Important Notes:
- Do NOT use @ syntax in environment variables (that's for secrets)
- All Firebase credentials are already properly configured
- The vercel.json file has been fixed to not reference non-existent secrets
- Your app will work with both Firebase App Hosting and Vercel

## Quick Deploy Link:
Use this direct link to deploy: https://vercel.com/new/clone?repository-url=https://github.com/Razepriv/fr-scraper-datav3
