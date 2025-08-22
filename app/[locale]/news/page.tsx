import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Layout from '@/components/layout/layout';
import { Section } from '@/components/layout/section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Users } from 'lucide-react';

interface NewsPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'navigation.items' });

    return {
        title: `${t('news')} - Stichting Boerengroep`,
        description: 'Stay updated with the latest news from Stichting Boerengroep and our partner organizations.',
    };
}

export default async function NewsPage({ params }: NewsPageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'navigation.items' });
    const tNewsletter = await getTranslations({ locale, namespace: 'newsletter' });

    const mockLayoutData = {
        data: {
            global: null
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <Section>
                <div className="space-y-8">
                    {/* Page Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">
                            {t('news')}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Stay updated with the latest news from Stichting Boerengroep and our partner organizations.
                        </p>
                    </div>

                    {/* News Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Newsletter */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Globe className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>{t('newsletter')}</CardTitle>
                                        <CardDescription>
                                            {tNewsletter('description')}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href="/news/newsletter">
                                        View Newsletter
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Friends News */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>{t('friends-news')}</CardTitle>
                                        <CardDescription>
                                            News and updates from our partner organizations and friends.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/news/friends-news">
                                        View Friends News
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Landscape */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Globe className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>{t('landscape')}</CardTitle>
                                        <CardDescription>
                                            Insights and analysis of the sustainable agriculture landscape.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/news/landscape">
                                        View Landscape
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
