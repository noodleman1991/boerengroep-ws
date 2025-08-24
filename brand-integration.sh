#!/bin/bash

# Boerengroep Brand Integration Script
# This script integrates brand fonts, colors, and logo system into your TinaCMS website

echo "🚀 Starting Boerengroep Brand Integration..."

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Please install pnpm first."
    exit 1
fi

# 1. Install required dependencies
echo "📦 Installing dependencies..."
pnpm add @next/font

# 2. Create brand components directory
echo "📁 Creating brand components directory..."
mkdir -p components/brand

# 3. Create logo component
echo "🎨 Creating logo component..."
cat > components/brand/logo.tsx << 'EOF'
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Icon } from '../icon';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  // TinaCMS compatible props
  logoImage?: string;
  logoType?: 'image' | 'icon';
  iconData?: {
    name?: string;
    color?: string;
    style?: string;
  };
  organizationName?: string;
}

const BoerengroepText: React.FC<{
  name?: string;
  size?: string;
  className?: string;
}> = ({ name = 'Stichting Boerengroep', size = 'md', className }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={cn('font-heading font-bold', sizeClasses[size as keyof typeof sizeClasses], className)}>
      <span className="text-brand-green">{name.split(' ')[0] || 'Stichting'}</span>
      {name.split(' ').length > 1 && (
        <span className="text-brand-tan"> {name.split(' ').slice(1).join(' ')}</span>
      )}
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className,
  logoImage,
  logoType = 'icon',
  iconData,
  organizationName = 'Stichting Boerengroep'
}) => {
  const containerSizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  // If we have a logo image, use it
  if (logoType === 'image' && logoImage) {
    return (
      <div className={cn('flex items-center gap-3', containerSizes[size], className)}>
        <Image
          src={logoImage}
          alt={organizationName}
          width={variant === 'icon' ? 48 : 200}
          height={48}
          className="h-full w-auto object-contain"
          priority
        />
        {variant === 'full' && (
          <BoerengroepText name={organizationName} size={size} />
        )}
      </div>
    );
  }

  // Fallback to icon + text (current system)
  switch (variant) {
    case 'icon':
      return (
        <div className={cn('flex items-center', className)}>
          {iconData && (
            <Icon
              data={{
                name: iconData.name || 'BiLeaf',
                color: iconData.color || 'green',
                style: iconData.style || 'float'
              }}
            />
          )}
        </div>
      );

    case 'text':
      return (
        <div className={cn('flex items-center', className)}>
          <BoerengroepText name={organizationName} size={size} />
        </div>
      );

    case 'full':
    default:
      return (
        <div className={cn('flex items-center gap-3', className)}>
          {iconData && (
            <Icon
              data={{
                name: iconData.name || 'BiLeaf',
                color: iconData.color || 'green',
                style: iconData.style || 'float'
              }}
            />
          )}
          <BoerengroepText name={organizationName} size={size} />
        </div>
      );
  }
};

// Specialized variants
export const HeaderLogo: React.FC<{
  className?: string;
  globalSettings?: any;
}> = ({ className, globalSettings }) => {
  const header = globalSettings?.header;

  return (
    <Logo
      variant="full"
      size="md"
      className={className}
      logoImage={header?.logo?.image}
      logoType={header?.logo?.type || 'icon'}
      iconData={header?.icon}
      organizationName={header?.name || 'Stichting Boerengroep'}
    />
  );
};

export const FooterLogo: React.FC<{
  className?: string;
  globalSettings?: any;
}> = ({ className, globalSettings }) => {
  const header = globalSettings?.header;

  return (
    <Logo
      variant="icon"
      size="sm"
      className={className}
      logoImage={header?.logo?.image}
      logoType={header?.logo?.type || 'icon'}
      iconData={header?.icon}
      organizationName={header?.name || 'Stichting Boerengroep'}
    />
  );
};
EOF

# 4. Update global TinaCMS configuration to include logo options
echo "⚙️  Updating TinaCMS global configuration..."
cat > tina/collection/global-updated.ts << 'EOF'
import type { Collection } from "@tinacms/cli";
import { ColorPickerInput } from "../fields/color";
import { iconSchema } from "../fields/icon";

