import { execSync } from 'node:child_process'

const shouldRun = process.env.VERCEL_ENV === 'production' || process.env.RUN_MIGRATIONS === '1'

if (shouldRun) {
  console.log('Running Payload migrations')
  execSync('pnpm payload migrate', { stdio: 'inherit' })
} else {
  console.log('Skipping Payload migrations (not production and RUN_MIGRATIONS is not 1)')
}
