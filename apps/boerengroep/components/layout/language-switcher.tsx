"use client";

import React from "react";
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const LANGUAGES = [
    { code: 'en', short: 'EN', label: 'English', switchTo: 'Switch to English' },
    { code: 'nl', short: 'NL', label: 'Nederlands', switchTo: 'Schakel naar Nederlands' },
] as const;

/** Two small buttons. The page stays the same, the site finds its address in the other language. */
export const LanguageSwitcher = () => {
    const locale = useLocale();
    const pathname = usePathname();
    const t = useTranslations('language-switcher');

    return (
        <div className="lang-switch" role="group" aria-label={t('label')}>
            {LANGUAGES.map((language) =>
                language.code === locale ? (
                    <span key={language.code} aria-current="true" lang={language.code}>
                        <span aria-hidden="true">{language.short}</span>
                        <span className="sr-only">{language.label}</span>
                    </span>
                ) : (
                    <Link
                        key={language.code}
                        href={pathname as never}
                        locale={language.code}
                        lang={language.code}
                        // Written in the language it leads to, which `lang` tells a screen reader.
                        aria-label={language.switchTo}
                    >
                        {language.short}
                    </Link>
                ),
            )}
        </div>
    );
};
