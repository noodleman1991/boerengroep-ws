"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HeaderLogo } from "../../logo";
import { useLayout } from "../layout-context";
import { LanguageSwitcher } from "../language-switcher";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Header = () => {
    const { globalSettings } = useLayout();
    const header = globalSettings!.header!;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const t = useTranslations('navigation');

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const handleMenuClick = (menuLabel: string) => {
        setActiveMenu(activeMenu === menuLabel ? null : menuLabel);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* Main header */}
            <nav className="bg-white/95 backdrop-blur-sm border-b border-neutral">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <HeaderLogo globalData={globalSettings} />
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {header.nav?.map((item, index) => {
                                if (!item || !item.href || !item.label) return null;
                                const isActive = activeMenu === item.label;

                                return (
                                    <div key={index} className="relative">
                                        {item.submenu && item.submenu.length > 0 ? (
                                            <>
                                                <button
                                                    className={`
                                                        px-3 py-2 text-sm font-medium rounded-[var(--radius-md)]
                                                        text-gray-700 hover:text-gray-900 hover:bg-gray-50
                                                        transition-colors duration-150
                                                        ${isActive ? 'text-gray-900 bg-gray-50' : ''}
                                                    `}
                                                    onClick={() => handleMenuClick(item.label!)}
                                                    onMouseEnter={() => activeMenu && setActiveMenu(item.label!)}
                                                >
                                                    {t(`items.${item.label}`)}
                                                </button>
                                                {/* Dropdown submenu */}
                                                <AnimatePresence>
                                                    {activeMenu === item.label && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -8 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute top-full left-0 mt-1 bg-white rounded-[var(--radius-lg)] py-2 px-1.5 min-w-[180px] z-50"
                                                            style={{ boxShadow: 'var(--shadow-dropdown)' }}
                                                        >
                                                            <div className="flex flex-col gap-0.5">
                                                                {item.submenu.map((subItem, subIndex) => {
                                                                    if (!subItem || !subItem.href || !subItem.label) return null;
                                                                    return (
                                                                        <Link
                                                                            key={subIndex}
                                                                            href={subItem.href as any}
                                                                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm font-medium px-3 py-2.5 rounded-[var(--radius-md)] whitespace-nowrap transition-colors duration-150"
                                                                            onClick={() => setActiveMenu(null)}
                                                                        >
                                                                            {t(`items.${subItem.label}`)}
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </>
                                        ) : (
                                            <Link
                                                href={item.href as any}
                                                className="px-3 py-2 text-sm font-medium rounded-[var(--radius-md)] text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                {t(`items.${item.label}`)}
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden lg:block">
                                <LanguageSwitcher />
                            </div>
                            {/* Mobile menu button - 44px touch target */}
                            <button
                                onClick={toggleMobileMenu}
                                className="lg:hidden flex items-center justify-center w-11 h-11 rounded-[var(--radius-md)] text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                aria-label={mobileMenuOpen ? t('close-menu') : t('open-menu')}
                                aria-expanded={mobileMenuOpen}
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="lg:hidden bg-white border-b border-neutral"
                    >
                        <div className="px-4 sm:px-6 py-3 space-y-1">
                            {header.nav?.map((item, index) => {
                                if (!item || !item.href || !item.label) return null;

                                return (
                                    <div key={index}>
                                        {item.submenu && item.submenu.length > 0 ? (
                                            <div>
                                                {/* Mobile menu parent item - 44px minimum height */}
                                                <button
                                                    className="flex items-center w-full min-h-[44px] px-3 py-2.5 text-base font-medium text-gray-900 rounded-[var(--radius-md)] hover:bg-gray-50 transition-colors"
                                                    onClick={() => handleMenuClick(item.label!)}
                                                    aria-expanded={activeMenu === item.label}
                                                >
                                                    {t(`items.${item.label}`)}
                                                </button>
                                                <AnimatePresence>
                                                    {activeMenu === item.label && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5 overflow-hidden"
                                                        >
                                                            {item.submenu.map((subItem, subIndex) => {
                                                                if (!subItem || !subItem.href || !subItem.label) return null;

                                                                return (
                                                                    <Link
                                                                        key={subIndex}
                                                                        href={subItem.href as any}
                                                                        className="flex items-center min-h-[44px] px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-[var(--radius-md)] hover:bg-gray-50 transition-colors"
                                                                        onClick={() => {
                                                                            setMobileMenuOpen(false);
                                                                            setActiveMenu(null);
                                                                        }}
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
                                                className="flex items-center min-h-[44px] px-3 py-2.5 text-base font-medium text-gray-900 rounded-[var(--radius-md)] hover:bg-gray-50 transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {t(`items.${item.label}`)}
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                            <div className="pt-3 mt-2 border-t border-gray-100">
                                <LanguageSwitcher />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside to close */}
            {(activeMenu || mobileMenuOpen) && (
                <div 
                    className="fixed inset-0 z-[-1]"
                    onClick={() => {
                        setActiveMenu(null);
                        setMobileMenuOpen(false);
                    }}
                />
            )}
        </header>
    );
};
