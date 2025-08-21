'use client';
import React from 'react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Clock, Euro, FileText, Users, Briefcase, GraduationCap } from 'lucide-react';

// Type-safe interfaces
interface VacancyNode {
    id: string;
    opportunityType?: string | null;
    jobCategory?: string | null;
    title?: string | null;
    organization?: string | null;
    applicationDeadline?: string | null;
    duration?: string | null;
    description?: any;
    responsibilities?: any;
    requiredSkills?: (string | null)[] | null;
    preferredQualities?: (string | null)[] | null;
    location?: {
        type?: string | null;
        cityRegion?: string | null;
    } | null;
    compensation?: {
        details?: string | null;
    } | null;
    howToApply?: any;
    contactInfo?: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
    } | null;
    supportingDocument?: string | null;
    valuesStatement?: any;
    languagesRequired?: (string | null)[] | null;
    languagesPreferred?: (string | null)[] | null;
}

interface VacancyEdge {
    node?: VacancyNode | null;
}

interface VacancyConnection {
    edges?: (VacancyEdge | null)[] | null;
}

interface VacanciesPageProps {
    vacancies: VacancyConnection;
}

export const VacanciesPage = ({ vacancies }: VacanciesPageProps) => {
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
        return new Date(dateString).toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const filterVacancies = (type: string, category?: string): VacancyEdge[] => {
        if (!vacancies.edges) return [];
        
        return vacancies.edges
            .filter((edge): edge is VacancyEdge => {
                const vacancy = edge?.node;
                if (!vacancy?.opportunityType || !vacancy?.applicationDeadline) return false;
                if (isExpired(vacancy.applicationDeadline)) return false;
                
                if (type === 'job' && category) {
                    return vacancy.opportunityType === 'job' && vacancy.jobCategory === category;
                }
                return vacancy.opportunityType === type;
            })
            .sort((a, b) => {
                const deadlineA = new Date(a?.node?.applicationDeadline || '');
                const deadlineB = new Date(b?.node?.applicationDeadline || '');
                return deadlineA.getTime() - deadlineB.getTime();
            });
    };

    const renderJobBoard = (title: string, vacancies: VacancyEdge[], icon: React.ReactNode, id: string) => {
        if (vacancies.length === 0) {
            return (
                <section id={id} className="space-y-6 scroll-mt-24">
                    <div className="flex items-center gap-3">
                        {icon}
                        <h2 className="text-2xl font-semibold">{title}</h2>
                    </div>
                    <p className="text-muted-foreground">
                        No opportunities available at the moment.
                    </p>
                </section>
            );
        }

        return (
            <section id={id} className="space-y-6 scroll-mt-24">
                <div className="flex items-center gap-3">
                    {icon}
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <Badge variant="secondary" className="ml-2">
                        {vacancies.length} {vacancies.length === 1 ? 'opportunity' : 'opportunities'}
                    </Badge>
                </div>
                
                <Accordion type="single" collapsible className="space-y-4">
                    {vacancies.map((edge, index) => {
                        const vacancy = edge?.node;
                        if (!vacancy) return null;

                        const applicationOpen = vacancy.applicationDeadline ? isApplicationOpen(vacancy.applicationDeadline) : false;

                        return (
                            <AccordionItem 
                                key={vacancy.id || index} 
                                value={`vacancy-${id}-${index}`}
                                className="border rounded-lg px-4"
                            >
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full mr-4">
                                        <div className="text-left">
                                            <div className="font-medium">{vacancy.title || 'Untitled Position'}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {vacancy.organization || 'Organization not specified'}
                                            </div>
                                        </div>
                                        <Badge 
                                            variant={applicationOpen ? "default" : "destructive"}
                                            className={applicationOpen ? "bg-green-500 hover:bg-green-600" : ""}
                                        >
                                            {applicationOpen ? "Open" : "Closed"}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                
                                <AccordionContent className="pt-4 space-y-6">
                                    {/* Quick Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        {vacancy.applicationDeadline && (
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">Deadline</div>
                                                    <div className="text-muted-foreground">
                                                        {formatDate(vacancy.applicationDeadline)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {vacancy.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">Location</div>
                                                    <div className="text-muted-foreground">
                                                        {vacancy.location.type} {vacancy.location.cityRegion && `• ${vacancy.location.cityRegion}`}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {vacancy.duration && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">Duration</div>
                                                    <div className="text-muted-foreground">{vacancy.duration}</div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {vacancy.compensation?.details && (
                                            <div className="flex items-center gap-2">
                                                <Euro className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">Compensation</div>
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
                                            <h4 className="font-medium mb-2">Description</h4>
                                            <div className="prose prose-sm max-w-none">
                                                <TinaMarkdown content={vacancy.description} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Responsibilities */}
                                    {vacancy.responsibilities && (
                                        <div>
                                            <h4 className="font-medium mb-2">Responsibilities</h4>
                                            <div className="prose prose-sm max-w-none">
                                                <TinaMarkdown content={vacancy.responsibilities} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills & Qualities */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {vacancy.requiredSkills && vacancy.requiredSkills.length > 0 && (
                                            <div>
                                                <h4 className="font-medium mb-2">Required Skills</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {vacancy.requiredSkills.map((skill: string | null, idx: number) => skill && (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {vacancy.preferredQualities && vacancy.preferredQualities.length > 0 && (
                                            <div>
                                                <h4 className="font-medium mb-2">Preferred Qualities</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {vacancy.preferredQualities.map((quality: string | null, idx: number) => quality && (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {quality}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Languages */}
                                    {((vacancy.languagesRequired && vacancy.languagesRequired.length > 0) || 
                                      (vacancy.languagesPreferred && vacancy.languagesPreferred.length > 0)) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {vacancy.languagesRequired && vacancy.languagesRequired.length > 0 && (
                                                <div>
                                                    <h4 className="font-medium mb-2">Required Languages</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {vacancy.languagesRequired.map((lang: string | null, idx: number) => lang && (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {lang}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {vacancy.languagesPreferred && vacancy.languagesPreferred.length > 0 && (
                                                <div>
                                                    <h4 className="font-medium mb-2">Preferred Languages</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {vacancy.languagesPreferred.map((lang: string | null, idx: number) => lang && (
                                                            <Badge key={idx} variant="outline" className="text-xs">
                                                                {lang}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Supporting Document */}
                                    {vacancy.supportingDocument && (
                                        <div>
                                            <h4 className="font-medium mb-2">Supporting Document</h4>
                                            <a 
                                                href={vacancy.supportingDocument}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-primary hover:underline"
                                            >
                                                <FileText className="h-4 w-4" />
                                                Download Document
                                            </a>
                                        </div>
                                    )}

                                    {/* Values Statement */}
                                    {vacancy.valuesStatement && (
                                        <div>
                                            <h4 className="font-medium mb-2">Values & Commitment</h4>
                                            <div className="prose prose-sm max-w-none">
                                                <TinaMarkdown content={vacancy.valuesStatement} />
                                            </div>
                                        </div>
                                    )}

                                    {/* How to Apply */}
                                    {vacancy.howToApply && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium mb-2">How to Apply</h4>
                                            <div className="prose prose-sm max-w-none">
                                                <TinaMarkdown content={vacancy.howToApply} />
                                            </div>
                                            
                                            {vacancy.contactInfo && (
                                                <div className="mt-3">
                                                    <h5 className="text-sm font-medium mb-1">Contact Information</h5>
                                                    <div className="text-sm text-muted-foreground">
                                                        {vacancy.contactInfo.name && <div>{vacancy.contactInfo.name}</div>}
                                                        {vacancy.contactInfo.email && (
                                                            <div>
                                                                <a href={`mailto:${vacancy.contactInfo.email}`} className="text-primary hover:underline">
                                                                    {vacancy.contactInfo.email}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {vacancy.contactInfo.phone && <div>{vacancy.contactInfo.phone}</div>}
                                                    </div>
                                                </div>
                                            )}
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

    // Filter vacancies by type and category
    const volunteerVacancies = filterVacancies('volunteer');
    const internshipVacancies = filterVacancies('internship');
    const coordinatorJobs = filterVacancies('job', 'coordinator');
    const freelanceJobs = filterVacancies('job', 'freelance');

    return (
        <div className="space-y-16">
            {/* Page Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Opportunities</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Discover meaningful opportunities to contribute to our mission through volunteering, 
                    internships, and employment.
                </p>
            </div>

            {/* Quick Navigation */}
            <div className="flex flex-wrap justify-center gap-4">
                <a href="#volunteers" className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                    <Users className="inline-block w-4 h-4 mr-2" />
                    Volunteers
                </a>
                <a href="#internships" className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                    <GraduationCap className="inline-block w-4 h-4 mr-2" />
                    Internships
                </a>
                <a href="#coordinator" className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                    <Briefcase className="inline-block w-4 h-4 mr-2" />
                    Coordinator
                </a>
                <a href="#freelance" className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                    <Briefcase className="inline-block w-4 h-4 mr-2" />
                    Freelance
                </a>
            </div>

            {/* Volunteer Opportunities */}
            {renderJobBoard(
                "Volunteer Opportunities", 
                volunteerVacancies, 
                <Users className="h-6 w-6 text-green-600" />,
                "volunteers"
            )}

            {/* Internships */}
            {renderJobBoard(
                "Internships", 
                internshipVacancies, 
                <GraduationCap className="h-6 w-6 text-blue-600" />,
                "internships"
            )}

            {/* Coordinator Jobs */}
            {renderJobBoard(
                "Coordinator Positions", 
                coordinatorJobs, 
                <Briefcase className="h-6 w-6 text-purple-600" />,
                "coordinator"
            )}

            {/* Freelance Jobs */}
            {renderJobBoard(
                "Freelance & Temporary Positions", 
                freelanceJobs, 
                <Briefcase className="h-6 w-6 text-orange-600" />,
                "freelance"
            )}
        </div>
    );
};
