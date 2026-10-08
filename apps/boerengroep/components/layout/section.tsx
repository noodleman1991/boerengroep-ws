import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SectionProps extends Omit<React.HTMLProps<HTMLElement>, 'background'> {
    /** One of the presets an editor can choose: white, mist, leaf, harvest, sky or dark. */
    background?: string | null;
    children: ReactNode;
}

const PRESETS = ['white', 'mist', 'leaf', 'harvest', 'sky', 'dark'];

export const Section: React.FC<SectionProps> = ({ className, children, background, ...props }) => {
    const preset = background && PRESETS.includes(background) ? background : 'white';
    return (
        <div className={`section-${preset}`}>
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
