import type { CalloutBlock } from '@sites/cms/types';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Section } from '../layout/section';

/** One line that links somewhere, as a slim band. */
export const Callout = ({ data }: { data: CalloutBlock }) => {
    const href = data.url?.trim();
    if (!data.text) return null;
    const inner = (
        <>
            <span>{data.text}</span>
            {href && <ArrowRight aria-hidden="true" />}
        </>
    );
    return (
        <Section background={data.background} className="callout-band">
            {!href ? (
                <p className="callout">{inner}</p>
            ) : /^https?:/i.test(href) ? (
                <a className="callout" href={href} target="_blank" rel="noopener noreferrer">
                    {inner}
                </a>
            ) : (
                <Link className="callout" href={href.startsWith('/') ? href : `/${href}`}>
                    {inner}
                </Link>
            )}
        </Section>
    );
};
