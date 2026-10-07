import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/layout'
import { Section } from '@/components/layout/section'
import { cms, type Locale } from '@/lib/cms'
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
      <Section>
        <ClientPage page={resolved.page} />
      </Section>
    </Layout>
  )
}

export async function generateStaticParams(): Promise<Params[]> {
  const paths = await cms.listPagePaths()
  return paths
    .filter((p) => p.path !== '/')
    .map((p) => ({ locale: p.locale, urlSegments: p.path.slice(1).split('/') }))
}
