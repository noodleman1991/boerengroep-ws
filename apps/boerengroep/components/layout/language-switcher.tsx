"use client";

import React from "react";
import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const LANGUAGES = [
    { code: 'en', short: 'EN', label: 'English' },
    { code: 'nl', short: 'NL', label: 'Nederlands' },
] as const;

/** Two small buttons. The page stays the same, the site finds its address in the other language. */
export const LanguageSwitcher = () => {
    const locale = useLocale();
    const pathname = usePathname();

    return (
        <div className="lang-switch" role="group" aria-label="Language">
            {LANGUAGES.map((language) =>
                language.code === locale ? (
                    <span key={language.code} aria-current="true" lang={language.code}>
                        {language.short}
                    </span>
                ) : (
                    <Link
                        key={language.code}
                        href={pathname as never}
                        locale={language.code}
                        lang={language.code}
                        aria-label={`Switch to ${language.code === 'nl' ? 'Dutch' : 'English'}`}
                    >
                        {language.short}
                    </Link>
                ),
            )}
        </div>
    );
};
