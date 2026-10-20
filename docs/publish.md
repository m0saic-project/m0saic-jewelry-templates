# Publishing a release

This repo is consumed by **clone**, not by npm. A release is a tag on a commit
whose `dist/` is current, plus a **bundle** attached to that tag's GitHub
release: the same build without what running it never reads (see
[Bundles](#bundles-the-release-as-a-host-installs-it)).

That makes the whole discipline one rule: **the build output in the commit
must match the source in the commit.** A tag whose `dist/` is stale hands
every user a repo that quietly renders the previous version.

---

## The sequence

```
npm run build && npm run previews && npm run build
npm run verify
git add -A
git commit -m "..."
git push
# then, on the production laptop, in a CLEAN clone (no node_modules):
node <monorepo>/scripts/sign-template-repo.mjs --repo <clone> --tag vYYYY.MM.N
# → commit release.json, keys/, tools/verify-release.mjs, tools/pack-bundle.mjs, .gitattributes; tag vYYYY.MM.N; push --tags
# then, in the same clone, pack the bundle and attach it to the tag's release:
node tools/pack-bundle.mjs --tag vYYYY.MM.N
gh release create vYYYY.MM.N bundle/bundle.json bundle/runtime.tgz bundle/previews.tgz
```

**Releases are signed.** `release.json` carries an ed25519 signature (the
m0saic release key) over the hash of `dist/**`, `template-manifest.json`,
`template-catalog.json` and `package.json`. A clone that verifies shows as **Official** in Mosaic
Desktop; a clone whose bytes differ (an edit, a stale dist) shows as
"differs from the signed release"; no signature at all is plain
third-party. CI verifies on every push to `main`. Anyone can check a
clone: `node tools/verify-release.mjs`.

`previews` only mints assets for templates that lack them, and the second
build is what writes their paths into the manifest. Skip it when nothing new
was added.

**Commit the generated files.** `dist/`, `template-manifest.json`, and
`assets/templates/**` are generated *and* tracked — that is what makes the
repo loadable with no build step. A commit that changes `src/` without them is
incomplete.

## Bundles: the release as a host installs it

A clone carries everything: source, tests, tools, fixtures. Running the
templates needs two parts of it, so each release also ships as three files on
its GitHub release:

| File | Holds | Needed for |
|---|---|---|
| `bundle.json` | the index: tag, commit, each archive's sha256 and size | checking the two archives |
| `runtime.tgz` | `dist/**`, `template-manifest.json`, `template-catalog.json`, `package.json`, `m0saic.brand.json` (when the repo has one — the shop-profile schema Mosaic Desktop reads; not part of the signature), `release.json` (when it signs this build), `LICENSE`, `NOTICE.md` | rendering, in the CLI or Mosaic Desktop |
| `previews.tgz` | the previews the manifest resolves (`assets/templates/<key>/preview.png`, `preview.mp4`, `poster.png`) | the gallery in Mosaic Desktop; the CLI never shows a preview |
| `samples.tgz` | the pack's sample pictures and clips — only when `template-manifest.json` names a folder in `repo.assets.samplesDir` (say `"samples"`); capped at 128 MB unpacked | Mosaic Desktop's Files dock, as the first place, "Samples"; the CLI never fetches it |

```
npm run bundle          # → bundle/bundle.json, bundle/runtime.tgz, bundle/previews.tgz [, bundle/samples.tgz]
gh release create vYYYY.MM.N bundle/bundle.json bundle/runtime.tgz bundle/previews.tgz
```

A repo that ships samples adds `bundle/samples.tgz` to that line (`npm run bundle` prints the exact command). Declare
the folder once in `template-manifest.json` — `"repo": { "assets": { "samplesDir": "samples" } }` — and keep it small:
a handful of pictures and clips a first-time user can drag onto a template. A repo that names no folder ships none.

Extract `runtime.tgz`, then `previews.tgz` (and `samples.tgz`), into one empty folder and the
folder loads like a clone (`--template-repo <folder>`). The names never change,
so `https://github.com/<owner>/<repo>/releases/latest/download/bundle.json`
always names the newest release. `bundle/` is ignored by git: the files live
on the release, not in the repo.

`npm run bundle` refuses a `release.json` signed for a different build (a
`dist/` rebuilt after signing): re-sign, or pack with
`npm run bundle -- --unsigned`. A repo of your own started from this one is
unsigned: delete `release.json` (and the CI `release` lane), and the bundle
packs without a signature.

## Version format

```
vYYYY.MM.N        v2026.08.1   v2026.08.2   v2026.09.1
```

Calendar versioning, `N` restarting each month. There is no public API to
semver here — the meaningful question is "how current is this curriculum",
which a date answers and `1.4.2` does not.

Template **ids** carry their own `/v1` and are independent of the repo tag. A
template id only changes when its behavior changes incompatibly.

## Before tagging

- [ ] `npm run verify` green
- [ ] every template has a preview asset (`test:contract` covers this)
- [ ] `CURRICULUM.md` has a `## <pack>` heading for every declared pack
      (`check:deps` covers this)
- [ ] ordinals are contiguous and match array position (the manifest generator
      covers this)
- [ ] you have **looked at** any new or re-minted preview

That last one is not automatable and has caught real defects — a first-frame
still that was blank, and a fail-fast template whose browse card was its own
error card. Both passed every check above.

## Cross-platform

The merge platform is Windows; day-to-day authoring here happens on macOS.
Before tagging, run `npm run verify` on Windows too. What differs in practice
is path handling and shell quoting in the tools, not the templates themselves
— but that is exactly the kind of thing that only shows up on the other
machine.

`.gitattributes` pins line endings (`* text=auto eol=lf`, binaries `-text`),
so a rebuild on either platform should produce a clean diff. **A `dist/` diff
that is nothing but line endings means that pinning has slipped** — fix it
rather than committing the churn.

## After tagging

Users pull and press **Refresh repos**. There is no registry and nothing to
yank — a bad release is fixed by the next commit, which is worth remembering
as a reason not to rush the tag rather than a reason to relax about it.
