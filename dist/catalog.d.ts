/**
 * This repo's catalog — the m0saic 0.3.1 template convention.
 *
 * A template's CODE declares what it IS; what DESCRIBES it (label,
 * description, tags, visibility, deprecation, and each prop's label / hint /
 * placeholder / order) lives in its catalog sidecar, `<name>.catalog.json`
 * beside the module — it may change after the code ships. The build's first
 * step (tools/gen-template-catalog.mjs) gathers the sidecars into
 * src/template-catalog.json; this module declares it.
 *
 * IMPORTING THIS DECLARES THE CATALOG (and the repo's conventions target) —
 * src/index.ts imports it FIRST, so every
 * template is defined with its entry applied, before the build gate's
 * conventions judge it (a template with no label / description / tags would
 * otherwise fail them).
 */
import type { MosaicTemplateCatalogFile } from "@m0saic/types";
/** The gathered catalog (validated by the build step that wrote it). */
export declare const TEMPLATE_CATALOG: MosaicTemplateCatalogFile;
