import React from 'react';
import { Blocks } from '@/components/blocks';
import { Section } from '@/components/layout/section';
import { RichText } from '@/components/rich-text';
import { cms, type Locale } from '@/lib/cms';

interface CalendarSectionsProps {
    locale: string;
}

// English paths identify the section pages. The page is returned in the requested locale.
const SECTIONS = [
    { id: 'breaks', path: '/activities/calendar-sections/breaks' },
    { id: 'soup-kitchen', path: '/activities/calendar-sections/soup-kitchen' },
    { id: 'open-meetings', path: '/activities/calendar-sections/open-meetings' },
];

export async function CalendarSections({ locale }: CalendarSectionsProps) {
    const sections = [];
    for (const section of SECTIONS) {
        try {
            const page = await cms.getPageByEnglishPath(section.path, locale as Locale);
            if (page) sections.push({ id: section.id, page });
        } catch (error) {
            console.error(`Error loading calendar section ${section.id}:`, error);
        }
    }
    if (sections.length === 0) return null;

    return (
        <div className="mt-12 space-y-12">
            {sections.map(({ id, page }) => (
                <div key={id} id={id} className="scroll-mt-20">
                    <Section className="py-8">
                        <div className="container mx-auto px-4 sm:px-6">
                            {page.title && <h2 className="text-2xl font-bold mb-6">{page.title}</h2>}
                            {page.blocks && page.blocks.length > 0 && (
                                <div className="mb-6">
                                    <Blocks blocks={page.blocks} />
                                </div>
                            )}
                            {page.body && (
                                <div className="prose dark:prose-dark max-w-none">
                                    <RichText data={page.body} />
                                </div>
                            )}
                        </div>
                    </Section>
                </div>
            ))}
        </div>
    );
}

export default CalendarSections;
