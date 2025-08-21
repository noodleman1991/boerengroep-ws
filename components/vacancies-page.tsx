'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { Section } from '@/components/layout/section';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
    CalendarDays,
    MapPin,
    Clock,
    Euro,
    FileText,
    Users,
    Briefcase,
    GraduationCap,
} from 'lucide-react';

// === Types ===
interface VacancyNode {
    id: string;
    opportunityType?: string | null;
    title?: string | null;
    location?: {
        type?: string | null;
        cityRegion?: string | null;
    } | null;
    startDate?: string | null;
    duration?: string | null;
    applicationDeadline?: string | null;
    description?: any;
    responsibilities?: any;
    requiredSkills?: (string | null)[] | null;
    preferredQualities?: any;
    languagesRequired?: (string | null)[] | null;
    compensation?: {
        details?: string | null;
    } | null;
    accessibilityNotes?: string | null;
    howToApply?: any;
    contactInfo?: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
    } | null;
    supportingDocument?: string | null;
    valuesStatement?: any;
    openToNontraditional?: boolean | null;
}

interface VacancyEdge {
    node?: VacancyNode | null;
}

interface VacancyConnection {
    edges?: (VacancyEdge | null)[] | null;
}

interface VacanciesPageProps {
    vacancies: VacancyConnection;
    locale: string;
}

const VACANCY_TYPES = [
    { type: 'volunteer', icon: Users, color: 'green' },
    { type: 'internship', icon: GraduationCap, color: 'blue' },
    { type: 'coordinator', icon: Briefcase, color: 'purple' },
    { type: 'freelance', icon: Briefcase, color: 'orange' },
    { type: 'other', icon: Briefcase, color: 'gray' },
] as const;

