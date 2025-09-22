/** @type {import('next').NextConfig} */
const baseConfig = {
  basePath: '',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.tina.io', port: '' },
      { protocol: 'https', hostname: 'res.cloudinary.com', port: '' }
    ],
    // Allow optimization of images in public folder
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" }
        ],
      },
      {
        // Apply headers to font files
        source: '/_next/static/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Apply headers to uploads folder (TinaCMS media)
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, s-maxage=31536000',
          },
        ],
      },
      {
        // Ensure branding assets are properly cached
        source: '/uploads/branding/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, s-maxage=31536000',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Prevent TinaCMS from handling font files
        {
          source: '/_next/static/:path*',
          destination: '/_next/static/:path*',
        },
        // Prevent TinaCMS from handling manifest
        {
          source: '/manifest.json',
          destination: '/manifest.json',
        },
        // Ensure uploads folder is accessible
        {
          source: '/uploads/:path*',
          destination: '/uploads/:path*',
        },
        // Explicitly handle branding assets
        {
          source: '/uploads/branding/:path*',
          destination: '/uploads/branding/:path*',
        },
      ],
      afterFiles: [
        { source: '/admin', destination: '/admin/index.html' },
      ],
    };
  },
  // React strict mode
  reactStrictMode: true,
  // PoweredBy header
  poweredByHeader: false,
  
  // Transpile motion package properly for Next.js
  transpilePackages: ['motion'],
  
};

module.exports = baseConfig;
