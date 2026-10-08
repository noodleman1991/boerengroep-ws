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
        <div className={`band section-${preset}`}>
            <section
                // The same width and side margins as the header and footer, so everything lines up.
                className={cn("page-width py-[var(--spacing-section)]", className)}
                {...props}
            >
                {children}
            </section>
        </div>
    );
};
