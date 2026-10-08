import { getTranslations } from 'next-intl/server';
import { Blocks } from '@/components/blocks';
import { RichText } from '@/components/rich-text';
import { loadBlockData } from '@/lib/block-data';
import { cms, type Locale } from '@/lib/cms';

// English paths identify the section pages. The page is returned in the requested locale.
const SECTIONS = [
    { id: 'breaks', path: '/activities/calendar-sections/breaks' },
    { id: 'soup-kitchen', path: '/activities/calendar-sections/soup-kitchen' },
    { id: 'open-meetings', path: '/activities/calendar-sections/open-meetings' },
];

/**
 * The regular activities, shown under the calendar. Editors write each one as a page
 * under "Calendar sections". The ids are the anchors that menu links point at.
 */
export async function CalendarSections({ locale }: { locale: Locale }) {
    const sections = [];
    for (const section of SECTIONS) {
        try {
            const page = await cms.getPageByEnglishPath(section.path, locale);
            if (page) sections.push({ id: section.id, page, data: await loadBlockData(page.blocks, locale) });
        } catch (error) {
            console.error(`Error loading calendar section ${section.id}:`, error);
        }
    }
    if (sections.length === 0) return null;
    const t = await getTranslations({ locale, namespace: 'calendar' });

    return (
        <div className="band band--plot section-mist">
            <div className="page-width calendar-regulars">
                <h2>{t('sections_title')}</h2>
                <div className="calendar-regulars__grid">
                    {sections.map(({ id, page, data }) => (
                        <section key={id} id={id} className="calendar-regulars__item">
                            {page.title && <h3>{page.title}</h3>}
                            {page.body && <RichText data={page.body} />}
                            {page.blocks && page.blocks.length > 0 && <Blocks blocks={page.blocks} data={data} />}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CalendarSections;
