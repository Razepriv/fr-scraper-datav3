# Deployment Guide - Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Have your Firebase and API credentials ready

## Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

## Step 2: Environment Variables Setup

You'll need to configure these environment variables in Vercel:

### Firebase Configuration
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### API Keys
- `GEMINI_API_KEY`

### Automatic Variables
- `NEXT_PUBLIC_BASE_URL` (will be set to your Vercel domain automatically)

## Step 3: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in the "Environment Variables" section
5. Click "Deploy"

## Step 4: Deploy via CLI (Alternative)

```bash
# Login to Vercel
vercel login

# Deploy from project root
vercel

# For production deployment
vercel --prod
```

## Step 5: Configure Domain (Optional)

1. Go to your project dashboard on Vercel
2. Navigate to "Settings" > "Domains"
3. Add your custom domain if needed

## Environment Variables in Vercel Dashboard

When setting up environment variables in Vercel:

1. Go to your project settings
2. Click "Environment Variables"
3. Add each variable with the appropriate value from your `.env` file
4. Make sure to select the correct environments (Production, Preview, Development)

## Build Configuration

The project is configured with:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Important Notes

- All `NEXT_PUBLIC_*` variables will be exposed to the client
- The `vercel.json` file is configured for optimal performance
- Images are configured to work with Firebase Storage
- The app supports both SSR and static export modes

## Troubleshooting

### Build Errors
- Check all environment variables are set correctly
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation with `npm run typecheck`

### Runtime Errors
- Check Vercel function logs in the dashboard
- Verify Firebase configuration is correct
- Ensure API endpoints are working

### Performance
- Enable Vercel Analytics for monitoring
- Use the built-in performance metrics
- Monitor function execution times

## Post-Deployment Checklist

- [ ] Test all export functionality (CSV, Excel, JSON)
- [ ] Verify Firebase Storage integration
- [ ] Check image loading and display
- [ ] Test advanced filtering and search
- [ ] Verify responsive design on mobile
- [ ] Test AI enhancement features (if applicable)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review the function logs for API errors
3. Verify environment variables are set correctly
4. Test locally with `npm run build && npm start`
