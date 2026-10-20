#!/usr/bin/env node
/**
 * Gather the catalog SIDECARS into the catalog — the FIRST build step.
 *
 * The m0saic 0.3.1 template convention: a template's code declares what it IS
 * (props, defaults, output, render); what DESCRIBES it — label, description,
 * tags, visibility, deprecation, and each prop's label / hint / placeholder /
 * order — lives in `<name>.catalog.json` beside its module, because that may
 * change after the code ships. This writes:
 *   src/template-catalog.json   imported by src/catalog.ts (declared before any
 *                               template is defined)
 *   template-catalog.json       beside template-manifest.json — what hosts read
 * Both are generated; edit the sidecars, never these.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let repos;
try { repos = require("@m0saic/platform/template-repos"); } catch { repos = null; }
if (!repos || typeof repos.collectTemplateCatalog !== "function") {
  console.error("[gen-template-catalog] ✗ this repo follows the m0saic 0.3.1 template convention (catalog sidecars) and needs @m0saic/platform 0.3.1 or later — run: npm install @m0saic/platform@^0.3.1 @m0saic/template-utils@^0.3.1 @m0saic/types@^0.3.1");
  process.exit(1);
}
const collected = repos.collectTemplateCatalog(ROOT);
if (collected.problems.length) {
  console.error(`[gen-template-catalog] ✗ ${collected.problems.length} problem(s) in the catalog sidecars:`);
  for (const p of collected.problems) console.error(`    ${p}`);
  process.exit(1);
}
const text = repos.serializeTemplateCatalog(collected.file);
fs.writeFileSync(path.join(ROOT, "src", "template-catalog.json"), text, "utf8");
fs.writeFileSync(path.join(ROOT, "template-catalog.json"), text, "utf8");
console.log(`[gen-template-catalog] wrote src/template-catalog.json + template-catalog.json (${collected.sidecars.length} sidecar(s))`);
