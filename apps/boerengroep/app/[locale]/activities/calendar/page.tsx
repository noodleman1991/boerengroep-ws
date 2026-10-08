import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CalendarSections } from '@/components/events/calendar-sections';
import { CalendarView } from '@/components/events/calendar-view';
import { SubscribeCalendar } from '@/components/events/subscribe-calendar';
import Layout from '@/components/layout/layout';
import { cms, type Locale } from '@/lib/cms';
import { toSiteEvent } from '@/lib/cms-adapters';
import { siteUrl } from '@/lib/site-url';

export const revalidate = 3600;

interface CalendarPageProps {
    params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: CalendarPageProps): Promise<Metadata> {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'calendar' });
    const settings = await cms.getSiteSettings(locale);
    return {
        title: `${t('title')} - ${settings?.general?.name ?? 'Stichting Boerengroep'}`,
        description: settings?.calendar?.intro || t('description'),
    };
}

export default async function CalendarPage({ params }: CalendarPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);
    const [events, settings, t] = await Promise.all([
        cms.listEvents(locale),
        cms.getSiteSettings(locale),
        getTranslations({ locale, namespace: 'calendar' }),
    ]);
    const calendar = settings?.calendar;

    return (
        <Layout>
            <div className="band section-white">
            <div className="page-width calendar-page">
                <header className="calendar-page__head">
                    <div>
                        <h1>{t('title')}</h1>
                        <p>{calendar?.intro || t('description')}</p>
                    </div>
                    {calendar?.showSubscribe !== false && (
                        <SubscribeCalendar feedUrl={`${siteUrl()}/calendar.ics${locale === 'nl' ? '?lang=nl' : ''}`} />
                    )}
                </header>
                <CalendarView
                    events={events.map(toSiteEvent)}
                    renderedAt={new Date().toISOString()}
                    defaultView={calendar?.defaultView === 'month' ? 'month' : 'list'}
                />
            </div>
            </div>
            <CalendarSections locale={locale} />
        </Layout>
    );
}
