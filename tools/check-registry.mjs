#!/usr/bin/env node
/**
 * Build-time registry gate.
 *
 * Stage 1 — load the freshly built `templates` first-party so every template
 * passes through `defineMosaicTemplate`, the seam that enforces the
 * DEFINITION-TIME conventions: defaultProps ("a knob shows what it does"),
 * colorProps (isColor + colorPicker), noLocalPaths (no absolute paths in
 * defaults), browseSurface (description + tags), propLabels (ui.label, a
 * warning). A throw-posture violation throws here, naming the template, the
 * knobs, and the fix — the build fails before the template can load in Mosaic
 * Desktop or the CLI.
 *
 * Stage 2 — render every template at its `defaultProps` on its hinted canvas
 * and audit the RENDER-TIME conventions: rendersAtDefaults, bindingsSound
 * (every editor.binding resolves), bindingsCover (a prop drawn as text is
 * bound to its rect — a warning), svgGlyphCoverage (svg text only uses
 * characters the font has). Templates whose required inputs have no default
 * are skipped, not failed.
 *
 * Same gate as the m0saic monorepo's `packages/templates/tools/check-registry.mjs`.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.env.M0SAIC_CLI ??= "/usr/bin/false";

// `--sweep`: also render every template on the standard canvases (1080p
// landscape / portrait / square) for the `canvasEnvelope` rule. Off by
// default — a build gate renders once; the sweep is a few times the cost.
const SWEEP = process.argv.includes("--sweep");
// `--json`: one machine-readable report on stdout (every finding with its
// convention, severity, keys, details and the fix), no human log lines —
// for agents looping on their own errors. Exit code is unchanged.
const JSON_OUT = process.argv.includes("--json");
// `--update-fingerprints`: (re)write layout-fingerprints/*.fingerprint from
// the current flattened layouts instead of comparing against them. Commit
// the result: the diff IS the review of a layout change.
const UPDATE_FP = process.argv.includes("--update-fingerprints");
// Fingerprints are SIDECARS: `<srcRoot>/<pack>/<slug>/vN/<slug>.layout.m0`
// next to the template source; a template whose id has no source folder
// falls back to `layout-fingerprints/<key>.m0`.
const FP_OPTS = { srcRoot: 'src' };
const log0 = console.log.bind(console);
const warn0 = console.warn.bind(console);
const err0 = console.error.bind(console);
const say = (...a) => { if (!JSON_OUT) log0(...a); };
const warn = (...a) => { if (!JSON_OUT) warn0(...a); };
const fail = (...a) => { if (!JSON_OUT) err0(...a); };
const report = { ok: true, mode: SWEEP ? "sweep" : "gate", templates: 0, rendered: 0, skipped: [], errors: [], warnings: [], notes: [], fingerprints: { srcRoot: FP_OPTS.srcRoot, fallbackDir: "layout-fingerprints", minted: 0, unchanged: 0, missing: 0, changed: 0 } };
const toJson = (f) => ({ templateId: f.templateId, convention: f.convention, severity: f.severity, violations: f.violations, fix: templateUtils.TEMPLATE_CONVENTION_FIX?.[f.convention] ?? null });
const finish = (code) => {
  if (JSON_OUT) { report.ok = code === 0; process.stdout.write(JSON.stringify(report, null, 2) + "\n"); }
  process.exit(code);
};

let templates;
let templateUtils;
try {
  ({ templates } = require("../dist/index.js")); // side effect: defineMosaicTemplate() for every template
  templateUtils = require("@m0saic/template-utils");
  // The filesystem half of layout fingerprints lives in the node-only entry
  // (the root barrel is walked by the web bundle and must stay free of node:fs).
  templateUtils = { ...templateUtils, ...require("@m0saic/template-utils/dist/dev/index.js") };
} catch (err) {
  const message = err && err.message ? err.message : String(err);
  fail(`\n[check-registry] ✗ the built templates refused to load:\n\n${message}\n`);
  fail("[check-registry] Fix the template above, then rebuild. (tools/check-registry.mjs)");
  finish(1);
}

const count = Array.isArray(templates) ? templates.length : 0;
// The template-convention line this repo targets (src/repo.ts `conventions`,
// m0saic 0.3.1). Rules introduced after it are reported as advice, never
// errors, until the repo moves it.
const CONVENTIONS_TARGET = (() => {
  try { const e = require("../dist/index.js"); return (e.repo ?? e.TEMPLATE_REPO)?.conventions ?? null; } catch { return null; }
})();

// ── Repo level: the front door (hello-world convention, 2026-09-14) ────────
// `repo.helloWorld` names the template a newcomer renders first — the
// canonical card via defineHelloWorldTemplate, or the pack's own. Record
// posture: the finding rides the same log Stage 1 prints, keyed by the repo
// id. (Same block as the monorepo's check-registry.)
{
  const entry = require("../dist/index.js");
  const repo = entry.repo ?? entry.TEMPLATE_REPO ?? null;
  const ownIds = Array.isArray(templates) ? templates.map((t) => String(t.id)) : [];
  const violations = typeof templateUtils.auditRepoFrontDoor === "function" ? templateUtils.auditRepoFrontDoor(repo, ownIds) : [];
  if (violations.length && typeof templateUtils.recordTemplateConventionFinding === "function") {
    templateUtils.recordTemplateConventionFinding(
      templateUtils.makeTemplateConventionFinding(String(repo?.repoId ?? "(repo)"), "repoFrontDoor", violations, false),
    );
  }
}
const printFindings = (label, findings) => {
  for (const f of findings) {
    fail(`  ${label} ${f.templateId} — ${f.convention}: ${f.violations.map((v) => v.key).join(", ")}`);
    for (const v of f.violations.slice(0, 4)) fail(`      ${v.detail}`);
    if (f.violations.length > 4) fail(`      …+${f.violations.length - 4} more`);
  }
};

// ── The catalog (m0saic 0.3.1) ──────────────────────────────────────────────
// A template's code declares what it IS; what DESCRIBES it (label,
// description, tags, visibility, deprecation, each prop's label / hint) lives
// in its catalog sidecar, <name>.catalog.json beside the module. Sound means:
// every sidecar parses and sits in its template's folder, the generated
// src/template-catalog.json is current, and every id and described prop
// exists. (The `catalogSidecar` rule — nothing descriptive left in code — is a
// render-time convention: Stage 2 reports it.)
{
  let repos = null;
  try { repos = require("@m0saic/platform/template-repos"); } catch { repos = null; }
  if (!repos || typeof repos.collectTemplateCatalog !== "function") {
    fail("\n[check-registry] ✗ this repo follows the m0saic 0.3.1 template convention and needs @m0saic/platform 0.3.1 or later.\n");
    finish(1);
  }
  const platform = require("@m0saic/platform");
  const collected = repos.collectTemplateCatalog(ROOT);
  const problems = [...collected.problems];
  const generatedPath = path.join(ROOT, "src", "template-catalog.json");
  const generated = fs.existsSync(generatedPath) ? fs.readFileSync(generatedPath, "utf8") : null;
  if (generated !== repos.serializeTemplateCatalog(collected.file)) {
    problems.push("src/template-catalog.json is stale — it is GENERATED from the <name>.catalog.json sidecars; run npm run build, never edit it");
  }
  const byId = new Map((Array.isArray(templates) ? templates : []).map((t) => [String(t.id), t]));
  for (const { path: rel, templateId } of collected.sidecars) {
    const t = byId.get(templateId);
    if (!t) { problems.push(`${rel}: describes ${templateId}, which this repo does not export`); continue; }
    const folder = `src/${templateId.split("/").slice(1).join("/")}`;
    if (path.posix.dirname(rel) !== folder) problems.push(`${rel}: describes ${templateId} but sits outside its folder (${folder}) — a sidecar lives beside the template's code`);
    for (const k of platform.unknownCatalogProps(t, collected.file.templates[templateId] ?? {})) {
      problems.push(`${rel}: props.${k} — ${templateId} has no such prop (dotted as propsSchema nests it)`);
    }
  }
  report.catalog = { sidecars: collected.sidecars.length, problems };
  if (problems.length) {
    fail(`\n[check-registry] ✗ CATALOG — the <name>.catalog.json sidecars:\n`);
    for (const p of problems) fail(`    ${p}`);
    finish(1);
  }
  say(`[check-registry] ✓ catalog: ${collected.sidecars.length} sidecar(s) sound, generated catalog current.`);
}

report.templates = typeof ids !== "undefined" ? ids.length : (typeof count !== "undefined" ? count : 0);
// ── Stage 1: definition time ───────────────────────────────────────────────
const recorded = typeof templateUtils.listTemplateConventionFindings === "function"
  ? templateUtils.listTemplateConventionFindings().filter((f) => !f.external)
  : [];
const errors1 = recorded.filter((f) => f.severity === "error");
report.errors.push(...errors1.map(toJson));
const warnings1 = recorded.filter((f) => f.severity === "warning");
report.warnings.push(...warnings1.map(toJson));
if (count === 0 || errors1.length > 0) {
  fail(`[check-registry] ✗ ${count} templates exported, ${errors1.length} convention error(s) recorded.`);
  printFindings("✗", errors1);
  finish(1);
}
const warnedKnobs = warnings1.reduce((n, f) => n + f.violations.length, 0);
say(`[check-registry] ✓ ${count} templates — definition-time conventions hold` +
  (warnings1.length ? ` (${warnings1.length} template(s) carry ${warnedKnobs} warning knob(s): ${[...new Set(warnings1.map((f) => f.convention))].join(", ")})` : "") + ".");

// ── Stage 2: render time ───────────────────────────────────────────────────
if (typeof templateUtils.auditRenderedTemplate !== "function") {
  warn("[check-registry] ⚠ this @m0saic/template-utils has no auditRenderedTemplate — render-time conventions not checked.");
  finish(0);
}
// A host registers every template of a repo before rendering any of them
// (a lesson may invoke a sibling by id through the registry). Do the same
// here, first-party, so nested invocations resolve exactly as they do in
// Mosaic Desktop and the CLI.
for (const template of templates) templateUtils.registerTemplate(template);
const errors2 = [];
const warnings2 = [];
const skipped = [];
const layouts = [];
let rendered = 0;
for (const template of templates) {
  const audit = await templateUtils.auditRenderedTemplate(template, {
    ...(SWEEP ? { sweepCanvases: templateUtils.STANDARD_SWEEP_CANVASES } : {}),
    // The repo's conventions target (repo.conventions): newer rules are advice.
    ...(CONVENTIONS_TARGET ? { conventionsTarget: CONVENTIONS_TARGET } : {}),
  });
  if (audit.skipped) {
    skipped.push(`${audit.templateId}: ${audit.skipped}`);
    report.skipped.push({ templateId: audit.templateId, reason: audit.skipped });
    continue;
  }
  rendered++;
  report.rendered = rendered;
  if (audit.layout) layouts.push({ id: audit.templateId, layout: audit.layout });
  for (const f of audit.findings) { (f.severity === "error" ? errors2 : warnings2).push(f); (f.severity === "error" ? report.errors : report.warnings).push(toJson(f)); }
  for (const note of audit.notes) report.notes.push({ templateId: audit.templateId, note });
  for (const note of audit.notes) warn(`  ⚠ ${audit.templateId}: ${note}`);
}
if (warnings2.length) {
  warn(`[check-registry] ⚠ ${warnings2.length} render-time warning(s) (record posture — fix when you touch the template):`);
  printFindings("⚠", warnings2);
}
// ── Stage 3: layout fingerprints ───────────────────────────────────────────
// The flattened layout at the hinted canvas, committed per template as a
// native `.m0` sidecar next to its source (`# size:` = the canvas, `# title:`
// = the id). A change is a build ERROR until re-minted with
// --update-fingerprints — so an edit to a shared helper shows its blast
// radius as a diff, not a surprise.
for (const { id, layout } of layouts) {
  if (UPDATE_FP) {
    if (templateUtils.writeLayoutFingerprint(ROOT, id, layout, FP_OPTS) > 0) report.fingerprints.minted++; else report.fingerprints.unchanged++;
    continue;
  }
  const result = templateUtils.checkLayoutFingerprint(ROOT, id, layout, false, FP_OPTS);
  if (result === "missing") {
    report.fingerprints.missing++;
    const where = templateUtils.layoutFingerprintLocation(ROOT, id, FP_OPTS);
    const f = { templateId: id, convention: "layoutFingerprint", severity: "warning", violations: [{ key: "missing", detail: `no committed fingerprint at ${path.relative(ROOT, path.join(where.dir, templateUtils.layoutFingerprintFileName(where.base)))} — run \`node tools/check-registry.mjs --update-fingerprints\` and commit it.` }] };
    warnings2.push(f); report.warnings.push(toJson(f));
  } else if (result) {
    report.fingerprints.changed++; errors2.push(result); report.errors.push(toJson(result));
  } else {
    report.fingerprints.unchanged++;
  }
}
if (UPDATE_FP) say(`[check-registry] ✎ layout fingerprints: ${report.fingerprints.minted} written, ${report.fingerprints.unchanged} unchanged → <template folder>/<slug>.layout.m0 (commit them).`);
else say(`[check-registry] ✓ layout fingerprints: ${report.fingerprints.unchanged} unchanged, ${report.fingerprints.missing} missing, ${report.fingerprints.changed} changed.`);

if (errors2.length) {
  fail(`[check-registry] ✗ ${errors2.length} render-time convention error(s):`);
  printFindings("✗", errors2);
  fail("[check-registry] Fix the template(s) above, then rebuild. (tools/check-registry.mjs)");
  finish(1);
}
if (SWEEP) say(`[check-registry] (sweep) each template was also rendered on ${templateUtils.STANDARD_SWEEP_CANVASES.length} standard canvases for the canvasEnvelope rule.`);
say(`[check-registry] ✓ ${rendered} templates rendered at their defaults — render-time conventions hold (${skipped.length} skipped: inputs required).`);
finish(0);
