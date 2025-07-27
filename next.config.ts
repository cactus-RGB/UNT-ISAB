// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/uc/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Disable image optimization for Google Drive URLs to avoid 400 errors
    unoptimized: false,
    // Add custom loader for Google Drive images
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts'
  },
}

export default nextConfig