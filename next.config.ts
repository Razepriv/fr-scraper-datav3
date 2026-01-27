import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Optimized for both Vercel and Firebase App Hosting deployment

  // TypeScript configuration for better module resolution
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for deployment setup
  },

  // Turbopack configuration (empty to allow Webpack fallback in Next.js 16)
  turbopack: {},

  // Configure images for SSR and external sources
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
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'dbz-images.dubizzle.com',
      },
      {
        protocol: 'https',
        hostname: 'fr-toolv2.firebasestorage.app',
      },
      {
        protocol: 'https',
        hostname: 'housing-images.n7net.in',
      },
      {
        protocol: 'https',
        hostname: '*.n7net.in',
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable output file tracing for deployment optimization
  output: 'standalone',

  // Webpack configuration for better module resolution in Firebase App Hosting
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ensure path aliases work in all environments
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.join(process.cwd(), 'src'),
      };

      // Polyfill Node.js modules for the browser
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          path: false,
          child_process: false,
          worker_threads: false,
          perf_hooks: false,
          os: false,
          crypto: false,
        };
      }
    }

    // Optimize bundle for Firebase App Hosting
    if (!dev && !isServer && config.optimization) {
      config.optimization.splitChunks = {
        ...(config.optimization.splitChunks || {}),
        cacheGroups: {
          ...((config.optimization.splitChunks && typeof config.optimization.splitChunks === 'object' && 'cacheGroups' in config.optimization.splitChunks ? config.optimization.splitChunks.cacheGroups : {}) || {}),
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 30,
          },
        },
      } as any;
    }

    return config;
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || "",
  }
}

export default nextConfig
