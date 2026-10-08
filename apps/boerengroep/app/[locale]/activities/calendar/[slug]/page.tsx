import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DateBlock, StatusBadge, TypeTag } from '@/components/events/event-bits';
import { EventActions } from '@/components/events/event-actions';
import Layout from '@/components/layout/layout';
import { RichText } from '@/components/rich-text';
import { Link } from '@/i18n/navigation';
import { cms, type Locale } from '@/lib/cms';
import { toSiteEvent } from '@/lib/cms-adapters';
import { eventPath } from '@/lib/events/ics-site';
import { eventJsonLd, jsonLdScript } from '@/lib/events/json-ld';
import { isUpcoming } from '@/lib/events/select';
import { mapsUrl, webAddress } from '@/lib/events/share';
import { formatWhen } from '@/lib/events/time';
import { hasRichText } from '@/lib/rich-text-utils';
import { siteUrl } from '@/lib/site-url';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: Locale; slug: string }> };

async function load(slug: string) {
    const found = await cms.getEvent(decodeURIComponent(slug));
    return found ? toSiteEvent(found) : null;
}

const absolute = (address: string) => (address.startsWith('/') ? `${siteUrl()}${address}` : address);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const event = await load(slug);
    if (!event) return {};
    const settings = await cms.getSiteSettings(locale);
    const site = settings?.general?.name ?? 'Stichting Boerengroep';
    const when = formatWhen(event.start, event.end, locale);
    const description = [when, event.place.address, event.description.replace(/\s+/g, ' ')].filter(Boolean).join('. ').slice(0, 220);
    const url = `${siteUrl()}/${locale}${eventPath(event.slug)}`;
    const picture = event.image?.share ? [{ url: absolute(event.image.share), width: 1200, height: 630, alt: event.image.alt }] : undefined;
    return {
        title: `${event.title} - ${site}`,
        description,
        alternates: {
            canonical: url,
            languages: { en: `${siteUrl()}/en${eventPath(event.slug)}`, nl: `${siteUrl()}/nl${eventPath(event.slug)}` },
        },
        openGraph: { type: 'article', title: event.title, description, url, siteName: site, images: picture },
        twitter: { card: picture ? 'summary_large_image' : 'summary', title: event.title, description, images: picture?.map((p) => p.url) },
    };
}

export default async function EventPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const event = await load(slug);
    if (!event) notFound();

    const [t, settings] = await Promise.all([getTranslations({ locale, namespace: 'calendar' }), cms.getSiteSettings(locale)]);
    const passed = !isUpcoming(event, new Date());
    const recap = passed ? await cms.getRecapOfEvent(event.id, locale) : null;
    const map = mapsUrl(event.place);
    const call = webAddress(event.place.callLink);
    const going = event.status === 'scheduled' || event.status === 'full';
    const url = `${siteUrl()}/${locale}${eventPath(event.slug)}`;
    const portrait = Boolean(event.image?.width && event.image.height && event.image.height > event.image.width);

    return (
        <Layout>
            <article className="page-width event-page">
                <Link href="/activities/calendar" className="event-page__back">
                    <ArrowLeft aria-hidden="true" />
                    {t('event.back')}
                </Link>

                <header className="event-page__head">
                    <DateBlock date={event.start} className="date-block--large" />
                    <div>
                        <div className="event-row__tags">
                            <TypeTag type={event.type} />
                            <StatusBadge status={event.status} />
                        </div>
                        <h1 className={going ? undefined : 'event-page__title--off'}>{event.title}</h1>
                    </div>
                </header>

                {event.status !== 'scheduled' && (
                    <p className={`event-page__state event-page__state--${event.status}`}>
                        <strong>{t(`status_text.${event.status}`)}</strong> {event.statusNote}
                    </p>
                )}
                {passed && going && (
                    <p className="event-page__state">
                        {t('event.passed')}{' '}
                        {recap && <Link href={`/activities/past-events/${recap.slug}`}>{t('event.recap')}</Link>}
                    </p>
                )}

                <div className={`event-page__layout${event.image ? '' : ' event-page__layout--plain'}`}>
                    <div className="event-page__main">
                        <dl className="event-page__facts">
                            <div>
                                <dt>{t('event.when')}</dt>
                                <dd>{formatWhen(event.start, event.end, locale)}</dd>
                            </div>
                            {event.place.address && (
                                <div>
                                    <dt>{t('event.where')}</dt>
                                    <dd>
                                        {event.place.address}
                                        {map && (
                                            <a href={map} target="_blank" rel="noopener noreferrer">
                                                {t('event.map')}
                                            </a>
                                        )}
                                    </dd>
                                </div>
                            )}
                            {call && (
                                <div>
                                    <dt>{t('online')}</dt>
                                    <dd>
                                        <a href={call} target="_blank" rel="noopener noreferrer">
                                            {t('event.join_online')}
                                        </a>
                                    </dd>
                                </div>
                            )}
                            {event.language && (
                                <div>
                                    <dt>{t('event.language')}</dt>
                                    <dd>{t(event.language === 'nl' ? 'event.language_nl' : 'event.language_en')}</dd>
                                </div>
                            )}
                        </dl>

                        {event.status === 'scheduled' && !passed && hasRichText(event.registration) && (
                            <div className="event-page__signup">
                                <h2>{t('event.sign_up')}</h2>
                                <RichText data={event.registration} />
                            </div>
                        )}

                        {going && !passed && <EventActions event={event} siteUrl={siteUrl()} />}

                        {event.description && (
                            <div className="event-page__text">
                                {event.description.split(/\n{1,}/).map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        )}

                        {event.people.length > 0 && (
                            <section className="event-page__people">
                                <h2>{t('event.people')}</h2>
                                <ul>
                                    {event.people.map((person) => (
                                        <li key={person.name}>
                                            {person.avatar && <Image src={person.avatar} alt="" width={56} height={56} />}
                                            <span>
                                                <strong>{person.name}</strong>
                                                {[person.role, person.affiliation].filter(Boolean).join(', ')}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    {event.image?.original && (
                        <figure className={`event-page__picture${portrait ? ' event-page__picture--poster' : ''}`}>
                            <Image
                                src={event.image.original}
                                alt={event.image.alt}
                                width={event.image.width ?? 1200}
                                height={event.image.height ?? 900}
                                sizes="(max-width: 900px) 100vw, 40vw"
                                priority
                            />
                        </figure>
                    )}
                </div>

                <script
                    type="application/ld+json"
                    // Escaped in jsonLdScript, so text typed by an editor cannot close the tag.
                    dangerouslySetInnerHTML={{
                        __html: jsonLdScript(
                            eventJsonLd(event, { url, organizer: { name: settings?.general?.name ?? 'Stichting Boerengroep', url: siteUrl() } }),
                        ),
                    }}
                />
            </article>
        </Layout>
    );
}

export async function generateStaticParams() {
    const events = await cms.listEvents();
    return (['en', 'nl'] as const).flatMap((locale) =>
        events.filter((event) => event.slug).map((event) => ({ locale, slug: event.slug as string })),
    );
}
