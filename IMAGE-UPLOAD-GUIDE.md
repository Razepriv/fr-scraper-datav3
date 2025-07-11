# Image Upload & Firebase Storage Integration

This document explains how to upload all existing images to Firebase Storage and configure automatic Firebase storage for new scraped images.

## 🚀 Quick Start

1. **Configure Firebase** (see [FIREBASE-STORAGE-SETUP.md](./FIREBASE-STORAGE-SETUP.md))
2. **Test Configuration**: `npm run test-firebase`
3. **Upload All Images**: `npm run upload-images`
4. **Start Scraping**: New images will automatically use Firebase Storage

## 📋 Scripts Available

| Script | Description |
|--------|-------------|
| `npm run test-firebase` | Test Firebase Storage configuration |
| `npm run upload-images` | Upload all existing images to Firebase (JS runner) |
| `npm run upload-images:ts` | Upload all existing images to Firebase (Direct TS) |

## 🔧 Configuration

### Environment Variables

Add to your `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Upload Provider (automatically uses Firebase if configured)
UPLOAD_PROVIDER=firebase
```

### Storage Adapter Priority

The system automatically selects the best storage adapter:

1. **Production/Serverless**: Always uses Firebase if configured
2. **Development**: Uses `UPLOAD_PROVIDER` setting, defaults to Firebase if configured
3. **Fallback**: Uses local filesystem if Firebase not configured

## 📁 Directory Structure

```
public/uploads/properties/
├── prop-1750839148648-0/
│   ├── image1.jpg
│   ├── image2.webp
│   └── ...
├── prop-1750843374013-0/
│   └── ...
└── ...
```

Each property directory contains all images for that property.

## 🔄 Migration Process

### 1. Bulk Upload Process

```bash
npm run upload-images
```

This will:
- ✅ Scan all property directories
- ✅ Upload each image to Firebase Storage
- ✅ Generate Firebase URLs for each image
- ✅ Update `data/properties.json` with new URLs
- ✅ Create backup of original data
- ✅ Generate detailed upload report

### 2. Upload Report

After upload, you'll get:
- **Console summary**: Success/failure counts
- **Backup file**: `data/properties_backup_[timestamp].json`
- **Detailed report**: `data/upload_report_[timestamp].json`

### 3. Automatic Future Uploads

Once configured, all new scraped images will automatically:
- ✅ Be uploaded to Firebase Storage
- ✅ Get Firebase URLs instead of local paths
- ✅ Be accessible from anywhere
- ✅ Have proper metadata and organization

## 🎯 Firebase Storage Structure

Images are organized as:
```
properties/
├── prop-1750839148648-0/
│   ├── 0-1704067200000.jpg
│   ├── 1-1704067201000.webp
│   └── ...
├── prop-1750843374013-0/
│   └── ...
└── test/
    └── test-image-[timestamp].png
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Firebase Storage bucket not configured"**
   ```bash
   # Check environment variables
   npm run test-firebase
   ```

2. **"Permission denied"**
   - Update Firebase Storage rules
   - Ensure bucket exists and is active

3. **"Upload failed"**
   - Check internet connection
   - Verify Firebase project is active
   - Check Firebase Storage quotas

### Debug Information

The application logs detailed information:
```
DEBUG ENV_CONFIG: {
  UPLOAD_PROVIDER: 'firebase',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'your-bucket.appspot.com',
  ...
}
📸 Using Firebase Storage
✅ Image uploaded to Firebase Storage: https://...
```

## 📊 Monitoring

### Firebase Console
- Monitor storage usage
- View uploaded files
- Check download statistics
- Manage storage rules

### Application Logs
- Upload success/failure rates
- Storage adapter selection
- Error details and debugging info

## 💰 Cost Considerations

Firebase Storage pricing:
- **Free tier**: 5GB storage, 1GB/day downloads
- **Paid tier**: $0.026/GB/month storage, $0.12/GB transfers

Monitor usage in Firebase Console > Usage and billing.

## 🔐 Security

### Firebase Storage Rules

For development:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

For production:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{propertyId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🚀 Next Steps

1. **Configure Firebase**: Follow [FIREBASE-STORAGE-SETUP.md](./FIREBASE-STORAGE-SETUP.md)
2. **Test Setup**: `npm run test-firebase`
3. **Upload Images**: `npm run upload-images`
4. **Start Scraping**: New images will automatically use Firebase
5. **Monitor Usage**: Check Firebase Console regularly

## 🆘 Support

If you encounter issues:
1. Check the [FIREBASE-STORAGE-SETUP.md](./FIREBASE-STORAGE-SETUP.md) guide
2. Run `npm run test-firebase` to verify configuration
3. Check the console logs for detailed error messages
4. Review Firebase Storage rules and permissions
