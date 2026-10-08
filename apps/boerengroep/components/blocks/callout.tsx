import type { CalloutBlock } from '@sites/cms/types';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Section } from '../layout/section';

/**
 * One line that links somewhere. It is a pill in the colour the editor chose, sitting on
 * the page itself rather than on a stripe of its own, so it does not cut the page in two.
 */
export const Callout = ({ data }: { data: CalloutBlock }) => {
    const href = data.url?.trim();
    if (!data.text) return null;
    const look = `callout callout--${data.background ?? 'white'}`;
    const inner = (
        <>
            <span>{data.text}</span>
            {href && <ArrowRight aria-hidden="true" />}
        </>
    );
    return (
        <Section className="callout-band">
            {!href ? (
                <p className={look}>{inner}</p>
            ) : /^https?:/i.test(href) ? (
                <a className={look} href={href} target="_blank" rel="noopener noreferrer">
                    {inner}
                </a>
            ) : (
                <Link className={look} href={href.startsWith('/') ? href : `/${href}`}>
                    {inner}
                </Link>
            )}
        </Section>
    );
};
