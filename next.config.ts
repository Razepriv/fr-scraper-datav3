import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Optimized for Vercel deployment
  // Remove output config for SSR on Vercel
  
  // Disable ESLint during production builds for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
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

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
}

export default nextConfig
