import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/layout'
import { cms, type Locale } from '@/lib/cms'
import { toCalendarEvent, toGlobalSettings } from '@/lib/cms-adapters'
import ClientPage from './[...urlSegments]/client-page'

export const revalidate = 3600

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const [resolved, events, settings] = await Promise.all([
    cms.resolvePage(locale, '/'),
    cms.listEvents(),
    cms.getSiteSettings(locale),
  ])
  if (!resolved?.page) notFound()

  return (
    <Layout rawPageData={resolved.page}>
      <ClientPage
        page={resolved.page}
        events={events.map(toCalendarEvent)}
        globalData={toGlobalSettings(settings)}
      />
    </Layout>
  )
}
