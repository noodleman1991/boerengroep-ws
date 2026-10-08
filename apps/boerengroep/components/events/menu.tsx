'use client';
import type { ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/** A button that opens a short list of choices. Keyboard and screen reader behaviour come from the popover. */
export function Menu({ label, icon, variant = 'quiet', open, onOpenChange, children }: {
    label: string;
    icon?: ReactNode;
    variant?: 'quiet' | 'leaf' | 'ink';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
}) {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger className={`btn-${variant}`}>
                {icon}
                {label}
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} collisionPadding={16} className="site-menu">
                {children}
            </PopoverContent>
        </Popover>
    );
}
