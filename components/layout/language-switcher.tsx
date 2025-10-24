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
    const displayText = locale === 'en' ? 'in het Nederlands' : 'in English';

    return (
        <Link
            href={pathname}
            locale={targetLocale}
            className="text-black hover:text-gray-600 text-sm font-medium transition-colors duration-200"
            aria-label={`Switch to ${targetLocale === 'nl' ? 'Dutch' : 'English'}`}
        >
            <span>{displayText}</span>
        </Link>
    );
};
