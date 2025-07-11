import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // For Firebase App Hosting, we don't need standalone output
  // output: 'export' for static, or remove for SSR
  
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
        'fr-toolv2.web.app', 
        'fr-toolv2.firebaseapp.com',
        '*.firebaseapp.com',
        '*.a.run.app'
      ]
    }
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
}

export default nextConfig
