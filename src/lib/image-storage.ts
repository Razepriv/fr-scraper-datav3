/**
 * Image Storage Adapter
 * Provides different storage backends for images (local filesystem, cloud storage, etc.)
 * Allows the app to work in serverless environments where filesystem access is limited
 */

import { ENV_CONFIG } from '@/lib/config';

export interface ImageStorageAdapter {
  uploadImage(buffer: Buffer, propertyId: string, imageIndex: number, contentType?: string, preferDataUrl?: boolean): Promise<string>;
  deleteImage(imageUrl: string): Promise<boolean>;
  getImageUrl(path: string): Promise<string>;
}

// Local filesystem adapter (for development)
class LocalImageStorage implements ImageStorageAdapter {
  private basePath = '/uploads/properties';

  async uploadImage(buffer: Buffer, propertyId: string, imageIndex: number, contentType?: string, preferDataUrl?: boolean): Promise<string> {
    if (typeof window !== 'undefined') {
      throw new Error('Filesystem operations not available on client side');
    }

    // If preferDataUrl is false, use a simple placeholder for non-critical images
    if (!preferDataUrl) {
      const placeholderUrl = `https://picsum.photos/400/300?random=${propertyId}-${imageIndex}`;
      console.log(`📷 Using external placeholder for non-preferred image ${imageIndex + 1}: ${placeholderUrl}`);
      return placeholderUrl;
    }

    // For preferred data URL images, store locally with compression if possible
    try {
      const { promises: fs } = await import('fs');
      const path = await import('path');
      const { v4: uuidv4 } = await import('uuid');

      const publicDir = path.join(process.cwd(), 'public');
      const propertyDir = path.join(publicDir, 'uploads', 'properties', propertyId);
      
      await fs.mkdir(propertyDir, { recursive: true });

      // Determine file extension from content type
      const extension = this.getFileExtension(contentType || 'image/jpeg');
      const filename = `${uuidv4()}.${extension}`;
      const filepath = path.join(propertyDir, filename);

      // Try to compress image before saving if it's large
      let bufferToSave = buffer;
      if (buffer.length > 500000) { // > 500KB, try compression
        try {
          bufferToSave = await this.compressImage(buffer, contentType); // Pass contentType instead of quality
          console.log(`🗜️ Local storage compression: ${buffer.length} → ${bufferToSave.length} bytes`);
        } catch (compressionError) {
          console.warn('⚠️ Local compression failed, using original:', compressionError);
          bufferToSave = buffer;
        }
      }

      await fs.writeFile(filepath, bufferToSave);

      const serverUrl = `/uploads/properties/${propertyId}/${filename}`;
      console.log(`✅ Image uploaded to local storage: ${serverUrl} (${bufferToSave.length} bytes)`);
      return serverUrl;
    } catch (error) {
      console.error('❌ Error uploading image to local storage:', error);
      
      // Fallback to external placeholder for critical images
      const placeholderUrl = `https://picsum.photos/400/300?random=${propertyId}-${imageIndex}`;
      console.log(`📷 Using fallback external placeholder: ${placeholderUrl}`);
      return placeholderUrl;
    }
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      throw new Error('Filesystem operations not available on client side');
    }

