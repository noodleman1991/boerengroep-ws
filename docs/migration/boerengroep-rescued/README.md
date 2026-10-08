# Files that were only on Tina's file server

The old site's content refers to these two pictures, but they are not in the old repository's
`public/uploads` folder. They were only on Tina's own file server (`assets.tina.io`), which
stops answering when the Tina account is closed. They were downloaded from there on 8 October
2026 and are kept here, so the import can bring them along.

| File | Used by |
| --- | --- |
| `1207.png` | The event "Excursion: Tuinen van de Egel" |
| `WhatsApp Image 2025-07-31 at 18.31.55.jpeg` | The old page "News from friends" |

The import reads the `uploads` folder here through `EXTRA_UPLOADS_DIR`. It has the layout of the old uploads
folder: a file here at `a/b.png` is the old address `/uploads/a/b.png`.

One file was left on Tina's server on purpose, see "Files" in
`2026-boerengroep-dry-run-review.md`: a 12.6 MB PDF attached to a vacancy that closed in 2025.
