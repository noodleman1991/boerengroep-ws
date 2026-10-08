# Execution log: Payload migration, Plans A to C

Date: 2026-10-08. Branch: `payload-migration`. This is the working ledger kept during execution.
Each `Ruling:` line is a decision taken where the plan was wrong, silent or contradicted by what the code and content showed,
with its reason and what it costs if it is wrong.

---

## Ledger for docs/superpowers/plans/2026-10-03-plan-a-cms-foundation.md

Spec: docs/superpowers/specs/2026-10-03-payload-multi-tenant-migration-design.md (section 16 overrides)
Setup: Ruling: work on branch `payload-migration` in place, no separate worktree — the plan's Task 1 creates this branch and moves untracked .env files that a worktree would not carry — cost if wrong: main checkout is occupied by the branch until switched back.
Setup: Ruling: started OrbStack to provide the Docker daemon the integration tests need — cost if wrong: a background app is running.

Pre-flight (shared interfaces):
- T3 produces createPayloadConfig/tenantScoped/onePerTenant; T6-T9 extend tenantScoped — consistent.
- T3 produces testPayload/resetDb/createTenant; T4,T6-T10 consume — consistent. resetDb passes context skipResave/disableRevalidate used by T7 hook — consistent.
- T4 produces relId/isSuperAdmin/tenantIdsWithRole + access fns; T6-T9 consume anyone/authenticated/publishedOrAuthenticated/tenantAdminsOnly — all defined in T4 Step 5.
- T5 produces pageBlocks/articleBlocks + shared fields; T7 uses pageBlocks, T8 articleBlocks/languageField/slugField/legacyIdField — consistent. Blocks reference relationTo 'media' (T6) before it exists: unit test in T5 does not build config, so OK; T5 int suite not run until T6 registers media.
- T10 consumes createPayloadConfig; ensureTenantAndAdmin new — consistent.
Pre-flight: no conflicts found.
Task 1: Ruling: `pnpm build-local` is broken on main before any change (OOM at default heap; then ECONNREFUSED because the Tina local server exits before `next build` collects page data) — baseline and all later Tina-era build checks use `NODE_OPTIONS=--max-old-space-size=8192 pnpm exec tinacms dev -c "next build"` instead — cost if wrong: a build difference between local-server mode and Tina Cloud mode goes unnoticed until the staging deploy.
Task 1: note: machine has 8 GB RAM; a full build takes ~10 min. Installed next is 15.5.7 (caret), Payload needs <15.5 — Task 2 pins ~15.4.11 as planned.
Task 1: IN PROGRESS — steps 1-7 done on branch payload-migration (uncommitted). Step 8 (install + build of moved app) was killed by the harness for low system memory; not restarted. Resume at Step 8: `pnpm install && pnpm --filter boerengroep build-local`, compare routes with baseline-routes.txt, then typecheck, then commit.
Task 1: Ruling: Step 8's full build of the moved app is folded into Task 2 Step 3 (one build covers the move and the upgrade); Task 1 is verified by `tsc --noEmit` (0 errors) — the 8 GB machine was reaped for memory during the build — cost if wrong: a build failure in Task 2 could come from either the move or the upgrade and needs bisecting.
Task 1: Ruling: app script `build-local` replaced with `NODE_OPTIONS=--max-old-space-size=8192 tinacms dev -c "env NODE_ENV=production next build"`; `.superpowers/` added to root .gitignore — cost if wrong: none beyond a script name.
Task 1: complete (commits 25e6ed3..8e573f0, tests: pnpm --filter boerengroep typecheck → > tsc --noEmit)
Task 2: evidence: build on next 15.4.11 / react 19.3.0 exit 0, 104 pages, route list identical to baseline (only chunk hashes differ), same 3 pre-existing error lines as baseline. Smoke: 7 pages 200, unknown page 404.
Task 2: Ruling: Step 4 smoke ran against `tinacms dev -c "next start"` on the built output instead of `pnpm dev` — the dev server needs far more memory on this 8 GB machine — cost if wrong: a dev-mode-only regression (HMR, turbopack) is not seen until someone runs `pnpm dev`.
Note for later tasks: `next start` alone 500s/404s on CMS pages because ISR refetches from the Tina local server; always wrap with `tinacms dev -c` while Tina is in place.
Task 2: complete (commits 8e573f0..2d1faf6, tests: pnpm --filter boerengroep typecheck → > tsc --noEmit)
Task 3: complete (commits 2d1faf6..edae222, tests: pnpm --filter @sites/cms exec vitest run --project int →    Duration  27.53s (transform 354ms, setup 28ms, collect 13.07s, tests 12.78s, environment 0ms, prepare 617ms))
Task 3: Ruling: plan's vitest config put `fileParallelism` inside a project (not a valid per-project option) and helpers.ts had a CollectionSlug/string mismatch — moved `fileParallelism: false` to the root `test` block and typed `slugs` as string[] — committed as a follow-up fix because the first Task 3 commit went in with these 2 type errors (my command chain did not stop on them) — cost if wrong: unit tests also run serially (they are fast). Same vitest fix applies to Plan B Task 1.
Task 4: Ruling: plan's test emails like root@test fail Payload's email validation — use @site.test in all tests (also seed/settings tests later) — cost if wrong: none, test data only.
Task 4: Ruling: the multi-tenant plugin's default field access lets only super admins write a user's `tenants`, silently dropping it for others — that contradicts spec §6 (tenant admins manage their tenant's users). Overrode `arrayFieldAccess` with `canAssignTenants` (super admin or tenant admin anywhere) and rewrote the guard hook to be diff-based: memberships in tenants the actor does not administer must arrive unchanged (blocks adding, removing and role changes in foreign tenants; allows full control in own tenants). Added 6 tests beyond the plan. — cost if wrong: tenant admins could not add editors (too strict) or could alter foreign memberships (too loose); both directions are now pinned by tests.
Task 4: Ruling: an editor's attempt to change their own memberships is ignored (Payload keeps the stored value when field access denies), not rejected with 403 — test asserts the stored result — cost if wrong: an editor gets no error message for a change that did not apply.
Task 4: note: access/index.ts where-returns typed as `Where` to satisfy AccessResult.
Task 4: complete (commits edae222..b63b736, tests: pnpm --filter @sites/cms exec vitest run →    Duration  11.62s (transform 239ms, setup 29ms, collect 3.41s, tests 6.80s, environment 0ms, prepare 653ms))
Task 5: Ruling: blocks reference relationTo 'media' before Task 6 registers it, so tsc fails on 3 lines until types are regenerated — committed on green unit tests; typecheck gate moves to the end of Task 6 — cost if wrong: one commit in history that does not typecheck.
Task 5: complete (commits b63b736..13c05b7, tests: pnpm --filter @sites/cms exec vitest run --project unit →    Duration  2.46s (transform 477ms, setup 0ms, collect 361ms, tests 18ms, environment 1ms, prepare 839ms))
Task 6: Ruling: tightened the anonymous-upload test to expect /not allowed/ — the plan's bare toThrow() passed before the collection existed — cost if wrong: test breaks if Payload rewords its Forbidden message.
Task 6: complete (commits 13c05b7..698b8b5, tests: pnpm --filter @sites/cms exec vitest run →    Duration  10.17s (transform 126ms, setup 9ms, collect 5.47s, tests 3.76s, environment 0ms, prepare 267ms))
Task 7: Ruling: re-saving a child that has no version in the locale failed validation (required localized title). resaveChildren now reads children with fallbackLocale false and skips those without a slug in that locale. Rule: a page with no Dutch version has no Dutch path; it stays reachable in Dutch under its English address via the fallback (Plan C resolvePage). Plan's descendant test rewritten into 3 tests (translated chain follows parent; untranslated child untouched; translated child under untranslated parent). — cost if wrong: an untranslated child of a renamed Dutch parent is not reachable under the Dutch parent URL, only under the English one.
Task 7: Ruling: Payload's ValidationError message is generic ("The following field is invalid: slug"); the readable text is in error.data.errors[0].message — duplicate-path and bad-slug tests assert on that/field name — cost if wrong: none.
Task 7: complete (commits 698b8b5..96fdd8f, tests: pnpm --filter @sites/cms exec vitest run →    Duration  12.18s (transform 150ms, setup 9ms, collect 5.93s, tests 5.08s, environment 1ms, prepare 314ms))
Task 8: note: bad-event-type test tightened to /Event Type/ (bare toThrow passed vacuously in RED).
Task 8: complete (commits 96fdd8f..0547eb4, tests: pnpm --filter @sites/cms exec vitest run →    Duration  12.79s (transform 131ms, setup 9ms, collect 4.43s, tests 7.24s, environment 1ms, prepare 265ms))
Task 9: note: three assertions tightened (/not allowed/, /From URL/, duplicate-redirect message read from error.data.errors[0]).
Task 9: complete (commits 0547eb4..d1ef391, tests: pnpm --filter @sites/cms exec vitest run →    Duration  16.29s (transform 128ms, setup 9ms, collect 5.00s, tests 9.96s, environment 1ms, prepare 296ms))
Task 10: Ruling: `payload` CLI run with the app's payload.config.ts fails (ERR_MODULE_NOT_FOUND on extension-less imports inside @sites/cms when entered from the CommonJS app). App script `payload` now sets PAYLOAD_CONFIG_PATH=../../packages/cms/src/dev.config.ts, so every CLI command (importmap, migrate) uses the shared package's config while cwd/env stay the app's. The app's payload.config.ts is used only by Next at runtime. — cost if wrong: a CLI command that needs app-only options (revalidateLocal) would not see them; none does today.
Task 10: Ruling: added `sass` devDependency to the app — the template's custom.scss needs it and pnpm does not hoist it — cost if wrong: one unused dev dependency.
Task 10: Ruling: Step 8's dev-server probe is replaced by build + `tinacms dev -c "next start"` probes (memory), run in Step 17 order after the migration exists; local app DB is `payload_dev` (migrated), not the test DB that tests wipe.
Task 10: Ruling: app also depends directly on @payloadcms/plugin-multi-tenant and @payloadcms/storage-vercel-blob — the generated admin importMap imports their client entry points and pnpm does not hoist — cost if wrong: none.
Task 10: Ruling: `node --test <dir>/` does not run a directory on Node 24 — use the glob form `node --test "tools/check-migrations/*.test.mjs"` (package script and CI) — cost if wrong: none.
Task 10: fixed find-destructive: contract-ok reason must be on the marker's own line (plan's regex matched across the newline; caught by the plan's own test).
Task 10: Ruling: CI typecheck excludes the app (`turbo run typecheck --filter=!boerengroep`) because Tina's generated client is git-ignored and absent in CI; switch back to `pnpm typecheck` in Plan C Task 9 — cost if wrong: app type errors are not caught in CI during the Tina period (they are caught locally and by the Vercel build).
Task 10: note: `.github/workflows/update-dependabot-pr.yml` and `.github/dependabot.yml` are Tina-only; remove in Plan C Task 9.
Task 10: note: after `pnpm add` in one workspace package the other kept stale links to a second payload instance (graphql 15 vs 16) causing TS2321 in the admin layout; a plain `pnpm install` relinked to one instance. Verified: 1 distinct instance each of payload, @payloadcms/ui, next reachable from the app. Also replaced the user cast in config.ts with isSuperAdmin(user as unknown as AccessUser) (TS2352 in app context).
Task 10: evidence: build exit 0 (106 pages incl. /admin and /api/[...slug]); probes on `next start`: /admin 200, /api/tenants 403 anonymous, /en 200, /nl/over-ons/geschiedenis 200, POST /api/newsletter/subscribe 400 (not shadowed by Payload catch-all), admin login via REST returns a token and lists tenant boerengroep. Local DB payload_dev migrated (1 migration) and seeded; local admin credentials are in apps/boerengroep/.env.local (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD).
Task 10: note: running Payload CLI/seed without NODE_ENV=production against a migrated DB adds a `dev` row to payload_migrations (schema push); removed it. Run CLI against payload_dev with NODE_ENV=production.
Task 10: complete (commits d1ef391..1a01705, tests: pnpm --filter @sites/cms exec vitest run →    Duration  21.84s (transform 164ms, setup 10ms, collect 7.62s, tests 12.69s, environment 1ms, prepare 376ms))
Post-plan: added test/isolation.int.test.ts (7 tests) to pin Review Focus item 4 for content collections — the plan claimed Task 4 pinned it but Task 4 only covered users/tenants. These are characterization tests of the plugin's enforcement (passed on first run; no RED). Finding: the anonymous REST API returns published docs of both tenants; acceptable (public content), frontends use the tenant-bound query layer.
Plan A: all 10 tasks complete. Admin UI not yet looked at in a browser (API-verified only) — visual check scheduled after Plan B loads content.
Final review for Plan A deferred to one whole-branch self-review after Plan C (user chose no agents).

---

## Ledger for docs/superpowers/plans/2026-10-03-plan-b-content-migration.md

Spec: docs/superpowers/specs/2026-10-03-payload-multi-tenant-migration-design.md (section 16 overrides)
Carried rulings from Plan A that affect this plan:
- vitest: `fileParallelism: false` goes at the root `test` block, not inside a project.
- test emails must have a TLD (use @site.test).
- Payload ValidationError messages are generic; assert on error.data.errors[0].
- Payload CLI: run with PAYLOAD_CONFIG_PATH pointing at an ESM config inside the package; against a migrated DB use NODE_ENV=production to avoid a schema push.
- Pages: a child without a version in a locale has no path in that locale (resaveChildren skips it).
- Run long commands with `set -o pipefail`; do not let `| tail` hide a failing exit code.
- After `pnpm add`, run a plain `pnpm install` so every workspace package links to the same payload instance.

Pre-flight (shared interfaces):
- T1 Report/listContent/readTinaFile/fileSlug/pageSlug consumed by T2-T8 — consistent.
- T2 Ctx/upsert/refId consumed by T3-T8 — consistent; Ctx.toLexical signature matches T3 makeToLexical.
- T4 resolveMedia(ctx,value,legacyId) consumed by T5,T7 — consistent.
- T6 planPages(files, report) consumed by T7 importPages — consistent.
- T7 importers consumed by T8 migrate — names match.
- T8 imports createTenant/resetDb/testPayload from @sites/cms/testing — export added in T1.
Pre-flight: no conflicts found.
Task 1: complete (commits 87d42cc..daf3f2a, tests: pnpm --filter @sites/migrate-tina exec vitest run --project unit →    Duration  590ms (transform 46ms, setup 0ms, collect 81ms, tests 8ms, environment 0ms, prepare 123ms))
Task 2: complete (commits daf3f2a..8f084ba, tests: pnpm --filter @sites/migrate-tina exec vitest run --project unit →    Duration  751ms (transform 47ms, setup 0ms, collect 78ms, tests 9ms, environment 0ms, prepare 155ms))
Task 3: complete (commits 8f084ba..e2b55d0, tests: pnpm --filter @sites/migrate-tina exec vitest run --project unit →    Duration  1.49s (transform 51ms, setup 0ms, collect 662ms, tests 12ms, environment 0ms, prepare 183ms))
Task 4: complete (commits e2b55d0..63198a4, tests: pnpm --filter @sites/migrate-tina exec vitest run --project unit →    Duration  1.63s (transform 75ms, setup 0ms, collect 770ms, tests 16ms, environment 0ms, prepare 225ms))
Task 5: complete (commits 63198a4..11b0694, tests: pnpm --filter @sites/migrate-tina exec vitest run --project unit →    Duration  1.59s (transform 66ms, setup 0ms, collect 715ms, tests 18ms, environment 1ms, prepare 232ms))
Task 6: Ruling: two plan tests used toMatchObject with an expected undefined, which requires the key to exist; planner omits absent keys — asserted with toBeUndefined() instead — cost if wrong: none.
Task 6: Ruling (from Step 5 check on real content): the planner as written mis-paired real pages. Fixed test-first (4 new tests): (a) pairing tries every spelling where each segment is translated or left as is, fully translated first (nieuws/friends-news, nieuws/newsletter); (b) added breaks→pauzes and open-meetings→open-vergaderingen to SEGMENT_NL; (c) a Dutch-only file whose key equals an already planned page is reported as shadowed and skipped instead of overwriting the pair (pages/nl/library/agroecologie-netwerk.mdx is a stray copy of nl/bibliotheek/...). Result on real content: 33 plans = 30 pairs + accessibility (en only) + 2 draft placeholders (/news, /activities/calendar-sections). — cost if wrong: a wrong pair merges two unrelated pages into one document; the dry-run report lists every pair decision for review.
Task 6: note: old URL /nl/library/agroecologie-netwerk keeps working through resolvePage's cross-locale redirect (its path equals the page's English path).
Task 6: complete (commits 11b0694..3663400, tests: pnpm --filter @sites/migrate-tina exec vitest run --project unit →    Duration  1.76s (transform 77ms, setup 0ms, collect 689ms, tests 30ms, environment 1ms, prepare 280ms))
Task 7+8: Ruling: executed together test-first (fixture + test RED on missing ../src/migrate, then importers + migrate + run → 14/14 GREEN on the first run); plan had Task 7's code written before Task 8's test — cost if wrong: none.
Task 8: complete (commits 3663400..c076795, tests: pnpm --filter @sites/migrate-tina exec vitest run →    Duration  6.45s (transform 157ms, setup 6ms, collect 1.86s, tests 3.42s, environment 1ms, prepare 292ms))
Task 9: Ruling: added MEDIA_DIR (media collection staticDir) so the app and CLI tools share one local uploads folder when no Blob token is set; test added RED→GREEN in packages/cms; local value <repo>/.media (git-ignored) — cost if wrong: none in production, Blob is used there.
Task 9: Ruling: menu/footer items are linked to a page only when the page is not a draft placeholder and the address is not served by a built-in route (new `reservedPaths` input, `APP_DIR` env, `listAppRoutes`); found on the real data, where `/news` and `/vacancies` items would have pointed Dutch visitors at different pages than today. 3 unit tests + 2 integration tests added RED→GREEN. — cost if wrong: a menu item keeps a plain href and does not follow a renamed page; editors can link it in the admin.
Task 9: Ruling: Step 5 "review with the site owner" cannot be done by me; wrote docs/migration/2026-boerengroep-dry-run-review.md with a proposed decision per entry, marked as needing owner confirmation — cost if wrong: owner disagrees with a pairing or an accepted omission; rerun is idempotent.
Task 9: evidence: real run exit 0, counts equal source for every collection (pages 33, events 26, newsletters 4, vacancies 3, past-events 2, speakers 6, authors 4, tags 3, media 68), second and third run identical, 23 report entries, 0 errors.
Task 9: finding for Plan C Task 5: components/logo.tsx hardcodes /uploads/branding/boerengroep-logo-zwart.png (2 places); it must keep working after public/uploads is removed (legacy redirect route) or use the settings logo.
Task 9: complete (commits c076795..c0d2b58, tests: pnpm --filter @sites/migrate-tina exec vitest run →    Duration  8.27s (transform 203ms, setup 11ms, collect 2.51s, tests 4.38s, environment 1ms, prepare 358ms))
Task 7: complete (commits 3663400..c076795, shared commit with Task 8; tests: tsc --noEmit exit 0 and Task 8's 14 integration tests)

---

## Ledger for docs/superpowers/plans/2026-10-03-plan-c-frontend-cutover.md

Spec: docs/superpowers/specs/2026-10-03-payload-multi-tenant-migration-design.md (section 16 overrides)
Carried rulings from Plans A and B that affect this plan:
- Machine has 8 GB RAM. Prefer typecheck + tests per task; full builds only where a task cannot be verified otherwise; use `next start` on a build instead of `next dev` for probes.
- While Tina is in place, builds use `pnpm --filter boerengroep build-local` (tina dev wrapping next build) and probes use `tinacms dev -c "next start"`.
- Payload CLI in the app: `pnpm payload ...` uses the shared package's dev.config (PAYLOAD_CONFIG_PATH). Against payload_dev use NODE_ENV=production.
- vitest `fileParallelism: false` at root; test emails @site.test; ValidationError details in error.data.errors[0].
- Pages: a page with no version in a locale has no path in that locale; served under its English address through the fallback.
- Local DB payload_dev holds the migrated Boerengroep content; local uploads in <repo>/.media via MEDIA_DIR; local admin credentials in apps/boerengroep/.env.local.
- Menu items point to pages only for real pages not owned by built-in routes; adapters must use page.path when linked, else href.
- components/logo.tsx hardcodes /uploads/branding/boerengroep-logo-zwart.png (Task 5/9 must keep it working).
- CI typecheck excludes the app until Tina is removed (restore `pnpm typecheck` in Task 9); also remove .github/workflows/update-dependabot-pr.yml and .github/dependabot.yml then.
- Use `set -o pipefail`; `node --test` needs a glob, not a directory.

Pre-flight (shared interfaces):
- T1 createQueries → T3 lib/cms.ts binds it; T6/T7/T8 consume cms.* names (resolvePage, getPageByEnglishPath, listPagePaths, getSiteSettings, listEvents, listNewsletters, getNewsletter, listPastEvents, getPastEvent, listVacancies, findRedirect, getMediaByLegacyPath) — all defined in T1.
- T2 withRevalidation/revalidateTenant uses CmsCustom.revalidateLocal (Plan A config) — consistent; T3 passes revalidateLocal.
- T3 adapters (mediaUrl, asConnection, toCalendarEvent, toNewsletterNode, toVacancyNode, toPastEventNode, toGlobalSettings, GlobalSettings, CalendarEvent) consumed by T4-T7 — names match.
- T4 RichText/Blocks consumed by T6/T7 — consistent.
- T6 writes url candidates consumed by T10 — consistent.
- Conflict: T6 Step 1 candidates.mjs reads apps/boerengroep/i18n/routing.ts and content/ before T6 replaces routing and T9 deletes content — order inside T6 is correct.
- Conflict: T1 test expects resolvePage('nl','/accessibility') to return the page with fallback content; with Plan A's ruling its Dutch path is empty, which the T1 code handles (returns page when localized.path is empty). Consistent.
Pre-flight: no blocking conflicts.
Task 1: complete (commits c0d2b58..d9f0073, tests: pnpm --filter @sites/cms exec vitest run →    Duration  23.32s (transform 156ms, setup 17ms, collect 7.64s, tests 14.04s, environment 1ms, prepare 374ms))
Task 2: Ruling: extracted the live preview address into a tested pure function pagePreviewUrl(path, localeCode) (3 unit tests RED→GREEN) instead of the plan's inline closure — cost if wrong: none.
Task 2: complete (commits d9f0073..758df2b, tests: pnpm --filter @sites/cms exec vitest run →    Duration  23.61s (transform 161ms, setup 17ms, collect 7.33s, tests 14.44s, environment 1ms, prepare 429ms))
Task 3: Ruling: Step 9's live probe of /api/revalidate is deferred to the next full build (after Task 7) to avoid an extra 10-minute build on this machine; its auth and tag filtering are unit-tested — cost if wrong: a wiring mistake in the 13-line route is found two tasks later.
Task 4: Ruling: Tasks 4-8 convert coupled files, so the app does not typecheck as a whole between them (tina/collection/* still imports removed schemas until Task 9; routes are rewritten in Tasks 6-7). Per-task gate for Tasks 4-8: no type errors in the files that task owns, plus unit tests. Whole-app typecheck and build gate moves to the end of Task 7 (routes) and Task 9 (Tina removed). — cost if wrong: intermediate commits are not buildable; bisecting inside this range needs care.
Task 4: note: conversion done by script (rules 1-5 of the plan), 29 edit markers removed, 5 TinaMarkdown elements replaced; also removed a commented-out CardDecorator block in features.tsx that still mentioned tinaField; removed tailwindBackgroundOptions (unused after the schema field was deleted).
Task 4: complete (commit 71ab4ff; gate: 0 type errors in components/blocks, components/rich-text.tsx, section.tsx, script-copy-btn.tsx; app unit tests 20/20)
Task 5: Ruling: logo. Header and footer showed a hardcoded image and ignored the settings field; the footer would have fallen back to plain text because the migrated settings have no logo (its file is missing in the source). Introduced FALLBACK_LOGO (the legacy upload path, redirected by the upload route after Task 9), used `settings logo || FALLBACK_LOGO` in Logo, HeaderLogo and useGlobalLogo, and hasLogo is always true — keeps today's rendering and makes the Site settings logo work — cost if wrong: if the legacy redirect fails the logo breaks; covered by the smoke test added in Task 10.
Task 5: complete (commit 38f4f56; gate: 0 type errors in components/layout and components/logo.tsx; 6 header label edits)
Task 6: Ruling: the generated routing.ts held only identity entries (every key equals its value), so next-intl translated no route names. The hand-maintained routing.ts has locales and defaultLocale and no `pathnames` block, instead of the plan's "keep entries for built-in routes" — cost if wrong: typed pathnames are gone (code already cast hrefs `as any`); behaviour is unchanged because identity entries did nothing.
Task 6: note: URL candidates built from both the committed and the regenerated routing file (200 lines) → docs/migration/boerengroep-url-candidates.txt.
Task 6: complete except Step 7 probes (commit 4264a1d; gate: 0 type errors in the catch-all route, home route, routing; url-parity tests 3/3). Step 7 probes run after Task 7 on one build.
Task 7: Ruling: the vacancies page and the event dialog decided "has content" by inspecting Tina's rich text shape (content.children / type 'p'), which is always false for Lexical data and would have hidden every migrated section. Added lib/rich-text-utils.ts `hasRichText` (7 unit tests RED→GREEN) and used it in both places — not in the plan — cost if wrong: an empty section renders an empty heading, or a filled one is hidden; pinned by tests.
Task 7: Ruling: adapters: newsletter author now carries `affiliation` (the detail page shows it); theme.color defaults to 'blue' when settings are missing (components index colour maps by it; same default as the old layout context). Both test-first.
Task 7: Ruling: components/icon.tsx lost its `tinaField` prop and two data-tina-field spreads (not listed in the plan).
Task 7: Ruling: the build + probes of Steps 10 (and Task 6 Step 7, Task 3 Step 9) cannot run yet: `tina/collection/*` no longer compiles and `build-local` wraps the Tina dev server. They run once after Task 9 removes Tina. Gate here: 0 type errors outside tina/, no Tina imports in app/components/lib, 28 app unit tests. — cost if wrong: route-level mistakes surface two tasks later.
Task 7: complete except probes (commit ed88609)
Task 8: complete except Step 7 probes (commit 9ef4f27; safe-path 6 tests RED→GREEN; 34 app unit tests; probes run after Task 9)
Task 9: note: I ran a stray `git stash && git checkout <old> -- . && git stash pop` inside a diagnostic command; it conflicted. Recovered with reset --hard HEAD + stash apply (Tasks 1-8 were committed; Task 9 changes were in the stash). No work lost. Lesson: never chain git state changes into read-only diagnostics.
Task 9: Ruling (found by the deferred probes): after the swap the build prerendered 0 pages; every route silently rendered per request, and /news/newsletter/[...slug] (nothing to prebuild, all four newsletters are friends' news) returned 500 DYNAMIC_SERVER_USAGE. Root cause: `getLocale()` in the shared Layout (added in Task 5) makes next-intl read request headers unless the locale is set explicitly. Fix: `setRequestLocale(locale)` in app/[locale]/layout.tsx and in all 16 pages (next-intl's documented requirement for static rendering). Evidence: prerender manifest 0 → 83 routes; the failing route now answers 404 for a friends item and for an unknown slug, as the old site did. — cost if wrong: a future page that forgets setRequestLocale and uses next-intl server APIs without an explicit locale turns its route dynamic again; the smoke test in Task 10 gets a check that pages are served from the prerender cache.
Task 9: Ruling: also removed .github/workflows/update-dependabot-pr.yml and .github/dependabot.yml (Tina-only), restored `pnpm typecheck` for all packages in CI, removed the @udecode/plate-core override.
Task 9 + deferred probes — evidence on `next build` + `next start` against payload_dev:
- build exit 0, compile 48 s, 83 prerendered routes.
- T6 Step 7: /en 200, /nl 200, /en/about-us/history 200, /nl/over-ons/geschiedenis 200, /nl/about-us/history 308→/nl/over-ons/geschiedenis, /en/over-ons/geschiedenis 308→/en/about-us/history, /en/accessibility 200, /nl/accessibility 200 (English fallback), /en/activities/calendar-sections 404 (draft placeholder), unknown 404, /nl/library/agroecologie-netwerk 308→/nl/bibliotheek/agroecologie-netwerk.
- T7 Step 10: calendar, news lists, past events list+detail, vacancies (en, nl), /nl/vacatures, friends detail, podcast: all 200; main-newsletter detail for a friends item 404.
- T3 Step 9: /api/revalidate wrong/no secret 401; valid secret returns only own-tenant string tags.
- T8 Step 7: /api/preview anonymous 401, off-site target 400, no path 400, logged-in admin 307 to the page.
- T9 Step 7: /uploads/1030.jpeg 308→media, logo path 308, missing 404, name with space 308; media file 200 image/jpeg; next/image optimizer 200.
- HTML content: hero text, localized menu hrefs (/nl/over-ons/..., built-in routes keep /nl/activities/calendar), calendar events, Dutch calendar sections present, past-event author, vacancy titles.
Task 9: complete (commit d64b98a)
Task 10: Ruling: parity list collected from the live site https://www.boerengroep.nl (it is this Next + Tina app): 159 of 200 candidates work there → docs/migration/boerengroep-urls.txt is the acceptance list.
Task 10: Ruling (found by the parity check): Next 15.4 sends the Location header twice on the first, uncached response of a redirect thrown from a statically generated page. Browsers accept an identical duplicate; fetch-style clients join them into an invalid address. Not caused by our code. The probe now collapses identical duplicates like a browser (location.mjs, 5 tests) and the check prints how many it saw (21 on a cold cache, 0 on the second pass). — cost if wrong: a non-browser client that merges duplicate headers gets a 404 on the very first request for a legacy address after a deploy; to be re-measured on the Vercel preview, whose proxy may normalise it. Listed as a deferred minor.
Task 10: Ruling (found by the parity check): an address mixing Dutch and English segments (/nl/activiteiten/agenda-secties/soup-kitchen) worked on the old site through its segment table. Added step 3 to resolvePage: match segment by segment against slugs in any locale, parents may be drafts, then redirect to the localized path (3 integration tests RED→GREEN). — cost if wrong: extra queries on a 404 (cached per address).
Task 10: Ruling (found by the smoke tests): the catch-all content route prebuilt /en/vacancies, /en/news/friends-news, /en/news/newsletter and /en/library/podcast, replacing the built-in pages (a CMS page exists at the same address; the old code avoided it by accident through an `index` segment). Added lib/reserved-paths.ts with RESERVED_PATHS/RESERVED_PREFIXES, isReservedPath and contentStaticParams; a test compares the lists with the route folders on disk so they cannot drift (5 tests RED→GREEN). — cost if wrong: a built-in page is replaced by a CMS page at build time; pinned by a unit test and a smoke test.
Task 10: Ruling: smoke tests adjusted to the real content (all four newsletters are friends' news; dropdown links are not in the DOM until opened) and extended from 12 to 18 (built-in routes not replaced, friends item not under the main newsletter address, header logo loads, old upload delivers the file, mixed-language address, pages served from the prerender cache). E2E is not in CI because it needs a built app and a content database; the runbook runs it against the preview.
Task 10: evidence: clean rebuild; parity 159 checked, 89 redirected, 0 failed (twice); Playwright 18/18; screenshots of home and admin reviewed; lint, typecheck, unit tests green.
Task 10: complete (commit ebc1037)
Task 11: Ruling: runbook and editor guide written from the plan and corrected for what execution found (NODE_ENV=production for CLI runs, absolute paths and APP_DIR for the migration, origin/main instead of local main because the live site has newer content than the local checkout, refresh of the parity list, duplicate Location note, logo setting, known behaviours). Steps 4-6 (staging rehearsal, cutover, close-out) need the owner's Vercel, Neon and DNS access and change production; not executed.
Task 11: complete for Steps 1-3 (commit 81ff91e); Steps 4-6 are owner actions.
Final review: self-review (no subagent tool used; the user chose "no agents"). A self-review by the author is weaker than a fresh reviewer.
Final: fixed tenant admin could reset the password or email of a user who also belongs to another site — test "refuses a tenant admin who changes the login of a user that also belongs to another tenant" RED→GREEN, suite 96/96.
Final: fixed tenant admin could delete a user who also belongs to another site — test "refuses a tenant admin who deletes a user that also belongs to another tenant" RED→GREEN.
Final: fixed tenant admin could edit, re-password or delete a super admin who is a member of their tenant (full takeover path) — test "refuses a tenant admin who edits or deletes a super admin that is a member of their tenant" RED→GREEN.
Final: fixed draft preview could be enabled by an editor of the other site (both sites share one users collection) — lib/preview-auth.ts canPreviewTenant, 5 tests RED→GREEN, route returns 403.
Final: fixed a save could hang when the other site does not answer during cache refresh — revalidateTenant uses AbortSignal.timeout (5 s), test "gives up on a site that does not answer" RED→GREEN.
Final: Ruling: added an optional Resend email adapter (@payloadcms/email-resend 3.90.2) so "Forgot password" works; without it Payload only logs emails and the editor guide's instruction would not work. Sender comes from the newsletter's existing RESEND_BOERENGROEP / FROM_EMAIL / FROM_NAME (lib/cms-email.ts, 3 tests RED→GREEN). The email key is not placed in config.custom. Not in the spec or the plan. — cost if wrong: one extra dependency; with the env vars absent behaviour is unchanged.
Final: verified CI can typecheck the app from a clean checkout (no next-env.d.ts, no .next): 0 errors.
Final: minor (deferred): Next 15.4 sends the Location header twice on the first uncached response of a page-level redirect; browsers accept it, some scripts do not. Re-measure on the Vercel preview.
Final: minor (deferred): unknown addresses each create a small cache entry (page lookups and /uploads lookups are cached per address); no bound on growth from random URLs.
Final: minor (deferred): no root README describing the monorepo layout and commands; the runbook covers local development briefly.
Final: minor (deferred): `pnpm --filter boerengroep dev` (turbopack dev server) was never run on this 8 GB machine; all verification used build + start.
Final: minor (deferred): icon and colour pickers are plain text fields (spec amendment 10).
Final: minor (deferred): the Playwright suite is not in CI; it needs a built app and a content database. The runbook runs it against the preview.
Final: minor (deferred): `tsx` and `@svgr/webpack` remain in the app's devDependencies and may be unused now.
Final: evidence on the last commit: lint clean; typecheck 3/3; unit tests app 47, cms 25, migrate-tina 54, url-parity 15, check-migrations 6; integration cms 96 (incl. unit), migrate-tina 70 (incl. unit); build exit 0 with 83 prerendered routes; parity 159 checked 0 failed; Playwright 18/18; 0 server errors.

---

## Round 2: site improvements (plan `docs/superpowers/plans/2026-10-08-site-improvements.md`)

Started 2026-10-08. Decisions from the owner: admin inside the Boerengroep site; Brevo code fixed now, key and list added later; defaults accepted for the remaining questions; extra page-building blocks and a clearly explained admin added to scope.

### Phase 0 and 1 (fresh baseline, quick fixes)

- Migration rerun on `origin/main` content (42 events, 8 vacancies, 6 newsletters, 3 past events, 140 uploads, 33 pages): counts equal the source, 0 errors.
- Ruling: editors now use inline images in text a lot (18, including the whole media page). The migration converts them into image nodes that point at the migrated file (`extractInlineImages`, `placeUploads`, 8 unit tests and 1 integration test RED→GREEN) instead of reporting them for manual work. Cost if wrong: an image lands on its own line where it used to sit inside a sentence.
- Ruling: added a fix-ups file per site (`docs/migration/boerengroep-fixups.json`, `FIXUPS_FILE`) for editorial corrections the old content cannot express: remove pages, override title or slug per language, add redirects (5 integration tests RED→GREEN). The tool may now delete a page, but only one it imported itself for the same site and only when a fix-up names it.
- Open Pot: English and Dutch pages paired (`open-pot-student-kitchen` with `soepkeuken`), Dutch page renamed to "Open Pot" at `/nl/activiteiten/open-pot`, old addresses redirect, event type shown as "Open Pot".
- Cookies and Terms pages removed. `/cookies`, `/terms-conditions` and `/algemene-voorwaarden` redirect to the Privacy policy.
- Uploads accept Word, Excel, PowerPoint, OpenDocument, text and CSV (2 tests).
- Fixed: a placeholder created from another placeholder had no source name in the report (test RED→GREEN).
- Ruling: plan item 1.4 (calendar text alignment and top gap) moves into Phase 5, which rebuilds those views. Cost if wrong: none, the fix ships with the new views.
- Parity list refreshed from the live site: 238 working addresses. Result on the new build: 238 checked, 0 failed. Playwright 18/18.
