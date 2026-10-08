import { Link } from '@/i18n/navigation';
import { BlockIcon } from './block-icon';

type Action = {
    label?: string | null;
    type?: 'button' | 'link' | null;
    link?: string | null;
    icon?: { name?: string | null } | null;
    id?: string | null;
};

/** "Read more..." reads better on a button as "Read more". */
const withoutDots = (label: string) => label.trim().replace(/\s*(\.{2,}|…)$/, '');

/**
 * The buttons of a block. The first button is filled, everything after it is an outlined
 * pill, also what the editor marked as a plain link: an underlined word under a headline
 * is easy to miss. An address that starts with / stays on the site in the reader's language.
 */
export function Actions({ actions, tone = 'leaf', className = '' }: {
    actions?: Action[] | null;
    /** `ink` for bands whose background is already green or orange. */
    tone?: 'leaf' | 'ink';
    className?: string;
}) {
    const list = (actions ?? []).filter((action) => action.label?.trim() && action.link?.trim());
    if (list.length === 0) return null;
    let leadGiven = false;
    return (
        <div className={`actions ${className}`}>
            {list.map((action, index) => {
                const href = action.link!.trim();
                const isButton = action.type !== 'link';
                const look = isButton && !leadGiven ? `btn-${tone}` : 'btn-quiet';
                if (isButton) leadGiven = true;
                const inner = (
                    <>
                        {withoutDots(action.label!)}
                        <BlockIcon name={action.icon?.name} />
                    </>
                );
                return /^(https?:|mailto:|tel:)/i.test(href) ? (
                    <a key={action.id ?? index} className={look} href={href} {...(/^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        {inner}
                    </a>
                ) : (
                    <Link key={action.id ?? index} className={look} href={href.startsWith('/') || href.startsWith('#') ? href : `/${href}`}>
                        {inner}
                    </Link>
                );
            })}
        </div>
    );
}
