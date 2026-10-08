# Site Improvements Plan: newsletter, navigation, calendar, content blocks, design, one admin

Date: 2026-10-08
Status: draft, awaiting review. Nothing in this plan is built yet.
Branch: continues on `payload-migration`.
Builds on: `docs/superpowers/specs/2026-10-03-payload-multi-tenant-migration-design.md` (sections 16 and 17) and `docs/migration/execution-log.md`.

**Goal:** Take the migrated Boerengroep site from "works like before" to "better than before": a working newsletter flow with Brevo, navigation that editors can change themselves, a calendar people can subscribe to and share, richer content blocks, a warmer design, and one admin for both sites.

**How this plan is written:** I execute it myself, without subagents. So it fixes decisions, interfaces, tests and acceptance checks, and leaves the code to be written test-first during execution. The previous plans carried full code and needed about forty corrections once they met the real content.

---

## 1. What I found while investigating

These are facts from the code, the database and the live site, not assumptions.

### Brevo and the newsletter

| Finding | Evidence | Effect |
|---|---|---|
| No list is configured in production | The live status endpoint reports `BREVO_LIST_ID: not set` | New subscribers are created as Brevo contacts but land in no list. This is the "link to Brevo doesn't work". |
| The API key in `.env.local` is rejected | Brevo answers `401 API Key is not enabled` | If production uses the same key, every sync fails. |
| Failures are silent | Errors are only written to the server log | Nobody notices. |
| Contacts are sent to Brevo before they confirm | The sync runs in the subscribe step, not the verify step | Unconfirmed addresses reach Brevo. |
| Unsubscribe and "delete my data" never reach Brevo | Only the subscribe route calls Brevo | People who leave stay in the Brevo list. This is a privacy problem. |
| A public endpoint reveals configuration | `GET /api/newsletter/subscribe` lists which secrets are set | Should not be public. |

### "Open pot student in nl gives 404"

Editors renamed the English page to `open-pot-student-kitchen`. The Dutch page is still the file `soepkeuken`. The menu links to `/nl/activities/open-pot-student-kitchen`, which the old site cannot translate, so it returns 404. The page and the event type are still called "Soup Kitchen" and "Soepkeuken" in several places.

### Content is newer than what I migrated

Local `main` was 330 commits behind `origin/main`. All 330 are content edits made through Tina. No code changed. Production now has 42 events, 8 vacancies, 6 newsletters, 3 past events and 140 uploads. My dry run used the older, smaller set.

### Design, as it renders today

- The logo is about 120 px wide in an 80 px header.
- Text links use the bright brand green on white. That is roughly a 2.9 to 1 contrast, below the accessibility minimum of 4.5 to 1.
- The footer has three very large headings, a plain form and a tiny logo.
- The calendar page starts with a large empty gap, and events exist only inside pop-ups, so an event has no address to share.
- Section backgrounds are typed by hand as Tailwind classes such as `bg-[#44AD39]/10`.

---

## 2. Decisions

Each decision has a recommendation. Section 7 lists the ones I need you to confirm.

### 2.1 One admin for both sites

**Recommendation: a small third app, `apps/admin`, that serves only the Payload admin at one address.** Both sites keep reading content directly from the database as they do now, but stop serving their own `/admin`.

- Editors of both organisations log in at the same address.
- A site switch sits at the top of the sidebar as two clear tabs, coloured per site. An editor who belongs to one site sees no tabs, only their site.
- The sidebar is grouped: **Content**, **Site settings**, and for admins **Users and sites**.
- The dashboard shows shortcuts for the selected site: add an event, edit the menu, newsletter settings, form responses.
- `/admin` on each site redirects to the admin address.

Why a third app instead of hosting the admin inside the Boerengroep site:

- Inspringtheater editors would otherwise log in on the Boerengroep domain.
- Every change then refreshes each site the same way, through the existing signed refresh call. There is one code path instead of two.
- The site builds get lighter, because they no longer compile the admin.

What this changes technically:

- **Preview across domains.** The admin's login cookie is not sent to the sites. Preview links get a short-lived signed token instead of relying on the session. The sites allow the admin address to embed them in the preview frame.
- **Migrations move to the admin app.** It becomes the one place that runs them. The sites never migrate.
- **Local development.** `pnpm dev` starts the admin on port 3001 and the site on 3000.