    try {
      const { promises: fs } = await import('fs');
      const path = await import('path');

      if (imageUrl.startsWith('/uploads/')) {
        const publicDir = path.join(process.cwd(), 'public');
        const filepath = path.join(publicDir, imageUrl);
        
        await fs.unlink(filepath);
        console.log(`✅ Image deleted from local storage: ${imageUrl}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error deleting image from local storage:', error);
      return false;
    }
  }

  async getImageUrl(path: string): Promise<string> {
    // For local storage, just return the path as-is
    return path;
  }

  private getFileExtension(contentType: string): string {
    const mimeTypeMap: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'image/svg+xml': 'svg'
    };

    return mimeTypeMap[contentType.toLowerCase()] || 'jpg';
  }

  private async compressImage(buffer: Buffer, contentType?: string): Promise<Buffer> {
    // Simple compression by reducing quality for JPEG images
    try {
      // For now, implement a basic compression by converting to JPEG with lower quality
      // In a real implementation, you might use a library like sharp or canvas
      
      if (contentType && contentType.includes('jpeg')) {
        // For JPEG, we can implement quality reduction
        // For now, return original buffer but in production you'd use sharp:
        // const sharp = require('sharp');
        // return await sharp(buffer).jpeg({ quality: 60 }).toBuffer();
        
        console.log('📦 Image compression would reduce JPEG quality here');
        return buffer; // Placeholder - would implement sharp compression
      }
      
      // For other formats, return original
      return buffer;
    } catch (error) {
      console.warn('⚠️ Image compression failed, using original:', error);
      return buffer;
    }
  }
}

// Serverless-compatible storage using external URLs (Cloudinary API)
class ExternalImageStorage implements ImageStorageAdapter {
  async uploadImage(buffer: Buffer, propertyId: string, imageIndex: number, contentType?: string, preferDataUrl?: boolean): Promise<string> {
    // If preferDataUrl is false, try external options first
    if (!preferDataUrl) {
      // Try to upload to Cloudinary first if configured
      if (ENV_CONFIG.CLOUDINARY_URL) {
        try {
          return await this.uploadToCloudinary(buffer, propertyId, imageIndex, contentType);
        } catch (error) {
          console.warn('⚠️ Cloudinary upload failed:', error);
        }
      }
      
      // For non-preferred data URL images, return a high-quality external placeholder
      const placeholderUrl = `https://picsum.photos/600/400?random=${propertyId}-${imageIndex}`;
      console.log(`📷 Using external placeholder for image ${imageIndex + 1}: ${placeholderUrl}`);
      return placeholderUrl;
    }

    // Preferred data URL path - try Cloudinary first, then compressed data URL
    if (ENV_CONFIG.CLOUDINARY_URL) {
      try {
        return await this.uploadToCloudinary(buffer, propertyId, imageIndex, contentType);
      } catch (error) {
        console.warn('⚠️ Cloudinary upload failed, falling back to data URL:', error);
      }
    }

    // Fallback: Use data URLs with aggressive compression for preferred images
    if (buffer.length < 1024 * 1024) { // Less than 1MB - try compression first
      try {
        const compressedBuffer = await this.compressImage(buffer, 0.2); // Use 20% quality for maximum compression
        const maxSize = ENV_CONFIG.MAX_COMPRESSED_IMAGE_SIZE || 60000; // Default 60KB (increased)
        if (compressedBuffer.length < maxSize) {
          const base64 = compressedBuffer.toString('base64');
          const mimeType = contentType || 'image/jpeg';
          const dataUrl = `data:${mimeType};base64,${base64}`;
          
          console.log(`✅ Image stored as compressed data URL (${buffer.length} → ${compressedBuffer.length} bytes, limit: ${maxSize})`);
          return dataUrl;
        } else {
          console.log(`⚠️ Compressed image still too large: ${compressedBuffer.length} bytes > ${maxSize}, using external placeholder`);
        }
      } catch (compressionError) {
        console.warn('⚠️ Image compression failed:', compressionError);
      }
    } else {
      console.log(`⚠️ Image too large for compression: ${buffer.length} bytes > 1MB, using external placeholder`);
    }
    
    // For large images or compression failures, use a placeholder
    const placeholderUrl = `https://placehold.co/600x400/e2e8f0/64748b?text=Property+Image+${imageIndex + 1}`;
    console.log(`⚠️ Large image (${buffer.length} bytes) replaced with placeholder`);
    return placeholderUrl;
  }

  private async uploadToCloudinary(buffer: Buffer, propertyId: string, imageIndex: number, contentType?: string): Promise<string> {
    const cloudinaryUrl = ENV_CONFIG.CLOUDINARY_URL!;
    
    // Extract cloud name and API credentials from CLOUDINARY_URL
    // Format: cloudinary://api_key:api_secret@cloud_name
    const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
    if (!urlMatch) {
      throw new Error('Invalid CLOUDINARY_URL format');
    }

    const [, apiKey, apiSecret, cloudName] = urlMatch;
    
    // Create form data for Cloudinary upload
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `properties/${propertyId}/${imageIndex}-${timestamp}`;
    
    // Generate signature for secure upload
    const crypto = await import('crypto');
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: contentType || 'image/jpeg' }));
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Image uploaded to Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    // If it's a Cloudinary URL, we could delete it from Cloudinary
    if (imageUrl.includes('cloudinary.com') && ENV_CONFIG.CLOUDINARY_URL) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = imageUrl.split('/');
        const publicIdWithExt = urlParts.slice(-3).join('/'); // properties/prop-id/image-id.ext
        const publicId = publicIdWithExt.replace(/\.[^.]+$/, ''); // Remove extension
        
        // Delete from Cloudinary (requires admin API)
        console.log(`🗑️ Would delete from Cloudinary: ${publicId}`);
        return true;
      } catch (error) {
        console.error('❌ Error deleting from Cloudinary:', error);
        return false;
      }
    }
    
    // For data URLs or placeholders, just log the action
    if (imageUrl.startsWith('data:') || imageUrl.includes('placehold.co')) {
      console.log(`🗑️ Removing reference to external image`);
      return true;
    }
    
    return false;
  }

  async getImageUrl(path: string): Promise<string> {
    return path;
  }

  // Compress image using Canvas API (browser) or Sharp (server)
  private async compressImage(buffer: Buffer, quality: number = 0.8): Promise<Buffer> {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
        // Use Canvas API for compression (client-side)
        const base64 = buffer.toString('base64');
        const mimeType = 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64}`;
        
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        return new Promise((resolve, reject) => {
          img.onload = () => {
            // Calculate new dimensions (reduce by 50% if too large)
            const maxDimension = 800;
            let { width, height } = img;
            
            if (width > maxDimension || height > maxDimension) {
              const ratio = Math.min(maxDimension / width, maxDimension / height);
              width = Math.floor(width * ratio);
              height = Math.floor(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              
              // Convert to compressed JPEG
              canvas.toBlob((blob) => {
                if (blob) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    resolve(Buffer.from(arrayBuffer));
                  };
                  reader.readAsArrayBuffer(blob);
                } else {
                  reject(new Error('Canvas compression failed'));
                }
              }, 'image/jpeg', quality);
            } else {
              reject(new Error('Canvas context not available'));
            }
          };
          
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = dataUrl;
        });
      } else {
        // Server-side: Use Sharp for compression
        try {
          const sharp = await import('sharp');
          
          // More aggressive compression for ExternalImageStorage
          const compressedBuffer = await sharp.default(buffer)
            .resize({ width: 600, height: 400, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: Math.round(quality * 100), progressive: true, mozjpeg: true })
            .toBuffer();
          
          console.log(`🗜️ Sharp compression: ${buffer.length} → ${compressedBuffer.length} bytes (${(compressedBuffer.length / buffer.length * 100).toFixed(1)}%)`);
          return compressedBuffer;
        } catch (sharpError) {
          console.error('❌ Sharp compression failed:', sharpError);
          return buffer; // Return original if Sharp fails
        }
      }
    } catch (error) {
      console.error('❌ Image compression failed:', error);
      return buffer; // Return original if compression fails
    }
  }
}

// Cloudinary adapter (for production with cloud storage)
class CloudinaryImageStorage implements ImageStorageAdapter {
  private cloudinaryUrl: string;

  constructor() {
    this.cloudinaryUrl = ENV_CONFIG.CLOUDINARY_URL || '';
    if (!this.cloudinaryUrl) {
      throw new Error('Cloudinary URL not configured');
    }
  }

  async uploadImage(buffer: Buffer, propertyId: string, imageIndex: number, contentType?: string, preferDataUrl?: boolean): Promise<string> {
    try {
      const cloudinaryUrl = this.cloudinaryUrl;
      
      // Extract cloud name and API credentials from CLOUDINARY_URL
      // Format: cloudinary://api_key:api_secret@cloud_name
      const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
      if (!urlMatch) {
        throw new Error('Invalid CLOUDINARY_URL format');
      }

      const [, apiKey, apiSecret, cloudName] = urlMatch;
      
      // Create form data for Cloudinary upload
      const timestamp = Math.round(Date.now() / 1000);
      const publicId = `properties/${propertyId}/${imageIndex}-${timestamp}`;
      
      // Generate signature for secure upload
      const crypto = await import('crypto');
      const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
      const signature = crypto.createHash('sha1')
        .update(paramsToSign + apiSecret)
        .digest('hex');

      const formData = new FormData();
      formData.append('file', new Blob([buffer], { type: contentType || 'image/jpeg' }));
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('signature', signature);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ Image uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      console.error('❌ Error uploading to Cloudinary:', error);
      // Fallback to external storage if Cloudinary fails
      console.log('⚠️ Falling back to external storage');
      const fallback = new ExternalImageStorage();
      return fallback.uploadImage(buffer, propertyId, imageIndex, contentType, preferDataUrl);
    }
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    // Implementation would depend on Cloudinary SDK
    console.log('⚠️ Cloudinary delete not implemented');
    return false;
  }

  async getImageUrl(path: string): Promise<string> {
    return path;
  }
}

// Firebase Storage adapter (for Firebase hosting)
class FirebaseStorageAdapter implements ImageStorageAdapter {
  private bucket: string;

  constructor() {
    this.bucket = ENV_CONFIG.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '';
    if (!this.bucket) {
      throw new Error('Firebase Storage bucket not configured');
    }
  }

  async uploadImage(buffer: Buffer, propertyId: string, imageIndex: number, contentType?: string, preferDataUrl?: boolean): Promise<string> {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Use Firebase SDK for client-side uploads
        return await this.uploadViaSDK(buffer, propertyId, imageIndex, contentType);
      } else {
        // Use REST API for server-side uploads
        const fileName = `properties/${propertyId}/${imageIndex}-${Date.now()}.${this.getFileExtension(contentType || 'image/jpeg')}`;
        return await this.uploadViaRestAPI(buffer, fileName, contentType);
      }
    } catch (error) {
      console.error('❌ Error uploading to Firebase Storage:', error);
      // Fallback to external storage with better error handling
      console.log('🔄 Falling back to external storage due to Firebase error');
      const fallback = new ExternalImageStorage();
      return fallback.uploadImage(buffer, propertyId, imageIndex, contentType, preferDataUrl);
    }
  }

  private async uploadViaSDK(buffer: Buffer, propertyId: string, imageIndex: number, contentType?: string): Promise<string> {
    const { getFirebaseStorage } = await import('@/lib/firebase');
    const { ref, uploadBytes } = await import('firebase/storage');

    const storage = getFirebaseStorage();
    
    // Determine file extension from content type
    const extension = this.getFileExtension(contentType || 'image/jpeg');
    const fileName = `properties/${propertyId}/${imageIndex}-${Date.now()}.${extension}`;
    const storageRef = ref(storage, fileName);

    try {
      const metadata = {
        contentType: contentType || 'image/jpeg',
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
        customMetadata: {
          'public': 'true',
          'propertyId': propertyId,
          'imageIndex': imageIndex.toString()
        }
      };
      
      const snapshot = await uploadBytes(storageRef, buffer, metadata);
      
      // Generate public URL without authentication token - this works with public storage rules
      const publicUrl = `https://storage.googleapis.com/${this.bucket}/${fileName}`;
      
      console.log(`✅ Image uploaded to Firebase Storage via SDK (PUBLIC): ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('❌ Firebase SDK upload failed:', error);
      throw error;
    }
  }

  private async uploadViaRestAPI(buffer: Buffer, fileName: string, contentType?: string): Promise<string> {
    // For Firebase Storage REST API with public access
    // This creates a publicly accessible URL without authentication tokens
    
    try {
      // Create proper file path with extension
      const extension = this.getFileExtension(contentType || 'image/jpeg');
      const timestamp = Date.now();
      const safeFileName = fileName.replace(/\.[^.]*$/, ''); // Remove existing extension
      const fullPath = `${safeFileName}-${timestamp}.${extension}`;
      
      // Use Firebase Storage REST API for uploads with public access
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o?name=${encodeURIComponent(fullPath)}&uploadType=media`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': contentType || 'image/jpeg',
          'Content-Length': buffer.length.toString(),
        },
        body: buffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Create public URL without authentication token - works with public storage rules
      const publicUrl = `https://storage.googleapis.com/${this.bucket}/${fullPath}`;
      
      console.log(`✅ Image uploaded to Firebase Storage via REST API (PUBLIC): ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('❌ Firebase REST API upload failed:', error);
      
      // Smart fallback with image compression for data URLs
      // Use configuration-based limits for document size control
      if (buffer.length < 1024 * 1024) { // Less than 1MB - try compression first
        try {
          const compressedBuffer = await this.compressImage(buffer, 0.4); // Use 40% quality for aggressive compression
          const maxSize = ENV_CONFIG.MAX_COMPRESSED_IMAGE_SIZE || 50000; // Default 50KB
          if (compressedBuffer.length < maxSize) {
            const base64Data = compressedBuffer.toString('base64');
            const dataUrl = `data:${contentType || 'image/jpeg'};base64,${base64Data}`;
            console.log(`✅ Firebase upload failed, using compressed data URL (${buffer.length} → ${compressedBuffer.length} bytes, limit: ${maxSize})`);
            return dataUrl;
          } else {
            console.log(`⚠️ Compressed image still too large: ${compressedBuffer.length} bytes > ${maxSize}, using placeholder`);
          }
        } catch (compressionError) {
          console.warn('⚠️ Image compression failed:', compressionError);
        }
      } else {
        console.log(`⚠️ Image too large for compression: ${buffer.length} bytes > 1MB, using placeholder`);
      }
      
      // For large images or compression failures, use placeholder
      const placeholderUrl = `https://placehold.co/600x400/e2e8f0/64748b?text=Property+Image`;
      console.log(`⚠️ Firebase upload failed, using placeholder for large image (${buffer.length} bytes)`);
      return placeholderUrl;
    }
  }

  private async getAccessToken(): Promise<string> {
    // For simplified implementation, we'll skip authentication
    // This requires public upload rules in Firebase Storage
    return '';
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined') {
          return await this.deleteViaSDK(imageUrl);
        } else {
          return await this.deleteViaRestAPI(imageUrl);
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Error deleting from Firebase Storage:', error);
      return false;
    }
  }

  private async deleteViaSDK(imageUrl: string): Promise<boolean> {
    try {
      const { getFirebaseStorage } = await import('@/lib/firebase');
      const { ref, deleteObject } = await import('firebase/storage');

      const storage = getFirebaseStorage();
      
      // Extract file path from URL
      const urlMatch = imageUrl.match(/\/o\/(.+?)\?/);
      if (urlMatch) {
        const filePath = decodeURIComponent(urlMatch[1]);
        const fileRef = ref(storage, filePath);
        
        await deleteObject(fileRef);
        console.log(`✅ Image deleted from Firebase Storage via SDK: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Firebase SDK delete failed:', error);
      return false;
    }
  }

  private async deleteViaRestAPI(imageUrl: string): Promise<boolean> {
    try {
      // Extract file name from Firebase Storage URL
      const urlMatch = imageUrl.match(/\/o\/(.+?)\?/);
      if (urlMatch) {
        const fileName = decodeURIComponent(urlMatch[1]);
        const deleteUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o/${encodeURIComponent(fileName)}`;
        
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`,
          },
        });

        if (response.ok) {
          console.log(`✅ Image deleted from Firebase Storage via REST: ${fileName}`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Firebase REST delete failed:', error);
      return false;
    }
  }

  async getImageUrl(path: string): Promise<string> {
    return path;
  }

  private getFileExtension(contentType: string): string {
    const mimeTypeMap: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'image/tif': 'tif',
      'image/svg+xml': 'svg',
      'image/avif': 'avif',
      'image/heic': 'heic',
      'image/heif': 'heif'
    };

    return mimeTypeMap[contentType.toLowerCase()] || 'jpg';
  }

  // Helper function to detect content type from file name
  private getContentTypeFromFileName(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    const extToMimeMap: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
      'tiff': 'image/tiff',
      'tif': 'image/tiff',
      'svg': 'image/svg+xml',
      'avif': 'image/avif',
      'heic': 'image/heic',
      'heif': 'image/heif'
    };

    return extToMimeMap[ext] || 'image/jpeg';
  }

  // Compress image using Canvas API (browser) or Sharp (server)
  private async compressImage(buffer: Buffer, quality: number = 0.8): Promise<Buffer> {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
        // Use Canvas API for compression (client-side)
        const base64 = buffer.toString('base64');
        const mimeType = 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64}`;
        
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        return new Promise((resolve, reject) => {
          img.onload = () => {
            // Calculate new dimensions (reduce by 50% if too large)
            const maxDimension = 800;
            let { width, height } = img;
            
            if (width > maxDimension || height > maxDimension) {
              const ratio = Math.min(maxDimension / width, maxDimension / height);
              width = Math.floor(width * ratio);
              height = Math.floor(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              
              // Convert to compressed JPEG
              canvas.toBlob((blob) => {
                if (blob) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    resolve(Buffer.from(arrayBuffer));
                  };
                  reader.readAsArrayBuffer(blob);
                } else {
                  reject(new Error('Canvas compression failed'));
                }
              }, 'image/jpeg', quality);
            } else {
              reject(new Error('Canvas context not available'));
            }
          };
          
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = dataUrl;
        });
      } else {
        // Server-side: Use Sharp for compression
        try {
          const sharp = await import('sharp');
          
          // Compress using Sharp
          const compressedBuffer = await sharp.default(buffer)
            .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: Math.round(quality * 100), progressive: true })
            .toBuffer();
          
          console.log(`🗜️ Sharp compression: ${buffer.length} → ${compressedBuffer.length} bytes (${(compressedBuffer.length / buffer.length * 100).toFixed(1)}%)`);
          return compressedBuffer;
        } catch (sharpError) {
          console.error('❌ Sharp compression failed:', sharpError);
          return buffer; // Return original if Sharp fails
        }
      }
    } catch (error) {
      console.error('❌ Image compression failed:', error);
      return buffer; // Return original if compression fails
    }
  }
}

