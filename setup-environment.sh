#!/bin/bash

# Environment Setup Script for FR Scraper Tool
echo "🚀 Setting up FR Scraper Tool Environment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Verify Firebase CLI
echo "🔥 Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# 3. Verify Vercel CLI
echo "▲ Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# 4. Setup Firebase project
echo "🔥 Setting up Firebase project..."
firebase login
firebase use fr-toolv2

# 5. Deploy Firebase rules
echo "📋 Deploying Firebase Storage rules..."
firebase deploy --only storage

# 6. Setup Vercel environment variables
echo "▲ Setting up Vercel environment variables..."
echo "Please run the following commands manually to set up Vercel environment variables:"
echo ""
echo "vercel env add GEMINI_API_KEY"
echo "vercel env add NEXT_PUBLIC_FIREBASE_API_KEY"
echo "vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL"
echo "vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "vercel env add NEXT_PUBLIC_FIREBASE_APP_ID"
echo "vercel env add NEXT_PUBLIC_BASE_URL"
echo ""

# 7. Build and test
echo "🔨 Building project..."
npm run build

echo "✅ Setup completed! Your environment is ready."
echo ""
echo "📋 Next steps:"
echo "1. Set up Vercel environment variables using the commands above"
echo "2. Deploy to Vercel: npm run deploy:vercel"
echo "3. Deploy to Firebase: npm run deploy"
