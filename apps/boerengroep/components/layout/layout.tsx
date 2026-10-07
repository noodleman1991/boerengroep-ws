import { getLocale } from 'next-intl/server'
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

  return (
    <LayoutProvider globalSettings={settings} pageData={rawPageData ?? {}}>
      <Header />
      <main className="overflow-x-hidden pt-20">{children}</main>
      <Footer />
    </LayoutProvider>
  )
}
