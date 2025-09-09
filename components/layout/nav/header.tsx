"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HeaderLogo } from "../../logo";
import { useLayout } from "../layout-context";
import { LanguageSwitcher } from "../language-switcher";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <HeaderLogo globalData={globalSettings} />
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {header.nav?.map((item, index) => {
                                if (!item || !item.href || !item.label) return null;
                                const isActive = activeMenu === item.label;

                                return (
                                    <div key={index} className="relative group">
                                        {item.submenu && item.submenu.length > 0 ? (
                                            <>
                                                <button
                                                    className={`text-black hover:text-gray-600 text-sm font-medium transition-colors duration-200 ${
                                                        isActive ? 'text-gray-600' : ''
                                                    }`}
                                                    onClick={() => handleMenuClick(item.label!)}
                                                    onMouseEnter={() => activeMenu && setActiveMenu(item.label!)}
                                                >
                                                    {t(`items.${item.label}`)}
                                                </button>
                                                {/* Individual submenu positioned relative to its parent */}
                                                <AnimatePresence>
                                                    {activeMenu === item.label && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-3 px-2 min-w-max z-50"
                                                        >
                                                            <div className="flex flex-col space-y-1">
                                                                {item.submenu.map((subItem, subIndex) => {
                                                                    if (!subItem || !subItem.href || !subItem.label) return null;
                                                                    return (
                                                                        <Link
                                                                            key={subIndex}
                                                                            href={subItem.href as any}
                                                                            className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-md whitespace-nowrap transition-colors duration-200"
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
                                                className="text-black hover:text-gray-600 text-sm font-medium transition-colors duration-200"
                                            >
                                                {t(`items.${item.label}`)}
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:block">
                                <LanguageSwitcher />
                            </div>
                            <button
                                onClick={toggleMobileMenu}
                                className="md:hidden p-2 rounded-md text-black hover:text-gray-600 transition-colors"
                                aria-label={mobileMenuOpen ? t('close-menu') : t('open-menu')}
                            >
                                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-white border-b border-neutral"
                    >
                        <div className="px-4 py-4 space-y-4">
                            {header.nav?.map((item, index) => {
                                if (!item || !item.href || !item.label) return null;

                                return (
                                    <div key={index}>
                                        {item.submenu && item.submenu.length > 0 ? (
                                            <div>
                                                <button
                                                    className="text-black text-base font-medium w-full text-left py-2"
                                                    onClick={() => handleMenuClick(item.label!)}
                                                >
                                                    {t(`items.${item.label}`)}
                                                </button>
                                                <AnimatePresence>
                                                    {activeMenu === item.label && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="pl-4 space-y-2 overflow-hidden"
                                                        >
                                                            {item.submenu.map((subItem, subIndex) => {
                                                                if (!subItem || !subItem.href || !subItem.label) return null;

                                                                return (
                                                                    <Link
                                                                        key={subIndex}
                                                                        href={subItem.href as any}
                                                                        className="block text-gray-600 text-sm py-1"
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
                                                className="block text-black text-base font-medium py-2"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {t(`items.${item.label}`)}
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                            <div className="pt-4 border-t border-neutral">
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
