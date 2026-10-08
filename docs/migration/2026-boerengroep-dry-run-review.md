# Review of the Boerengroep dry-run report

Date: 2026-10-08, last brought up to date after the fifth round of work on the same day
Report: `2026-boerengroep-dry-run-report.md` (regenerated on every run)
Status: decisions below are proposed by the migration author and need the site owner's confirmation before cutover.

## Result

The run imported everything and exited cleanly, with no `error` entries. A second run changed nothing.
Counts are of the import of 8 October 2026 from `origin/main`, after the fix-ups.

| What | On the new site |
|---|---|
| Pages | 31 (29 published, 2 draft placeholders that keep child addresses stable) |
| Events | 34, in 7 kinds |
| News items | 6, all news from friends |
| Vacancies | 8 |
| Stories of past events | 3 |
| Speakers and authors | 1 and 5 |
| Pictures and files | 144: the 142 of the old uploads folder, and 2 that were only on Tina's file server |
| Forwarding addresses | 5 |

## Files

Every file of the old site was checked, because files were stored in two places.

- **The uploads folder of the old repository**: 142 files, all imported. Each old address
  (`/uploads/...`) still delivers its file.
- **Tina's own file server** (`assets.tina.io`). It goes away when the Tina account is closed.
  The old content used it in two ways:
  - Four links on "What is Boerengroep" (English and Dutch) led there: the **Year Plan 2026**
    and the **Year Report 2025**. Both files are in the uploads folder too. The import now
    turns such links into links to the imported file. Checked: no text in the database
    mentions that server any more, and both links deliver a PDF from the new site.
  - Three files were only there and not in the repository. Two are pictures the content
    shows, and they were downloaded and are kept in `boerengroep-rescued/uploads`, so the
    import brings them along: `1207.png` (the event "Excursion: Tuinen van de Egel", which had
    no picture on the live site because of this) and
    `WhatsApp Image 2025-07-31 at 18.31.55.jpeg` (the old page "News from friends").
  - **Left on that server on purpose, needs the owner's decision:**
    `vacancies/documents/2025-2026_aangepasteopeningstijden_EN.pdf`, 12.6 MB, attached to the
    vacancy "Food.Film.Fest Volunteer", which closed on 29 September 2025 and no longer shows.
    Its name says it is about adjusted opening hours, so it looks attached by mistake. If it is
    wanted: download
    `https://assets.tina.io/fbbafd20-e72e-48a2-bb11-70ea9ed9a361/vacancies/documents/2025-2026_aangepasteopeningstijden_EN.pdf`
    before the Tina account is closed and attach it to the vacancy in the admin.

## Decisions per report entry

### missing-media (3): accepted

- The PDF of the vacancy "Food.Film.Fest Volunteer": see "Files" above.
- `/uploads/logo.png` in the site settings, twice (once per language). That file exists
  nowhere, not on Tina's server either. The fix-ups file sets the logo the header really uses,
  `/uploads/branding/boerengroep-logo-zwart.png`.

### unpaired-locale (1): accepted

- `pages/en/accessibility.mdx` has no Dutch version. Dutch visitors get the English text at
  `/nl/accessibility`, as today.

### placeholder-parent (2): accepted

Draft pages that exist only so child addresses stay the same. They are not public.

- `/activities/calendar-sections` (Dutch `/activiteiten/agenda-secties`).
- `/news` (Dutch `/nieuws`). The public `/news` address is served by a built-in route.

### shadowed-file (5): accepted

Files that the current site never serves, because another file answers the same address.

- `pages/en/index.mdx` and `pages/nl/index.mdx`: the home page is `home.mdx`.
- `pages/en/inspringtheater/index.mdx` and `pages/nl/inspringtheater/index.mdx`: `inspringtheater.mdx` wins.
- `pages/nl/library/agroecologie-netwerk.mdx`: a copy of `nl/bibliotheek/agroecologie-netwerk.mdx`.
  Its old address `/nl/library/agroecologie-netwerk` redirects to `/nl/bibliotheek/agroecologie-netwerk`.

### skipped (2): accepted

- `pages/about.mdx` and `pages/test-page.en.mdx` sit outside the language folders and are starter leftovers.

### Placeholder content left out (17 files, one hidden text): proposed, needs the owner's confirmation

The old content still carries material that looks like starter or sample content. It is left out
of the import by `docs/migration/boerengroep-fixups.json` (`removeFiles` and `clearPageBodies`).
Nothing is changed in the old content itself, so the live site keeps showing it until cutover.
To keep an item, take its line out of that file before the import.

- Eight Dutch events dated January and February 2025, all without a picture and written in the
  same generic voice: `bestuursvergadering-januari`, `workshop-regeneratieve-landbouw`,
  `soepkeuken-wageningen`, `informatiesessie-csa`, `talk-jonge-boeren`,
  `lezing-toekomst-voedselsystemen`, `beleid-bijeenkomst-eu-green-deal`,
  `excursie-biologische-boerderij`.
- One event named "what" (28 July 2025) with no text.
- Five speakers who appear only on those eight events: Dr. Maria van der Meer, Lisa Vermeulen,
  Pieter Janssen, Prof. Dr. Johanna de Wit, Tom van Houten. The speaker "Marcha" stays.
- Three tags from the starter kit that no story uses: `markdown`, `mermaid`, `TinaCMS`.
- The hidden text of the Inspringtheater page ("Welcome to Inspringtheater - a unique platform
  for creativity and expression..."). The old site never showed it. The page's blocks, which hold
  the real text about the theatre group, stay.

Why this is a judgement and not a fact: the files do not say they are samples. The reading rests
on their pattern (made together, generic text, people who appear nowhere else). If any of these
events really took place, it should stay as a past event.

With these gone the report counts 33 events instead of 42, 1 speaker instead of 6 and no tags.
`missing-media` drops from 11 to 6, because five missing pictures belonged to the removed speakers.

### Photo page turned into a gallery: proposed, needs the owner's confirmation

`pages/en/library/media.mdx` ("Picture and Video gallery") was a text with a heading, four
pictures and a sentence under each. It is imported as a Photo gallery block: the heading is the
title and each sentence is the caption of the picture above it (`galleryPages` in the fix-ups
file). That each sentence belongs to the picture above it was checked against the pictures
themselves. The page also had a hidden older text with three pictures, one of which
(`IMG_20260716_111223641.jpg`) is on the page nowhere else. That hidden text is left out. The
picture is still in the library and can be added to the gallery.

### Vacancies are one post in two languages: accepted

All eight vacancies exist only as English files, so each is imported as the English of a post
and Dutch visitors read the English. Three of them carry Dutch inside the English text. Those
need a hand afterwards, see "After cutover" in the runbook.

### Kinds of events come from the old fixed list: accepted

The old site knew eight kinds. The import makes a kind for each one in use (seven), named as
the old site named it in each language, and editors can change them afterwards.

## Pairing decisions to double-check

Pages were paired across languages by translating each address segment with the table from the old
page route. Three pairs needed rules that the old table did not have:

- `calendar-sections/breaks` with `agenda-secties/pauzes`.
- `calendar-sections/open-meetings` with `agenda-secties/open-vergaderingen`.
- `news/friends-news` and `news/newsletter` with `nieuws/friends-news` and `nieuws/newsletter`,
  where the Dutch file kept the English name.

## Menu links

A menu item is linked to a page, so that it follows the page when its address changes, only when a
real page exists for it and no built-in route owns the address. Items for the calendar, past events,
news lists, podcast and vacancies keep their plain address, exactly as today.
