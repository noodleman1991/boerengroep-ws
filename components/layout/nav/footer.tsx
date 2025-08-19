"use client";

import React from "react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Icon } from "../../icon";
import { useLayout } from "../layout-context";

export const Footer = () => {
    const { globalSettings } = useLayout();
    const { header, footer } = globalSettings!;
    const t = useTranslations('footer');
    const tNav = useTranslations('navigation');

    return (
        <footer className="border-t bg-white pt-20 dark:bg-transparent">
            <div className="mx-auto max-w-6xl px-6">

                {/* Quick Links Section */}
                {footer?.quickLinks && footer.quickLinks.length > 0 && (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
                        {footer.quickLinks.map((section, index) => {
                            if (!section || !section.title) return null;

                            return (
                                <div key={index} className="space-y-4">
                                    <h3 className="font-semibold text-foreground text-lg">
                                        {t(`quick-links.${section.title}.title`)}
                                    </h3>
                                    <ul className="space-y-3">
                                        {section.links?.map((link, linkIndex) => {
                                            if (!link || !link.href || !link.label) return null;

                                            return (
                                                <li key={linkIndex}>
                                                    <Link
                                                        href={link.href as any} // TypeScript will validate this against our pathnames
                                                        className="text-muted-foreground hover:text-accent-foreground transition-colors duration-150 text-sm"
                                                    >
                                                        {t(`quick-links.${section.title}.links.${link.label}`)}
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
                                    <a href={`mailto:${t('contact.email')}`} className="hover:text-accent-foreground transition-colors duration-150">
                                        {t('contact.email')}
                                    </a>
                                </p>
                                <p>
                                    <a href={`tel:${t('contact.phone.raw')}`} className="hover:text-accent-foreground transition-colors duration-150">
                                        {t('contact.phone.display')}
                                    </a>
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
                            if (!link || !link.url || !link.icon?.name) return null;

                            const socialName = link.icon.name.replace('Fa', '').replace('AiFill', '').toLowerCase();

                            return (
                                <a
                                    key={`${link.icon.name}${index}`}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group"
                                    aria-label={t(`social.${socialName}`)}
                                >
                                    <Icon
                                        data={{ ...link.icon, size: 'small' }}
                                        className="text-muted-foreground hover:text-primary group-hover:scale-110 transition-all duration-150"
                                    />
                                </a>
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
                        <Link href="/terms-conditions" className="hover:text-accent-foreground transition-colors duration-150">
                            {t('legal.terms')}
                        </Link>
                        <Link href="/accessibility" className="hover:text-accent-foreground transition-colors duration-150">
                            {t('legal.accessibility')}
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};
