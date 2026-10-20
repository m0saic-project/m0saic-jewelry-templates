import type { MosaicTemplatePackDescriptor, MosaicTemplateRepoDescriptor } from "@m0saic/types";
/**
 * Who this repo is. The entry module (src/index.ts) re-exports this as
 * `repo` — one of the two exports every Mosaic host requires from an
 * external template repo (the other is `templates`).
 *
 * This is the distribution repo of Mosaic for Jewelry: the solution pins
 * its URL, installs its latest signed release on its own, and shows nothing
 * else. The handle stays `@jewelry` — every template id is
 * `@jewelry/<pack>/<slug>/vN`, the same ids the solution's tour stages.
 */
export declare const TEMPLATE_REPO: MosaicTemplateRepoDescriptor;
/**
 * Packs, in display order. One is enough to start; add more by mirroring
 * the social/ folder (pack id = folder name = the <pack> segment of ids).
 */
export declare const TEMPLATE_PACKS: MosaicTemplatePackDescriptor[];
