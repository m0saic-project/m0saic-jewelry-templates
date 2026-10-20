import type { MosaicTemplateRepoManifestEntry } from "@m0saic/types";
/**
 * One row of the authoring registry — a template's IDENTITY and its place in
 * the display order (each chapter has a registry.ts).
 *
 * What a template is CALLED and how it is described — its title (the
 * catalog `label`), description and tags — is not here: since m0saic 0.3.1 it
 * lives in the template's catalog sidecar, `<name>.catalog.json` beside its
 * module. The build's manifest generator reads both and ASSERTS the rows agree
 * exactly with the templates the entry module exports: a template can't ship
 * unregistered, and a registry row can't outlive its template.
 */
export type StarterRegistryEntry = {
    /** Slug segment of the id — `<repoId>/<pack>/<SLUG>/vN`. */
    slug: string;
    /** The FULL versioned template id, e.g. `"@jewelry/social/product-spotlight/v1"`. */
    templateId: string;
    /** Named export on the repo entry module (src/index.ts) that yields the template. */
    exportName: string;
    /**
     * Explicit preview overrides. Usually omitted — the generator discovers
     * assets/templates/<id with "/" -> "__">/preview.png|preview.mp4|poster.png
     * by convention.
     */
    preview?: MosaicTemplateRepoManifestEntry["preview"];
};
/** A curriculum chapter: one pack of templates, in teaching order. */
export type StarterChapter = {
    /** Pack id — the `<pack>` id segment AND the src/<pack>/ folder name. */
    pack: string;
    /** Registry rows in curriculum order (array order is authoritative). */
    entries: StarterRegistryEntry[];
};
