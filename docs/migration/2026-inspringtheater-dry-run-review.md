# Review of the Inspringtheater dry-run report

Date: 2026-10-08
Report: `2026-inspringtheater-dry-run-report.md` (regenerated on every run)
Fix-ups: `inspringtheater-fixups.json`
Status: the decisions below are proposed by the migration author and need the confirmation of
someone from Inspringtheater before the site goes live.

## Where the content came from

The live site, www.inspringtheater.nl, is a copy of the old Boerengroep site with its own
content put in. The import read the state of its repository of 18 August 2026, the last one on
this machine: the repository is private and could not be fetched. **At cutover, import again
from its latest state.** Anything added to the live site since August is missing here.

## Result

The run imported everything and exited cleanly, with no `error` entries. A second run changed
nothing.

| What | On the new site |
|---|---|
| Pages | 14, each in English and Dutch |
| Events | 29, in 5 kinds (course, jump-in session, talk, workshop, other) |
| Pictures and files | 71, all of the old uploads folder |
| Forwarding addresses | 57 |
| News, vacancies, stories, podcast | none: the old site had no real ones |

Every address the live site answers on today was collected (199, in
`inspringtheater-urls.txt`) and checked against the new site: all 199 arrive, 0 fail.

No link and no picture points at Tina's file server, so nothing breaks when Tina is closed.

## Left out, and why (needs confirmation)

Because the site started as a copy, most of what its repository holds is not Inspringtheater's.
None of the following was imported. Each line names how much and how it was recognised.

- **Sample content of the starter kit**: 8 Dutch events (for example "Excursie biologische
  boerderij"), 5 speakers with invented names, 4 authors, 3 tags, 4 news items (for example
  "A Complete Guide to Sustainable Farming Practices") and 3 vacancies. None is about theatre,
  and none is linked from the menu.
- **Empty pages left from Boerengroep**: 52 page files with nothing on them, such as "About us",
  "Library" and "News / Positions". They still answer on the live site, with an empty page.
  Their addresses now lead to the closest page that exists (see "Old addresses").
- **Starter pages**: "Agenda" (the calendar is built in), "History" under the old "About us",
  three news pages.
- **The page "Privacy Policy"**. It holds a pasted academic abstract, not a privacy statement.
  See "Needed before going live".

If any of this should be on the site after all, remove its line from `removeFiles` or
`removePages` in the fix-ups file and run the import again.

## Old addresses

- The 26 addresses the live menu and footer lead to all arrive, in both languages.
- `/agenda` leads to the calendar.
- `/privacy`, `/cookies`, `/terms-conditions` and `/accessibility` lead to the home page. The
  live pages behind them are empty.
- 52 addresses of the empty pages named above lead to the closest page that exists: the old
  "About us" pages to "About Inspringtheater", the old activity pages to "Activities", "Jobs"
  to "Get involved", and the rest to the home page.
- One menu link is left out: "Volunteers" in the footer leads to `/get-involved/volunteers`,
  which does not exist on the live site either.

## Decisions per report entry

### shadowed-file (2): accepted

`pages/en/index.mdx` and `pages/nl/index.mdx` are never served, because `home.mdx` is the home
page.

### skipped (92): proposed, see "Left out, and why"

38 files removed by the fix-ups file, 52 pages with nothing on them, and the two footer links
to the page that does not exist.

## Found and repaired on the way

- One picture on the Dutch "Inspringsessies" page was lost by the first import: its file name
  has brackets, `Website jump in (1).png`, written in a way the tool did not read. It is
  imported now, and a test covers it.
- Events of the old site keep a second text, "full description", next to the description. It
  is filled in for one event out of 29. The import adds it to the event's text.

## Needed before going live (only the organisation can supply these)

1. **A privacy statement.** The site collects email addresses for a newsletter, so it needs
   one. Until there is a page for it, the small print under the sign-up box links to nothing.
   When the page exists: add it under Site settings, Footer, as the first of the small links
   at the bottom. The sign-up box then links to it by itself.
2. **A larger logo**, if one exists. The only file is 300 by 99 pixels, which looks soft on
   sharp screens. Upload a better one under Site settings, General.
3. **Its own newsletter list and mail sender.** The site must not write to Boerengroep's list.
   See the environment variables in the runbook.
4. **Access to the repository** of the live site, for the import at cutover.

## What the site looks like

The same parts as Boerengroep, with its own colours taken from its logo: orange leads, green
accompanies, and the footer is a warm dark brown. It has no separate symbol, so pages without
a picture open with their words only. Colours live in
`apps/inspringtheater/app/[locale]/theme.css`, the name, logo and descriptions in
`apps/inspringtheater/site.config.ts`, and the few sentences that differ from Boerengroep's in
`apps/inspringtheater/messages`.
