# Firebase Storage Setup Guide

This guide will help you configure Firebase Storage for your property scraping application.

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firebase Storage:
   - Go to "Storage" in the left sidebar
   - Click "Get Started"
   - Choose "Start in test mode" (we'll configure rules later)
   - Select a location for your storage bucket

## 2. Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Upload Provider Configuration
UPLOAD_PROVIDER=firebase
```

You can find these values in your Firebase project settings:
- Go to Project Settings (gear icon)
- Scroll down to "Your apps" section
- Click on the web app icon
- Copy the config values

## 3. Firebase Storage Rules

Update your Firebase Storage rules to allow uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow uploads to properties folder
    match /properties/{propertyId}/{imageId} {
      allow read, write: if true; // For development - tighten for production
    }
    
    // Allow reading all files
    match /{allPaths=**} {
      allow read: if true;
    }
  }
}
```

## 4. Upload All Existing Images

To upload all your existing images from the local `public/uploads/properties` folder to Firebase Storage:

```bash
# Option 1: Using the npm script
npm run upload-images

# Option 2: Direct TypeScript execution
npm run upload-images:ts

# Option 3: Manual execution
npx tsx scripts/bulk-upload-to-firebase.ts
```

## 5. Verify Setup

1. Check that the environment variables are correctly set:
   ```bash
   npm run dev
   ```
   Look for the debug output in the console that shows Firebase Storage is being used.

2. Test image upload by scraping a new property - images should now be uploaded to Firebase Storage.

3. Check your Firebase Storage console to see the uploaded images.

## 6. Production Considerations

For production environments:

1. **Secure Storage Rules**: Update your Firebase Storage rules to be more restrictive:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /properties/{propertyId}/{imageId} {
         allow read: if true;
         allow write: if request.auth != null; // Require authentication
       }
     }
   }
   ```

2. **Authentication**: Implement Firebase Auth if you need user-specific access control.

3. **Environment Variables**: Ensure all Firebase environment variables are set in your production environment.

4. **Backup**: Consider setting up automated backups of your Firebase Storage bucket.

## 7. Troubleshooting

### Common Issues:

1. **"Firebase Storage bucket not configured"**
   - Ensure `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is set in your environment variables

2. **"Permission denied"**
   - Check your Firebase Storage rules
   - Verify the bucket name is correct

3. **"Failed to upload image"**
   - Check your internet connection
   - Verify Firebase project is active
   - Check Firebase Storage is enabled in your project

### Debug Mode:

The application logs detailed information about which storage adapter is being used. Check the console for messages like:
- `📸 Using Firebase Storage`
- `✅ Image uploaded to Firebase Storage`

## 8. Cost Considerations

Firebase Storage pricing:
- First 5GB/month: Free
- Additional storage: $0.026/GB/month
- Downloads: $0.12/GB
- Uploads: $0.12/GB

Monitor your usage in the Firebase Console under "Usage and billing".

## 9. Migration Status

After running the bulk upload script, your images will be:
- ✅ Uploaded to Firebase Storage
- ✅ Property data updated with Firebase URLs
- ✅ Local images preserved as backup
- ✅ New scraped images automatically uploaded to Firebase

The migration creates:
- Backup of your properties data
- Detailed upload report
- Firebase URLs for all images
