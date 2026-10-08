# Review of the Boerengroep dry-run report

Date: 2026-10-08
Report: `2026-boerengroep-dry-run-report.md` (regenerated on every run)
Status: decisions below are proposed by the migration author and need the site owner's confirmation before cutover.

## Result

The run imported everything and exited cleanly, with no `error` entries. A second run changed nothing.

| Collection | Source files | Imported |
|---|---|---|
| Pages | 71 files in two languages | 33 documents (30 pairs, 1 English only, 2 draft placeholders) |
| Events | 26 | 26 |
| Newsletters | 4 | 4 |
| Vacancies | 3 | 3 |
| Past events | 2 | 2 |
| Speakers | 6 | 6 |
| Authors | 4 | 4 |
| Tags | 3 | 3 |
| Media | 68 | 68 |
| Site settings | 1 | 1 |
| Redirects | 0 | 0 |

## Decisions per report entry

### missing-media (10): fix in admin after cutover

These files are referenced in content but are not in `public/uploads` on `main`, so the images are
already broken on the current site. The documents were imported with the image field empty.

- Five speaker avatars under `/uploads/speakers/`. These speakers look like sample data.
- `/uploads/1207.png` on the event "Excursion Tuinen van de Egel".
- `/uploads/vacancies/documents/2025-2026_aangepasteopeningstijden_EN.pdf` on the vacancy "Nice position".
- `/uploads/WhatsApp Image 2025-07-31 at 18.31.55.jpeg` on the English and Dutch Friends News pages.
- `/uploads/logo.png` in the site settings. The header does not use this field today. It shows a
  fixed image, `/uploads/branding/boerengroep-logo-zwart.png`, which was imported. After cutover,
  set that image as the logo under Site settings.

### inline-image (3): fix in admin after cutover

Rich text was imported, and the image inside it is left as literal markdown text.

- Vacancy "Nice position": `/uploads/1.png` and `/uploads/2.png`.
- Vacancy "Volunteer with us": `/uploads/bg_chair.jpg`.

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
