import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/i18n/routing';

type Words = { [key: string]: string | Words };

/** The shared wording with this site's own wording laid over it. */
function over(shared: Words, own: Words): Words {
    const out: Words = { ...shared };
    for (const [key, value] of Object.entries(own)) {
        const base = out[key];
        out[key] = typeof value === 'object' && typeof base === 'object' ? over(base, value) : value;
    }
    return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
    const shared = (await import(`../../boerengroep/messages/${locale}.json`)).default as Words;
    const own = (await import(`../messages/${locale}.json`)).default as Words;
    return { locale, messages: over(shared, own) };
});
