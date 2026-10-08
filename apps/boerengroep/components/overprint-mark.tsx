import { useId } from 'react';

/**
 * The logo's two overlapping circles as a small sign. The overlap is drawn in the
 * colour the two inks give when printed over each other, so it also works on a dark ground.
 */
export function OverprintMark({ className }: { className?: string }) {
    const clip = useId();
    return (
        <svg className={className} viewBox="0 0 62 40" aria-hidden="true" focusable="false">
            <clipPath id={clip}>
                <circle cx="20" cy="20" r="20" />
            </clipPath>
            <circle cx="20" cy="20" r="20" fill="var(--leaf)" />
            <circle cx="42" cy="20" r="20" fill="var(--harvest)" />
            <circle cx="42" cy="20" r="20" fill="#416102" clipPath={`url(#${clip})`} />
        </svg>
    );
}
