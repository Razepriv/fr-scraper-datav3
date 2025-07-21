#!/bin/bash

# Script to add environment variables to Vercel
# Run this script to automatically configure all environment variables

echo "🚀 Adding Environment Variables to Vercel..."

# Firebase Configuration
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
echo "AIzaSyD2ScfODrkVf0zWaJdsjy_Mw4c09k0oM8Y"

vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production  
echo "fr-toolv2.firebaseapp.com"

vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL production
echo "https://fr-toolv2-default-rtdb.firebaseio.com"

vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
echo "fr-toolv2"

vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
echo "fr-toolv2.firebasestorage.app"

vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
echo "540549710523"

vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
echo "1:540549710523:web:fadec9af72cdeb9d019f9e"

# AI Configuration (CRITICAL for scraping)
vercel env add GEMINI_API_KEY production
echo "AIzaSyAruKQEX7GIP3VAgw486lJlYVyrIciYqHE"

# Environment Configuration
vercel env add NODE_ENV production
echo "production"

vercel env add NEXT_PUBLIC_BASE_URL production
echo "https://freerooom-proplist-bzqsqcohq-razeprivs-projects.vercel.app"

# Storage Configuration
vercel env add STORAGE_TYPE production
echo "database"

vercel env add UPLOAD_PROVIDER production
echo "firebase"

# Feature Flags
vercel env add ENABLE_BULK_DELETE production
echo "true"

vercel env add ENABLE_EXPORT production
echo "true"

vercel env add ENABLE_AI_FEATURES production
echo "true"

# Limits
vercel env add MAX_PROPERTIES production
echo "10000"

vercel env add MAX_UPLOAD_SIZE production
echo "10485760"

echo "✅ All environment variables added!"
echo "🔄 Redeploying to apply changes..."

# Redeploy to apply the environment variables
vercel --prod

echo "🎉 Deployment complete! AI scraping should now work correctly."
