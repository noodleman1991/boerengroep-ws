"use client";
import React from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { Icon } from "../../icon";
import { useLayout } from "../layout-context";

// Import the actual TinaCMS generated types
import type { GlobalFooterQuickLinks, GlobalFooterQuickLinksLinks } from "@/tina/__generated__/types";

export const Footer = () => {
    const { globalSettings } = useLayout();
    const { header, footer } = globalSettings!;
    const t = useTranslations('footer');
    const tNav = useTranslations('navigation');

    // Helper function to safely get translation key
    const getTranslationKey = (label: string | null | undefined): string => {
        if (!label) return '';
        return label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    // Helper function to safely get translation with fallback
    const getTranslation = (key: string, fallback: string | null | undefined): string => {
        if (!fallback) return '';
        try {
            return t(key, { defaultValue: fallback });
        } catch {
            return fallback;
        }
    };

    return (
        <footer className="border-t bg-white pt-20 dark:bg-transparent">
            <div className="mx-auto max-w-6xl px-6">

                {/* Quick Links Section */}
                {footer?.quickLinks && footer.quickLinks.length > 0 && (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
                        {footer.quickLinks.map((section, index) => {
                            // Null check for section
                            if (!section || !section.title) return null;

                            const sectionKey = getTranslationKey(section.title);
                            const sectionTitle = getTranslation(`quick-links.${sectionKey}.title`, section.title);

                            return (
                                <div key={index} className="space-y-4">
                                    <h3 className="font-semibold text-foreground text-lg">
                                        {sectionTitle}
                                    </h3>
                                    <ul className="space-y-3">
                                        {section.links?.map((link, linkIndex) => {
                                            // Null check for link
                                            if (!link || !link.href || !link.label) return null;

                                            const linkKey = getTranslationKey(link.label);
                                            const linkLabel = getTranslation(`quick-links.${sectionKey}.links.${linkKey}`, link.label);

                                            return (
                                                <li key={linkIndex}>
                                                    <Link
                                                        href={link.href}
                                                        className="text-muted-foreground hover:text-accent-foreground transition-colors duration-150 text-sm"
                                                    >
                                                        {linkLabel}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Newsletter Signup Section */}
                <div className="border-t border-border pt-8 mb-8">
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-foreground text-lg">
                                {t('newsletter.title')}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                {t('newsletter.description')}
                            </p>
                            <div className="flex gap-2 max-w-sm">
                                <input
                                    type="email"
                                    placeholder={t('newsletter.placeholder')}
                                    className="flex-1 px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-150">
                                    {t('newsletter.subscribe')}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-foreground text-lg">
                                {t('contact.title')}
                            </h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>{t('contact.organization')}</p>
                                <p>{t('contact.address.street')}</p>
                                <p>{t('contact.address.city')}</p>
                                <p>{t('contact.address.country')}</p>
                                <p className="pt-2">
                                    <Link href={`mailto:${t('contact.email')}`} className="hover:text-accent-foreground transition-colors duration-150">
                                        {t('contact.email')}
                                    </Link>
                                </p>
                                <p>
                                    <Link href={`tel:${t('contact.phone.raw')}`} className="hover:text-accent-foreground transition-colors duration-150">
                                        {t('contact.phone.display')}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="flex flex-wrap items-center gap-6 border-t border-border py-6 flex-col md:flex-row md:justify-between">

                    <div className="order-last flex justify-center md:order-first md:justify-start">
                        <Link href="/" aria-label={tNav('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-150">
                            <Icon
                                parentColor={header?.color || 'default'}
                                data={header?.icon || { name: 'BiLeaf', color: 'green', style: 'float' }}
                            />
                            <span className="self-center text-muted-foreground text-sm">
                {t('copyright', {
                    year: new Date().getFullYear().toString(),
                    organization: header?.name || 'Stichting Boerengroep'
                })}
              </span>
                        </Link>
                    </div>

                    {/* Social Media Links */}
                    <div className="order-first flex justify-center gap-6 text-sm md:order-last md:justify-end">
                        {footer?.social?.map((link, index) => {
                            // Null check for link
                            if (!link || !link.url || !link.icon?.name) return null;

                            const socialName = link.icon.name.replace('Fa', '').toLowerCase();
                            const ariaLabel = getTranslation(`social.${socialName}`, `Follow us on ${socialName}`);

                            return (
                                <Link
                                    key={`${link.icon.name}${index}`}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group"
                                    aria-label={ariaLabel}
                                >
                                    <Icon
                                        data={{ ...link.icon, size: 'small' }}
                                        className="text-muted-foreground hover:text-primary group-hover:scale-110 transition-all duration-150"
                                    />
                                </Link>
                            );
                        })}
                    </div>

                </div>

                {/* Legal Links */}
                <div className="border-t border-border py-4">
                    <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground md:justify-start">
                        <Link href="/privacy" className="hover:text-accent-foreground transition-colors duration-150">
                            {t('legal.privacy')}
                        </Link>
                        <Link href="/cookies" className="hover:text-accent-foreground transition-colors duration-150">
                            {t('legal.cookies')}
                        </Link>
                        <Link href="/algemene-voorwaarden" className="hover:text-accent-foreground transition-colors duration-150">
                            {t('legal.terms')}
                        </Link>
                        <Link href="/toegankelijkheid" className="hover:text-accent-foreground transition-colors duration-150">
                            {t('legal.accessibility')}
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};
