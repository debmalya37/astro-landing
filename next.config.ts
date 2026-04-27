import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Advanced Image Optimization
  images: {
    // 1. Add the external domain here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.surabhiastrology.com',
      },
      {
        protocol: 'https',
        hostname: 'archive.siasat.com', // Added for the PM Modi News Image
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com', // Added for the PM Modi News Image
      },
      {
        protocol: 'https',
        hostname: 'static.vecteezy.com', // Added for your "Solve" cards
      },
      {
        protocol: 'https',
        hostname: 'www.jyotishdham.com', // Added for your "Solve" cards
      },
      {
        protocol: 'https',
        hostname: 'gerardcounseling.com', // Added for your "Solve" cards
      },
      {
        protocol: 'https',
        hostname: 'media.swncdn.com', // Added for your "Solve" cards
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com', // Added for your "Solve" cards
      }
    ],
    // Automatically serves AVIF (smallest) or WebP depending on browser support
    formats: ['image/avif', 'image/webp'],
    // Optimization for common device widths (prevents oversized images on mobile)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Cache optimized images for 1 year (Vercel Edge Cache)
    minimumCacheTTL: 31536000,
  },

  // 2. Production Optimizations
  compress: true, // Enables Gzip/Brotli compression
  reactStrictMode: true,
  poweredByHeader: false, // Security: removes X-Nextjs-Powered-By header

  // 3. Custom Headers for Aggressive Caching (Browser side)
  async headers() {
    return [
      {
        // Cache all static assets (images, fonts, etc.) in the public folder
        source: '/(.*).(jpg|jpeg|png|svg|webp|JPG|mp4|webm)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // 4. Experimental tweaks for heavy pages
  experimental: {
    // Reduces the size of the JavaScript bundle
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'three','react-icons', 'fa6'],
  },
};

export default nextConfig;