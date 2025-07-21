@echo off
REM Vercel Deployment Script for Windows
REM This script helps deploy your property scraping app to Vercel

echo 🚀 Starting Vercel Deployment Process...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Run type checking
echo 🔍 Running TypeScript checks...
npm run typecheck
if %errorlevel% neq 0 (
    echo ❌ TypeScript errors found. Please fix them before deployment.
    exit /b 1
)

REM Run linting
echo 🧹 Running linting...
npm run lint
if %errorlevel% neq 0 (
    echo ⚠️  Linting issues found. Consider fixing them.
)

REM Test build locally
echo 🏗️  Testing build locally...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix build errors before deployment.
    exit /b 1
)

echo ✅ Local build successful!

REM Deploy to Vercel
echo 🌐 Deploying to Vercel...
if "%1"=="preview" (
    echo 📋 Creating preview deployment...
    vercel
) else (
    echo 🚀 Deploying to production...
    vercel --prod
)

echo ✅ Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Check your deployment at the provided URL
echo 2. Test all export functionality
echo 3. Verify Firebase Storage integration
echo 4. Configure custom domain if needed
echo.
echo 🔧 To manage environment variables:
echo    vercel env ls                    # List environment variables
echo    vercel env add VARIABLE_NAME     # Add environment variable
echo    vercel env rm VARIABLE_NAME      # Remove environment variable
