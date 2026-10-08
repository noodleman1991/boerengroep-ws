import { getTranslations } from 'next-intl/server';
import Layout from '@/components/layout/layout';
import { BrandSymbol } from '@/components/brand-symbol';
import { Link } from '@/i18n/navigation';

/** Shown for an address that leads nowhere. It keeps the menu, so nobody is stuck. */
export default async function NotFound() {
    const t = await getTranslations('notFound');
    return (
        <Layout>
            <div className="page-width">
                <div className="notice">
                    <BrandSymbol className="notice__mark" />
                    <h1>{t('title')}</h1>
                    <p className="notice__text">{t('text')}</p>
                    <div className="notice__actions">
                        <Link href="/" className="btn-leaf">
                            {t('home')}
                        </Link>
                        <Link href="/activities/calendar" className="btn-quiet">
                            {t('calendar')}
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
