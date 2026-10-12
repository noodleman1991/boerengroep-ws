import type { MetadataRoute } from 'next';
import { isTrialCopy, siteUrl } from '@/lib/site-url';

/**
 * What search engines may read, at /robots.txt. Pictures and files are served from /api/media,
 * so /api as a whole stays open and only the parts that are not content are closed.
 */
export default function robots(): MetadataRoute.Robots {
    // A copy for trying things out stays closed as a whole.
    if (isTrialCopy()) return { rules: [{ userAgent: '*', disallow: '/' }] };
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin',
                    '/api/newsletter/',
                    '/api/form-submit',
                    '/api/preview',
                    '/api/exit-preview',
                    '/api/revalidate',
                    // Pages about one visitor's own subscription.
                    '/en/newsletter/',
                    '/nl/newsletter/',
                ],
            },
        ],
        sitemap: `${siteUrl()}/sitemap.xml`,
    };
}
