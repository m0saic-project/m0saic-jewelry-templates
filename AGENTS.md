# AGENTS.md

Entry point for coding agents working in this repo. Humans want [`README.md`](README.md).

## What this repo is

The public distribution repo of **Mosaic for Jewelry** (handle `@jewelry`). Mosaic Desktop,
opened as that solution, pins this repo's URL and installs its latest **signed release**
(`bundle.json` + `runtime.tgz` + `previews.tgz` + `samples.tgz`); the solution shows these
templates and nothing else. The founder signs and publishes releases; nobody else can.

It started on 2026-10-20 with ONE template, Product Spotlight v1, to establish the upstream;
`v2026.10.1` moved it to the 0.4.0 packages, and `v2026.10.2` adds four more (Piece Reel, New
Arrivals, Personal Pick, Window Card). The wider
jewelry field (`m0saic_jewelry`, local, many templates) is where templates are developed; a
template moves here when it is stable enough for every jeweler. A release cannot be taken
back, so the set stays small on purpose: quality over quantity.

## Rules

- **Public-safe.** No real company, brand, product or person in a default, a preview, a test
  or a sample (Maison Lumen is made up). Media is Pexels / CC0 only, credited in
  `NOTICE.md`, `PREVIEW-CREDITS.md` and `samples/README.md`.
- **Shipped means frozen.** A template version that has shipped in a signed release is never
  edited (`check-registry` holds its layout fingerprint). New behaviour is `vN+1` beside it;
  the old version stays registered until its catalog sidecar deprecates it.
- **Code says what a template IS; the sidecar says how it is DESCRIBED.** Label, description,
  tags and prop copy live in `<name>.catalog.json` beside the module (m0saic 0.3.1
  convention; `repo.conventions` in `src/repo.ts`). Write them in a jeweler's words.
- **Versions start at v1 here.** Whatever a template went through before it arrived, this
  repo is where it officially begins: it ships as `v1` with no history behind it. A template
  module holds its layers (`productSpotlightBase` + the media-controls wrapper) in one file
  and registers one id.
- **Shop profile.** `m0saic.brand.json` maps `brandName / brandLogo / accent / ctaUrl /
  platform` to the app's own fields. Keep those prop names on every template so a jeweler's
  details land in each design.
- **Generated files are committed.** `dist/`, `template-manifest.json`,
  `template-catalog.json`, `src/template-catalog.json`. Run `npm run build` before committing.

## Working

```
npm install && npm run verify       # build + lint + jest + loader contract + dep policy
npm run new                         # scaffold a template folder
npm run previews                    # mint preview assets for templates that lack them
npm run bundle                      # the release files, into bundle/ (git-ignored)
```

Publishing is the founder's act: `docs/publish.md` (sign with the m0saic release key, pack
the bundle, attach it to the tag's GitHub release). Hosts read
`releases/latest/download/bundle.json`, so a release is live the moment it is published.
