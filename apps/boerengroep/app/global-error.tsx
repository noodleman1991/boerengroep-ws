'use client';

/**
 * The last resort, for a failure in the frame of the site itself. Nothing of the site can be
 * relied on here, so it carries its own words in both languages and its own few styles.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html lang="en">
            <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', color: '#111111', background: '#ffffff' }}>
                <main style={{ maxWidth: '36rem', margin: '0 auto', padding: '20vh 1.5rem 4rem' }}>
                    <h1 style={{ fontSize: '2rem', lineHeight: 1.15, margin: '0 0 1rem' }}>Something went wrong</h1>
                    <p style={{ fontSize: '1.125rem', lineHeight: 1.5, margin: '0 0 0.5rem' }}>The page could not be shown. Please try again.</p>
                    <p lang="nl" style={{ fontSize: '1.125rem', lineHeight: 1.5, margin: '0 0 2rem' }}>
                        De pagina kon niet worden getoond. Probeer het opnieuw.
                    </p>
                    <button
                        type="button"
                        onClick={reset}
                        style={{ minHeight: 44, padding: '0.6rem 1.4rem', border: 0, borderRadius: 999, background: '#111111', color: '#ffffff', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Try again / Opnieuw proberen
                    </button>
                </main>
            </body>
        </html>
    );
}
