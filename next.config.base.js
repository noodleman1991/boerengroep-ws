// next.config.base.js

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
    ];
  },
  async rewrites() {
    return [
      { source: '/admin', destination: '/admin/index.html' },
    ];
  },
};

module.exports = baseConfig;
