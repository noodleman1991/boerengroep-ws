/** @type {import('next').NextConfig} */
const baseConfig = {
  basePath: '',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', port: '' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', port: '' },
      // Covers of YouTube videos. The site's server fetches them, so a visitor's browser does not contact YouTube before pressing play.
      { protocol: 'https', hostname: 'i.ytimg.com', port: '' },
    ],
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
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          // Browsers must not guess the type of a file, for example of an upload.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Other sites learn which site a visitor came from, not which page.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // The site never asks for these, so nothing embedded in it can either.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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
    ];
  },
  // React strict mode
  reactStrictMode: true,
  // PoweredBy header
  poweredByHeader: false,
  
  // Transpile motion package properly for Next.js
  transpilePackages: ['motion', '@sites/cms'],
  
};

module.exports = baseConfig;
