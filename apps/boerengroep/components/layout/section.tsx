import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SectionProps extends React.HTMLProps<HTMLElement> {
    background?: string;
    children: ReactNode;
}

export const Section: React.FC<SectionProps> = ({ className, children, background, ...props }) => {
    return (
        <div className={background || "bg-white"}>
            <section
                className={cn(
                    "py-[var(--spacing-section)] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
                    className
                )}
                {...props}
            >
                {children}
            </section>
        </div>
    );
};