const Global: Collection = {
    label: "Global",
    name: "global",
    path: "content/global",
    format: "json",
    ui: {
        global: true,
    },
    fields: [
        {
            type: "object",
            label: "Header",
            name: "header",
            fields: [
                {
                    type: "object",
                    label: "Logo",
                    name: "logo",
                    fields: [
                        {
                            type: "string",
                            label: "Logo Type",
                            name: "type",
                            options: [
                                { label: "Icon (Current System)", value: "icon" },
                                { label: "Custom Image", value: "image" },
                            ],
                        },
                        {
                            type: "image",
                            label: "Logo Image",
                            name: "image",
                            description: "Upload your logo image (SVG, PNG, or JPG)",
                            // @ts-ignore
                            uploadDir: () => "logo",
                        },
                    ],
                },
                // Keep existing icon system for backwards compatibility
                iconSchema as any,
                {
                    type: "string",
                    label: "Organization Name",
                    name: "name",
                },
                {
                    type: "string",
                    label: "Color",
                    name: "color",
                    options: [
                        { label: "Default", value: "default" },
                        { label: "Primary", value: "primary" },
                    ],
                },
                {
                    type: "object",
                    label: "Navigation Links",
                    name: "nav",
                    list: true,
                    ui: {
                        itemProps: (item: any) => {
                            return { label: item?.label };
                        },
                        defaultItem: {
                            href: "/",
                            label: "Home",
                        },
                    },
                    fields: [
                        {
                            type: "string",
                            label: "Link",
                            name: "href",
                        },
                        {
                            type: "string",
                            label: "Label",
                            name: "label",
                        },
                        {
                            type: "object",
                            label: "Submenu Items",
                            name: "submenu",
                            list: true,
                            ui: {
                                itemProps: (item: any) => {
                                    return { label: item?.label };
                                },
                                defaultItem: {
                                    href: "/",
                                    label: "Submenu Item",
                                },
                            },
                            fields: [
                                {
                                    type: "string",
                                    label: "Link",
                                    name: "href",
                                },
                                {
                                    type: "string",
                                    label: "Label",
                                    name: "label",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: "object",
            label: "Footer",
            name: "footer",
            fields: [
                {
                    type: "object",
                    label: "Social Links",
                    name: "social",
                    list: true,
                    ui: {
                        itemProps: (item: any) => {
                            return { label: item?.icon?.name || 'undefined' };
                        },
                    },
                    fields: [
                        iconSchema as any,
                        {
                            type: "string",
                            label: "Url",
                            name: "url",
                        },
                    ],
                },
                {
                    type: "object",
                    label: "Quick Links Sections",
                    name: "quickLinks",
                    list: true,
                    ui: {
                        itemProps: (item: any) => {
                            return { label: item?.title || 'Quick Links Section' };
                        },
                        defaultItem: {
                            title: "Section Title",
                            links: [
                                {
                                    href: "/",
                                    label: "Link Label",
                                }
                            ],
                        },
                    },
                    fields: [
                        {
                            type: "string",
                            label: "Section Title",
                            name: "title",
                        },
                        {
                            type: "object",
                            label: "Links",
                            name: "links",
                            list: true,
                            ui: {
                                itemProps: (item: any) => {
                                    return { label: item?.label };
                                },
                                defaultItem: {
                                    href: "/",
                                    label: "Link Label",
                                },
                            },
                            fields: [
                                {
                                    type: "string",
                                    label: "Link",
                                    name: "href",
                                },
                                {
                                    type: "string",
                                    label: "Label",
                                    name: "label",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: "object",
            label: "Theme",
            name: "theme",
            fields: [
                {
                    type: "string",
                    label: "Primary Color",
                    name: "color",
                    ui: {
                        component: ColorPickerInput,
                    },
                },
                {
                    type: "string",
                    name: "font",
                    label: "Font Family",
                    options: [
                        {
                            label: "System Sans",
                            value: "sans",
                        },
                        {
                            label: "Nunito",
                            value: "nunito",
                        },
                        {
                            label: "Lato",
                            value: "lato",
                        },
                    ],
                },
                {
                    type: "string",
                    name: "darkMode",
                    label: "Dark Mode",
                    options: [
                        {
                            label: "System",
                            value: "system",
                        },
                        {
                            label: "Light",
                            value: "light",
                        },
                        {
                            label: "Dark",
                            value: "dark",
                        },
                    ],
                },
            ],
        },
    ],
};

export default Global;
EOF

# 5. Update layout with brand fonts
echo "🖋️  Updating layout with brand fonts..."
cp app/[locale]/layout.tsx app/[locale]/layout.tsx.backup
cat > app/[locale]/layout.tsx << 'EOF'
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
EOF

# 6. Update header component
echo "🧭 Updating header component..."
cp components/layout/nav/header.tsx components/layout/nav/header.tsx.backup
cat > components/layout/nav/header.tsx << 'EOF'
"use client";

import React, { useState } from "react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HeaderLogo } from '@/components/brand/logo';
import { useLayout } from "../layout-context";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Header = () => {
    const { globalSettings } = useLayout();
    const header = globalSettings!.header!;
    const [menuState, setMenuState] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const t = useTranslations('navigation');

    const toggleDropdown = (label: string) => {
        setActiveDropdown(activeDropdown === label ? null : label);
    };

    const closeAllMenus = () => {
        setMenuState(false);
        setActiveDropdown(null);
    };

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="bg-background/95 backdrop-blur-md fixed z-20 w-full border-b border-brand-tan/20 shadow-sm"
            >
                <div className="mx-auto max-w-6xl px-6 transition-all duration-300">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full items-center justify-between gap-12">
                            <Link
                                href="/"
                                onClick={closeAllMenus}
                                aria-label={t('home')}
                                className="flex items-center transition-all duration-200 hover:opacity-80 focus:outline-2 focus:outline-brand-green focus:outline-offset-2 rounded-sm"
                            >
                                <HeaderLogo
                                    globalSettings={globalSettings}
                                    className="transition-transform duration-200 hover:scale-105"
                                />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? t('close-menu') : t('open-menu')}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden focus:outline-2 focus:outline-brand-green focus:outline-offset-2 rounded-md"
                            >
                                <Menu
                                    className={`m-auto size-6 duration-200 ${
                                        menuState ? 'rotate-180 scale-0 opacity-0' : ''
                                    }`}
                                />
                                <X
                                    className={`absolute inset-0 m-auto size-6 duration-200 ${
                                        menuState ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-0 opacity-0'
                                    }`}
                                />
                            </button>

                            {/* Desktop Navigation */}
                            <div className="hidden lg:block">
                                <ul className="flex gap-8 text-sm">
                                    {header.nav?.map((item, index) => {
                                        if (!item || !item.href || !item.label) return null;

                                        return (
                                            <li key={index} className="relative group">
                                                {item.submenu && item.submenu.length > 0 ? (
                                                    <div className="relative">
                                                        <button
                                                            className="text-muted-foreground hover:text-brand-green flex items-center gap-1 duration-200 font-subtitle font-medium focus:outline-2 focus:outline-brand-green focus:outline-offset-2 rounded-sm px-2 py-1"
                                                            onMouseEnter={() => setActiveDropdown(item.label!)}
                                                            onMouseLeave={() => setActiveDropdown(null)}
                                                        >
                                                            <span>{t(`items.${item.label}`)}</span>
                                                            <ChevronDown className="size-3 transition-transform group-hover:rotate-180" />
                                                        </button>

                                                        <AnimatePresence>
                                                            {activeDropdown === item.label && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="absolute top-full left-0 mt-2 w-64 bg-background border border-brand-tan/20 rounded-lg shadow-lg overflow-hidden z-50 backdrop-blur-sm"
                                                                    onMouseEnter={() => setActiveDropdown(item.label!)}
                                                                    onMouseLeave={() => setActiveDropdown(null)}
                                                                >
                                                                    {item.submenu.map((subItem, subIndex) => {
                                                                        if (!subItem || !subItem.href || !subItem.label) return null;

                                                                        return (
                                                                            <Link
                                                                                key={subIndex}
                                                                                href={subItem.href as any}
                                                                                className="block px-4 py-3 text-sm text-muted-foreground hover:text-brand-green hover:bg-brand-pale-yellow/30 transition-all duration-200 font-body focus:outline-2 focus:outline-brand-green"
                                                                                onClick={closeAllMenus}
                                                                            >
                                                                                {t(`items.${subItem.label}`)}
                                                                            </Link>
                                                                        );
                                                                    })}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={item.href as any}
                                                        className="text-muted-foreground hover:text-brand-green block duration-200 font-subtitle font-medium focus:outline-2 focus:outline-brand-green focus:outline-offset-2 rounded-sm px-2 py-1"
                                                        onClick={closeAllMenus}
                                                    >
                                                        <span>{t(`items.${item.label}`)}</span>
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>

                        {/* Mobile Navigation */}
                        <AnimatePresence>
                            {menuState && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="bg-background/95 backdrop-blur-md mb-6 w-full flex-wrap items-center justify-end space-y-8 rounded-xl border border-brand-tan/20 p-6 shadow-lg lg:hidden"
                                >
                                    <div className="w-full">
                                        <ul className="space-y-6 text-base">
                                            {header.nav?.map((item, index) => {
                                                if (!item || !item.href || !item.label) return null;

                                                return (
                                                    <li key={index}>
                                                        {item.submenu && item.submenu.length > 0 ? (
                                                            <div>
                                                                <button
                                                                    onClick={() => toggleDropdown(item.label!)}
                                                                    className="text-muted-foreground hover:text-brand-green flex w-full items-center justify-between duration-200 font-subtitle font-medium focus:outline-2 focus:outline-brand-green focus:outline-offset-2 rounded-sm p-2"
                                                                >
                                                                    <span>{t(`items.${item.label}`)}</span>
                                                                    {activeDropdown === item.label ? (
                                                                        <ChevronUp className="size-4" />
                                                                    ) : (
                                                                        <ChevronDown className="size-4" />
                                                                    )}
                                                                </button>

                                                                <AnimatePresence>
                                                                    {activeDropdown === item.label && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.2 }}
                                                                            className="mt-3 ml-4 space-y-3 overflow-hidden border-l border-brand-tan/30 pl-4"
                                                                        >
                                                                            {item.submenu.map((subItem, subIndex) => {
                                                                                if (!subItem || !subItem.href || !subItem.label) return null;

                                                                                return (
                                                                                    <Link
                                                                                        key={subIndex}
                                                                                        href={subItem.href as any}
                                                                                        className="text-muted-foreground hover:text-brand-green block text-sm duration-200 font-body focus:outline-2 focus:outline-brand-green focus:outline-offset-2 rounded-sm p-1"
                                                                                        onClick={closeAllMenus}
                                                                                    >
                                                                                        {t(`items.${subItem.label}`)}
                                                                                    </Link>
                                                                                );
                                                                            })}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        ) : (
                                                            <Link
                                                                href={item.href as any}
                                                                className="text-muted-foreground hover:text-brand-green block duration-200 font-subtitle font-medium focus:outline-2 focus:outline-brand-green focus:outline-offset-2 rounded-sm p-2"
                                                                onClick={closeAllMenus}
                                                            >
                                                                <span>{t(`items.${item.label}`)}</span>
                                                            </Link>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </nav>
        </header>
    );
};
EOF

# 7. Update footer with brand logo
echo "🔗 Updating footer component..."
cp components/layout/nav/footer.tsx components/layout/nav/footer.tsx.backup
sed -i.bak 's/import { Icon } from "..\/..\/icon";/import { Icon } from "..\/..\/icon";\nimport { FooterLogo } from "..\/..\/brand\/logo";/' components/layout/nav/footer.tsx

sed -i.bak 's/<Link href="\/" aria-label={tNav.*}.*>/<Link href="\/" aria-label={tNav("home")} className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-150">/' components/layout/nav/footer.tsx

sed -i.bak 's/<Icon.*\/>/\<FooterLogo globalSettings={globalSettings} \/\>/' components/layout/nav/footer.tsx

# 8. Update styles with brand colors and fonts
echo "🎨 Updating styles with brand colors and fonts..."
cp styles.css styles.css.backup
cat > styles.css << 'EOF'
@import 'tailwindcss';
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));
@plugin "@tailwindcss/typography";

@theme inline {
  /* Font Families */
  --font-enriqueta: 'Enriqueta', serif;
  --font-public-sans: 'Public Sans', sans-serif;
  --font-roboto-flex: 'Roboto Flex', sans-serif;

  /* Brand Color Palette */
  --color-brand-tan: #e0a767;
  --color-brand-light-yellow: #efd67e;
  --color-brand-green: #488744;
  --color-brand-orange: #e09967;
  --color-brand-lime: #8ce05c;
  --color-brand-blue: #6799e0;
  --color-brand-light-green: #a3e067;
  --color-brand-pale-yellow: #ffeeb0;
  --color-brand-primary-blue: #1b70ff;

  /* System Colors */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

:root {
  --radius: 0.625rem;

  /* Light Theme - Using Brand Colors */
  --background: #ffffff;
  --foreground: #000000;
  --card: #ffffff;
  --card-foreground: #000000;
  --popover: #ffffff;
  --popover-foreground: #000000;
  --primary: #488744; /* Brand green */
  --primary-foreground: #ffffff;
  --secondary: #ffeeb0; /* Pale yellow */
  --secondary-foreground: #000000;
  --muted: #ffeeb0;
  --muted-foreground: #488744;
  --accent: #e0a767; /* Brand tan */
  --accent-foreground: #000000;
  --destructive: #dc2626;
  --border: #e0a767;
  --input: #ffeeb0;
  --ring: #488744;
}

.dark {
  /* Dark Theme - Adjusted brand colors for accessibility */
  --background: #0a0a0a;
  --foreground: #ffffff;
  --card: #1a1a1a;
  --card-foreground: #ffffff;
  --popover: #1a1a1a;
  --popover-foreground: #ffffff;
  --primary: #8ce05c; /* Light green for dark mode */
  --primary-foreground: #000000;
  --secondary: #2a2a2a;
  --secondary-foreground: #ffffff;
  --muted: #2a2a2a;
  --muted-foreground: #a3e067;
  --accent: #efd67e; /* Light yellow for dark mode */
  --accent-foreground: #000000;
  --destructive: #ef4444;
  --border: #404040;
  --input: #2a2a2a;
  --ring: #8ce05c;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground font-body leading-relaxed;
  }

  /* Typography Hierarchy - Using Brand Fonts */
  h1, .h1 {
    @apply font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6;
    color: var(--color-brand-green);
  }

  h2, .h2 {
    @apply font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-5;
    color: var(--color-brand-green);
  }

  h3, .h3 {
    @apply font-subtitle text-2xl md:text-3xl font-semibold leading-tight mb-4;
    color: var(--color-brand-tan);
  }

  h4, .h4 {
    @apply font-subtitle text-xl md:text-2xl font-semibold leading-tight mb-4;
    color: var(--color-brand-tan);
  }

  h5, .h5 {
    @apply font-subtitle text-lg md:text-xl font-medium leading-tight mb-3;
    color: var(--foreground);
  }

  h6, .h6 {
    @apply font-subtitle text-base md:text-lg font-medium leading-tight mb-3;
    color: var(--foreground);
  }

  /* Paragraph and body text */
  p {
    @apply font-body text-base md:text-lg leading-relaxed mb-4;
  }

  /* Links */
  a {
    @apply text-brand-primary-blue hover:text-brand-green transition-colors duration-200;
  }

  /* Focus styles for accessibility */
  :focus-visible {
    @apply outline-2 outline-offset-2 outline-brand-green;
  }
}

/* Brand utility classes for Tailwind */
.font-heading {
  font-family: var(--font-enriqueta);
}

.font-subtitle {
  font-family: var(--font-public-sans);
}

.font-body {
  font-family: var(--font-roboto-flex);
}

.text-brand-green {
  color: var(--color-brand-green);
}

.text-brand-tan {
  color: var(--color-brand-tan);
}

.text-brand-primary-blue {
  color: var(--color-brand-primary-blue);
}

.bg-brand-green {
  background-color: var(--color-brand-green);
}

.bg-brand-tan {
  background-color: var(--color-brand-tan);
}

.bg-brand-pale-yellow {
  background-color: var(--color-brand-pale-yellow);
}

.border-brand-tan {
  border-color: var(--color-brand-tan);
}

.border-brand-green {
  border-color: var(--color-brand-green);
}

/* Brand button styles */
.btn-brand-primary {
  background-color: var(--color-brand-green);
  color: #ffffff;
  border-radius: var(--radius);
  padding: 0.75rem 1.5rem;
  font-family: var(--font-public-sans);
  font-weight: 600;
  transition: all 0.2s ease-in-out;
}

.btn-brand-primary:hover {
  background-color: var(--color-brand-lime);
  transform: translateY(-1px);
}

.btn-brand-primary:focus {
  outline: 2px solid var(--color-brand-green);
  outline-offset: 2px;
}

.btn-brand-secondary {
  background-color: var(--color-brand-tan);
  color: #000000;
  border-radius: var(--radius);
  padding: 0.75rem 1.5rem;
  font-family: var(--font-public-sans);
  font-weight: 600;
  transition: all 0.2s ease-in-out;
}

.btn-brand-secondary:hover {
  background-color: var(--color-brand-light-yellow);
  transform: translateY(-1px);
}

.btn-brand-secondary:focus {
  outline: 2px solid var(--color-brand-green);
  outline-offset: 2px;
}

/* Responsive typography */
@media (max-width: 768px) {
  h1, .h1 {
    @apply text-3xl md:text-4xl;
  }

  h2, .h2 {
    @apply text-2xl md:text-3xl;
  }
}
EOF

# 9. Update Tailwind config with brand colors
echo "⚡ Updating Tailwind configuration..."
cp tailwind.config.ts tailwind.config.ts.backup
cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // System colors
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                // Boerengroep Brand Colors
                'brand': {
                    'tan': 'var(--color-brand-tan)',
                    'light-yellow': 'var(--color-brand-light-yellow)',
                    'green': 'var(--color-brand-green)',
                    'orange': 'var(--color-brand-orange)',
                    'lime': 'var(--color-brand-lime)',
                    'blue': 'var(--color-brand-blue)',
                    'light-green': 'var(--color-brand-light-green)',
                    'pale-yellow': 'var(--color-brand-pale-yellow)',
                    'primary-blue': 'var(--color-brand-primary-blue)',
                }
            },
            fontFamily: {
                heading: ['var(--font-enriqueta)', 'serif'],
                subtitle: ['var(--font-public-sans)', 'sans-serif'],
                body: ['var(--font-roboto-flex)', 'sans-serif'],
                sans: ['var(--font-public-sans)', 'sans-serif'],
                serif: ['var(--font-enriqueta)', 'serif'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },
    plugins: [],
};

export default config;
EOF

# 10. Final steps and instructions
echo ""
echo "✅ Brand integration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Replace tina/collection/global.ts with tina/collection/global-updated.ts"
echo "2. Upload your logo to public/uploads/logo/"
echo "3. Run 'pnpm dev' to start development server"
echo "4. Access TinaCMS admin at /admin to configure logo"
echo ""
echo "🎨 TinaCMS Logo Configuration:"
echo "• Go to /admin → Global Settings → Header → Logo"
echo "• Choose 'Custom Image' and upload your logo"
echo "• Or keep 'Icon' for current icon system"
echo ""
echo "🔧 Files modified:"
echo "• components/brand/logo.tsx (NEW)"
echo "• tina/collection/global-updated.ts (NEW)"
echo "• app/[locale]/layout.tsx (fonts added)"
echo "• components/layout/nav/header.tsx (logo integration)"
echo "• components/layout/nav/footer.tsx (logo integration)"
echo "• styles.css (brand colors and typography)"
echo "• tailwind.config.ts (brand color classes)"
echo ""
echo "💾 Backup files created with .backup extension"
echo ""
echo "🚀 Your Boerengroep brand is now integrated!"

# Make script executable
chmod +x "$0"

echo "Script completed successfully! 🎉"
EOF

# Make the script executable
chmod +x brand-integration.sh

echo "Implementation script created! Run with:"
echo "./brand-integration.sh"
