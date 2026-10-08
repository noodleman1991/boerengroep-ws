"use client";

import React from "react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LogoImage } from "../../logo";
import { useLayout } from "../layout-context";
import { SiteLink } from "../site-link";
import { NewsletterSignup } from "../../newsletter-signup";

const SOCIAL_NAMES: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    mastodon: 'Mastodon',
    bluesky: 'Bluesky',
    x: 'X',
    chat: 'Chat group',
};

export const Footer = () => {
    const { globalSettings } = useLayout();
    const t = useTranslations('footer');
    const tNav = useTranslations('navigation');
    if (!globalSettings) return null;
    const { name, tagline, logo, contact, social, footer } = globalSettings;
    const hasContact = contact.addressLines.length > 0 || contact.email || contact.phone;

    return (
        <div className="site-footer-wrap">
            <div className="site-footer__sun" aria-hidden="true" />
            <footer className="site-footer">
                <div className="page-width">
                    <div className="site-footer__grid">
                        <div className="site-footer__brand">
                            <Link href="/" aria-label={tNav('home')}>
                                <LogoImage src={logo} name={name || 'Home'} />
                            </Link>
                            {tagline && <p className="site-footer__tagline">{tagline}</p>}
                            {hasContact && (
                                <address className="site-footer__contact">
                                    {contact.addressLines.map((line, index) => (
                                        <span key={index}>{line}</span>
                                    ))}
                                    {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
                                    {contact.phone && (
                                        <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}>{contact.phone}</a>
                                    )}
                                </address>
                            )}
                            {social.length > 0 && (
                                <ul className="site-footer__social">
                                    {social.map((account, index) => (
                                        <li key={index}>
                                            <a href={account.url} rel="noopener noreferrer">
                                                {SOCIAL_NAMES[account.platform] ?? new URL(account.url).hostname.replace(/^www\./, '')}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="site-footer__columns">
                            {footer.columns.map((column, index) => (
                                <div key={index}>
                                    {column.title && <h2 className="site-footer__heading">{column.title}</h2>}
                                    <ul className="site-footer__links">
                                        {column.links.map((link, linkIndex) => (
                                            <li key={linkIndex}>
                                                <SiteLink link={link}>{link.label}</SiteLink>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {footer.showNewsletter && (
                            <div className="site-footer__news">
                                <NewsletterSignup source="footer" />
                            </div>
                        )}
                    </div>

                    <div className="site-footer__base">
                        <p>
                            {t('copyright', { year: new Date().getFullYear(), organization: name })}
                        </p>
                        {footer.legalLinks.length > 0 && (
                            <ul className="site-footer__legal">
                                {footer.legalLinks.map((link, index) => (
                                    <li key={index}>
                                        <SiteLink link={link}>{link.label}</SiteLink>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};
