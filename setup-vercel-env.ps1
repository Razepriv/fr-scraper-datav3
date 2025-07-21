# PowerShell script to add environment variables to Vercel
# This will fix the dummy data issue by properly configuring the AI

Write-Host "🚀 Adding Environment Variables to Vercel..." -ForegroundColor Green

# The most critical one - GEMINI_API_KEY for AI scraping
Write-Host "Adding GEMINI_API_KEY (Critical for AI scraping)..." -ForegroundColor Yellow
vercel env add GEMINI_API_KEY production --value="AIzaSyAruKQEX7GIP3VAgw486lJlYVyrIciYqHE"

# Firebase Configuration
Write-Host "Adding Firebase configuration..." -ForegroundColor Blue
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production --value="AIzaSyD2ScfODrkVf0zWaJdsjy_Mw4c09k0oM8Y"
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production --value="fr-toolv2.firebaseapp.com"
vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL production --value="https://fr-toolv2-default-rtdb.firebaseio.com"
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production --value="fr-toolv2"
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production --value="fr-toolv2.firebasestorage.app"
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production --value="540549710523"
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production --value="1:540549710523:web:fadec9af72cdeb9d019f9e"

# Environment Configuration
Write-Host "Adding environment configuration..." -ForegroundColor Cyan
vercel env add NODE_ENV production --value="production"
vercel env add NEXT_PUBLIC_BASE_URL production --value="https://freerooom-proplist-bzqsqcohq-razeprivs-projects.vercel.app"

# Storage Configuration
vercel env add STORAGE_TYPE production --value="database"
vercel env add UPLOAD_PROVIDER production --value="firebase"

# Feature Flags (ENABLE_AI_FEATURES is critical)
Write-Host "Adding feature flags..." -ForegroundColor Magenta
vercel env add ENABLE_BULK_DELETE production --value="true"
vercel env add ENABLE_EXPORT production --value="true"
vercel env add ENABLE_AI_FEATURES production --value="true"

# Limits
vercel env add MAX_PROPERTIES production --value="10000"
vercel env add MAX_UPLOAD_SIZE production --value="10485760"

Write-Host "✅ All environment variables added!" -ForegroundColor Green
Write-Host "🔄 Redeploying to apply changes..." -ForegroundColor Yellow

# Redeploy to apply the environment variables
vercel --prod

Write-Host "🎉 Deployment complete! AI scraping should now work correctly." -ForegroundColor Green
Write-Host "🎯 The dummy data issue should be resolved!" -ForegroundColor Green
