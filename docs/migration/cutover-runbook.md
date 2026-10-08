# Cutover runbook

Boerengroep first. The second site, Inspringtheater, has its own section further down and goes
live after Boerengroep, because the admin panel for both lives on the Boerengroep site.

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
   The mail key is read from `RESEND_API_KEY` first. `RESEND_BOERENGROEP` is its old name and
   still works.

## Newsletter and Brevo (owner)

The site adds people to a Brevo list when they confirm their email, takes them off when they
unsubscribe and deletes them when they ask for their data to be erased. Two things are needed, in
this order. Until both are there the site keeps collecting sign-ups in its own table and nothing is lost.

1. A working key. In Brevo: your name at the top right, "SMTP & API", "API keys", create a key.
   The current local key is refused by Brevo with "API Key is not enabled". Save the new key as
   `BREVO_API_KEY` in Vercel for Production and Preview, then redeploy.
2. The list. In the admin panel open Site settings, Newsletter. The box "Does the sign-up reach
   Brevo?" shows whether the key works and names the lists of the account with their numbers. Fill
   in "Brevo list number" and save. `BREVO_LIST_ID` in Vercel is only a fallback and can stay empty.
3. In the same box press "Bring the Brevo list up to date". Everyone who confirmed while the link
   was broken is added, and everyone who unsubscribed is taken off. It is safe to press again.

If the list should record the language, create a text contact attribute named `LANGUAGE` in Brevo
(Contacts, Settings, Contact attributes). Without it people are still added, only without a language.

The subscriber database needs no change for this.

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
   FIXUPS_FILE=$PWD/../../docs/migration/boerengroep-fixups.json \
   EXTRA_UPLOADS_DIR=$PWD/../../docs/migration/boerengroep-rescued/uploads \
   REPORT_PATH=$PWD/../../docs/migration/staging-report.md pnpm migrate
   ```

   - On `main` the app is still at the repository root, so the content is at `bg-main/content`.
   - Use absolute paths. The command runs inside `tools/migrate-tina`.
   - `APP_DIR` tells the tool which addresses belong to built-in routes, so menu items for the
     calendar, news lists, podcast and vacancies keep their plain address.
   - `FIXUPS_FILE` holds the corrections the old content cannot express: the Dutch "Open Pot"
     page, the removed cookie and terms pages with their forwarding addresses, the logo, and
     the placeholder content that is left out (see "Placeholder content left out" in
     `2026-boerengroep-dry-run-review.md` and confirm that list first).
     Without it those are not applied.
   - `EXTRA_UPLOADS_DIR` adds the files that were only on Tina's own file server and not in the
     repository, see `docs/migration/boerengroep-rescued/README.md`. Links in texts that pointed
     at that server (the year plan and the year report) are turned into links to the imported
     file. A link to that server whose file is nowhere to be found shows in the report under
     `missing-media`.
   - The run ends by telling the site to forget what it showed before, and logs "Site
     refreshed". "Site not refreshed" means the site could not be reached at the address in
     its settings. See step 5.
   - Use `origin/main`, not a local `main`. Editors publish through Tina Cloud straight to GitHub,
     so a local checkout can be weeks behind the live site.
   - The run is safe to repeat. A second run updates and never duplicates.

4. Compare `staging-report.md` with `2026-boerengroep-dry-run-review.md`. Entries for content that
   editors added since the dry run are expected. Every new entry needs a decision, and there must be
   no `error` entries.
5. Open the preview and check that the home page shows the imported content. The import told
   the site to refresh (step 3). If it logged "Site not refreshed", or pages still look empty:
   in Vercel open the project, Settings, Data Cache, "Purge Everything", then redeploy. A
   redeploy alone is not enough, because Vercel keeps remembered content across deployments.
   The same holds locally: delete `apps/<app>/.next` before building after an import.
6. `node tools/url-parity/check.mjs <preview origin> docs/migration/boerengroep-urls.txt` must report 0 failed.
   The list was collected from the live site on 2026-10-08. Refresh it on rehearsal day:
   `node tools/url-parity/collect.mjs https://www.boerengroep.nl docs/migration/boerengroep-url-candidates.txt docs/migration/boerengroep-urls.txt`.
   Note the line about redirects that carried the Location header twice. Locally that happens on
   the first, uncached response of each redirect. Record whether Vercel shows it too.
