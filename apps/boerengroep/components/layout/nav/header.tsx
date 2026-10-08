"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LogoImage } from "../../logo";
import { useLayout } from "../layout-context";
import { LanguageSwitcher } from "../language-switcher";
import { SiteLink } from "../site-link";

/** True when the page being viewed is this link or sits below it. */
function isCurrent(pathname: string, href: string): boolean {
    const base = href.split('#')[0] || '/';
    if (base === '/') return pathname === '/';
    return pathname === base || pathname.startsWith(`${base}/`);
}

export const Header = () => {
    const { globalSettings } = useLayout();
    const nav = globalSettings?.nav ?? [];
    const t = useTranslations('navigation');
    const pathname = usePathname();
    const [open, setOpen] = useState<number | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [sheetItem, setSheetItem] = useState<number | null>(null);
    const [compact, setCompact] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const burgerRef = useRef<HTMLButtonElement>(null);
    // Read inside the key handler, which is set up once.
    const openRef = useRef<number | null>(null);
    openRef.current = open;
    const sheetRef = useRef(false);
    sheetRef.current = sheetOpen;

    // Slimmer bar once the visitor has scrolled past the top.
    useEffect(() => {
        const onScroll = () => setCompact(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close menus when the page changes, on Escape, and on a click elsewhere.
    useEffect(() => {
        setOpen(null);
        setSheetOpen(false);
    }, [pathname]);
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            // Give the keyboard back to the button that opened the menu, so nobody is left nowhere.
            if (openRef.current !== null) {
                navRef.current?.querySelector<HTMLButtonElement>(`[aria-controls="nav-panel-${openRef.current}"]`)?.focus();
            }
            if (sheetRef.current) burgerRef.current?.focus();
            setOpen(null);
            setSheetOpen(false);
        };
        const onClick = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) setOpen(null);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onClick);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onClick);
        };
    }, []);
    useEffect(() => {
        document.body.style.overflow = sheetOpen ? 'hidden' : '';
        // While the phone menu covers the page, the page behind it is out of reach for
        // the keyboard and for screen readers too.
        const behind = document.querySelectorAll<HTMLElement>('main, .site-footer-wrap, .skip-link');
        for (const element of behind) element.inert = sheetOpen;
        return () => {
            document.body.style.overflow = '';
            for (const element of behind) element.inert = false;
        };
    }, [sheetOpen]);

    return (
        <>
        <header className={`site-header${compact ? ' site-header--compact' : ''}`}>
            <div className="page-width site-header__bar">
                <Link href="/" className="site-header__logo" aria-label={t('home')}>
                    <LogoImage src={globalSettings?.logo} name={globalSettings?.name || 'Home'} />
                </Link>

                <nav className="site-nav" aria-label={t('main-menu')} ref={navRef}>
                    <ul className="site-nav__list">
                        {nav.map((item, index) => {
                            const current = !item.external && isCurrent(pathname, item.href);
                            if (item.children.length > 0) {
                                const expanded = open === index;
                                return (
                                    <li
                                        key={index}
                                        // Tabbing out of an open dropdown closes it.
                                        onBlur={(event) => {
                                            if (expanded && !event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(null);
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className="site-nav__item"
                                            aria-expanded={expanded}
                                            aria-controls={`nav-panel-${index}`}
                                            data-current={current}
                                            onClick={() => setOpen(expanded ? null : index)}
                                        >
                                            {item.label}
                                            <ChevronDown className="site-nav__chevron" aria-hidden="true" />
                                        </button>
                                        {expanded && (
                                            <ul className="site-nav__panel" id={`nav-panel-${index}`} aria-label={t('menu-of', { name: item.label })}>
                                                <li>
                                                    <SiteLink link={item}>{item.label}</SiteLink>
                                                </li>
                                                {item.children.map((child, childIndex) => (
                                                    <li key={childIndex}>
                                                        <SiteLink link={child}>{child.label}</SiteLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            }
                            return (
                                <li key={index}>
                                    <SiteLink
                                        link={item}
                                        className={item.highlight ? 'btn-leaf' : 'site-nav__item'}
                                        aria-current={current ? 'page' : undefined}
                                    >
                                        {item.label}
                                    </SiteLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="site-header__tools">
                    <LanguageSwitcher />
                    <button
                        type="button"
                        className="site-header__burger"
                        ref={burgerRef}
                        aria-label={sheetOpen ? t('close-menu') : t('open-menu')}
                        aria-expanded={sheetOpen}
                        onClick={() => setSheetOpen(!sheetOpen)}
                    >
                        {sheetOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
                    </button>
                </div>
            </div>
        </header>

            {/* Outside the header: its blur effect would otherwise trap this full-screen sheet inside the bar. */}
            {sheetOpen && (
                <div className="site-sheet">
                    <nav aria-label={t('main-menu')}>
                        <ul>
                            {nav.map((item, index) => (
                                <li key={index}>
                                    {item.children.length > 0 ? (
                                        <>
                                            <button
                                                type="button"
                                                className="site-sheet__item"
                                                aria-expanded={sheetItem === index}
                                                onClick={() => setSheetItem(sheetItem === index ? null : index)}
                                            >
                                                {item.label}
                                                <ChevronDown
                                                    className="site-nav__chevron"
                                                    style={{ transform: sheetItem === index ? 'rotate(180deg)' : undefined }}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                            {sheetItem === index && (
                                                <ul className="site-sheet__children">
                                                    <li>
                                                        <SiteLink link={item}>{item.label}</SiteLink>
                                                    </li>
                                                    {item.children.map((child, childIndex) => (
                                                        <li key={childIndex}>
                                                            <SiteLink link={child}>{child.label}</SiteLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </>
                                    ) : (
                                        <SiteLink link={item} className="site-sheet__item">
                                            {item.label}
                                        </SiteLink>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}
        </>
    );
};
