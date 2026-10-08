import config from '@payload-config';
import { getPayload } from 'payload';
import { TENANT_SLUG } from '@/lib/cms';

let cached: Promise<number | string> | undefined;

/** The id of the site this app serves. Looked up once. */
export function thisTenantId(): Promise<number | string> {
  cached ??= (async () => {
    const payload = await getPayload({ config });
    const found = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: TENANT_SLUG } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const id = found.docs[0]?.id;
    if (id === undefined) throw new Error(`Site "${TENANT_SLUG}" does not exist in the database`);
    return id;
  })().catch((error) => {
    cached = undefined;
    throw error;
  });
  return cached;
}
