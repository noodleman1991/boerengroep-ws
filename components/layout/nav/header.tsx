"use client";

import React, { useState } from "react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HeaderLogo } from "../../logo";
import { useLayout } from "../layout-context";
import { LanguageSwitcher } from "../language-switcher";
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
                className="bg-background/80 fixed z-20 w-full border-b border-border/50 backdrop-blur-xl">
                <div className="mx-auto max-w-6xl px-6 transition-all duration-300">
                    <div className="grid grid-cols-3 items-center py-3 lg:py-4">
                        {/* Logo */}
                        <div className="flex justify-start">
                            <HeaderLogo globalData={globalSettings} />
                        </div>

                        {/* Desktop Navigation - Centered */}
                        <div className="hidden lg:flex justify-center">
                            <ul className="flex gap-8 text-sm font-heading">
                                {header.nav?.map((item, index) => {
                                    if (!item || !item.href || !item.label) return null;

                                    return (
                                        <li key={index} className="relative group">
                                            {item.submenu && item.submenu.length > 0 ? (
                                                <div className="relative">
                                                    <button
                                                        className="text-muted-foreground hover:text-accent-foreground flex items-center gap-1 duration-150 hover:drop-shadow-sm"
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
                                                                className="absolute top-full left-0 mt-1 w-56 bg-white border border-border/50 rounded-lg shadow-lg shadow-black/10 overflow-hidden z-50"
                                                                onMouseEnter={() => setActiveDropdown(item.label!)}
                                                                onMouseLeave={() => setActiveDropdown(null)}
                                                            >
                                                                {item.submenu.map((subItem, subIndex) => {
                                                                    if (!subItem || !subItem.href || !subItem.label) return null;

                                                                    return (
                                                                        <Link
                                                                            key={subIndex}
                                                                            href={subItem.href as any}
                                                                            className="block px-4 py-3 text-sm text-muted-foreground hover:text-accent-foreground hover:bg-gray-50 transition-colors duration-150"
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
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150 hover:drop-shadow-sm"
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

                        {/* Right side - Language Switcher + Mobile Menu Button */}
                        <div className="flex items-center justify-end gap-4">
                            {/* Desktop Language Switcher */}
                            <div className="hidden lg:block">
                                <LanguageSwitcher />
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? t('close-menu') : t('open-menu')}
                                className="relative z-20 -m-2.5 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
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
                                className="bg-white/95 backdrop-blur-xl mb-6 w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-border/50 p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:hidden"
                            >
                                <div className="w-full">
                                    <ul className="space-y-6 text-base font-heading">
                                        {header.nav?.map((item, index) => {
                                            if (!item || !item.href || !item.label) return null;

                                            return (
                                                <li key={index}>
                                                    {item.submenu && item.submenu.length > 0 ? (
                                                        <div>
                                                            <button
                                                                onClick={() => toggleDropdown(item.label!)}
                                                                className="text-muted-foreground hover:text-accent-foreground flex w-full items-center justify-between duration-150"
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
                                                                        className="mt-3 ml-4 space-y-3 overflow-hidden border-l border-border pl-4"
                                                                    >
                                                                        {item.submenu.map((subItem, subIndex) => {
                                                                            if (!subItem || !subItem.href || !subItem.label) return null;

                                                                            return (
                                                                                <Link
                                                                                    key={subIndex}
                                                                                    href={subItem.href as any}
                                                                                    className="text-muted-foreground hover:text-accent-foreground block text-sm duration-150"
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
                                                            className="text-muted-foreground hover:text-accent-foreground block duration-150"
                                                            onClick={closeAllMenus}
                                                        >
                                                            <span>{t(`items.${item.label}`)}</span>
                                                        </Link>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {/* Mobile Language Switcher */}
                                    <div className="mt-8 pt-6 border-t border-border">
                                        <LanguageSwitcher />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>
        </header>
    );
};
