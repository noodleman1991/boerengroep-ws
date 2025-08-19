import { Metadata } from 'next';
import { client } from '@/tina/__generated__/client';
import { Calendar } from '@/components/calendar/calendar';

export const metadata: Metadata = {
    title: 'Event Calendar - Stichting Boerengroep',
    description: 'View upcoming events and activities at Stichting Boerengroep.',
};

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

export default async function CalendarPage() {
    const { events } = await getCalendarData();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Event Calendar</h1>
                <p className="text-muted-foreground">
                    View all upcoming events, workshops, meetings, and activities.
                </p>
                {events.length === 0 && (
                    <div className="mt-4 p-4 border border-dashed rounded-lg text-center">
                        <p className="text-muted-foreground">
                            No events found. Add events through the{' '}
                            <a href="/admin" className="text-primary hover:underline">
                                TinaCMS admin panel
                            </a>
                            .
                        </p>
                    </div>
                )}
            </div>

            <Calendar events={events} />
        </div>
    );
}