7. `E2E_BASE_URL=<preview origin> pnpm --filter boerengroep e2e` must pass. Some checks name
   content from the dry run, such as the vacancy "General Board Member". Adjust them if editors
   changed that content. The run includes automated accessibility checks on each kind of page.
   Two groups of tests skip themselves unless you ask for them:
   - the block tests need a test page that carries every block. Create it with
     `TEST_PAGE_PUBLISH=1 pnpm --filter @sites/cms seed:test-page` and the same variables as the
     seed in step 2. Its texts only name the blocks. Delete the page "Test page for blocks" and
     the form "Test form" afterwards, so neither reaches production.
   - the admin test needs `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in the environment.
8. Open `<preview origin>/sitemap.xml` and `<preview origin>/robots.txt`. Every address in the
   sitemap must start with the origin you expect. A wrong origin means `NEXT_PUBLIC_SITE_URL`
   is wrong. Vercel keeps preview deployments out of search engines by itself.
9. Open `<preview origin>/calendar.ics` and one event page. Subscribe to the calendar from a
   phone once, and check that an event's "Add to my calendar" file opens.
10. Create one account per person in the admin under People and sites, People, with the role
   Editor on Boerengroep. Ask each editor to log in on the preview and edit a draft page.

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

10. Before the Tina account is closed, check that nothing on the site still points at Tina's file
    server: `pg_dump --data-only <production url> | grep -c assets.tina.io` must print 0. The
    browser test "the year plan and the year report come from this site" checks the two known
    links.

## The Inspringtheater site

The second site is the app `apps/inspringtheater`. It has no pages of its own: it shows the same
pages, blocks and calendar as Boerengroep with its own content, colours, logo and wording, and
reads from the same database. Editors use the admin panel on the Boerengroep site. Typing
`/admin` on the Inspringtheater site sends them there.

Do this after Boerengroep is live, or on staging at the same time as its rehearsal.

1. **Vercel project.** Create a project `inspringtheater-payload` from this repository with Root
   Directory `apps/inspringtheater`, Production Branch `main`, Node 22.
2. **Environment variables** on that project:

   | Name | Value |
   |---|---|
   | `PAYLOAD_DATABASE_URL` | the same database as Boerengroep (Neon `main`, or `staging` for Preview) |
   | `PAYLOAD_SECRET` | the same value as Boerengroep, per environment |
   | `TENANT_SLUG` | `inspringtheater` |
   | `NEXT_PUBLIC_SITE_URL` | the origin of this site |
   | `ADMIN_URL` | the Boerengroep origin followed by `/admin` |
   | `REVALIDATE_SECRET` | `openssl rand -hex 32`. The same value goes into the seed in step 3 |
   | `BLOB_READ_WRITE_TOKEN` | the same Blob token |
   | `DATABASE_URL`, `NEWSLETTER_SECRET`, `RESEND_API_KEY`, `FROM_EMAIL`, `FROM_NAME`, `REPLY_TO_EMAIL`, `BREVO_API_KEY`, `BREVO_LIST_ID` | this site's own newsletter list and mail settings. Never Boerengroep's: the two lists must not mix |

   Do not set `RUN_MIGRATIONS` and do not set `PODCAST_RSS_URL`. Migrations belong to the
   Boerengroep project. `PAYLOAD_SECRET` must be equal on both projects, because preview links
   and logins are signed with it.
3. **Seed the site** against the same database, with the Inspringtheater origin and its secret:

   ```bash
   cd packages/cms
   NODE_ENV=production PAYLOAD_SECRET=<secret> PAYLOAD_DATABASE_URL=<url> TENANT_SLUG=inspringtheater \
   SEED_TENANT_NAME="Inspringtheater" SEED_SITE_URL=<inspringtheater origin> REVALIDATE_SECRET=<its secret> \
   SEED_ADMIN_EMAIL=<owner email> SEED_ADMIN_PASSWORD=<same password as before> pnpm seed
   ```

   The address and the secret given here are what the admin uses to tell this site that
   something changed. If an edit in the admin does not show on the site, these two are wrong:
   correct them under People and sites, Sites.
4. **Import its content.** The old site lives in its own repository. Get read access to it,
   check out its `main`, and run the import with this site's fix-ups:

   ```bash
   git clone <inspringtheater repository> ../it-main
   cd tools/migrate-tina
   NODE_ENV=production PAYLOAD_SECRET=<secret> PAYLOAD_DATABASE_URL=<url> TENANT_SLUG=inspringtheater \
   BLOB_READ_WRITE_TOKEN=<blob token> \
   CONTENT_DIR=$PWD/../../../it-main/content UPLOADS_DIR=$PWD/../../../it-main/public/uploads \
   MESSAGES_DIR=$PWD/../../../it-main/messages APP_DIR=$PWD/../../apps/boerengroep \
   FIXUPS_FILE=$PWD/../../docs/migration/inspringtheater-fixups.json \
   REPORT_PATH=$PWD/../../docs/migration/inspringtheater-staging-report.md pnpm migrate
   ```

   `APP_DIR` stays `apps/boerengroep`: that is where the built-in routes are. `MESSAGES_DIR`
   gives the old site's own names for the kinds of events. Confirm
   `2026-inspringtheater-dry-run-review.md` first: it lists what is left out and why.
5. **Check.**
   - `node tools/url-parity/check.mjs <origin> docs/migration/inspringtheater-urls.txt` must
     report 0 failed.
   - `E2E_BASE_URL=<origin> pnpm --filter inspringtheater e2e` must pass.
   - Edit an event in the admin and see it change on the site within seconds.
   - Open a page in the admin and press the eye button: the preview opens on the
     Inspringtheater address.
6. **Go live**: move the domain to `inspringtheater-payload` and set the site's address under
   People and sites, Sites, to the real domain.

Three things only the organisation can supply before this site goes live: a privacy statement
(the old page held an unrelated text and was left out, so the newsletter box links to none), a
larger logo file if one exists (the only one is 300 pixels wide), and access to the old
repository for the last content.

When a route is added to or removed from `apps/boerengroep/app`, run
`node tools/site-routes/sync.mjs`. It writes the matching thin files in
`apps/inspringtheater/app`. A test fails when the two are out of step.

## Rollback

Move the domain back to the old Vercel project. Its last deployment still serves the Tina site from
the commit before the merge. Nothing in the old project was changed. Keep the old project and its
Tina Cloud app for two weeks, then delete both and remove the `bg-main` worktree.

Content edited in Payload after cutover is not copied back. If a rollback happens after editors
started working, list their changes from the admin's version history before deciding.

## After cutover

- Under Site settings, General, check the logo. The import sets it from the fix-ups file.
- Under Site settings, Newsletter, follow "Newsletter and Brevo" above: the check at the top of
  that tab says what is still missing.
- Four events in the old content end before they start, for example "Lecture series" on
  7 October. The site shows them with their start only. Correct the end dates under Calendar, Events.
- Every page now has its own title and description for search engines and link previews. The
  description is the line under the headline of the page's opening block, or else its first
  paragraph. Two texts are worth a look, because they now show in search results:
  the Dutch home page says "De website is nog onder constructie ;)", and pages without any
  text fall back to the site-wide "Wageningen's peasant association | Celebrating 50 years!",
  which is set in `apps/boerengroep/app/[locale]/layout.tsx`. Filling in the one-line
  introduction under Site settings, General replaces that fallback.
- Three vacancies hold their English and their Dutch in one text, for example "Secretary /
  Secretaris". A vacancy is now one post in two languages: move the Dutch part of each to the
  Dutch version (language switch at the top right of the vacancy).
- The kinds of events were made from the old fixed list. Rename, recolour or merge them under
  Calendar, Kinds of events. "Talk" and "Lecture" are separate kinds, as they were.
- If the organisation has its symbol (the logo without lettering) as original artwork, upload
  it under Site settings, General. Until then the site uses a redrawn one, see
  `tools/brand-symbol/README.md`.
- Submit `<site>/sitemap.xml` in Google Search Console. The old site had no sitemap.
- Tell people about the calendar address `<site>/calendar.ics`, or simply point them at the
  "Subscribe to our calendar" button on the calendar page.
- The home page now carries two blocks that fill themselves, added by the import: "Latest news"
  after the events and "Open positions" after the announcement. Move or remove them on the
  page "Home" like any block. A third one, "In the spotlight", is there for whatever you want
  to put first: see the editing guide, "What shows on the home page".
- One file was left on Tina's file server on purpose: a 12.6 MB PDF attached to the vacancy
  "Food.Film.Fest Volunteer", which closed in September 2025. Its name says it is about opening
  hours, not about the vacancy. If it is wanted, download it before the Tina account is closed
  and attach it to the vacancy: see "Files" in `2026-boerengroep-dry-run-review.md`.
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
- **One admin for both sites.** The admin panel lives on the Boerengroep site at `/admin`.
  People who work on both sites choose the site with two tabs. The Inspringtheater site
  forwards its `/admin` there. A preview of an Inspringtheater page opens on that site through
  a signed link that is valid for twelve hours.
- **Links that leave the site** (calendar files, the subscribe address, share links and previews)
  are built from `NEXT_PUBLIC_SITE_URL`. A wrong value there shows up as links to the wrong domain.
- **Emails from forms** are only sent when an editor adds one on a form, and they go out through
  the same mail settings as password resets.
- **The database has one migration**, `20261008_162747_initial`. From the first deployment on,
  every later change to the content model is a new, additive migration next to it.
- **Browser tests are not part of CI.** CI runs lint, typecheck, the unit tests, the database
  tests and the migration check. The browser tests (behaviour, twelve screen widths,
  accessibility: 120 for Boerengroep, and the shared ones plus its own for Inspringtheater) need
  a built site with content, and until cutover that content lives on `main`. Run them by hand
  against the preview before every cutover-sized change:
  `E2E_BASE_URL=<origin> pnpm --filter boerengroep e2e` and
  `E2E_BASE_URL=<origin> pnpm --filter inspringtheater e2e`.
- **Removed things can forward.** A forwarding address (Site settings, Forwarding addresses)
  works for removed pages and for removed news items.
- **Empty lists stay out of the sitemap.** The news lists, the stories, the podcast and the
  vacancies page are only offered to search engines once they have something in them.
- **Local development.** `pnpm --filter boerengroep dev` needs the database from
  `packages/cms/docker-compose.yml` and the variables in `apps/boerengroep/.env.local`.
  On a machine with 8 GB of memory, prefer `pnpm --filter boerengroep build` and `start`.
  The build keeps a compiler cache of up to 1.5 GB in `apps/boerengroep/.next/cache/webpack`.
  It is safe to delete when the disk is short.
