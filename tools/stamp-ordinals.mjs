#!/usr/bin/env node
/**
 * stamp-ordinals — rewrite every catalog sidecar's `NN · ` label prefix to
 * match the template's position in CHAPTERS order (src/template-registry.ts,
 * then each pack's registry.ts). The build refuses a label whose ordinal
 * disagrees with the registry, and adding a template to a pack that is not
 * last shifts every ordinal after it — so run this after `npm run new`.
 *
 *   node tools/stamp-ordinals.mjs          rewrite
 *   node tools/stamp-ordinals.mjs --check  exit 1 if anything would change
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const packs = [...read("src/template-registry.ts").matchAll(/\{\s*pack:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
let ordinal = 0;
let changed = 0;
for (const pack of packs) {
  const reg = read(`src/${pack}/registry.ts`);
  // One row per VERSION (a v2 sits beside its v1 under the same slug): stamp the version the row names.
  // A deprecated version (superseded, kept exported) takes no ordinal; its number passes to its replacement.
  for (const m of reg.matchAll(/slug:\s*"([a-z0-9-]+)",\s*templateId:\s*"[^"]*\/(v\d+)"/g)) {
    const slug = m[1];
    const dir = path.join(ROOT, "src", pack, slug);
    for (const v of [m[2]]) {
      const file = path.join(dir, v, `${slug}.catalog.json`);
      if (!fs.existsSync(file)) continue;
      const json = JSON.parse(fs.readFileSync(file, "utf8"));
      const title = String(json.label ?? "").replace(/^\d+\s*·\s*/, "");
      if (!json.deprecated) ordinal += 1;
      const label = json.deprecated ? title : `${String(ordinal).padStart(2, "0")} · ${title}`;
      if (json.label === label) continue;
      changed += 1;
      console.log(`${CHECK ? "would stamp" : "stamped"}  ${json.templateId}: "${json.label}" -> "${label}"`);
      if (!CHECK) {
        json.label = label;
        fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
      }
    }
  }
}
console.log(`stamp-ordinals: ${ordinal} templates, ${changed} label(s) ${CHECK ? "out of date" : "rewritten"}.`);
if (CHECK && changed > 0) process.exit(1);
