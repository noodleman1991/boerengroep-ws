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

### Phase 2 and 3 (design layer, settings, navigation)

- Design direction: white field, ink, the logo's green and orange, deep green for text links, a dark green footer that rises as a field horizon with the orange sun behind it. The logo's two overlapping circles return as a small sign. Slab headlines (Enriqueta), Public Sans for everything else. All of it is variables in `app/[locale]/site.css`, so the second site changes values, not rules. Rejected on purpose: cream paper background and blob shapes.
- Ruling: buttons are green with black text (7:1). White on this green fails contrast. Text links use the deeper green.
- Site settings are one document with five tabs: General, Menu, Footer, Newsletter, Calendar. The Theme tab is gone; a site's look lives in code.
- Menu and footer links use one link picker: a page of the site, a built-in section (calendar, news and so on) or any address. A link to a page follows the page when its address changes. `resolveLink`, 7 unit tests.
- Ruling: the migration writes the menu labels in both languages from the old translation files, so the Dutch menu is complete on day one.
- Header: larger logo (56px, 42px after scrolling), dropdowns as real buttons with open state, one language switch. Phone menu is a full sheet. Fixed: the sheet was clipped because the header's blur traps fixed children; the sheet now sits outside the header.
- Footer: logo with address, email, phone and social links on the left, link columns in the middle, newsletter card on the right. Between 768 and 1180 wide the newsletter card runs under the other two.
- Ruling: the initial database migration was regenerated as one file (`20261008_060100_initial`). No environment has the older one. `pnpm --filter @sites/cms db:reset` resets the test database when the schema changes in a way that is not purely additive.
- Events get their address from title and date (`eventSlug`, 6 unit tests), filled in automatically in the admin and numbered on a repeat. Found when three real events collided.

### Phase 4 (newsletter and Brevo)

What was wrong, by evidence: production reported `BREVO_LIST_ID: not set`, so contacts landed in no list; Brevo rejects the local key with `401 API Key is not enabled`; failures were only logged; people were sent to Brevo before they confirmed their address; unsubscribing and deleting never reached Brevo; and `GET /api/newsletter/subscribe` told any visitor which secrets were set.

