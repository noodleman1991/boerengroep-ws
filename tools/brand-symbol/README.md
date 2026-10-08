# The Boerengroep symbol as a vector file

`apps/boerengroep/public/brand/boerengroep-symbol.svg` is the green and orange swirl of the logo
without the lettering. No vector original was at hand, so it was drawn from the logo picture
(`apps/boerengroep/public/logo.png`) by the three scripts in this folder.

1. `1-shapes.mjs` reads the logo and builds the two shapes. Wherever the logo shows a shape, the
   shape is taken exactly. Where lettering covers it (about 29% of the symbol), each edge is
   continued along the sweep of its swirl, from where it disappears to where it shows again.
2. `2-trace.cjs` turns the shapes into smooth outlines and writes the SVG.
3. `3-check.mjs` compares the SVG with the logo wherever there is no lettering. On the last run
   0.53% of those pixels differed, all of them on edges.

If the organisation has the original artwork, use that instead: replace the SVG file, or upload
a symbol under Site settings, General.

To run them again: the first and third need `sharp` (run them from `packages/cms`), the second
needs the `potrace` package, which is not a dependency of this repository.

```bash
out=$(mktemp -d)
(cd packages/cms && cp ../../tools/brand-symbol/1-shapes.mjs ./tmp-shapes.mjs && SCALE=2 BLUR=1.4 node ./tmp-shapes.mjs ../../apps/boerengroep/public/logo.png "$out"; rm ./tmp-shapes.mjs)
(cd "$out" && npm init -y >/dev/null && npm install potrace && cp "$OLDPWD/tools/brand-symbol/2-trace.cjs" . && SCALE=2 TOL=2.5 ALPHA=1.33 node 2-trace.cjs "$out" "$out/boerengroep-symbol.svg")
```

## The Inspringtheater symbol

`apps/inspringtheater/public/brand/inspringtheater-symbol.svg` (a copy sits in
`apps/boerengroep/public/brand`, for the login page of the admin) was drawn with the same
scripts. The only picture of that logo is 300 by 99 pixels, so it is enlarged eight times first,
and the shapes are smoothed more before tracing. About 12% of the symbol lies under lettering in
the logo and is continued along the sweep of each swirl. The outlines are as true as a picture
of that size allows: the large shapes are right, the thinnest strokes of the original are
simplified or left out. If the organisation has the original artwork, use that instead.

```bash
out=$(mktemp -d)
logo=apps/inspringtheater/public/brand/inspringtheater-logo.png
(cd packages/cms && node -e "const s=require('sharp');s('../../$logo').resize({width:2400,kernel:'lanczos3'}).png().toFile('$out/logo-8x.png')")
(cd packages/cms && cp ../../tools/brand-symbol/1-shapes.mjs ./tmp-shapes.mjs && RW=900 GREEN=309c28 ORANGE=f87800 GREEN_AT=365,255 ORANGE_AT=245,440 VIEW=0,0,900,792 SCALE=2 BLUR=4.5 node ./tmp-shapes.mjs "$out/logo-8x.png" "$out"; rm ./tmp-shapes.mjs)
(cd "$out" && npm init -y >/dev/null && npm install potrace && cp "$OLDPWD/tools/brand-symbol/2-trace.cjs" . && GREEN=309c28 ORANGE=f87800 SCALE=2 TOL=4 ALPHA=1.33 TURD=1400 node 2-trace.cjs "$out" "$out/inspringtheater-symbol.svg")
```

`GREEN` and `ORANGE` are the two colours of the logo, `GREEN_AT` and `ORANGE_AT` the middle of
each swirl in the enlarged picture, `RW` how much of its width holds the symbol. Keep the
transparency of the logo when enlarging it: on a white background the scripts read white as
part of the shapes.

