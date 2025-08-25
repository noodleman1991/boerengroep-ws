import { Metadata, Viewport } from "next";
import { Enriqueta, Public_Sans, Roboto_Flex } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { TailwindIndicator } from "@/components/ui/breakpoint-indicator";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import { VideoDialogProvider } from '@/components/ui/VideoDialogContext';
import VideoDialog from '@/components/ui/VideoDialog';

// Boerengroep Brand Fonts with optimized configurations
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

export const metadata: Metadata = {
    title: "Stichting Boerengroep Wageningen",
    description: "Wageningen's peasant association | Celebrating 50 years!",
    keywords: ["boerengroep", "wageningen", "sustainable agriculture", "peasant association", "food sovereignty"],
    authors: [{ name: "Stichting Boerengroep" }],
    creator: "Stichting Boerengroep",
    publisher: "Stichting Boerengroep",
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
        url: 'https://boerengroep.nl',
        title: 'Stichting Boerengroep Wageningen',
        description: "Wageningen's peasant association | Celebrating 50 years!",
        siteName: 'Stichting Boerengroep',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Stichting Boerengroep Wageningen',
        description: "Wageningen's peasant association | Celebrating 50 years!",
        creator: '@boerengroep',
    },
    // viewport removed from here - now separate export below
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

    const messages = await getMessages();

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
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link rel="icon" type="image/png" href="/favicon.png" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />
            {/* Theme color for mobile browsers */}
            <meta name="theme-color" content="#44AD39" />
            <meta name="msapplication-TileColor" content="#44AD39" />
        </head>
        <body className={cn(
            "min-h-screen bg-background font-body text-foreground",
            "supports-[font-variation-settings:normal]:font-sans"
        )}>
        <NextIntlClientProvider messages={messages}>
            <VideoDialogProvider>
                {children}
                <VideoDialog />
            </VideoDialogProvider>
            <TailwindIndicator />
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
