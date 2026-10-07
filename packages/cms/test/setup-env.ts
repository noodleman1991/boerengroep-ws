import os from 'node:os'
import path from 'node:path'

process.env.PAYLOAD_DATABASE_URL ??= 'postgres://payload:payload@127.0.0.1:54329/payload_test'
process.env.PAYLOAD_SECRET ??= 'test-secret-not-for-production'
process.env.TENANT_SLUG ??= 'boerengroep'
process.env.MEDIA_DIR ??= path.join(os.tmpdir(), 'sites-cms-test-media')
