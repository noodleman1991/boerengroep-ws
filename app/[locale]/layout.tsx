// import { Metadata } from "next";
// import { Inter as FontSans, Lato, Nunito } from "next/font/google";
// import { cn } from "@/lib/utils";
// import "@/styles.css";
// import { TailwindIndicator } from "@/components/ui/breakpoint-indicator";
//
// // import { VideoDialogProvider } from "@/components/ui/VideoDialogContext";
// // import VideoDialog from "@/components/ui/VideoDialog";
//
// const fontSans = FontSans({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });
//
// const nunito = Nunito({
//   subsets: ["latin"],
//   variable: "--font-nunito",
// });
//
// const lato = Lato({
//   subsets: ["latin"],
//   variable: "--font-lato",
//   weight: "400",
// });
//
// export const metadata: Metadata = {
//   title: "Stichting Boerengroep Wageningen",
//   description: "Wageningen's peasant association | Celebrating 50 years!",
// };
// //
// // export default function RootLayout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   return (
// //     <html lang="en" className={cn(fontSans.variable, nunito.variable, lato.variable)}>
// //       <body className="min-h-screen bg-background font-sans antialiased">
// //         <VideoDialogProvider>
// //           {children}
// //           <VideoDialog />
// //         </VideoDialogProvider>
// //         <TailwindIndicator />
// //       </body>
// //     </html>
// //   );
// // }
//
// import { NextIntlClientProvider } from 'next-intl';
// import { getMessages } from 'next-intl/server';
// import { notFound } from 'next/navigation';
// import Layout from '@/components/layout/layout';
//
// const locales = ['nl', 'en'];
//
// export function generateStaticParams() {
//     return locales.map((locale) => ({ locale }));
// }
//
// export default async function LocaleLayout({
//                                                children,
//                                                params: { locale }
//                                            }: {
//     children: React.ReactNode;
//     params: { locale: string };
// }) {
//     if (!locales.includes(locale as any)) notFound();
//
//     const messages = await getMessages();
//
//     return (
//         <html lang={locale}
//               className={cn(fontSans.variable, nunito.variable, lato.variable)}
//         >
//         <body className="min-h-screen bg-background font-sans antialiased">
//         <NextIntlClientProvider messages={messages}>
//             {/*<Layout>*/}
//                 {children}
//             {/*</Layout>*/}
//             <TailwindIndicator />
//         </NextIntlClientProvider>
//         </body>
//         </html>
//     );
// }

import { Metadata } from "next";
import { Inter as FontSans, Lato, Nunito } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles.css";
import { TailwindIndicator } from "@/components/ui/breakpoint-indicator";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import { VideoDialogProvider } from '@/components/ui/VideoDialogContext';
import VideoDialog from '@/components/ui/VideoDialog';

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
});

const nunito = Nunito({
    subsets: ["latin"],
    variable: "--font-nunito",
});

const lato = Lato({
    subsets: ["latin"],
    variable: "--font-lato",
    weight: "400",
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
        <html lang={locale}
              className={cn(fontSans.variable, nunito.variable, lato.variable)}
        >
        <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
            <VideoDialogProvider>
                {/*<Layout>*/}
                    {children}
                {/*</Layout>*/}
                <VideoDialog />
            </VideoDialogProvider>
            <TailwindIndicator />
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
