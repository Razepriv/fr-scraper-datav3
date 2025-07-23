@echo off
REM Environment Setup Script for FR Scraper Tool (Windows)
echo 🚀 Setting up FR Scraper Tool Environment...

REM 1. Install dependencies
echo 📦 Installing dependencies...
npm install

REM 2. Install Firebase CLI if not present
echo 🔥 Checking Firebase CLI...
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Firebase CLI...
    npm install -g firebase-tools
)

REM 3. Install Vercel CLI if not present  
echo ▲ Checking Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

REM 4. Setup Firebase project
echo 🔥 Setting up Firebase project...
firebase use fr-toolv2

REM 5. Deploy Firebase rules
echo 📋 Deploying Firebase Storage rules...
firebase deploy --only storage

REM 6. Build and test
echo 🔨 Building project...
npm run build

echo ✅ Setup completed! Your environment is ready.
echo.
echo 📋 Next steps:
echo 1. Set up Vercel environment variables:
echo    vercel env add GEMINI_API_KEY
echo    vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
echo    vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
echo    vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL
echo    vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
echo    vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
echo    vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
echo    vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
echo    vercel env add NEXT_PUBLIC_BASE_URL
echo.
echo 2. Deploy to Vercel: npm run deploy:vercel
echo 3. Deploy to Firebase: npm run deploy

pause
