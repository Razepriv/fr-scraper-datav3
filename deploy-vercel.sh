#!/bin/bash

# Vercel Deployment Script
# This script helps deploy your property scraping app to Vercel

echo "🚀 Starting Vercel Deployment Process..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Run type checking
echo "🔍 Running TypeScript checks..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Please fix them before deployment."
    exit 1
fi

# Run linting
echo "🧹 Running linting..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  Linting issues found. Consider fixing them."
fi

# Test build locally
echo "🏗️  Testing build locally..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deployment."
    exit 1
fi

echo "✅ Local build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
if [ "$1" == "preview" ]; then
    echo "📋 Creating preview deployment..."
    vercel
else
    echo "🚀 Deploying to production..."
    vercel --prod
fi

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check your deployment at the provided URL"
echo "2. Test all export functionality"
echo "3. Verify Firebase Storage integration"
echo "4. Configure custom domain if needed"
echo ""
echo "🔧 To manage environment variables:"
echo "   vercel env ls                    # List environment variables"
echo "   vercel env add VARIABLE_NAME     # Add environment variable"
echo "   vercel env rm VARIABLE_NAME      # Remove environment variable"
