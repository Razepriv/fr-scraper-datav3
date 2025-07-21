# Vercel Deployment Guide

## Step 1: Create Vercel Project
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository: `Razepriv/fr-scraper-datav3`
4. Configure the project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
   - Install Command: `npm install`

## Step 2: Configure Environment Variables
Go to Project Settings > Environment Variables and add these variables:

### Firebase Configuration (REQUIRED)
```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyD2ScfODrkVf0zWaJdsjy_Mw4c09k0oM8Y
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = fr-toolv2.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL = https://fr-toolv2-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = fr-toolv2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = fr-toolv2.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 540549710523
NEXT_PUBLIC_FIREBASE_APP_ID = 1:540549710523:web:fadec9af72cdeb9d019f9e
```

### AI Configuration
```
GEMINI_API_KEY = AIzaSyAruKQEX7GIP3VAgw486lJlYVyrIciYqHE
```

### Application Configuration
```
NODE_ENV = production
NEXT_PUBLIC_BASE_URL = https://your-project-name.vercel.app
STORAGE_TYPE = database
UPLOAD_PROVIDER = firebase
ENABLE_BULK_DELETE = true
ENABLE_EXPORT = true
ENABLE_AI_FEATURES = true
MAX_PROPERTIES = 10000
MAX_UPLOAD_SIZE = 10485760
```

## Step 3: Environment Selection
For each environment variable, select:
- ☑️ Production
- ☑️ Preview  
- ☑️ Development

## Step 4: Deploy
1. Click "Deploy" 
2. Vercel will automatically build and deploy your application
3. Update NEXT_PUBLIC_BASE_URL with your actual Vercel domain

## Important Notes:
- The error "Environment Variable references Secret which does not exist" means you need to manually add these variables in Vercel dashboard
- Do NOT use the .env.vercel file for deployment - it's just a reference
- All NEXT_PUBLIC_ variables will be available on the client side
- Regular variables (like GEMINI_API_KEY) are server-side only

## Alternative: Quick Deploy Button
You can also create a deploy button by adding this to your README:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Razepriv/fr-scraper-datav3)

## Troubleshooting:
- If build fails, check the Build Logs in Vercel dashboard
- Ensure all environment variables are properly set
- Firebase App Hosting is also available as an alternative deployment option