### 2.2 Navigation that editors can change

Today a menu item is an address plus a translation key that only a developer can add. That is why editors could not rename "Soup Kitchen".

- **Site settings becomes tabbed:** General, Header, Footer, Newsletter, Calendar.
- **A menu item has:** a label per language, and one link target chosen from a list: a page, a built-in section (Calendar, Past events, News, Friends' news, Podcast, Vacancies), or a custom address. One level of sub-items.
- **The footer has:** link columns with a title per language, the contact block (name, address lines, email, phone), social links, legal links and the copyright line. All editable. Contact details move out of the translation files.
- **In the admin** each row shows its label, rows can be dragged to reorder, and a page link follows the page when its address changes.
- **One-time conversion:** existing labels are copied from the translation files into the settings for both languages, so nothing changes visually on day one.

### 2.3 Newsletter and Brevo

- **Confirm first, then sync.** A person is added to the Brevo list when they confirm their email, not before.
- **Leaving works everywhere.** Unsubscribe removes them from the list. "Delete my data" deletes the Brevo contact.
- **The list belongs to the site.** The Newsletter tab holds the Brevo list for that site, chosen from a dropdown that reads the lists from Brevo. The API key stays a server secret per site.
- **Problems are visible.** The Newsletter tab shows connection status: key accepted or not, list found or not, subscriber count, and the last sync error. Each subscriber records when it was synced and any error, and failed syncs are retried.
- **Editable texts per language:** form heading, intro, button, consent line, the thank-you message after signing up, and the message on the confirmation page.
- **A nicer form.** One rounded field with the button inside it, a calm success state that replaces the form with the thank-you message, and clear error text. Used in the footer and as a "Newsletter signup" block for pages.
- **The public status endpoint is removed.**

Not in scope: writing and sending the newsletters themselves stays in Brevo. The confirmation emails keep going through Resend.

### 2.4 Calendar

**Every event gets its own page.** That is what makes sharing, calendar files and search results possible.

- **Event page** at `/activities/calendar/<slug>`: image, date and time in Dutch time, place with a map link, description, hosts, registration, and a link to the recap and gallery once the event has passed. It carries a share image and event data for search engines.
- **Share:** the phone's native share sheet where available. Otherwise copy link, WhatsApp and email.
- **Add to calendar:** a `.ics` file per event, plus Google Calendar and Outlook links.
- **Subscribe:** one feed address for all upcoming events, with a "Subscribe to our calendar" button and a short explanation for Google, Apple and Outlook. Events then appear and update in people's own calendars.
- **Status:** each event is Scheduled, Full, Cancelled or Postponed. "Full" shows a badge on cards, the month grid and the event page, and replaces the registration button with "Fully booked". Cancelled events are marked as cancelled in subscribed calendars.
- **Images:** one event image instead of two confusing ones. Cropping and a focal point are set in the admin when uploading, and the site uses the right cut for cards, posters and share images.
- **Views:** the default becomes an "Upcoming" list grouped by month, which works on phones. The month grid stays as a second view. Filter chips by type. A "Past" switch.
- **Fixes:** the text alignment in the month grid, the empty gap at the top, times shown in Dutch time for everyone, and removal of unused drag-and-drop code.
- **Naming:** the type "Soup Kitchen" is shown as "Open Pot".

Not in scope: repeating events, ticketing, and registration inside the site. Registration stays a link or a form (2.6).

### 2.5 Gallery

- A past-event recap gets a **Photos** field. Editors drop many pictures at once.
- On the recap page the photos show as a **mosaic**. Clicking one opens a **carousel** with keyboard and swipe support.
- A **Gallery block** for pages shows either chosen pictures or "the photos of this past event", with a link back to the recap.
- The Library media page can list all galleries automatically.

### 2.6 Content blocks

- **Video:** accepts any YouTube or Vimeo link and embeds it in privacy mode, loading the player only on click. No tracking cookies before a visitor presses play. Also available inside rich text.
- **Documents:** a block that lists files with name, type and size as download cards. Files can also be linked inside rich text. Uploads accept PDF, Word, Excel and OpenDocument.
- **Vacancy document:** the field exists. It gets the same file types and a clear download card on the vacancy.
- **Item with order form** (your T-shirt example): a block with a small picture carousel, name, details and price text, and one of two actions chosen per item:
  - a button to an external form such as a Google Form, or
  - a form built in the admin, with responses stored in Payload and an optional email to the organisers.
  No payment on the site.
- **Forms** come from Payload's official form builder: editors create a form (text, email, choice, number, long text, checkbox), write the confirmation message, and read responses in the admin. A plain **Form block** for pages comes for free, for example a contact form. Spam protection is a hidden trap field and a rate limit.
- **Layout options instead of typed classes:** each section gets a background preset (Paper, White, Leaf, Harvest, Dark), a width and a spacing choice, and where it applies text alignment and image side. Existing hand-typed backgrounds are converted to the nearest preset.
- **Alignment fixes** across blocks at phone, tablet and desktop widths.

### 2.7 Design direction: clean, warmer, more organic

Kept: the two typefaces, the green and orange, the calm layout.

Changed:

- **Paper, not white.** A warm off-white page with white cards on it. Dark soil-green text.
- **Green with enough contrast.** A deeper green for text links. The bright green stays for buttons, badges and large shapes.
- **Organic shapes.** Soft pebble-shaped image frames, hand-drawn wavy section edges, a faint paper grain. No stock illustrations.
- **Header.** Taller, with the logo about twice as large. Clear hover and current-page states, dropdowns as soft cards, a small EN / NL switch, and a slimmer bar after scrolling. On phones a full-screen menu with large type.
- **Footer.** A wavy top edge into a deep green footer: logo and one-line mission with social links, compact link columns, the newsletter card, contact. One slim legal line.
- **Home.** Hero, then a "What's on" band straight after it: the next event large with its image, three more as compact rows, and a small month view. Then the content sections, then the newsletter band.
- **Rhythm.** Smaller, consistent heading sizes, a comfortable reading width, alternating section backgrounds from the presets.
- **Motion.** Gentle reveals only, and none for visitors who ask for reduced motion.
- **Built on tokens.** Colours, radii and shapes are variables, so Inspringtheater gets its own palette on the same components.

**One checkpoint:** before applying the design everywhere I build a hidden preview page with the new header, footer, newsletter form, an event card and the "What's on" band, and send you screenshots at desktop and phone width. You react once, then I roll it out.

### 2.8 Small items

- **Cookie declaration and Terms pages:** removed, including footer links. Their old addresses redirect to the Privacy policy. This is consistent with the site setting no tracking cookies, which the click-to-load video keeps true.
- **Open Pot:** the migration pairs the English and Dutch pages. The Dutch page is renamed to Open Pot with a redirect from the old address. Menu labels become editable (2.2), which removes the root cause.

---

## 3. Phases

Each phase ends in working, committed software. Sizes are relative: S is hours, M is about a day, L is several days of work.

| # | Phase | Size | Result |
|---|---|---|---|
| 0 | Fresh baseline | S | Dry run and checks repeated on today's content |
| 1 | Quick fixes | S | Open Pot, legal pages, vacancy documents, calendar alignment |
| 2 | Design preview | M | Tokens and a hidden preview page. **Checkpoint with you.** |
| 3 | Settings and navigation | M | Tabbed settings, editable header and footer in the new design |
| 4 | Newsletter and Brevo | M | Correct sync lifecycle, editable texts, new form |
| 5 | Calendar | L | Event pages, share, calendar files and feed, status, views |
| 6 | Blocks | L | Gallery, video, documents, forms, item block, layout presets |
| 7 | One admin | M | `apps/admin`, site tabs, cross-domain preview |
| 8 | Roll-out and close | M | Design applied everywhere, final migration rehearsal, docs |

### Phase 0: Fresh baseline

- 0.1 Run the migration tool against `origin/main` content into a fresh local database. Review the report.
- 0.2 Add pairing rules that the new content needs, starting with `open-pot-student-kitchen` and `soepkeuken`. Test first.
- 0.3 Refresh the parity list from the live site and rerun parity and smoke tests. Update tests that name specific content.

*Done when:* counts match the source, the report has no errors, parity reports 0 failures.

### Phase 1: Quick fixes

- 1.1 Open Pot: pairing (0.2), Dutch rename with redirect, event type label.
- 1.2 Remove Cookies and Terms pages in the migration, add redirects to the Privacy policy, drop the footer entries.
- 1.3 Vacancy document: wider file types, download card.
- 1.4 Calendar: text alignment in month cells and the top gap.

*Tests:* unit tests for pairing and redirects, smoke tests for `/nl/activities/open-pot-student-kitchen`, `/en/cookies` and a vacancy with a document.

### Phase 2: Design preview

- 2.1 Tokens in `globals.css`: paper, soil, leaf, leaf-deep, harvest, radii, pebble shapes, wave edges, grain.
- 2.2 Preview page at a hidden address with: header, footer, newsletter form in all states, event card, "What's on" band, a text and image section, buttons and links.
- 2.3 Contrast check of every text and background pair, automated.
- 2.4 Screenshots at 1280 and 390 wide, sent to you.

*Done when:* you have reacted to the direction. This is the only planned stop.

### Phase 3: Settings and navigation

- 3.1 Schema: tabbed site settings. Menu items with a localized label and a link target (page, built-in section, custom). Footer columns, contact block, legal links, copyright.
- 3.2 Database migration plus a one-time conversion that copies labels from the translation files.
- 3.3 Adapter and components: header and footer read only from settings. Row labels in the admin.
- 3.4 New header and footer per the approved preview, including the larger logo and the phone menu.

*Tests:* integration tests for the schema and the conversion, unit tests for link resolution in both languages, smoke tests for menu links, the language switch and keyboard use of the menu.

### Phase 4: Newsletter and Brevo

- 4.1 Brevo client behind one interface: add to list, remove from list, delete contact, list the lists, check the key. Unit-tested against a fake HTTP layer.
- 4.2 Lifecycle: sync on confirm, remove on unsubscribe, delete on data deletion. Subscriber rows get `brevo_synced_at` and `brevo_error`. Failed syncs retry.
- 4.3 Newsletter tab: list picker, status panel, editable texts and thank-you message.
- 4.4 New form component and "Newsletter signup" block. Confirmation page uses the editable message.
- 4.5 Remove the public status endpoint.

*Tests:* unit tests for each lifecycle step including Brevo failures, an integration test of subscribe, confirm, unsubscribe and delete against a fake Brevo, a smoke test of the form through to the thank-you state.

*Needs from you:* a working Brevo API key and the list for each site (section 7).

### Phase 5: Calendar

- 5.1 Schema: `status`, one event image with crop sizes, slug uniqueness per site. Migration maps the two old image fields to one.
- 5.2 Calendar file generator: pure functions for one event and for a feed. Covers escaping, line folding, time in UTC, stable identifiers, cancelled status. Unit-tested against the format rules.
- 5.3 Routes: event page, per-event `.ics`, the feed, share image.
- 5.4 Share menu and add-to-calendar menu.
- 5.5 Views: upcoming list, month grid, type filter, past switch. Remove drag-and-drop code. Dutch time everywhere.
- 5.6 "What's on" band for the home page, replacing the current preview block.
- 5.7 Calendar tab in settings: feed on or off, default view, texts.

*Tests:* unit tests for the generator, share links and date formatting across the daylight-saving change, integration tests for queries (upcoming, past, by type), smoke tests for opening an event, downloading the file, the feed's content type, and the Full badge.

### Phase 6: Blocks

- 6.1 Gallery: `photos` on past events, mosaic and carousel, Gallery block, library index.
- 6.2 Video block and rich-text video with click-to-load privacy embed.
- 6.3 Documents block, file links in rich text, wider upload types.
- 6.4 Form builder plugin, tenant-scoped. Form renderer. Form block. Spam trap and rate limit. Optional notification email.
- 6.5 Item block with carousel and either an external link or a form.
- 6.6 Section presets (background, width, spacing, alignment) on all blocks, with conversion of existing values.
- 6.7 Alignment pass on every block at three widths.

*Tests:* integration tests for new collections and access (an editor of one site cannot read the other site's form responses), unit tests for video link parsing and form validation, smoke tests for the carousel, a form submission and the item block's two modes, screenshots of every block at three widths.

### Phase 7: One admin

- 7.1 `apps/admin`: Payload admin and API only. Migrations run here.
- 7.2 Site tabs in the sidebar, grouped navigation, per-site dashboard shortcuts.
- 7.3 Signed preview tokens. Sites accept them and allow the admin address to frame them.
- 7.4 Sites drop their admin routes and redirect `/admin`. All cache refreshes go through the signed call.
- 7.5 Runbook and CI updates for three apps.

*Tests:* unit tests for token signing, expiry and tampering, integration tests that a token for one site is refused by the other, smoke tests for login, site switch, edit and see the change on the site, and preview of a draft.

### Phase 8: Roll-out and close

- 8.1 Apply the approved design to all pages and blocks. Screenshot review of every page type at three widths.
- 8.2 Accessibility pass: contrast, focus order, keyboard menus, reduced motion.
- 8.3 Final migration rehearsal on fresh content, parity and smoke tests.
- 8.4 Update the editor guide and the cutover runbook.

---

## 4. Rules for execution

- Test first for all logic. Screenshots for visual work.
- Every schema change is an additive database migration, checked by the existing migration guard.
- Every query stays behind the tenant-bound query layer. New collections are tenant-scoped and covered by an isolation test.
- No tracking cookies are introduced.
- Lint, typecheck, unit and integration tests pass before each commit. Parity and smoke tests pass at the end of each phase.
- Decisions that differ from this plan are recorded in `docs/migration/execution-log.md` with their reason.
- Builds on this machine use the larger heap setting and `next start`, not the dev server.

## 5. Risks

- **Scope.** This is roughly as much work as the migration itself. The phases are ordered so that each one is useful alone and the work can stop after any of them.
- **Design is taste.** The preview checkpoint exists so that a wrong direction costs one page, not the whole site.
- **Brevo cannot be verified end to end** until a working key and list exist. Until then it is tested against a fake.
- **One admin changes the deployment** from two apps to three, and touches preview and cache refresh, which were just stabilised. It is placed late for that reason.
- **Content keeps changing in Tina** until cutover. Phase 0 and Phase 8 both rerun the migration.

## 6. Not included

- Repeating events, ticketing and on-site payment.
- Writing or sending newsletters from Payload.
- The Inspringtheater site itself. This plan prepares the admin and the tokens for it.
- New illustrations or photography.

## 7. What I need from you

1. **Admin address.** A third small app at its own address, as recommended in 2.1, or the admin inside the Boerengroep site? If its own address, which one?
2. **Brevo.** A working API key and the list to use for Boerengroep. The key I have is rejected by Brevo, and production has no list configured. This is yours to set in Brevo and Vercel.
3. **Open Pot in Dutch.** The Dutch title and address for the page. My default is the title "Open Pot" at `/nl/activiteiten/open-pot`.
4. **Order forms.** Which email address should receive a notification when someone submits a form? My default is none, responses only in the admin.
5. **Design references.** Any site whose feel you like? Without one I follow section 2.7 and show you the preview.

---

## 8. Decisions after review (2026-10-08)

These replace the matching parts above.

1. **Admin lives inside the Boerengroep site** at `/admin`. There is no third app. The
   Inspringtheater site will redirect its `/admin` there. That redirect and the signed
   preview links across domains are built together with the Inspringtheater site, because
   they need the second site to exist. Phase 7 therefore becomes **Admin clarity**:
   - two clear site tabs at the top of the sidebar for people who work on both sites,
   - the sidebar grouped by what editors do: Pages and blocks, Calendar, News, Library,
     Forms, Site settings, People and sites,
   - a short explanation in plain, friendly language on every collection, tab and field,
   - a dashboard with shortcuts for the selected site.
2. **Brevo.** The code is fixed now. The key and the list are added by the owner
   afterwards. Until then the Newsletter tab says exactly what is missing.
3. **Defaults taken for the open questions:** the Dutch page is titled "Open Pot" at
   `/nl/activiteiten/open-pot`. Forms send no email unless an address is entered on the
   form. The design follows section 2.7.
4. **More page-building blocks**, all reusable on any page:
   - **Podcast episodes:** the latest episodes from the podcast feed, or chosen ones,
     with a player.
   - **Events:** upcoming events, optionally of one type, or hand-picked ones.
   - **Gallery:** pictures with captions that show on the mosaic and in the carousel.
   - **Video:** YouTube and Vimeo, as in 2.6.
   - Text, image with text, documents, form, item, newsletter signup, as above.
5. **The design checkpoint does not block the work.** The preview page and its
   screenshots are produced early and delivered with the report. Colours, shapes and
   sizes live in tokens, so a change of direction is a change in one file.

Execution is logged in `docs/migration/execution-log.md` under "Round 2".
