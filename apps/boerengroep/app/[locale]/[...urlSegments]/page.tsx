import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/layout'
import { loadBlockData } from '@/lib/block-data'
import { cms, type Locale } from '@/lib/cms'
import { pageParts } from '@/lib/page-parts'
import { contentStaticParams } from '@/lib/reserved-paths'
import { contentPageMeta } from '@/lib/site-meta'
import ClientPage from './client-page'

export const revalidate = 3600

type Params = { locale: Locale; urlSegments: string[] }

const withLocale = (locale: Locale, path: string) => `/${locale}${path === '/' ? '' : path}`

// Static assets and internal paths never match a CMS page.
const notAPage = (urlSegments: string[]) => urlSegments.some((s) => s.includes('.') || s.startsWith('_'))
const pathOf = (urlSegments: string[]) => `/${urlSegments.map((s) => decodeURIComponent(s)).join('/')}`

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, urlSegments } = await params
  setRequestLocale(locale)
  if (notAPage(urlSegments)) return {}
  const resolved = await cms.resolvePage(locale, pathOf(urlSegments))
  return resolved?.page ? contentPageMeta(locale, resolved.page) : {}
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { locale, urlSegments } = await params
  setRequestLocale(locale);

  if (notAPage(urlSegments)) notFound()

  const path = pathOf(urlSegments)
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
      <ClientPage
        page={resolved.page}
        data={await loadBlockData(resolved.page.blocks, locale)}
        subPages={pageParts(resolved.page).empty ? await cms.listChildPages(resolved.page.id, locale) : []}
      />
    </Layout>
  )
}

export async function generateStaticParams(): Promise<Params[]> {
  // Addresses owned by built-in routes are left out. Prebuilding them here would
  // replace the built-in page with the CMS page of the same address.
  return contentStaticParams(await cms.listPagePaths())
}
