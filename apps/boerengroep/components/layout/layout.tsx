import { getLocale, getTranslations } from 'next-intl/server'
import React, { type PropsWithChildren } from 'react'
import { cms, type Locale } from '@/lib/cms'
import { toGlobalSettings } from '@/lib/cms-adapters'
import { LayoutProvider } from './layout-context'
import { Footer } from './nav/footer'
import { Header } from './nav/header'

type LayoutProps = PropsWithChildren & {
  rawPageData?: unknown
}

export default async function Layout({ children, rawPageData }: LayoutProps) {
  const locale = (await getLocale()) as Locale
  const settings = toGlobalSettings(await cms.getSiteSettings(locale))
  const t = await getTranslations({ locale, namespace: 'navigation' })

  return (
    <LayoutProvider globalSettings={settings} pageData={rawPageData ?? {}}>
      {/* First stop for keyboard and screen reader users: jump over the menu. */}
      <a className="skip-link" href="#content">
        {t('skip')}
      </a>
      <Header />
      <main id="content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </LayoutProvider>
  )
}
