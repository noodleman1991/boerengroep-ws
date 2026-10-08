import { Metadata, Viewport } from "next";
import { Enriqueta, Public_Sans, Roboto_Flex } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import "./site.css";
import { TailwindIndicator } from "@/components/ui/breakpoint-indicator";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { LivePreviewListener } from '@/components/live-preview-listener';
import Layout from '@/components/layout/layout';
import { siteUrl } from '@/lib/site-url';
import { SITE } from '@/site.config';

// The fonts of the design, shared by both sites
const enriqueta = Enriqueta({
    subsets: ["latin"],
    variable: "--font-enriqueta",
    weight: ["400", "700"],
    display: 'swap',
    fallback: ['Georgia', 'Times New Roman', 'serif'],
});

const publicSans = Public_Sans({
    subsets: ["latin"],
    variable: "--font-public-sans",
    weight: ["300", "400", "500", "600", "700"],
    style: ['normal', 'italic'],
    display: 'swap',
    fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

const robotoFlex = Roboto_Flex({
    subsets: ["latin"],
    variable: "--font-roboto-flex",
    display: 'swap',
    // Roboto Flex supports variable font features
    axes: ['slnt', 'wdth', 'GRAD', 'XTRA', 'XOPQ', 'YOPQ', 'YTLC', 'YTUC', 'YTAS', 'YTDE', 'YTFI'],
    fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

// What browsers and search engines are told about the site as a whole. A page that says
// nothing more specific about itself falls back to this.
export const metadata: Metadata = {
    title: SITE.title,
    description: SITE.description,
    authors: [{ name: SITE.name }],
    creator: SITE.name,
    publisher: SITE.name,
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        alternateLocale: ['nl_NL'],
        url: siteUrl(),
        title: SITE.title,
        description: SITE.description,
        siteName: SITE.name,
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE.title,
        description: SITE.description,
    },
};

// Separate viewport export (Next.js 14+ requirement)
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

const locales = ['nl', 'en'];

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
                                               children,
                                               params
                                           }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!locales.includes(locale as any)) notFound();

    // Lets next-intl resolve the locale without reading request headers, so pages can be static.
    setRequestLocale(locale);

    const messages = await getMessages();
    const { isEnabled: isPreview } = await draftMode();

    return (
        <html
            lang={locale}
            className={cn(
                enriqueta.variable,
                publicSans.variable,
                robotoFlex.variable,
                "scroll-smooth antialiased"
            )}
            suppressHydrationWarning
        >
        <head>
            {/* Preload critical fonts */}
            {/*<link*/}
            {/*    rel="preload"*/}
            {/*    href="/_next/static/media/roboto-flex-latin.woff2"*/}
            {/*    as="font"*/}
            {/*    type="font/woff2"*/}
            {/*    crossOrigin="anonymous"*/}
            {/*/>*/}
            {/*<link*/}
            {/*    rel="preload"*/}
            {/*    href="/_next/static/media/enriqueta-latin.woff2"*/}
            {/*    as="font"*/}
            {/*    type="font/woff2"*/}
            {/*    crossOrigin="anonymous"*/}
            {/*/>*/}
            {/* Favicon and app icons */}
            <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
            <link rel="icon" type="image/png" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />
            {/* Theme color for mobile browsers */}
            <meta name="theme-color" content={SITE.themeColor} />
            <meta name="msapplication-TileColor" content={SITE.themeColor} />
        </head>
        <body className={cn(
            "min-h-screen bg-background font-body text-foreground",
            "supports-[font-variation-settings:normal]:font-sans"
        )}>
        {isPreview && <LivePreviewListener />}
        <NextIntlClientProvider messages={messages}>
            {children}
            <TailwindIndicator />
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
