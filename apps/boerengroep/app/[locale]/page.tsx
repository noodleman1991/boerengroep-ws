import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/layout'
import { loadBlockData } from '@/lib/block-data'
import { cms, type Locale } from '@/lib/cms'
import { contentPageMeta } from '@/lib/site-meta'
import ClientPage from './[...urlSegments]/client-page'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const resolved = await cms.resolvePage(locale, '/')
  return resolved?.page ? contentPageMeta(locale, resolved.page, true) : {}
}

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const resolved = await cms.resolvePage(locale, '/')
  if (!resolved?.page) notFound()

  return (
    <Layout rawPageData={resolved.page}>
      <ClientPage page={resolved.page} data={await loadBlockData(resolved.page.blocks)} />
    </Layout>
  )
}
