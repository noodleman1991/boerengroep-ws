/** @type {import('next').NextConfig} */
const baseConfig = {
  basePath: '',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.tina.io', port: '' },
      { protocol: 'https', hostname: 'res.cloudinary.com', port: '' }
    ],
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
      ],
      afterFiles: [
        { source: '/admin', destination: '/admin/index.html' },
      ],
    };
  },
  // React strict mode
  reactStrictMode: true,
  // SWC minification
  swcMinify: true,
  // PoweredBy header
  poweredByHeader: false,
};

module.exports = baseConfig;