// Storage adapter factory
export function createImageStorage(): ImageStorageAdapter {
  const uploadProvider = ENV_CONFIG.UPLOAD_PROVIDER;
  const isServerless = ENV_CONFIG.isServerless();
  const isProduction = ENV_CONFIG.isProduction();

  // Debug: Print environment variables
  console.log('DEBUG ENV_CONFIG:', {
    UPLOAD_PROVIDER: ENV_CONFIG.UPLOAD_PROVIDER,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ENV_CONFIG.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: ENV_CONFIG.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NODE_ENV: process.env.NODE_ENV,
    isServerless,
    isProduction
  });

  // In serverless production environments, prefer cloud storage
  if (isServerless || isProduction) {
    // Check for Firebase Storage first
    if (ENV_CONFIG.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
      console.log('📸 Using Firebase Storage for serverless/production');
      return new FirebaseStorageAdapter();
    } else if (ENV_CONFIG.CLOUDINARY_URL) {
      console.log('📸 Using Cloudinary image storage for serverless/production');
      return new CloudinaryImageStorage();
    } else {
      console.log('⚠️ Serverless/production environment detected but no cloud storage configured');
      console.log('📸 Using External image storage with data URLs/placeholders');
      return new ExternalImageStorage();
    }
  }

  // For development environments, prioritize Firebase if configured
  switch (uploadProvider) {
    case 'firebase':
      if (ENV_CONFIG.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
        console.log('📸 Using Firebase Storage');
        return new FirebaseStorageAdapter();
      }
      console.log('⚠️ Firebase Storage not configured, falling back to local storage');
      return new LocalImageStorage();
    case 'cloudinary':
      if (ENV_CONFIG.CLOUDINARY_URL) {
        console.log('📸 Using Cloudinary image storage');
        return new CloudinaryImageStorage();
      }
      console.log('⚠️ Cloudinary not configured, falling back to local storage');
      return new LocalImageStorage();

    case 's3':
      console.log('⚠️ S3 image storage not implemented, falling back to local storage');
      return new LocalImageStorage();

    case 'external':
      console.log('📸 Using External image storage (data URLs/placeholders)');
      return new ExternalImageStorage();

    case 'local':
      console.log('📸 Using Local filesystem image storage');
      return new LocalImageStorage();
      
    default:
      // Default to Firebase if configured, otherwise local
      if (ENV_CONFIG.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
        console.log('📸 Using Firebase Storage (default)');
        return new FirebaseStorageAdapter();
      }
      console.log('📸 Using Local filesystem image storage (default)');
      return new LocalImageStorage();
  }
}

// Singleton instance
let imageStorageInstance: ImageStorageAdapter | null = null;

export function getImageStorage(): ImageStorageAdapter {
  if (!imageStorageInstance) {
    imageStorageInstance = createImageStorage();
  }
  return imageStorageInstance;
}

// Helper function to download image from URL and return buffer
export async function downloadImageFromUrl(url: string): Promise<{ buffer: Buffer; contentType?: string } | null> {
  if (!url || !url.startsWith('http')) {
    console.error(`❌ Invalid or relative URL provided for download: ${url}`);
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': new URL(url).origin,
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch image ${url}: ${response.status} ${response.statusText}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || undefined;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`✅ Image downloaded from URL: ${url} (${buffer.length} bytes)`);
    return { buffer, contentType };
  } catch (error) {
    console.error(`❌ Error downloading image from ${url}:`, error);
    return null;
  }
}
