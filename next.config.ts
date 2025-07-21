import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Optimized for both Vercel and Firebase App Hosting deployment
  
  // Disable ESLint during production builds for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration for better module resolution
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
  
  // Increase body size limit for scraping large HTML
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
        process.env.NEXT_PUBLIC_BASE_URL || ''
      ].filter(Boolean)
    }
  },
  
  // Webpack configuration for better module resolution in Firebase App Hosting
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ensure path aliases work in all environments
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    
    // Optimize bundle for Firebase App Hosting
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

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
}

export default nextConfig