- New Brevo client (`lib/email/brevo.ts`, 15 unit tests with an injected `fetch`): add to list, remove from list, delete contact, bulk add, bulk remove, read a list, list the lists, check the key. It never throws. A refusal comes back as a reason.
- Lifecycle (`lib/newsletter/brevo-sync.ts`, 12 unit tests): added to the list on confirming, taken off on unsubscribing, deleted on erasure. The site's own table stays the record of consent.
- The list number comes from Site settings, Newsletter. `BREVO_LIST_ID` is the fallback (`listIdFrom`, 3 unit tests).
- Ruling, deviation from the plan: no `brevo_synced_at` and `brevo_error` columns. Instead the status compares the confirmed people on the site with the people on the Brevo list, and "Bring the Brevo list up to date" adds who is missing and removes who left. Reason: this needs no migration on the live subscriber database and it also repairs everyone who confirmed while the link was broken. Cost if wrong: there is no per-person error history; problems are in the server log and in the status.
- Admin: Site settings, Newsletter starts with a live check, "Does the sign-up reach Brevo?". It says in sentences what works, what does not and what to do, lists the lists of the account when none is chosen, and offers the repair button. `GET /api/newsletter/status` and `POST /api/newsletter/sync` answer only for admins of this site (`canManageTenant`, 3 unit tests) and only about this site's newsletter.
- Removed: the public health report on `GET /api/newsletter/subscribe`.
- Ruling, security: deleting your data now takes two steps. The form sends a personal link by email and only that link deletes. Before, anyone could delete any subscriber by typing their address, and with Brevo connected that would also have removed them from the mailing list. The form answers the same whether or not the address is known. New email `sendDeleteConfirmationEmail` in both languages.
- If the Brevo account has no `LANGUAGE` contact attribute, the client retries without it, so people are still added (unit test). Not verified against the live account: no working key was available.
- Sign-up box rebuilt (`components/newsletter-signup.tsx`): one rounded field with the button inside, wrapping to two rows in a narrow place. After signing up the box is replaced by the thank-you. Every text is editable per language in Site settings, Newsletter, and falls back to the standard wording. Someone already on the list is told so instead of seeing an error.
- New block "Newsletter sign-up" for pages, words left and field right on a wide screen.
- Confirm page and delete page redesigned as short message pages. The confirm page shows the editable "after confirming" title and message.
- Dutch newsletter wording moved from formal to informal, matching the rest of the site.
- Tests: app 86 unit, CMS 45 unit and 86 with a database, 24 browser tests (6 new for the newsletter, all answering the site's endpoints themselves so no test writes to the subscriber list or sends mail). Parity: 238 checked, 0 failed.

### Phase 5 (calendar)

- Every event has its own page at `/activities/calendar/<address>`, with the date large, time and place, sign-up, description, people, the picture, a share preview and event data for search engines (`eventJsonLd`, escaped for safe embedding).
- The old calendar (about 3,600 lines: drag and drop, week, day and year views, a settings panel) is replaced by about 900 lines: an upcoming list grouped by month, a month grid, a past list, and filter chips per kind of event. On a phone the month shows dots per day and lists the chosen day underneath. Two packages only the old code used are removed (`re-resizable`, `react-day-picker`).
- All dates and times are shown on the Dutch clock for every visitor (`lib/events/time.ts`, tests across the change to winter time on 25 October 2026).
- Calendar files (`lib/events/ics.ts`, 12 unit tests against the format rules: escaping, 75-byte folding without cutting a character, UTC times, whole days, stable identity, sequence that grows with edits). `/calendar/<address>.ics` gives one event, `/calendar.ics` is the feed to subscribe to, with `?lang=nl` for Dutch wording. The feed can be switched off in Site settings, Calendar.
- Add to calendar: the file, Google Calendar and Outlook.com. Share: the phone's own share sheet when there is one, otherwise copy link, WhatsApp and email. Subscribe: one button with a short explanation and four ways in.
- Status: Full shows an orange badge on lists, the month grid and the event page, plus a notice, and the sign-up box is hidden. Cancelled and postponed events stay visible, crossed out.
- Ruling: midnight to midnight, or midnight without an end, means whole days with the last day included. Editors who picked dates without times produced exactly this (for example the introduction weekend and the Farm Experience Internship).
- Ruling: an end that lies before the start is ignored everywhere. Four events in the current content have one (for example "Lecture series" on 7 October ends on 30 September). They show with their start only. Worth correcting in the admin after cutover.
- Ruling: an event without an end counts as two hours in calendar files, as the admin says. On the site it stays under "Upcoming" until the end of its day.
- Ruling: in calendar files a postponed event is marked as cancelled on its old date with "Postponed:" in the title. A calendar has no better way to say "not on this day".
- Ruling: the feed carries everything that is coming and the past twelve months. The identity of an event in the feed does not contain the web address, so a change of domain never doubles events in subscribed calendars.
- Ruling, less than planned: the share image is the event's own picture cut to 1200 by 630. An event without a picture has no generated image and falls back to the site's default preview.
- "What's on" band (the Events block): the first event large with its picture and the date on the corner, the next ones as short rows, and a small month. It can show the next events, one kind, or hand-picked events, and now works on any page, not only the home page (`loadBlockData`). With nothing coming it shows the most recent events under "Recently".
- Ruling, design: the large day number uses the tall, narrow, heavy lettering of the logo (Roboto Flex, condensed). The headline face only has old-style figures, where a 7 hangs below the line and a 30 looks small.
- Alignment: sections now use the same width and side margins as the header and footer. Content pages are no longer wrapped in a second section, so their blocks are full-width bands like on the home page.
- The regular activities under the calendar (Breaks, Open Pot, Open Meetings) are three short columns. Their anchors are unchanged.
- Not covered by a browser test: the Full badge, because the content has no full event. Checked by hand by setting one local event to Full and one to Cancelled, looking at the list, the event page and the feed, and putting them back.
- Tests: app 152 unit (68 new for events), CMS 45 unit and 88 with a database (2 new), 30 browser tests (6 new). Parity: 238 checked, 0 failed.

### Phase 6 (blocks)

- New blocks, all usable on any page and in past event stories: Photo gallery, Video, Documents, Podcast episodes, Form, Item. Newsletter sign-up and Events came in earlier phases.
- Gallery: a mosaic on square cells (seven photos fill three even rows on a wide screen, five fill four rows on a phone), captions on the tiles, and a large view with arrows, swipe and keyboard. It shows chosen photos or the photos of a past event with a link to its story. Past event pages show their photos the same way and link to their calendar event.
- Video: YouTube and Vimeo links in every common form (`parseVideo`, 6 unit tests). Nothing is requested from the video site until the visitor presses play. The cover of a YouTube video is fetched by the site's own server. A browser test proves that no request leaves for YouTube before play. Editors can also place a video inside any text.
- Documents: download cards with name, kind and size (`fileInfo`, 4 unit tests). A file placed in a text becomes the same card, a picture in a text gets its caption. Vacancies show their document as a card.
- Podcast: the feed reading moved into one tested module (`lib/podcast.ts`, 6 unit tests). Fixed along the way: the podcast page asked its own web address for the feed, which fails while the site is being built. It now reads the feed directly.
- Forms: built in the admin with the official form builder, per site. Answers go through `/api/form-submit`, which checks the site, every field (`validateSubmission`, 7 unit tests), a hidden trap field, a minimum time and a rate limit of ten per ten minutes per sender. The open API accepts no answers. Emails are sent only when an editor adds one on the form.
- Item (the T-shirt case): pictures to flip through, details, price text and one button that opens a link or a form on the page. No payment.
- Ruling: the eight older blocks (opening, callout, items side by side, figures, quotes, invitation, text, picture with text) were rewritten in the same design language instead of patched. Headings are left-aligned everywhere, sections share one width, figures use the logo lettering. Animation on every block is gone.
- Ruling, design: one typeface (Public Sans) for all running text and controls, the slab for headlines, the condensed heavy face only for dates and figures. Before, body text used a third family.
- The Invitation block gets a background choice like the others (additive migration `20261008_102426_cta_background`). The video in text adds no database change.
- Ruling: block symbols are a fixed list of thirty names. The old component bundled a whole icon library. Removed with it: `react-icons`, `react-player` and the components only the old blocks used.
- Found by looking at the result: a page kept showing old photos, forms or names after they changed, because its cached answer was only dropped when the page itself changed. Queries now also drop their answer when a form, past event, speaker, author or tag they show changes (database test RED then GREEN).
- "Block examples": `pnpm --filter @sites/cms seed:demo` makes a draft page with every block filled in, for editors to look at and copy from.
- Tests: app 185 unit, CMS 45 unit and 89 with a database, 34 browser tests (5 new: gallery keys, video privacy, form errors and thanks, item, refused answers). Parity: 238 checked, 0 failed. Every block was looked at in a browser at desktop width and the main ones at phone width.
- Machine note: the laptop ran out of disk during this phase (about 200 MB free, 12 GB of swap). Builds here now run with the compiler's disk cache off.

### Phase 7 (a clearer admin panel)

- One admin panel for both sites, inside the Boerengroep site. People who work on both sites see the sites as two tabs, on the welcome screen and at the top of the menu. The plugin's dropdown is hidden. With an item open the other tab is switched off, because switching would move that item to the other site.
- The menu is grouped by what editors come to do, in this order: Pages, Calendar, News and vacancies, Library, Forms, Site settings, People and sites. Collections have everyday names ("Pictures and files", "Speakers and hosts", "Forwarding addresses", "People", "Sites").
- A welcome on the first screen with seven shortcuts (add an event, change a page, upload pictures, write a news item, tell how an event went, menu footer and newsletter, read form answers) and one sentence on what is live when.
- Every collection, tab and field that was still bare has a label and an explanation in plain words. Error messages follow the labels ("Address", "Old address").
- Every block starts with one line that says what it is for. Rows in lists carry what the editor typed as their title ("About Us" instead of "Menu item 01").
- Site settings show their name at the top instead of "ID: 1" (hidden title field, additive migration `20261008_104251_settings_title` with a backfill for existing settings).
- Found by logging in: the first version crashed the welcome screen. The shared package and the app each loaded their own copy of the admin library, so the components could not see the admin's state. The earlier Brevo panel had the same flaw without showing it: it could not read which site the settings belong to. Ruling: components that use the admin library live in the app that serves the admin (`apps/boerengroep/components/admin`), and the shared settings point at them. The wording logic stays in the shared package. Cost if wrong: a second app that wants its own admin needs its own copies, which the one-admin decision rules out.
- Tests: CMS 46 unit and 89 with a database, tool 78 and 25, app 185 unit, 35 browser tests (1 new: welcome, shortcuts and menu order after logging in, skipped where no admin account is given). Parity: 238 checked, 0 failed. Looked at in a browser with a second site added locally and removed afterwards.

### Phase 8 (roll-out and close)

- Every kind of page was looked at in a browser at desktop and phone width (home, a content page, news, friends' news, past events and a story, vacancies, podcast, calendar, an event, the short newsletter pages, the 404 page). None scrolls sideways and none logs a browser error. The list pages for news, vacancies and the podcast keep their earlier look inside the new header, footer, width and typeface.
- Accessibility: automated WCAG 2.1 A and AA checks on ten kinds of page are now part of the browser tests (`e2e/a11y.spec.ts`). First run: 8 of 10 clean. Fixed: contrast of the days outside the month, a label on an element that may not carry one, and a picture strip that could not be reached with the keyboard. Now 10 of 10. Not done: a manual pass with a screen reader.
- Final rehearsal on the live content of `origin/main` (unchanged since the baseline, commit `6e41ee3`): the three migrations were folded into one, `20261008_110137_initial`, the database was built from nothing, seeded and filled. Counts equal the source: 42 events, 8 vacancies, 6 news items, 3 past events, 140 pictures and files, 31 pages (33 minus the two removed legal pages), 5 forwarding addresses. 0 errors. The report is byte for byte the same as the baseline, so the import is repeatable.
- On that database: 45 browser tests pass (35 behaviour, 10 accessibility), parity 238 checked and 0 failed, typecheck and lint clean, app 185 unit, CMS 46 unit and 89 with a database, tool 78 unit and 25 with a database.
- Editor guide rewritten for the new admin. Runbook updated: the fix-ups file in the import command (it was missing there), calendar checks, which tests skip themselves and how to switch them on, and what to do after cutover.
- Ruling: the "Block examples" page is local help, not part of the import. It is created on request with `seed:demo`.
- Open, for the owner: confirm the dry-run review, the staging rehearsal and cutover per the runbook, a working Brevo key and list number, and free disk space on the laptop before building there again. Then the Inspringtheater plan.

## Round 3 (after the owner saw the design, 2026-10-08)

Asked for: a more integrated design with better flow between sections, no white box around the footer logo, accessibility throughout with tests, every screen size, a more interesting gallery (captions, videos), a better item block that says donation and not sale with editable small print, the sample content gone, and an answer to "is it production ready".

- Flow: a page is a stack of bands. Each band rises over the one before it with a shallow curve, and the footer hill overlaps the end of the page, so sections no longer meet in straight stripes. An opening without a picture keeps its words left and uses the logo's circles as the picture. The callout is a pill on the page instead of a stripe of its own. The "blue" background became a green-grey that sits with the other tints.
- Footer logo: a recoloured copy of the logo (white lettering, original green and orange) ships with the site as `public/brand/boerengroep-logo-on-dark.png`, and Site settings has "Logo for dark backgrounds" to replace it. Ruling: a colour filter was tried first and rejected, because it also shifted the green and orange.
- Pages: a page's own text was imported but never shown, on the old site and on the new one. It shows now, under the opening block. This made the Contact page appear, which only had that text, and the photos on the Library media page. A page without a main heading gets its title as one. A page with nothing on it (Activities, Library) lists its sub-pages instead of being blank.
- Gallery: videos sit among the photos and take the large tiles, a few words can go above the mosaic, and the large view has a strip of small pictures. A video loads from YouTube or Vimeo only after its play button is pressed, also when reached with the arrow keys (browser test). Stories of past events can carry videos too.
- Item block: renamed "Item for a donation". "Suggested donation" instead of a price, small pictures to choose from, and small print under the button that the editor can change. Empty, it reads "This is a donation to (name), not a purchase."
- Consent texts: the newsletter's small print was already editable (Site settings, Newsletter, "Small print under the box"). The item's small print is new. A form's consent line is a tick box whose text the editor writes.
- Placeholder content: left out at import through the fix-ups file, with tests (RED then GREEN) for leaving files out, removing what an earlier run imported and emptying a page's hidden text. 9 events, 5 speakers, 3 tags and one hidden text. This is a judgement, recorded in the review for the owner to confirm. The "Block examples" page with invented quotes and numbers became a neutral test page (`seed:test-page`) whose texts only name the blocks, and it is kept out of search engines and the sitemap. Also removed: default texts that claimed "about once a month", the joke text on the 404 page, an unused starter component, and an unused email check that would have sent a test mail.
- Accessibility, found and fixed: no way to skip the menu; focus lost after closing a menu, the phone menu or a large photo; the page behind the phone menu still reachable; dropdowns staying open when tabbed out of; three different focus rings, one of them orange on orange; the 404 page without menu, landmarks or a way on; the stories list without a main heading and with a skipped heading level; pop-up menus without a name; a rule for "less motion" that removed every transform and so moved pop-up menus to the corner of the screen; event texts in the other language read with the wrong voice; the language switch labelled in the wrong language.
- Accessibility tests: `e2e/a11y.spec.ts` grew from 10 to 48 tests. Every kind of page at desktop and phone size against WCAG 2.1 A and AA plus common good practice (36), the same with menus, dialogs, form errors and the newsletter box open (5), six with the keyboard alone, and one with less motion asked for. Not done: a pass with a real screen reader.
- Screen sizes: `e2e/responsive.spec.ts` opens 18 kinds of page at 12 widths from 320 to 1920 pixels and fails on sideways scrolling, cut-off headings, controls outside the screen and tap targets under 24 pixels. First run: 17 of 18 failed. Fixed: the full menu appeared at 1024 pixels although it needs about 1120 (the language switch fell off the screen), podcast buttons outside a phone screen, and small tap targets in the month grid and the news list.
- Production basics that were missing, on the old site too: a title and description per page (every page was titled "Stichting Boerengroep Wageningen"), `/sitemap.xml`, `/robots.txt`, a page for errors, and three security headers.
- Tests: 102 browser tests (36 behaviour, 48 accessibility, 18 screen sizes), app 213 unit, CMS 46 unit and 90 with a database, tool 78 unit and 28 with a database. Parity: 238 checked, 0 failed. One migration, regenerated as `20261008_114307_initial` because nothing is deployed yet.
- Open, for the owner: confirm the placeholder list, the two description texts named in the runbook, and everything already open after Round 2.

## Round 4 (second look at the design, 2026-10-08)

Asked for: no curves between sections, the same treatment on every component, the real symbol instead of two abstract circles, as a clean SVG; a better "read more" in the opening; a callout that sits properly between sections; a reworked calendar, above all the month; kinds of events and their filter controlled from the admin; a page that is only a picture centred; the photo page rebuilt with the gallery component; vacancies with correct logic and one post in both languages. During the round the owner asked to keep the previous footer and found the first callout placement wrong.

- Design logic, as it now stands: the header and the footer are the frame and run the full width, the footer as the hill with the sun. Between them the page is open ground (white) with plots on it: a part with a colour is a rounded panel set in from the window's edges. The look lives in the one `Section` component, so every block and built-in page follows it. A callout is a small plot of its own, a low strip as wide as the others with the same air above and below.
- Rejected on the way: curves between sections (owner), the footer as an inset dark panel (owner preferred the hill), and a callout placed on the lower edge of the section above it (owner: it reads as part of the calendar, which it is not).
- Symbol: `apps/boerengroep/public/brand/boerengroep-symbol.svg`, 5 KB, 123 curves, drawn from the logo picture because no vector original was at hand. Where the logo shows the swirls they are taken exactly: 0.53% of comparable pixels differ, all on edges. 29% of the symbol lay under the lettering and is continued along the sweep of each swirl, which is a reconstruction. Scripts and notes in `tools/brand-symbol`. Site settings has a "Symbol" field to replace it. Ruling: a first attempt that guessed hidden pixels from their neighbours gave broken shapes and was thrown away.
- The symbol is used where the two circles were: beside the words of an opening without a picture, on the short pages (404, error, newsletter), in an event's frame without a picture. It was removed from the item block and from video tiles, where it added nothing.
- Opening: what an editor marked as a plain link is now an outlined pill like other second buttons, and a closing "..." on a button label is dropped.
- Kinds of events: new list in the admin (Calendar, Kinds of events) with a name per language and one of eight named colours, each readable on the site. Events and the Events block point to a kind. The fixed list in code is gone. The filter is built from the kinds that have events in the view at hand, with counts. Ruling: kinds are sorted by name, not by a hand-set order, to keep the admin simple. Cost if wrong: one extra field.
- Calendar: the list shows each month's name beside its events and keeps it in view, and the date of an event stands on a tile in the colour of its kind. The month is a table of day tiles in the colour of what is on, with the chosen day's events beside it (under it on a phone). It opens on the next day that has something, and an empty month offers a button to the next month with events. Titles in tiles use the narrow face of the dates.
- Vacancies: one post, localized fields, no "language" field. Found by reading the old logic: a vacancy without a deadline and without "always open" was never shown (two live vacancies were invisible), and a deadline closed at the start of its day instead of the end. New rules with tests (`lib/vacancies.ts`): always open wins, no date means open, the last day counts by the Dutch calendar, closed for three days and then gone, nearest last day first. The page was rewritten around them and shows every field an editor fills in. Ruling: the three-day "closed" period is kept from the old site.
- Photo page: imported as a gallery with captions through a new `galleryPages` fix-up (unit and database tests). Which sentence belongs to which picture was checked by looking at the pictures.
- A page that is only a picture (Contact) is centred under a centred title (`visualOnly` in `lib/page-parts.ts`, tested).
- Test database: the changed model made the schema tool ask a question and hang the tests. The throwaway test database was recreated. The single migration was regenerated as `20261008_142839_initial` (nothing is deployed).
- The live site moved during the round (`origin/main` 6e41ee3 to 59b8174: one new event, one edit, two uploads). The import was run on the new state: 34 events, 142 files.
- Tests: 112 browser tests (42 behaviour, 51 accessibility, 19 screen sizes), app 224 unit, CMS 46 unit and 93 with a database, tool 83 unit and 31 with a database. Parity: 238 checked, 0 failed.
- Open, for the owner: confirm the photo page and the kinds, move the Dutch out of three bilingual vacancies after cutover, provide the original symbol if it exists, and everything open after Round 3.

## Round 5 (ready for production, and the second site, 2026-10-08)

Asked for: "make ready for prod", build the Inspringtheater site, and during the round: a size for pictures in a text and galleries in content pages, the news and the open positions on the home page as blocks that fill themselves, a way to feature a page there, a clearer editor guide, a check that every file came over from Tina ("for example the year plan"), and a header logo 15% larger.

- The second site is `apps/inspringtheater`: an app without pages of its own. Its route files are one-line re-exports of the Boerengroep ones, written by `tools/site-routes/sync.mjs`, and `@/` resolves to its own folder first and to `apps/boerengroep` second. What differs per site is in three places: `site.config.ts` (name, logo, descriptions), `app/[locale]/theme.css` (colours) and `messages` (a few sentences). A test fails when the two apps' dependencies or routes drift apart.
- One admin for both: `/admin` on the second site forwards to the first. A page preview for the second site is a link signed with the site's secret, valid for twelve hours (`packages/cms/src/preview.ts`). Checked with both apps running: an edit of an Inspringtheater event in the admin shows on its site within seconds, and the preview link sets preview mode.
- Inspringtheater's content: imported from its repository as of 18 August 2026 (private, could not be fetched). 14 pages, 29 events in 5 kinds, 71 files. The repository is a copy of the old Boerengroep site, so 38 sample files and 52 empty pages were left out through its fix-ups file, see `2026-inspringtheater-dry-run-review.md`. New in the import tool for this: the site's own address words, leaving out empty pages, colours per kind, dropping menu links that lead nowhere.
- Old addresses of Inspringtheater: 199 collected from the live site. The first check failed on 66: empty leftover pages that still answer today. Each now forwards to the closest page that exists. 199 checked, 0 failed.
- Files, checked because the owner asked. All 142 files of the old uploads folder were already imported. But the year plan and the year report were linked on Tina's own file server, which goes away with the Tina account, and the import had kept those links. The import now turns a link to that server, or into the uploads folder, into a link to the imported file. Three files existed only on that server: two pictures are kept in `docs/migration/boerengroep-rescued` and imported (one event had no picture on the live site because of this), one 12.6 MB PDF on a closed vacancy was left there for the owner to decide. One Inspringtheater picture with brackets in its name had been lost by the first import and is read now.
- Stale pages after an import, found when a rebuilt site kept showing old content: the import writes without the per-item refresh, and a build reuses what the site remembered. The import now tells the site once, at its end, to forget everything of that site. The runbook says what to do when the site cannot be reached.
- Pictures in a text: an editor chooses a size (a third, half, three quarters, or the whole width of the text) and a place (left, middle, right) on the picture itself, and may write a line under it. Text runs beside small and medium pictures on a wide screen only.
- Galleries: a photo gallery can stand inside a text. Both that one and the gallery block have a size: the mosaic, or even rows of small, medium or large photos.
- Three new blocks, grouped with Events: "Latest news" (newest first, the item in the spotlight leading), "Open positions" (what people can apply for today, by the rules of the vacancies page) and "In the spotlight" (one to three things an editor picks: a page, an event, a news item, a story or a vacancy, with their own words if wanted). Vacancies got a spotlight tick box. The import puts the first two on the Boerengroep home page through a new `addBlocks` fix-up.
- Found on the way: a news item marked "Inspringtheater" would have shown on neither news list, because the lists still checked for the old spelling "Inspiratietheater". Removed news items can now forward like pages. The sitemap leaves out the built-in lists that are empty. Shared sentences that named Boerengroep or farming are neutral now.
- Header logo: 64, 48 and 53 pixels high where it was 56, 42 and 46. The screen-size tests then failed for Inspringtheater at 320 pixels, where its wider logo pushed the menu button out. The logo is now limited to 44% of the screen's width.
- Editor guide rewritten around what an editor wants to do, with a table that leads to each task. The steps were checked against the admin itself.
- The single migration was regenerated as `20261008_162747_initial`.
- Tests: browser, Boerengroep 120 (50 behaviour, 51 accessibility, 19 screen sizes) and Inspringtheater 58 with 2 skipped (its own 14, and the shared accessibility and screen-size suites). App 270 unit, CMS 51 unit and 93 with a database, tool 113 unit and 36 with a database, second app 4, address tool 15. Parity: Boerengroep 238 checked, 0 failed. Inspringtheater 199 checked, 0 failed.
- Not done: the browser tests are still not part of CI. They need a site built on imported content, and until cutover that content lives on `main`.
- Open, for the owners. Boerengroep: everything open after Round 4, the PDF named above, and a look at the two new blocks on the home page. Inspringtheater: confirm what was left out, write a privacy statement, supply a larger logo if there is one, its own newsletter list and mail sender, and access to its repository for the import at cutover.

## Round 6 (the admin itself, 2026-10-08)

Asked for, after a first look at the admin: Boerengroep before Inspringtheater, clearer instructions, how to arrange the navigation, "I'm missing the friends news", "I don't understand People and sites", "some of the content types are empty although the sites have content", a designed login page with the swirl as the logo of the admin, an SVG for Inspringtheater, the Brevo key in the admin instead of with the hosting ("is it safe?"), and an email to the organisation with each purchase.

- What "empty" turned out to be. Three things at once. The sites stood in alphabetical order with nothing chosen, so the first click landed on Inspringtheater, which has no news, vacancies or stories. The list of people showed nobody, not even the admin who was looking at it, and the list of sites showed one of two: the plugin filtered both lists by the chosen site. And nothing said how much each site holds.
- Now: the websites have an order an admin can drag, Boerengroep first, and the first one is chosen for whoever has not chosen. The two lists show everyone the reader may see, whichever website is chosen (who may see whom is decided by this project's own access rules, which the tests cover). The first screen lists every kind of content of the chosen website with one line on what it is and how many there are, and says "Nothing yet" where there is none.
- Plain names: "People and websites", "People who can log in", "Websites", "Main admin", "Admin of this website", "Editor". The plugin's "tenant" wording is replaced.
- First screen: which website, what do you want to do, and seven questions that open to a short answer (the order of the menu, where the news from friends is, an empty list, saved but not changed, Dutch, undo, a colleague).
- Arranging the menu: its settings were one page of 14,500 pixels with every item and sub-item open. The rows are closed now and carry their own words, so the menu reads as seven rows to drag, under six numbered steps. The footer got the same.
- News from friends was never missing, but it sits in the one list "News" and nothing said so. The list has three links above it (all, our own, from friends), the first screen counts both, and the description says where each shows on the website.
- Login page: a panel in the soft green of the site's plots with the symbols of both websites, their names and the sun of the footer in a corner, beside the form. On a phone it is a band above the form. The symbol is also the mark in the corner of every screen.
- Inspringtheater symbol: `inspringtheater-symbol.svg`, drawn with the same scripts as Boerengroep's from the only picture there is (300 by 99 pixels, enlarged eight times). 12% of it lay under lettering and is continued. The web archive only had a smaller badge. The large shapes are right, the thinnest strokes are simplified. The site now opens pages without a picture with it. A symbol shows only in the opening at the top of a page.
- Brevo key in the admin: possible, and safe when done this way. Only admins of a website can save it. It is locked (AES-256-GCM, with the secret of the installation) before it reaches the database. It is write-only: no reader gets it back, not a visitor, not an admin, not the site's own pages. Only its last four characters show, to people who are logged in. An empty box keeps the saved key, a tick box removes it. The key of the hosting stays as fallback. A database test covers each of these, and it caught a real leak while this was built: a hook that returns "nothing" leaves a value in place, so the locked key travelled with the settings that pages load.
- Email on each form answer: every answer, orders through "Item for a donation" included, is mailed to the organisation, with every question and answer, and "reply" writes to the person. The address is a setting (General, "Send form answers and orders to"), else the contact address. That setting is not readable by visitors either.
- A copy on a laptop must not send mail: the local database holds the real address of the organisation and a working mail key was set. The form test would have mailed the real inbox. `EMAILS_OFF=1` now makes both mail senders write to the log, the browser tests start the app that way, and nothing was sent (checked in the server log: two emails "attempted without being configured").
- The single migration was regenerated as `20261008_181609_initial`.
- Tests: browser, Boerengroep 125 and Inspringtheater 58 with 2 skipped. App 282 unit, CMS 57 unit and 101 with a database, tool 113 unit and 36 with a database, second app 5, address tool 15. Parity: 238 and 199 checked, 0 failed.
- Not checked: a real email through Resend from a deployed site, and a real Brevo key saved in the admin against a real Brevo account. Both need the owner's accounts.

## Round 7 (cut-off text in the calendar, and a look of its own, 2026-10-08)

Asked for: "examine the truncated text in the calendar and calendar widget", and for the block components: "look at wur.nl pretty similar - I want to diverge from this in the designs".

- Cut-off text, found in three places. Descriptions in the calendar list and in the large event of the "What's on" block were cut by their box after two or three lines, in the middle of a word ("Come t…"). In the month, the names of events were cut in the middle of a word ("Boerengro ep…"), because a day was 85 pixels wide.
- Now the site shortens a long description itself, at the end of a sentence when whole sentences fit and otherwise at a whole word with a mark (`excerpt` in `lib/page-meta.ts`, tested), and no box cuts text. The month is a ruled sheet as wide as the page with the chosen day under it, so every name is shown in full. Two browser tests guard this: no text in the list, the month or the block is cut by its box at 1366 and 390 pixels.
- Compared with wur.nl by looking at it: both sites had rounded panels set in from the edges, rounded pictures, pill buttons, a date tab on the corner of a picture and ruled lists on soft green and cream. The headings already differed (a slab serif here).
- The new look of the parts of a page: printed matter of a group that makes its own posters. Parcels are cut square and have a hatched edge along their top, as a land map marks a field. A large picture has a block of the second colour shifted behind it, as when two colours are printed off-register. A date is a leaf of a tear-off calendar: weekday on a black band, the day large, the month under it. Buttons are stamps with a hard edge that press in under the pointer. Tabs, filters, the language switch and the menu button are square. The month is a calendar sheet.
- Kept, because the owner said so earlier: the hill with the sun as footer, the swirl of the logo, the parcels set in from the edges of the window, the announcement as a low strip of its own. The two round things left are the sun and the swirl.
- It is one set of variables (`--corner`, `--corner-ui`, `--rule`, `--print`, `--print-shift`) and a handful of rules in `site.css`, so Inspringtheater has it too, in its own colours, and it can be tuned or turned back in one place. The login page of the admin follows it.
- Tests: browser, Boerengroep 127 and Inspringtheater 58 with 2 skipped, including accessibility and twelve screen widths on the new look. App 287 unit. Parity unchanged.

### Round 7, second attempt at the look (same evening)

- The square, printed look described above was shown to the owner and rejected in four words: "not good at all". It is gone. Asked which way to go instead, the owner chose "organic, from the swirl" out of four directions.
- Kept from the first attempt: everything about cut-off text (the site shortens at a sentence or a word, the month is as wide as the page and shows every name in full, two browser tests guard it).
- The look now starts from the earlier rounded one, which the owner liked, and takes its shapes from the logo, which is drawn by hand: two balls, each with a brush stroke around it.
  - A plot and a picture have an uneven outline, every corner its own curve, as if cut out by hand. Three such outlines, so neighbours differ. Smaller on a small screen.
  - A date stands on a ball. In a list the ball has the soft colour of the kind of event. On the large event of "What's on" it is a ball of the second colour on the corner of the picture, as one ball lies over the other in the logo.
  - The picture of an opening has a ball of the second colour behind it.
  - A heading above a part of a page is underlined with a brush stroke, drawn as a mask so it takes each site's own leading colour.
- Unchanged: pills for buttons, filters and tabs, the hill with the sun, the announcement strip, the swirl in an opening without a picture.
- It is a set of variables (`--blob-a`, `--blob-b`, `--blob-c`, `--k`, `--ball`, `--ground`) and one closing section in `site.css`, shared by both sites.
- Tests on this look: browser, Boerengroep 127 and Inspringtheater 58 with 2 skipped, with accessibility and twelve screen widths. App 287 unit.
- Lesson for the next change of look: show a direction and let the owner choose before building it. One question with four options took a minute. The rejected attempt took an hour.

### Round 7, adjustments after the owner saw the organic look

Said: "I don't like the visual in the hero and the line space is not enough there, and you can make the uneven outlines not too much but more interesting than this, and also the brush stroke can be more interesting and varied (with specific pattern)". Asked which visual: only the orange ball behind a hero photo. The swirl beside the headline stays as it is.

- The ball behind the picture of an opening is gone.
- The opening: the headline had its lines at 1.02 times the letter size, which let the tails and stems of the slab letters touch. Now 1.16, and the text under it 1.65, with more room above the buttons.
- Outlines: a plot and a large picture now have one corner that sweeps round, like a stroke of the logo, and three cut close. The sweep moves from plot to plot (top right, then bottom left) and from picture to picture. Small panels keep the gentle unevenness.
- Brush strokes: three, with more body, set slightly off level, in a fixed order down the page: a long stroke with a flick at its end, a ball with a stroke leaving it in the two colours of the logo, and two strokes one over the other in the two colours.
- Tests on this: browser, Boerengroep 127 and Inspringtheater 58 with 2 skipped.

### Round 7, the look the owner chose (2026-10-09)

- The sweeping corners and the three brush strokes were answered with "ugly now, think better", and "be creative". Guessing had failed three times, so the next two steps were shown instead of built: a page with the same part of the home page drawn in three ways, in the browser, with one question under it.
  - First page, three directions (rings from the logo, a hand-printed edge with a bristled brush stroke, and the quiet version). Answer: the quiet one, "but I don't like the uneven borders, try better".
  - Second page, the quiet look with three kinds of border (the same curve on every corner, a leaf, a fine line set in like a label). Answer: the leaf.
- What is built: a plot and a large picture have the shape of a leaf, two opposite corners round and the other two almost square, and the next plot turns the other way, so they alternate down the page. Small panels have a small leaf. The announcement strip has one as low as the strip. A picture inside a text keeps even corners. Dates stay on a ball, headings keep the one plain brush stroke, buttons and filters stay pills.
- Kept from the remarks before: no ball behind the picture of an opening, and more room between the lines of an opening.
- Found by the screen-size tests when the date rolled over and another event came first: on a 320 pixel phone the large date ball beside the title of an event left a long word no room. On a phone the ball now stands above the title. A browser test that read a calendar file did not expect long lines to be folded. It reads them as one line now.
- The page with the options was a file in `public` and is removed.
- Tests: browser, Boerengroep 127 and Inspringtheater 58 with 2 skipped. App 287 unit.
- Lesson, confirmed twice: for a matter of taste, draw the options for real and let the owner point. Each page took a few minutes and got a clear answer at once.
