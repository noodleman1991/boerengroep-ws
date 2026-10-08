import type { CalloutBlock } from '@sites/cms/types';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const COLOURS = ['mist', 'leaf', 'harvest', 'sky', 'dark'];

/**
 * One line that links somewhere, such as a call for volunteers. It is a plot of its own: a
 * low strip in the colour the editor chose, as wide as the other coloured parts and with the
 * same air above and below. So it belongs to neither neighbour and stands between them.
 */
export const Callout = ({ data }: { data: CalloutBlock }) => {
    const href = data.url?.trim();
    if (!data.text) return null;
    // A callout always has a colour. "White" would make it disappear on the page.
    const colour = data.background && COLOURS.includes(data.background) ? data.background : 'mist';
    const inner = (
        <>
            <span>{data.text}</span>
            {href && <ArrowRight aria-hidden="true" />}
        </>
    );
    return (
        <div className={`band band--plot band--callout section-${colour}`}>
            {!href ? (
                <p className="callout page-width">{inner}</p>
            ) : /^https?:/i.test(href) ? (
                <a className="callout page-width" href={href} target="_blank" rel="noopener noreferrer">
                    {inner}
                </a>
            ) : (
                <Link className="callout page-width" href={href.startsWith('/') ? href : `/${href}`}>
                    {inner}
                </Link>
            )}
        </div>
    );
};
