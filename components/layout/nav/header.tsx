"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { Icon } from "../../icon";
import { useLayout } from "../layout-context";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Header = () => {
    const { globalSettings, theme } = useLayout();
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
                className="bg-background/50 fixed z-20 w-full border-b backdrop-blur-3xl">
                <div className="mx-auto max-w-6xl px-6 transition-all duration-300">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full items-center justify-between gap-12">
                            <Link
                                href="/"
                                onClick={closeAllMenus}
                                aria-label={t('home')}
                                className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                                <Icon
                                    parentColor={header.color || 'default'}
                                    data={{
                                        name: header.icon?.name || 'BiLeaf',
                                        color: header.icon?.color || 'green',
                                        style: header.icon?.style || 'float',
                                    }}
                                />
                                <span className="font-semibold text-foreground">
                  {header.name || 'Stichting Boerengroep'}
                </span>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? t('close-menu') : t('open-menu')}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
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
                                                            className="text-muted-foreground hover:text-accent-foreground flex items-center gap-1 duration-150"
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
                                                                    className="absolute top-full left-0 mt-1 w-56 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50"
                                                                    onMouseEnter={() => setActiveDropdown(item.label!)}
                                                                    onMouseLeave={() => setActiveDropdown(null)}
                                                                >
                                                                    {item.submenu.map((subItem, subIndex) => {
                                                                        if (!subItem || !subItem.href || !subItem.label) return null;

                                                                        return (
                                                                            <Link
                                                                                key={subIndex}
                                                                                href={subItem.href}
                                                                                className="block px-4 py-3 text-sm text-muted-foreground hover:text-accent-foreground hover:bg-accent/50 transition-colors duration-150"
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
                                                        href={item.href}
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
                                    className="bg-background mb-6 w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:hidden dark:shadow-none"
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
                                                                                        href={subItem.href}
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
                                                                href={item.href}
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
