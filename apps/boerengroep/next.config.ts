import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import baseConfig from './next.config.base'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withPayload(withNextIntl(baseConfig))
