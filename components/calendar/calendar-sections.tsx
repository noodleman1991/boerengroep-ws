import React from 'react';
import { client } from '@/tina/__generated__/client';
import { Section } from '@/components/layout/section';
import { Blocks } from '@/components/blocks';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { components } from '@/components/mdx-components';

interface CalendarSectionsProps {
    locale: string;
}

interface SectionData {
    id: string;
    title: string;
    content: any;
    blocks?: any[];
}

async function getCalendarSections(locale: string): Promise<SectionData[]> {
    const sections = [
        { 
            id: 'breaks', 
            path: locale === 'nl' ? 'nl/activiteiten/agenda-secties/pauzes.mdx' : 'en/activities/calendar-sections/breaks.mdx'
        },
        { 
            id: 'soup-kitchen', 
            path: locale === 'nl' ? 'nl/activiteiten/agenda-secties/soepkeuken.mdx' : 'en/activities/calendar-sections/soup-kitchen.mdx'
        },
        { 
            id: 'open-meetings', 
            path: locale === 'nl' ? 'nl/activiteiten/agenda-secties/open-vergaderingen.mdx' : 'en/activities/calendar-sections/open-meetings.mdx'
        }
    ];

    const sectionData: SectionData[] = [];

    for (const section of sections) {
        try {
            const data = await client.queries.contentQuery({
                relativePath: section.path
            });

            if (data?.data?.page) {
                sectionData.push({
                    id: section.id,
                    title: data.data.page.title || '',
                    content: data.data.page.body,
                    blocks: data.data.page.blocks || []
                });
            } else {
                // Page not found, add placeholder
                sectionData.push({
                    id: section.id,
                    title: '',
                    content: null,
                    blocks: []
                });
            }
        } catch (error) {
            // Silently fail and skip broken sections
            continue;
        }
    }

    return sectionData;
}

export async function CalendarSections({ locale }: CalendarSectionsProps) {
    const sections = await getCalendarSections(locale);

    if (sections.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 space-y-12">
            {sections.map((section) => (
                <div key={section.id} id={section.id} className="scroll-mt-20">
                    <Section className="py-8">
                        <div className="container mx-auto px-4 sm:px-6">
                            {section.title && (
                                <h2 className="text-2xl font-bold mb-6">{section.title}</h2>
                            )}
                            
                            {/* Render content blocks if they exist */}
                            {section.blocks && section.blocks.length > 0 && (
                                <div className="mb-6">
                                    <Blocks blocks={section.blocks} />
                                </div>
                            )}

                            {/* Render markdown body content */}
                            {section.content && (
                                <div className="prose dark:prose-dark max-w-none">
                                    <TinaMarkdown content={section.content} components={components} />
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