export const VacanciesPage = ({
                                  vacancies,
                                  locale,
                              }: VacanciesPageProps) => {
    const t = useTranslations('vacancies');

    const isApplicationOpen = (deadline: string) => {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        return deadlineDate >= today;
    };

    const isExpired = (deadline: string) => {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const threeDaysAfter = new Date(deadlineDate);
        threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);
        return today > threeDaysAfter;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(
            locale === 'nl' ? 'nl-NL' : 'en-US',
            {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }
        );
    };

    const filterVacanciesByType = (type: string): VacancyEdge[] => {
        if (!vacancies.edges) return [];
        return vacancies.edges
            .filter((edge): edge is VacancyEdge => {
                const vacancy = edge?.node;
                if (
                    !vacancy?.opportunityType ||
                    !vacancy?.applicationDeadline
                )
                    return false;
                if (isExpired(vacancy.applicationDeadline)) return false;
                return vacancy.opportunityType === type;
            })
            .sort((a, b) => {
                const da = new Date(a.node?.applicationDeadline || '');
                const db = new Date(b.node?.applicationDeadline || '');
                return da.getTime() - db.getTime();
            });
    };

    const VacancyAccordion = ({
                                  vacancies: typeVacancies,
                                  type,
                                  icon: Icon,
                                  color,
                              }: {
        vacancies: VacancyEdge[];
        type: string;
        icon: React.ComponentType<any>;
        color: string;
    }) => {
        if (typeVacancies.length === 0) {
            return (
                <section
                    id={type}
                    className="space-y-6 scroll-mt-24"
                >
                    <div className="flex items-center gap-3">
                        <Icon className={`h-6 w-6 text-${color}-600`} />
                        <h2 className="text-2xl font-semibold">
                            {t(`types.${type}.title`)}
                        </h2>
                    </div>
                    <p className="text-muted-foreground">
                        {t(`types.${type}.noOpportunities`)}
                    </p>
                </section>
            );
        }

        return (
            <section
                id={type}
                className="space-y-6 scroll-mt-24"
            >
                <div className="flex items-center gap-3">
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                    <h2 className="text-2xl font-semibold">
                        {t(`types.${type}.title`)}
                    </h2>
                    <Badge
                        variant="secondary"
                        className="ml-2"
                    >
                        {typeVacancies.length}{' '}
                        {typeVacancies.length === 1
                            ? t('opportunity')
                            : t('opportunities')}
                    </Badge>
                </div>

                <Accordion
                    type="single"
                    collapsible
                    className="space-y-4"
                >
                    {typeVacancies.map((edge, index) => {
                        const vacancy = edge.node;
                        if (!vacancy) return null;

                        const applicationOpen = vacancy.applicationDeadline
                            ? isApplicationOpen(vacancy.applicationDeadline)
                            : false;

                        return (
                            <AccordionItem
                                key={vacancy.id || index}
                                value={`vacancy-${type}-${index}`}
                                className="border rounded-lg overflow-hidden bg-white shadow-sm"
                            >
                                <AccordionTrigger className="hover:no-underline px-4 py-3">
                                    <div className="flex items-center justify-between w-full mr-4">
                                        <div className="text-left">
                                            <div className="font-medium">
                                                {vacancy.title ||
                                                    t('untitledPosition')}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                applicationOpen
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                            className={
                                                applicationOpen
                                                    ? 'bg-green-500 hover:bg-green-600'
                                                    : ''
                                            }
                                        >
                                            {applicationOpen
                                                ? t('status.open')
                                                : t('status.closed')}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="pt-4 px-4 pb-6 space-y-6">
                                    {/* Quick Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        {vacancy.applicationDeadline && (
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {t('fields.deadline')}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {formatDate(
                                                            vacancy.applicationDeadline
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {vacancy.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {t('fields.location')}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {vacancy.location.type}
                                                        {vacancy.location.cityRegion &&
                                                            ` • ${vacancy.location.cityRegion}`}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {vacancy.startDate && (
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {t('fields.startDate')}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {formatDate(vacancy.startDate)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {vacancy.duration && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {t('fields.duration')}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {vacancy.duration}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {vacancy.compensation?.details && (
                                            <div className="flex items-center gap-2">
                                                <Euro className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {t('fields.compensation')}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {vacancy.compensation.details}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {vacancy.description && (
                                        <div>
                                            <h4 className="font-medium mb-2">
                                                {t('fields.description')}
                                            </h4>
                                            <div className="prose prose-sm max-w-none">
                                                <TinaMarkdown
                                                    content={vacancy.description}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Responsibilities */}
                                    {vacancy.responsibilities && (
                                        <div>
                                            <h4 className="font-medium mb-2">
                                                {t('fields.responsibilities')}
                                            </h4>
                                            <div className="prose prose-sm max-w-none">
                                                <TinaMarkdown
                                                    content={vacancy.responsibilities}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills & Qualities */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {vacancy.requiredSkills &&
                                            vacancy.requiredSkills.length > 0 && (
                                                <div>
                                                    <h4 className="font-medium mb-2">
                                                        {t('fields.requiredSkills')}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {vacancy.requiredSkills.map(
                                                            (skill, idx) =>
                                                                skill && (
                                                                    <Badge
                                                                        key={idx}
                                                                        variant="secondary"
                                                                        className="text-xs"
                                                                    >
                                                                        {skill}
                                                                    </Badge>
                                                                )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {vacancy.preferredQualities && (
                                            <div>
                                                <h4 className="font-medium mb-2">
                                                    {t('fields.preferredQualities')}
                                                </h4>
                                                <div className="prose prose-sm max-w-none">
                                                    <TinaMarkdown
                                                        content={vacancy.preferredQualities}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Languages */}
                                    {vacancy.languagesRequired &&
                                        vacancy.languagesRequired.length > 0 && (
                                            <div>
                                                <h4 className="font-medium mb-2">
                                                    {t('fields.languagesRequired')}
                                                </h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {vacancy.languagesRequired.map(
                                                        (lang, idx) =>
                                                            lang && (
                                                                <Badge
                                                                    key={idx}
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {lang}
                                                                </Badge>
                                                            )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {/* Accessibility Notes */}
                                    {vacancy.accessibilityNotes && (
                                        <div>
                                            <h4 className="font-medium mb-2">
                                                {t('fields.accessibilityNotes')}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {vacancy.accessibilityNotes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Supporting Document */}
                                    {vacancy.supportingDocument && (
                                        <div>
                                            <h4 className="font-medium mb-2">
                                                {t('fields.supportingDocument')}
                                            </h4>
                                            <a
                                                href={vacancy.supportingDocument}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-primary hover:underline"
                                            >
                                                <FileText className="h-4 w-4" />
                                                {t('downloadDocument')}
                                            </a>
                                        </div>
                                    )}

                                    {/* Values Statement */}
                                    {vacancy.valuesStatement && (
                                        <div>
                                            <h4 className="font-medium mb-2">
                                                {t('fields.valuesStatement')}
                                            </h4>
                                            <div className="prose prose-sm max-w-none">
                                                <TinaMarkdown
                                                    content={vacancy.valuesStatement}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* How to Apply & Contact Info */}
                                    {vacancy.howToApply && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium mb-2">
                                                {t('fields.howToApply')}
                                            </h4>
                                            <div className="prose prose-sm max-w-none">
                                                <TinaMarkdown
                                                    content={vacancy.howToApply}
                                                />
                                            </div>

                                            {vacancy.contactInfo && (
                                                <div className="mt-3">
                                                    <h5 className="text-sm font-medium mb-1">
                                                        {t('fields.contactInfo')}
                                                    </h5>
                                                    <div className="text-sm text-muted-foreground">
                                                        {vacancy.contactInfo.name && (
                                                            <div>{vacancy.contactInfo.name}</div>
                                                        )}
                                                        {vacancy.contactInfo.email && (
                                                            <div>
                                                                <a
                                                                    href={`mailto:${vacancy.contactInfo.email}`}
                                                                    className="text-primary hover:underline"
                                                                >
                                                                    {vacancy.contactInfo.email}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {vacancy.contactInfo.phone && (
                                                            <div>
                                                                {vacancy.contactInfo.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Open to Non-Traditional Applicants */}
                                    {vacancy.openToNontraditional && (
                                        <div>
                                            <Badge className="bg-blue-100 text-blue-800">
                                                {t('fields.openToNontraditional')}
                                            </Badge>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </section>
        );
    };

    return (
        <Section>
            <div className="space-y-16">
                {/* Page Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t('description')}
                    </p>
                </div>

                {/* Quick Navigation */}
                <div className="flex flex-wrap justify-center gap-4">
                    {VACANCY_TYPES.map(({ type, icon: Icon }) => (
                        <a
                            key={type}
                            href={`#${type}`}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                        >
                            <Icon className="inline-block w-4 h-4 mr-2" />
                            {t(`types.${type}.navTitle`)}
                        </a>
                    ))}
                </div>

                {/* Vacancy Sections */}
                {VACANCY_TYPES.map(({ type, icon, color }) => {
                    const typeVacancies = filterVacanciesByType(type);
                    return (
                        <VacancyAccordion
                            key={type}
                            vacancies={typeVacancies}
                            type={type}
                            icon={icon}
                            color={color}
                        />
                    );
                })}
            </div>
        </Section>
    );
};
