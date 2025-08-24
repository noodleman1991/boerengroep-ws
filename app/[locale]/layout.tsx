import { Metadata } from "next";
import { Enriqueta, Public_Sans, Roboto_Flex } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { TailwindIndicator } from "@/components/ui/breakpoint-indicator";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { VideoDialogProvider } from '@/components/ui/VideoDialogContext';
import VideoDialog from '@/components/ui/VideoDialog';

// Boerengroep Brand Fonts
const enriqueta = Enriqueta({
    subsets: ["latin"],
    variable: "--font-enriqueta",
    weight: ["400", "700"],
    display: 'swap',
});

const publicSans = Public_Sans({
    subsets: ["latin"],
    variable: "--font-public-sans",
    weight: ["300", "400", "500", "600", "700"],
    style: ['normal', 'italic'],
    display: 'swap',
});

const robotoFlex = Roboto_Flex({
    subsets: ["latin"],
    variable: "--font-roboto-flex",
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Stichting Boerengroep Wageningen",
    description: "Wageningen's peasant association | Celebrating 50 years!",
};

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
                "scroll-smooth"
            )}
        >
        <body className="min-h-screen bg-background font-body antialiased">
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
