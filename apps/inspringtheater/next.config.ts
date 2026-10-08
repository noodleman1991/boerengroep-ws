import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import baseConfig from '../boerengroep/next.config.base'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** Where the admin panel lives: in the Boerengroep app. Editors who type /admin here are sent there. */
const adminUrl = process.env.ADMIN_URL?.replace(/\/$/, '')
const adminOrigin = adminUrl ? new URL(adminUrl).origin : undefined

const base = baseConfig as NextConfig

const config: NextConfig = {
  ...base,
  // The pages and components are the shared ones in apps/boerengroep.
  experimental: { ...base.experimental, externalDir: true },
  async redirects() {
    return adminUrl
      ? [
          { source: '/admin', destination: adminUrl, permanent: false },
          { source: '/admin/:path*', destination: `${adminUrl}/:path*`, permanent: false },
        ]
      : []
  },
  async headers() {
    const shared: { source: string; headers: { key: string; value: string }[] }[] = (await base.headers?.()) ?? []
    return shared.map((rule) =>
      rule.source !== '/(.*)' || !adminOrigin
        ? rule
        : {
            ...rule,
            // The admin panel shows this site in a frame for the live preview, from another address.
            headers: rule.headers
              .filter((header) => header.key !== 'X-Frame-Options')
              .map((header) =>
                header.key === 'Content-Security-Policy' ? { ...header, value: `frame-ancestors 'self' ${adminOrigin}` } : header,
              ),
          },
    )
  },
}

export default withPayload(withNextIntl(config))
