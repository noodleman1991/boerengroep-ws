import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { client } from '@/tina/__generated__/client';
import { Calendar } from '@/components/calendar/calendar';
import Layout from '@/components/layout/layout';
import { Section } from '@/components/layout/section';

interface CalendarPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CalendarPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'calendar' });

    return {
        title: `${t('title')} - Stichting Boerengroep`,
        description: t('description'),
    };
}

async function getCalendarData() {
    try {
        const data = await client.queries.calendarQuery();
        return {
            events: data.data?.eventConnection?.edges?.map(edge => edge?.node).filter(Boolean) || [],
        };
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        return {
            events: [],
        };
    }
}

export default async function CalendarPage({ params }: CalendarPageProps) {
    const { locale } = await params;
    const { events } = await getCalendarData();
    const t = await getTranslations({ locale, namespace: 'calendar' });

    // Mock/Default layout data for the Layout component
    const mockLayoutData = {
        data: {
            global: null // This will be fetched by the Layout component itself
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <Section>
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
                        <p className="text-muted-foreground">
                            {t('description')}
                        </p>
                        {events.length === 0 && (
                            <div className="mt-4 p-4 border border-dashed rounded-lg text-center">
                                <p className="text-muted-foreground">
                                    {t('errors.noEventsAdmin')}{' '}
                                    <a href="/admin" className="text-primary hover:underline">
                                        TinaCMS admin panel
                                    </a>
                                    .
                                </p>
                            </div>
                        )}
                    </div>

                    <Calendar
                        events={events}
                        className="w-full"
                        defaultHeight="600px"
                    />
                </div>
            </Section>
        </Layout>
    );
}
