import type { NextConfig } from 'next';

export const baseConfig: NextConfig = {
    basePath: '',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'assets.tina.io',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
            }
        ],
    },
    async headers() {
        const headers = [
            {
                key: 'X-Frame-Options',
                value: 'SAMEORIGIN',
            },
            {
                key: 'Content-Security-Policy',
                value: "frame-ancestors 'self'",
            },
        ];
        return [
            {
                source: '/(.*)',
                headers,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/admin',
                destination: '/admin/index.html',
            },
        ];
    },
};
