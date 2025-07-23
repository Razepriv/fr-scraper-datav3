# 🚀 FR Scraper Tool - Complete API & Deployment Configuration Guide

## 📋 Overview
This guide covers the complete setup for APIs, Firebase, and Vercel deployment for the FR Scraper Tool.

## 🔧 Prerequisites
- Node.js 18+ 
- Firebase CLI (`npm install -g firebase-tools`)
- Vercel CLI (`npm install -g vercel`)
- Firebase project: `fr-toolv2`

## 🔑 Required API Keys & Environment Variables

### 1. **Gemini AI API Key**
```bash
GEMINI_API_KEY=AIzaSyCBCVpX71GSGC7J0iRh_qCBwn74BXEU86A
```

### 2. **Firebase Configuration**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD2ScfODrkVf0zWaJdsjy_Mw4c09k0oM8Y
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fr-toolv2.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://fr-toolv2-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fr-toolv2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fr-toolv2.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=540549710523
NEXT_PUBLIC_FIREBASE_APP_ID=1:540549710523:web:fadec9af72cdeb9d019f9e
```

### 3. **Base URLs**
```bash
NEXT_PUBLIC_BASE_URL=https://fr-toolv2.web.app  # For Firebase hosting
# OR
NEXT_PUBLIC_BASE_URL=https://your-vercel-app.vercel.app  # For Vercel hosting
```

## 🔥 Firebase Setup

### 1. **Login and Configure Project**
```bash
firebase login
firebase use fr-toolv2
```

### 2. **Deploy Storage Rules**
```bash
firebase deploy --only storage
```

### 3. **Deploy Firestore Rules**
```bash
firebase deploy --only firestore
```

### 4. **Deploy Full Firebase App**
```bash
npm run deploy
```

## ▲ Vercel Setup

### 1. **Login to Vercel**
```bash
vercel login
```

### 2. **Link Project**
```bash
vercel link
```

### 3. **Set Environment Variables**
```bash
# Core API Keys
vercel env add GEMINI_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add NEXT_PUBLIC_BASE_URL

# Configuration Variables
vercel env add STORAGE_TYPE database
vercel env add UPLOAD_PROVIDER external
vercel env add NODE_ENV production
```

### 4. **Deploy to Vercel**
```bash
npm run deploy:vercel
```

## 🖼️ Image Storage Configuration

The app uses a hybrid image storage strategy:

### **ExternalImageStorage (Recommended for Production)**
- Uses compressed data URLs for images under 60KB
- Fallback to external placeholders for larger images
- No external dependencies required
- Works in all serverless environments

### **FirebaseStorage (Optional)**
- Requires proper authentication setup
- Good for long-term image persistence
- Requires Firebase Storage rules configuration

## 🔧 Build & Development Commands

```bash
# Development
npm run dev              # Start development server

# Building
npm run build           # Build for production
npm run verify-build    # Lint, typecheck, and build

# Deployment
npm run deploy:vercel   # Deploy to Vercel
npm run deploy          # Deploy to Firebase

# Environment Management
npm run vercel:env      # List Vercel environment variables
npm run setup:vercel    # Setup Vercel environment (helper)
npm run setup:firebase  # Setup Firebase project (helper)
```

## 🚀 Quick Setup (Automated)

### **Windows:**
```bash
setup-environment.bat
```

### **Linux/macOS:**
```bash
chmod +x setup-environment.sh
./setup-environment.sh
```

## 🔍 API Endpoints

Once deployed, these endpoints will be available:

```
POST /api/scrape/url     # Scrape from URL
POST /api/scrape/html    # Scrape from raw HTML
POST /api/scrape/bulk    # Bulk scraping operations
```

## 📊 Configuration Validation

### **Check Firebase Connection:**
```bash
npm run test-firebase
```

### **Check Production Readiness:**
```bash
npm run test-production
```

### **Verify Environment Variables:**
```bash
npm run vercel:env
```

## 🔐 Security & Storage Rules

### **Firebase Storage Rules (Already Configured):**
- Public read access for all files
- Unauthenticated write access to `/properties/**`
- Authenticated write access for other locations

### **Image Processing Limits:**
- Max compressed image size: 60KB
- Max images per property: 15
- Max data URL images: 8
- Max document size: 900KB

## 🌍 Environment-Specific Settings

### **Development (.env.local):**
```bash
NODE_ENV=development
UPLOAD_PROVIDER=external
STORAGE_TYPE=database
```

### **Production (Vercel/Firebase):**
```bash
NODE_ENV=production
UPLOAD_PROVIDER=external
STORAGE_TYPE=database
```

## 🆘 Troubleshooting

### **Common Issues:**

1. **Firebase 403 Errors:** Deploy storage rules with `firebase deploy --only storage`
2. **Vercel Build Fails:** Check environment variables are set correctly
3. **Image Upload Issues:** Verify UPLOAD_PROVIDER is set to "external"
4. **API Timeout:** Increase function timeout in vercel.json (already set to 30s)

### **Debug Commands:**
```bash
# Check Firebase project
firebase projects:list

# Check Vercel deployment
vercel ls

# Test local build
npm run build && npm run start
```

## ✅ Deployment Checklist

- [ ] Firebase project configured (`fr-toolv2`)
- [ ] Firebase Storage rules deployed
- [ ] Vercel environment variables set
- [ ] Gemini API key configured
- [ ] Build passes (`npm run verify-build`)
- [ ] Image storage working (ExternalImageStorage)
- [ ] API endpoints responding
- [ ] CORS configured properly
- [ ] Base URLs set correctly

## 🎯 Production URLs

- **Firebase Hosting:** https://fr-toolv2.web.app
- **Vercel Deployment:** https://your-project.vercel.app
- **Firebase Console:** https://console.firebase.google.com/project/fr-toolv2
