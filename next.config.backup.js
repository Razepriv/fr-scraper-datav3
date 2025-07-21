/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during production builds for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Experimental features for better module resolution
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: [
        'localhost:9002', 
        'localhost:9004',
        'fr-toolv2.web.app', 
        'fr-toolv2.firebaseapp.com',
        '*.firebaseapp.com',
        '*.a.run.app',
        '*.vercel.app',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
      ].filter(Boolean),
    },
    // Enable turbo mode for better build performance
    turbo: {
      rules: {
        '*.ts': ['typescript-transform'],
        '*.tsx': ['typescript-transform'],
      },
    },
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configure images for SSR
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'fr-toolv2.firebasestorage.app',
      }
    ]
  },
  
  // Webpack configuration for better module resolution
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add alias resolution as fallback
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    
    // Optimize for Firebase App Hosting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 30,
          },
        },
      };
    }
    
    return config;
  },
  
  // Output configuration for Firebase App Hosting
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Ensure proper handling of environment variables
  env: {
    NODE_ENV: process.env.NODE_ENV,
    STORAGE_TYPE: process.env.STORAGE_TYPE,
    UPLOAD_PROVIDER: process.env.UPLOAD_PROVIDER,
  },
};

// Add path import at the top if using webpack alias
const path = require('path');

module.exports = nextConfig;
