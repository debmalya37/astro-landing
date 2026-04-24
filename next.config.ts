import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Advanced Image Optimization
  images: {
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
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
};

export default nextConfig;