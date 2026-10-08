import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SectionProps extends Omit<React.HTMLProps<HTMLElement>, 'background'> {
    /** One of the presets an editor can choose: white, mist, leaf, harvest, sky or dark. */
    background?: string | null;
    children: ReactNode;
}

const PRESETS = ['white', 'mist', 'leaf', 'harvest', 'sky', 'dark'];

/**
 * One part of a page. Every block and every built-in page uses it, so all of them share the
 * same width, the same spacing and the same look. A part with a colour is a "plot": a rounded
 * panel set in from the edges of the window. A white part is the open ground between plots.
 */
export const Section: React.FC<SectionProps> = ({ className, children, background, ...props }) => {
    const preset = background && PRESETS.includes(background) ? background : 'white';
    return (
        <div className={`band section-${preset}${preset === 'white' ? '' : ' band--plot'}`}>
            <section
                // The same width and side margins as the header and footer, so everything lines up.
                className={cn('page-width band__inner', className)}
                {...props}
            >
                {children}
            </section>
        </div>
    );
};
