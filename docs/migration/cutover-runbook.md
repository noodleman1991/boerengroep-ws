# Boerengroep cutover runbook

## One-time setup (owner)

1. **Neon.** Create a project `sites-platform` with a database `payload`. Create a branch `staging`
   from `main`. Note the pooled connection string of each branch.
2. **Vercel Blob.** Create one public Blob store `sites-media`. Note its read-write token.
3. **Vercel project.** Create a project `boerengroep-payload` from this repository with
   - Root Directory: `apps/boerengroep`
   - Production Branch: `main`
   - Framework: Next.js, Node 22
4. **Environment variables** on that project:

   | Name | Production | Preview |
   |---|---|---|
   | `PAYLOAD_DATABASE_URL` | Neon `main` | Neon `staging` |
   | `PAYLOAD_SECRET` | `openssl rand -hex 32` | a different value |
   | `TENANT_SLUG` | `boerengroep` | `boerengroep` |
   | `REVALIDATE_SECRET` | `openssl rand -hex 32` | a different value |
   | `NEXT_PUBLIC_SITE_URL` | the production origin | the preview origin |
   | `BLOB_READ_WRITE_TOKEN` | Blob token | Blob token |
   | `RUN_MIGRATIONS` | not set | `1` |
   | every existing variable of the old project | copy | copy |

   The build reads the database to prebuild pages, so `PAYLOAD_DATABASE_URL` must be reachable
   from Vercel builds. If Preview deployments are protected, the smoke tests and the parity check
   need a protection bypass or a public preview.

   The existing variables are `DATABASE_URL`, `RESEND_BOERENGROEP`, `FROM_EMAIL`, `FROM_NAME`,
   `REPLY_TO_EMAIL`, `NEWSLETTER_SECRET`, `BASE_URL`, `BASE_PATH`, `PODCAST_RSS_URL`,
   `NEXT_PUBLIC_BASE_URL`, `BREVO_API_KEY`, `BREVO_LIST_ID`. Do not copy the four `TINA` variables.

## Staging rehearsal

1. Push `payload-migration`. The preview deployment runs the migrations against Neon `staging`.
2. Seed the tenant and the first admin against staging:

   ```bash
   cd packages/cms
   NODE_ENV=production PAYLOAD_SECRET=<preview secret> PAYLOAD_DATABASE_URL=<staging url> TENANT_SLUG=boerengroep \
   SEED_TENANT_NAME="Stichting Boerengroep" SEED_SITE_URL=<preview origin> REVALIDATE_SECRET=<preview value> \
   SEED_ADMIN_EMAIL=<owner email> SEED_ADMIN_PASSWORD=<strong password> pnpm seed
   ```

   `NODE_ENV=production` matters. Without it Payload pushes the schema and marks the database as a
   development database, and the next migration run asks for confirmation.

3. Check out the old content next to the branch and migrate it into staging:

   ```bash
   git fetch origin && git worktree add ../bg-main origin/main
   cd tools/migrate-tina
   NODE_ENV=production PAYLOAD_SECRET=<preview secret> PAYLOAD_DATABASE_URL=<staging url> TENANT_SLUG=boerengroep \
   BLOB_READ_WRITE_TOKEN=<blob token> \
   CONTENT_DIR=$PWD/../../../bg-main/content UPLOADS_DIR=$PWD/../../../bg-main/public/uploads \
   APP_DIR=$PWD/../../apps/boerengroep \
   REPORT_PATH=$PWD/../../docs/migration/staging-report.md pnpm migrate
   ```

   - On `main` the app is still at the repository root, so the content is at `bg-main/content`.
   - Use absolute paths. The command runs inside `tools/migrate-tina`.
   - `APP_DIR` tells the tool which addresses belong to built-in routes, so menu items for the
     calendar, news lists, podcast and vacancies keep their plain address.
   - Use `origin/main`, not a local `main`. Editors publish through Tina Cloud straight to GitHub,
     so a local checkout can be weeks behind the live site.
   - The run is safe to repeat. A second run updates and never duplicates.

4. Compare `staging-report.md` with `2026-boerengroep-dry-run-review.md`. Entries for content that
   editors added since the dry run are expected. Every new entry needs a decision, and there must be
   no `error` entries.
5. Redeploy the preview so pages are generated from the migrated data.
6. `node tools/url-parity/check.mjs <preview origin> docs/migration/boerengroep-urls.txt` must report 0 failed.
   The list was collected from the live site on 2026-10-08. Refresh it on rehearsal day:
   `node tools/url-parity/collect.mjs https://www.boerengroep.nl docs/migration/boerengroep-url-candidates.txt docs/migration/boerengroep-urls.txt`.
   Note the line about redirects that carried the Location header twice. Locally that happens on
   the first, uncached response of each redirect. Record whether Vercel shows it too.
7. `E2E_BASE_URL=<preview origin> pnpm --filter boerengroep e2e` must pass. Some checks name
   content from the dry run, such as the vacancy "General Board Member". Adjust them if editors
   changed that content.
8. Create one editor account per person in the admin under Users, with role Editor on Boerengroep.
   Ask each editor to log in on the preview and edit a draft page.

## Cutover day

1. Announce the content freeze. From now on nobody edits in Tina.
2. `git fetch origin && git -C ../bg-main checkout --detach origin/main` to get the last Tina content commits.
3. Seed production: repeat staging step 2 with the production values and the production origin.
4. Migrate into production: repeat staging step 3 with the production values. Review the report.
5. Merge `payload-migration` into `main`. The production deployment of `boerengroep-payload` runs
   the migrations, which is a no-op because step 3 already applied them, and builds.
6. Run the parity check and the smoke tests against the production deployment URL of
   `boerengroep-payload`, before it has the domain.
7. Move the production domain from the old Vercel project to `boerengroep-payload`.
8. Run the parity check once more against the real domain.
9. Set the tenant's Site URL in the admin to the real domain if it differs.

## Rollback

Move the domain back to the old Vercel project. Its last deployment still serves the Tina site from
the commit before the merge. Nothing in the old project was changed. Keep the old project and its
Tina Cloud app for two weeks, then delete both and remove the `bg-main` worktree.

Content edited in Payload after cutover is not copied back. If a rollback happens after editors
started working, list their changes from the admin's version history before deciding.

## After cutover

- Under Site settings, choose the logo image. Until then the header shows the previous logo file
  through its old address.
- Fix the entries marked `fix in admin after cutover` in `2026-boerengroep-dry-run-review.md`:
  three inline images in vacancies, and the images whose files were already missing.
- Delete the two draft placeholder pages only if their child pages move elsewhere. They keep the
  child addresses stable.
- Remove the Tina secrets from GitHub and Vercel once the old project is deleted.

## Known behaviour to be aware of

- **Old Dutch links redirect.** Menu links used to point at English addresses under `/nl`, for
  example `/nl/about-us/history`. These now redirect permanently to the Dutch address.
- **First request after a deploy.** A redirect thrown from a prebuilt page carries the Location
  header twice on its first, uncached response. Browsers follow it. Some scripts and link checkers
  do not. The second request is served from cache with a single header.
- **Pages without a Dutch version** are shown in English under their English address, as before.
- **Local development.** `pnpm --filter boerengroep dev` needs the database from
  `packages/cms/docker-compose.yml` and the variables in `apps/boerengroep/.env.local`.
  On a machine with 8 GB of memory, prefer `pnpm --filter boerengroep build` and `start`.
