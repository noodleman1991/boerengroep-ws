"use client";

import React from "react";
import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
// import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
    const locale = useLocale();
    const pathname = usePathname();

    // Determine the target locale and display text
    const targetLocale = locale === 'en' ? 'nl' : 'en';
    const displayText = locale === 'en' ? 'in Nederlands' : 'in English';

    return (
        <Link
            href={pathname}
            locale={targetLocale}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-accent-foreground transition-colors duration-150 rounded-md hover:bg-gray-50"
            aria-label={`Switch to ${targetLocale === 'nl' ? 'Dutch' : 'English'}`}
        >
            {/*<Globe className="size-4" />*/}
            <span className="font-medium">{displayText}</span>
        </Link>
    );
};
