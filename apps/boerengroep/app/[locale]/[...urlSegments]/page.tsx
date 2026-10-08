import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/layout'
import { loadBlockData } from '@/lib/block-data'
import { cms, type Locale } from '@/lib/cms'
import { contentStaticParams } from '@/lib/reserved-paths'
import ClientPage from './client-page'

export const revalidate = 3600

type Params = { locale: Locale; urlSegments: string[] }

const withLocale = (locale: Locale, path: string) => `/${locale}${path === '/' ? '' : path}`

export default async function Page({ params }: { params: Promise<Params> }) {
  const { locale, urlSegments } = await params
  setRequestLocale(locale);

  // Static assets and internal paths never match a CMS page.
  if (urlSegments.some((s) => s.includes('.') || s.startsWith('_'))) notFound()

  const path = `/${urlSegments.map((s) => decodeURIComponent(s)).join('/')}`
  const resolved = await cms.resolvePage(locale, path)

  if (resolved?.redirectTo) permanentRedirect(withLocale(locale, resolved.redirectTo))

  if (!resolved?.page) {
    const rule = (await cms.findRedirect(path)) ?? (await cms.findRedirect(withLocale(locale, path)))
    if (rule) {
      const target = /^https?:\/\//.test(rule.to) ? rule.to : withLocale(locale, rule.to)
      if (rule.permanent) permanentRedirect(target)
      redirect(target)
    }
    notFound()
  }

  return (
    <Layout rawPageData={resolved.page}>
      <ClientPage page={resolved.page} data={await loadBlockData(resolved.page.blocks)} />
    </Layout>
  )
}

export async function generateStaticParams(): Promise<Params[]> {
  // Addresses owned by built-in routes are left out. Prebuilding them here would
  // replace the built-in page with the CMS page of the same address.
  return contentStaticParams(await cms.listPagePaths())
}
