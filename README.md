# Jewelry Templates (`@jewelry`)

The templates behind **Mosaic for Jewelry**, the m0saic Desktop solution for jewelers.
Pick a design, drop in your photos, make the video.

If you use Mosaic for Jewelry you never touch this repo: Desktop installs each
release on its own. If you are not using it yet:

- Install Mosaic Desktop from [m0saic.io/download](https://m0saic.io/download), open it as
  Mosaic for Jewelry on the first screen, and the newest release of these templates is
  already there.
- In the full product, Templates → Add source → this repo's URL. On the command line,
  `npx m0saic install m0saic-project/m0saic-jewelry-templates`.

## What is here

| Template | What it makes |
| --- | --- |
| **Product Spotlight** (`@jewelry/social/product-spotlight/v1`) | One piece, one social ad: your photo or clip fills its side of the frame; the name, the metal and stone, the price and where to go sit beside it. Story, feed, square, landscape or email size. |

`samples/` holds a few real jewelry photos and clips (Pexels, free for commercial use) that
Mosaic Desktop lists first in its Files dock, so there is something to drag in before you
bring your own. More templates arrive through the same releases.

## For developers

```
npm install && npm run build       # catalog → tsc → manifest → conventions gate
npm test                            # the templates' own tests
npm run verify                      # build + lint + tests + loader contract + deps
m0saic make @jewelry/social/product-spotlight/v1 --template-repo . -o spot.mp4
```

`dist/`, `template-manifest.json` and `template-catalog.json` are committed: a clone loads
with no build step, and `npm run bundle` packs exactly that build into the release Desktop
installs. Rebuild before every commit. A shipped template version never changes; a new
behaviour is a new `vN+1` folder. Publishing (signing, the bundle, the GitHub release) is in
[`docs/publish.md`](docs/publish.md). Agents start at [`AGENTS.md`](AGENTS.md).

Media credits: [`NOTICE.md`](NOTICE.md).
