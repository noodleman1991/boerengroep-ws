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
